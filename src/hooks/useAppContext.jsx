import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './useAuth';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { user } = useAuth();
  const [theme, setTheme] = useState(localStorage.getItem('sa_theme') || 'dark');
  const [history, setHistory] = useState(JSON.parse(localStorage.getItem('sa_history')) || []);
  const [settings, setSettings] = useState(JSON.parse(localStorage.getItem('sa_settings')) || {
    toasts: true,
    animations: true,
    autoCopy: false
  });

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

  return (
    <AppContext.Provider value={{ 
      theme, setTheme, 
      history, addHistoryEvent, clearHistory,
      settings, setSettings 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
