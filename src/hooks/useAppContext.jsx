import { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useAuth } from './useAuth';
import { toast } from 'react-hot-toast';
import { getSessionFingerprint } from '../utils/session';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { user, loading, logout } = useAuth();
  const [theme, setTheme] = useState(localStorage.getItem('sa_theme') || 'dark');
  const [history, setHistory] = useState(JSON.parse(localStorage.getItem('sa_history')) || []);
  const [sessions, setSessions] = useState(JSON.parse(localStorage.getItem('sa_sessions')) || []);
  const [currentSessionId, setCurrentSessionId] = useState(sessionStorage.getItem('sa_current_sid'));
  const [trustedDevices, setTrustedDevices] = useState(JSON.parse(localStorage.getItem('sa_trusted_devices')) || []);
  
  const [settings, setSettings] = useState(JSON.parse(localStorage.getItem('sa_settings')) || {
    toasts: true,
    animations: true,
    autoCopy: false
  });
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  
  const isInitialized = useRef(false);

  const INACTIVITY_LIMIT = 12 * 60 * 60 * 1000; // 12 hours
  const WARNING_THRESHOLD = INACTIVITY_LIMIT - (5 * 60 * 1000); // 11h 55m

  const addHistoryEvent = useCallback((type, details = '') => {
    const newEvent = {
      id: Date.now(),
      type,
      details,
      timestamp: new Date().toISOString()
    };
    setHistory(prev => [newEvent, ...prev].slice(0, 100)); // Increased for better analytics
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem('sa_history');
  }, []);

  const extendSession = useCallback(() => {
    localStorage.setItem('sa_last_activity', Date.now().toString());
    setShowSessionWarning(false);
    addHistoryEvent('session_extended', 'Session manually extended');
  }, [addHistoryEvent]);

  const terminateSession = useCallback(async (sid) => {
    const sessionToTerm = sessions.find(s => s.sessionId === sid);
    setSessions(prev => prev.filter(s => s.sessionId !== sid));
    
    if (sid === currentSessionId) {
      addHistoryEvent('session_terminated', `Current session (${sessionToTerm?.sessionName}) ended.`);
      sessionStorage.removeItem('sa_current_sid');
      await logout();
    } else {
      addHistoryEvent('session_terminated', `Remote device (${sessionToTerm?.sessionName}) revoked.`);
      if (settings.toasts) toast.success('Session terminated');
    }
  }, [sessions, currentSessionId, logout, addHistoryEvent, settings.toasts]);

  const logoutAllOtherSessions = useCallback(() => {
    setSessions(prev => prev.filter(s => s.sessionId === currentSessionId));
    addHistoryEvent('other_sessions_terminated', 'All other active sessions cleared.');
    if (settings.toasts) toast.success('Other sessions cleared');
  }, [currentSessionId, addHistoryEvent, settings.toasts]);

  const createNewSession = useCallback(() => {
    const fingerprint = getSessionFingerprint();
    const existingSession = sessions.find(s => s.stableId === fingerprint.stableId);

    if (existingSession) {
      const sid = existingSession.sessionId;
      setCurrentSessionId(sid);
      sessionStorage.setItem('sa_current_sid', sid);
      setSessions(prev => [
        { ...existingSession, lastActivity: new Date().toISOString(), loginTimestamp: new Date().toISOString() },
        ...prev.filter(s => s.sessionId !== sid)
      ].slice(0, 10));
      addHistoryEvent('login', `Logged In from ${fingerprint.sessionName}`);
      return sid;
    } else {
      const sid = Math.random().toString(36).substring(2, 15);
      const newSession = { 
        ...fingerprint, 
        sessionId: sid,
        loginTimestamp: new Date().toISOString(),
        lastActivity: new Date().toISOString()
      };
      setCurrentSessionId(sid);
      sessionStorage.setItem('sa_current_sid', sid);
      setSessions(prev => [newSession, ...prev].slice(0, 10));
      addHistoryEvent('session_created', `New device authorized: ${fingerprint.sessionName}`);
      return sid;
    }
  }, [sessions, addHistoryEvent]);

  const toggleTrustDevice = useCallback((stableId) => {
    setTrustedDevices(prev => {
      const isTrusted = prev.includes(stableId);
      const next = isTrusted ? prev.filter(id => id !== stableId) : [...prev, stableId];
      localStorage.setItem('sa_trusted_devices', JSON.stringify(next));
      if (settings.toasts) {
        toast.success(isTrusted ? 'Device trust removed' : 'Device marked as trusted');
      }
      return next;
    });
  }, [settings.toasts]);

  // Enterprise Analytics
  const analytics = useMemo(() => {
    const loginEvents = history.filter(e => e.type === 'login' || e.type === 'session_restore');
    const logoutEvents = history.filter(e => e.type === 'logout' || e.type === 'session_expiry' || e.type === 'session_terminated');
    
    // Calculate Session Durations
    let totalDuration = 0;
    let longestSession = 0;
    let sessionCount = 0;

    // Estimate session durations from history logs
    const sessionLogs = [...history].reverse().filter(e => ['login', 'logout', 'session_restore', 'session_expiry', 'session_terminated'].includes(e.type));
    
    let lastStartTime = null;
    sessionLogs.forEach(event => {
      if (event.type === 'login' || event.type === 'session_restore') {
        lastStartTime = new Date(event.timestamp).getTime();
      } else if (lastStartTime) {
        const duration = new Date(event.timestamp).getTime() - lastStartTime;
        if (duration > 0) {
          totalDuration += duration;
          longestSession = Math.max(longestSession, duration);
          sessionCount++;
        }
        lastStartTime = null;
      }
    });

    const devices = new Set(sessions.map(s => s.stableId));

    return {
      totalLogins: loginEvents.length,
      totalLogouts: logoutEvents.length,
      avgSessionDuration: sessionCount > 0 ? totalDuration / sessionCount : 0,
      longestSession,
      totalDevicesUsed: devices.size,
      currentActiveSessions: sessions.length
    };
  }, [history, sessions]);

  // Sync state
  useEffect(() => {
    localStorage.setItem('sa_history', JSON.stringify(history));
    localStorage.setItem('sa_sessions', JSON.stringify(sessions));
  }, [history, sessions]);

  // Session Restoration
  useEffect(() => {
    if (!loading && user && !isInitialized.current) {
      isInitialized.current = true;
      
      const fingerprint = getSessionFingerprint();
      const existingSession = sessions.find(s => s.stableId === fingerprint.stableId);

      // Validate session integrity before restoring
      const globalLastActivity = parseInt(localStorage.getItem('sa_last_activity') || '0', 10);
      const isExpiredGlobally = globalLastActivity > 0 && (Date.now() - globalLastActivity) >= INACTIVITY_LIMIT;
      const isSessionExpired = existingSession && (Date.now() - new Date(existingSession.lastActivity).getTime()) >= INACTIVITY_LIMIT;

      if (isExpiredGlobally || isSessionExpired) {
        setTimeout(() => addHistoryEvent('session_expiry', 'Prevented restoration of expired session.'), 0);
        logout();
        return;
      }

      if (!currentSessionId && existingSession) {
        setCurrentSessionId(existingSession.sessionId);
        sessionStorage.setItem('sa_current_sid', existingSession.sessionId);
        addHistoryEvent('session_restore', `Secure session restored on ${fingerprint.sessionName}`);
        if (settings.toasts) toast.success('Session restored');
      } else if (!currentSessionId) {
        const sid = Math.random().toString(36).substring(2, 15);
        const newSession = { 
          ...fingerprint, 
          sessionId: sid,
          loginTimestamp: new Date().toISOString(),
          lastActivity: new Date().toISOString()
        };
        setCurrentSessionId(sid);
        sessionStorage.setItem('sa_current_sid', sid);
        setSessions(prev => [newSession, ...prev].slice(0, 10));
        addHistoryEvent('session_created', `New device authorized: ${fingerprint.sessionName}`);
        if (settings.toasts) toast.success('Session restored');
      }
    }
  }, [loading, user, currentSessionId, sessions, addHistoryEvent, settings.toasts, INACTIVITY_LIMIT, logout]);

  // Inactivity tracking
  useEffect(() => {
    if (!user) return;

    const resetTimer = () => {
      const now = Date.now().toString();
      localStorage.setItem('sa_last_activity', now);
      if (currentSessionId) {
        setSessions(prev => prev.map(s => 
          s.sessionId === currentSessionId ? { ...s, lastActivity: new Date().toISOString() } : s
        ));
      }
      if (showSessionWarning) {
        setShowSessionWarning(false);
      }
    };

    const checkInactivity = () => {
      const lastActivity = parseInt(localStorage.getItem('sa_last_activity') || Date.now().toString());
      const elapsed = Date.now() - lastActivity;

      if (elapsed >= INACTIVITY_LIMIT) {
        addHistoryEvent('session_expiry', 'Session expired due to 12h inactivity');
        logout();
      } else if (elapsed >= WARNING_THRESHOLD && !showSessionWarning) {
        setShowSessionWarning(true);
      }
    };

    const events = ['mousemove', 'click', 'keydown', 'scroll', 'touchstart'];
    events.forEach(e => window.addEventListener(e, resetTimer));
    const interval = setInterval(checkInactivity, 30000);

    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimer));
      clearInterval(interval);
    };
  }, [user, currentSessionId, showSessionWarning, INACTIVITY_LIMIT, WARNING_THRESHOLD, logout, addHistoryEvent]);

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('sa_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('sa_settings', JSON.stringify(settings));
  }, [settings]);

  return (
    <AppContext.Provider value={{ 
      theme, setTheme, 
      history, addHistoryEvent, clearHistory,
      sessions, terminateSession, logoutAllOtherSessions, createNewSession, currentSessionId,
      settings, setSettings,
      showSessionWarning, setShowSessionWarning,
      extendSession,
      trustedDevices, toggleTrustDevice,
      analytics
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
export const useAuthContext = useAppContext;
