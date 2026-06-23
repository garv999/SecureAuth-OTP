import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider } from './AuthProvider';
import { AuthContext } from './AuthContext';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { useContext } from 'react';

// Mock Firebase Auth
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  onAuthStateChanged: vi.fn(),
  signOut: vi.fn(),
  signInWithPhoneNumber: vi.fn(),
  signInWithPopup: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  RecaptchaVerifier: vi.fn()
}));

// Mock Firebase service
vi.mock('../services/firebase', () => ({
  auth: {},
  googleProvider: {}
}));

// Mock Firestore service
vi.mock('../services/firestore', () => ({
  logAuditEvent: vi.fn().mockResolvedValue()
}));

const TestComponent = () => {
  const { user, loading, status, loginWithGoogle, logout } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  return (
    <div>
      <div data-testid="status">{status}</div>
      <div data-testid="user">{user ? user.email : 'No User'}</div>
      <button onClick={loginWithGoogle}>Login Google</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initially shows loading and then transitions to IDLE when no user', async () => {
    let resolveAuth;
    onAuthStateChanged.mockImplementation((auth, callback) => {
      resolveAuth = () => callback(null);
      return () => {};
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Trigger the auth state change
    resolveAuth();

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('IDLE');
    });
    expect(screen.getByTestId('user')).toHaveTextContent('No User');
  });

  it('transitions to AUTHENTICATED when user is found', async () => {
    const mockUser = { email: 'test@example.com', providerData: [{ providerId: 'google.com' }] };
    onAuthStateChanged.mockImplementation((auth, callback) => {
      callback(mockUser);
      return () => {};
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('AUTHENTICATED');
    });
    expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
  });

  it('handles loginWithGoogle success', async () => {
    onAuthStateChanged.mockImplementation((auth, callback) => {
      callback(null);
      return () => {};
    });

    const mockUser = { email: 'google@example.com' };
    signInWithPopup.mockResolvedValue({ user: mockUser });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());

    const loginBtn = screen.getByText('Login Google');
    loginBtn.click();

    await waitFor(() => {
      expect(signInWithPopup).toHaveBeenCalled();
    });
  });

  it('handles logout', async () => {
    const mockUser = { email: 'test@example.com' };
    onAuthStateChanged.mockImplementation((auth, callback) => {
      callback(mockUser);
      return () => {};
    });

    signOut.mockResolvedValue();

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('AUTHENTICATED'));

    const logoutBtn = screen.getByText('Logout');
    logoutBtn.click();

    await waitFor(() => {
      expect(signOut).toHaveBeenCalled();
    });
  });
});
