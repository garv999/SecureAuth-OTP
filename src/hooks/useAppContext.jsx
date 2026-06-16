import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
  
  const [settings, setSettings] = useState(JSON.parse(localStorage.getItem('sa_settings')) || {
    toasts: true,
    animations: true,
    autoCopy: false
  });
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  
  // Guard for session restoration log
  const isInitialized = useRef(false);

  const INACTIVITY_LIMIT = 12 * 60 * 60 * 1000; // 12 hours
  const WARNING_THRESHOLD = INACTIVITY_LIMIT - (5 * 60 * 1000); // 11h 55m

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('sa_history', JSON.stringify(history));
    localStorage.setItem('sa_sessions', JSON.stringify(sessions));
  }, [history, sessions]);

  // Handle Session Restoration Log (Once per lifecycle)
  useEffect(() => {
    if (!loading && user && !isInitialized.current) {
      isInitialized.current = true;
      
      // Check if current session exists in the device list
      if (!currentSessionId) {
        const fingerprint = getSessionFingerprint();
        const newSession = { ...fingerprint, isCurrent: true };
        setCurrentSessionId(newSession.sessionId);
        sessionStorage.setItem('sa_current_sid', newSession.sessionId);
        setSessions(prev => [newSession, ...prev].slice(0, 10));
        addHistoryEvent('session_created', `New session on ${newSession.deviceType} (${newSession.browserName})`);
      }

      addHistoryEvent('session_restore', `Secure session restored for ${user.phoneNumber}`);
      if (settings.toasts) {
        toast.success('Session restored successfully');
      }
    }
  }, [loading, user]);

  const terminateSession = async (sid) => {
    const sessionToTerm = sessions.find(s => s.sessionId === sid);
    setSessions(prev => prev.filter(s => s.sessionId !== sid));
    
    if (sid === currentSessionId) {
      addHistoryEvent('session_terminated', 'Current session terminated by user.');
      sessionStorage.removeItem('sa_current_sid');
      await logout();
      toast.error('Session terminated');
    } else {
      addHistoryEvent('session_terminated', `Remote session (${sessionToTerm?.deviceType}) terminated.`);
      toast.success('Remote session terminated');
    }
  };

  const logoutAllOtherSessions = () => {
    setSessions(prev => prev.filter(s => s.sessionId === currentSessionId));
    addHistoryEvent('other_sessions_terminated', 'All other sessions cleared.');
    toast.success('All other sessions terminated');
  };

  const createNewSession = () => {
    const fingerprint = getSessionFingerprint();
    const newSession = { ...fingerprint, isCurrent: true };
    setCurrentSessionId(newSession.sessionId);
    sessionStorage.setItem('sa_current_sid', newSession.sessionId);
    setSessions(prev => [newSession, ...prev].slice(0, 10));
    addHistoryEvent('session_created', `New login on ${newSession.deviceType}`);
    return newSession.sessionId;
  };

  // Apply theme to body
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('sa_theme', theme);
  }, [theme]);

  // Sync settings
  useEffect(() => {
    localStorage.setItem('sa_settings', JSON.stringify(settings));
  }, [settings]);

  // Sync history
  useEffect(() => {
    localStorage.setItem('sa_history', JSON.stringify(history));
  }, [history]);

  const addHistoryEvent = (type, details = '') => {
    const newEvent = {
      id: Date.now(),
      type,
      details,
      timestamp: new Date().toISOString()
    };
    setHistory(prev => [newEvent, ...prev].slice(0, 50));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('sa_history');
  };

  // Session Inactivity Tracking
  useEffect(() => {
    if (!user) return;

    const resetTimer = () => {
      localStorage.setItem('sa_last_activity', Date.now().toString());
      if (showSessionWarning) {
        setShowSessionWarning(false);
        addHistoryEvent('session_extended', 'Session extended by user activity');
      }
    };

    const checkInactivity = () => {
      const lastActivity = parseInt(localStorage.getItem('sa_last_activity') || Date.now().toString());
      const now = Date.now();
      const elapsed = now - lastActivity;

      if (elapsed >= INACTIVITY_LIMIT) {
        addHistoryEvent('session_expiry', 'Session expired due to 12h inactivity');
        logout();
        localStorage.removeItem('sa_last_activity');
      } else if (elapsed >= WARNING_THRESHOLD && !showSessionWarning) {
        setShowSessionWarning(true);
      }
    };

    // Events to track activity
    const events = ['mousemove', 'click', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));

    const interval = setInterval(checkInactivity, 30000); // Check every 30s

    // Initial check on startup
    checkInactivity();

    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimer));
      clearInterval(interval);
    };
  }, [user, logout, showSessionWarning]);

  const extendSession = () => {
    localStorage.setItem('sa_last_activity', Date.now().toString());
    setShowSessionWarning(false);
    addHistoryEvent('session_extended', 'Session manually extended');
  };

  return (
    <AppContext.Provider value={{ 
      theme, setTheme, 
      history, addHistoryEvent, clearHistory,
      sessions, terminateSession, logoutAllOtherSessions, createNewSession, currentSessionId,
      settings, setSettings,
      showSessionWarning, setShowSessionWarning,
      extendSession
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
