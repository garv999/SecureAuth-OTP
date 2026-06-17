import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { getSessionFingerprint } from '../utils/session';
import { INACTIVITY_LIMIT, WARNING_THRESHOLD } from '../constants/session';
import { AppContext } from './AppContext';

export const AppProvider = ({ children }) => {
  const { user, loading, logout } = useAuth();
  
  // Settings initialization
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('sa_settings');
    return saved ? JSON.parse(saved) : {
      toasts: true,
      animations: true,
      autoCopy: false
    };
  });

  // History and Theme initialization
  const [theme, setTheme] = useState(() => localStorage.getItem('sa_theme') || 'dark');
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem('sa_history')) || []);
  const [sessions, setSessions] = useState(() => JSON.parse(localStorage.getItem('sa_sessions')) || []);
  const [trustedDevices, setTrustedDevices] = useState(() => JSON.parse(localStorage.getItem('sa_trusted_devices')) || []);
  
  // Session initialization (Production-safe pattern)
  const [currentSessionId, setCurrentSessionId] = useState(() => {
    const sid = sessionStorage.getItem('sa_current_sid');
    if (sid) return sid;
    
    // Attempt session restoration from localStorage fingerprint
    const fingerprint = getSessionFingerprint();
    const savedSessions = JSON.parse(localStorage.getItem('sa_sessions') || '[]');
    const existing = savedSessions.find(s => s.stableId === fingerprint.stableId);
    
    if (existing) {
      const globalLastActivity = parseInt(localStorage.getItem('sa_last_activity') || '0', 10);
      const isExpired = globalLastActivity > 0 && (Date.now() - globalLastActivity) >= INACTIVITY_LIMIT;
      const isSessionExpired = (Date.now() - new Date(existing.lastActivity).getTime()) >= INACTIVITY_LIMIT;

      if (!isExpired && !isSessionExpired) {
        sessionStorage.setItem('sa_current_sid', existing.sessionId);
        return existing.sessionId;
      }
    }
    return null;
  });

  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const isInitialized = useRef(false);

  const addHistoryEvent = useCallback((type, details = '') => {
    const newEvent = {
      id: Date.now(),
      type,
      details,
      timestamp: new Date().toISOString()
    };
    setHistory(prev => [newEvent, ...prev].slice(0, 100));
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
    const isKnownDevice = existingSession || trustedDevices.includes(fingerprint.stableId);

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
      
      if (!isKnownDevice) {
        addHistoryEvent('security_alert', `New unrecognized device detected: ${fingerprint.sessionName}`);
        if (settings.toasts) toast.error('Security Alert: Unrecognized device detected', { duration: 6000 });
      } else {
        addHistoryEvent('session_created', `New device authorized: ${fingerprint.sessionName}`);
      }
      return sid;
    }
  }, [sessions, trustedDevices, addHistoryEvent, settings.toasts]);

  const toggleTrustDevice = useCallback((stableId) => {
    setTrustedDevices(prev => {
      const isTrusted = prev.includes(stableId);
      const next = isTrusted ? prev.filter(id => id !== stableId) : [...prev, stableId];
      localStorage.setItem('sa_trusted_devices', JSON.stringify(next));
      if (settings.toasts) {
        toast.success(isTrusted ? 'Device trust removed' : 'Device marked as trusted');
      }
      addHistoryEvent(isTrusted ? 'trust_removed' : 'trust_added', `Device trust status updated for ${stableId.substring(0, 8)}`);
      return next;
    });
  }, [settings.toasts, addHistoryEvent]);

  // Enhanced Security Score
  const securityScore = useMemo(() => {
    if (!user) return 0;
    
    let score = 0;
    
    // 1. Providers (Max 25)
    const providerCount = user.providerData.length;
    score += providerCount >= 2 ? 25 : 15;
    
    // 2. Trusted Devices (Max 25)
    const hasTrusted = trustedDevices.length > 0;
    score += hasTrusted ? 25 : 5;
    
    // 3. Active Sessions (Max 25)
    if (sessions.length === 1) score += 25;
    else if (sessions.length <= 3) score += 15;
    else if (sessions.length <= 6) score += 5;
    
    // 4. Security Health (Max 25)
    const now = new Date().getTime();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const recentAlerts = history.filter(e => 
      e.type === 'security_alert' && new Date(e.timestamp).getTime() > oneWeekAgo
    );
    score += Math.max(0, 25 - (recentAlerts.length * 10));
    
    return score;
  }, [user, sessions, trustedDevices, history]);

  // Security Specific Notifications
  const securityNotifications = useMemo(() => {
    const securityTypes = [
      'security_alert', 
      'trust_added', 
      'trust_removed', 
      'google_login', 
      'phone_login', 
      'session_terminated',
      'other_sessions_terminated',
      'provider_linked',
      'provider_unlinked'
    ];
    return history.filter(e => securityTypes.includes(e.type)).slice(0, 20);
  }, [history]);

  // Use the calculated values to satisfy lint and provide to context
  const securityContextValues = { securityScore, securityNotifications };

  // Enterprise Analytics
  const analytics = useMemo(() => {
    const loginEvents = history.filter(e => e.type === 'login' || e.type === 'session_restore' || e.type === 'google_login' || e.type === 'phone_login');
    const logoutEvents = history.filter(e => e.type === 'logout' || e.type === 'session_expiry' || e.type === 'session_terminated');
    
    let totalDuration = 0;
    let longestSession = 0;
    let sessionCount = 0;

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

  // Session Restoration Logic (Fixed to avoid sync setState in effect)
  useEffect(() => {
    if (!loading && user && !isInitialized.current) {
      isInitialized.current = true;
      
      const fingerprint = getSessionFingerprint();
      const provider = user.providerData[0]?.providerId === 'google.com' ? 'Google' : 'Phone Auth';
      const eventType = user.providerData[0]?.providerId === 'google.com' ? 'google_login' : 'phone_login';
      const identifier = user.providerData[0]?.providerId === 'google.com' ? user.email : user.phoneNumber;

      if (currentSessionId) {
        // Log restoration asynchronously to avoid cascading render warnings
        const timer = setTimeout(() => {
          addHistoryEvent('session_restore', `Secure session restored on ${fingerprint.sessionName}`);
          if (settings.toasts) toast.success('Session restored');
        }, 0);
        return () => clearTimeout(timer);
      } else {
        // Create new session asynchronously
        const timer = setTimeout(() => {
          createNewSession();
          addHistoryEvent(eventType, `Authenticated with ${provider} (${identifier})`);
          if (settings.toasts) toast.success(`New ${provider} session initialized`);
        }, 0);
        return () => clearTimeout(timer);
      }
    }
  }, [loading, user, currentSessionId, addHistoryEvent, settings.toasts, createNewSession]);

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
  }, [user, currentSessionId, showSessionWarning, logout, addHistoryEvent]);

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
      analytics,
      ...securityContextValues
    }}>
      {children}
    </AppContext.Provider>
  );
};
