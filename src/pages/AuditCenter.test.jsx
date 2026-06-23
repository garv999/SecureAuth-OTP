import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import AuditCenter from './AuditCenter';
import { useAuth } from '../hooks/useAuth';
import { getAuditLogs } from '../services/firestore';

// Mock hook and service
vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn()
}));

vi.mock('../services/firestore', () => ({
  getAuditLogs: vi.fn()
}));

describe('AuditCenter Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({
      user: { uid: 'test-uid' }
    });
  });

  it('renders loading skeleton and then loads events', async () => {
    const mockLogs = [
      {
        id: 'log-1',
        eventType: 'login',
        riskLevel: 'LOW',
        device: 'MacBook Pro',
        browser: 'Chrome',
        os: 'macOS',
        sessionId: 'session-123',
        timestamp: new Date().toISOString(),
        metadata: { details: 'Logged in successfully' }
      }
    ];

    getAuditLogs.mockResolvedValue({
      logs: mockLogs,
      lastVisible: null
    });

    render(<AuditCenter />);

    // Initially should show header
    expect(screen.getByText('Enterprise Audit Center')).toBeInTheDocument();

    // Wait for the mock logs to be loaded
    await waitFor(() => {
      expect(screen.getByText('Logged in successfully')).toBeInTheDocument();
    });

    expect(screen.getAllByText('LOW')[0]).toBeInTheDocument();
    expect(screen.getAllByText('MacBook Pro')[0]).toBeInTheDocument();
  });

  it('opens event details drawer when clicking an event', async () => {
    const mockLogs = [
      {
        id: 'log-2',
        eventType: 'security_alert',
        riskLevel: 'HIGH',
        device: 'iPhone',
        browser: 'Safari',
        os: 'iOS',
        sessionId: 'session-456',
        timestamp: new Date().toISOString(),
        metadata: { details: 'Unrecognized device login' }
      }
    ];

    getAuditLogs.mockResolvedValue({
      logs: mockLogs,
      lastVisible: null
    });

    render(<AuditCenter />);

    await waitFor(() => {
      expect(screen.getByText('Unrecognized device login')).toBeInTheDocument();
    });

    // Click the event
    fireEvent.click(screen.getByText('Unrecognized device login'));

    // Check if the drawer opens with detail information
    expect(screen.getByRole('heading', { name: 'Event Details' })).toBeInTheDocument();
    expect(screen.getByText('session-456')).toBeInTheDocument();
    expect(screen.getByText('iOS')).toBeInTheDocument();
    expect(screen.getByText('Safari')).toBeInTheDocument();
  });
});
