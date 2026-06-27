import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, act, waitFor } from '@testing-library/react';
import { useContext, useEffect } from 'react';
import { AppProvider } from './AppProvider';
import { AppContext } from './AppContext';
import { useAuth } from '../hooks/useAuth';
import { getSessionFingerprint } from '../utils/session';
import { getUserSubcollection, setUserDoc } from '../services/firestore';

// Mock dependencies
vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn()
}));

vi.mock('../utils/session', () => ({
  getSessionFingerprint: vi.fn(),
  normalizeSession: (session) => ({
    sessionId: session.sessionId || session.id || 'mock-id',
    stableId: session.stableId || 'mock-stable-id',
    deviceName: session.deviceName || 'Unknown Device',
    deviceType: session.deviceType || 'Desktop',
    browserName: session.browserName || 'Unknown Browser',
    operatingSystem: session.operatingSystem || 'Unknown OS',
    sessionName: session.sessionName || 'Unknown Device',
    userAgent: session.userAgent || '',
    loginTimestamp: session.loginTimestamp || new Date().toISOString(),
    lastActivity: session.lastActivity || new Date().toISOString()
  })
}));

vi.mock('../services/firestore', () => ({
  getUserSubcollection: vi.fn(),
  setUserDoc: vi.fn().mockResolvedValue(),
  deleteUserDoc: vi.fn().mockResolvedValue(),
  logAuditEvent: vi.fn().mockResolvedValue()
}));

vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

// Test consumer to read context state
const TestConsumer = ({ onRender }) => {
  const state = useContext(AppContext);
  useEffect(() => {
    if (onRender) onRender(state);
  }, [state, onRender]);

  return (
    <div>
      <div data-testid="sid">{state.currentSessionId || 'null'}</div>
      <div data-testid="trusted">{JSON.stringify(state.trustedDevices)}</div>
    </div>
  );
};

describe('AppProvider Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.clear();
    window.localStorage.clear();
  });

  describe('AppProvider - Logout Session Reset', () => {
    it('clears currentSessionId, removes sa_current_sid from sessionStorage, and resets initialization state when user logs out', async () => {
      const mockUser = {
        uid: 'user-123',
        providerData: [{ providerId: 'google.com' }]
      };
      
      useAuth.mockReturnValue({
        user: mockUser,
        loading: false,
        logout: vi.fn()
      });

      getSessionFingerprint.mockReturnValue({
        stableId: 'fingerprint-123',
        sessionName: 'Test OS',
        deviceType: 'Desktop',
        browserName: 'Chrome',
        operatingSystem: 'macOS'
      });

      getUserSubcollection.mockResolvedValue([]);

      window.sessionStorage.setItem('sa_current_sid', 'session-active');

      let capturedState;
      const { rerender } = render(
        <AppProvider>
          <TestConsumer onRender={(s) => { capturedState = s; }} />
        </AppProvider>
      );

      await waitFor(() => {
        expect(capturedState.currentSessionId).not.toBeNull();
      });

      useAuth.mockReturnValue({
        user: null,
        loading: false,
        logout: vi.fn()
      });

      await act(async () => {
        rerender(
          <AppProvider>
            <TestConsumer onRender={(s) => { capturedState = s; }} />
          </AppProvider>
        );
      });

      await waitFor(() => {
        expect(capturedState.currentSessionId).toBeNull();
      });

      expect(window.sessionStorage.getItem('sa_current_sid')).toBeNull();
    });
  });

  describe('AppProvider - Login Session Restoration Bypass', () => {
    it('creates a new session instead of restoring when no currentSessionId exists', async () => {
      const mockUser = {
        uid: 'user-456',
        providerData: [{ providerId: 'google.com' }]
      };

      useAuth.mockReturnValue({
        user: mockUser,
        loading: false,
        logout: vi.fn()
      });

      getSessionFingerprint.mockReturnValue({
        stableId: 'fingerprint-456',
        sessionName: 'Test OS',
        deviceType: 'Desktop',
        browserName: 'Chrome',
        operatingSystem: 'macOS'
      });

      const existingSession = {
        sessionId: 'existing-session-id',
        stableId: 'fingerprint-456',
        sessionName: 'Test OS',
        deviceType: 'Desktop',
        browserName: 'Chrome',
        operatingSystem: 'macOS',
        lastActivity: new Date().toISOString()
      };
      
      getUserSubcollection.mockResolvedValue([existingSession]);

      window.sessionStorage.removeItem('sa_current_sid');
      window.localStorage.removeItem('sa_sessions');

      let capturedState;
      render(
        <AppProvider>
          <TestConsumer onRender={(s) => { capturedState = s; }} />
        </AppProvider>
      );

      await waitFor(() => {
        expect(capturedState.currentSessionId).not.toBeNull();
      });

      expect(setUserDoc).toHaveBeenCalled();
      expect(capturedState.history.some(e => e.type === 'session_restore')).toBe(false);
    });
  });

  describe('AppProvider - Storage Hardening', () => {
    it('defaults trustedDevices to an empty array when localStorage contains invalid data', async () => {
      window.localStorage.setItem('sa_trusted_devices', '{invalid-json}');

      const mockUser = {
        uid: 'user-789',
        providerData: [{ providerId: 'google.com' }]
      };

      useAuth.mockReturnValue({
        user: mockUser,
        loading: false,
        logout: vi.fn()
      });

      getUserSubcollection.mockResolvedValue([]);

      let capturedState;
      render(
        <AppProvider>
          <TestConsumer onRender={(s) => { capturedState = s; }} />
        </AppProvider>
      );

      expect(capturedState.trustedDevices).toEqual([]);
    });
  });
});
