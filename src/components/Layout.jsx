import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { BsExclamationTriangleFill } from 'react-icons/bs';
import { toast } from 'react-hot-toast';
import Sidebar from './Sidebar';
import Modal from './Modal';
import Button from './common/Button';
import { useAppContext } from '../hooks/useAppContext';
import { useAuth } from '../hooks/useAuth';

const Layout = () => {
  const { showSessionWarning, extendSession, addHistoryEvent } = useAppContext();
  const { logout, user } = useAuth();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      addHistoryEvent('logout', `User ${user?.phoneNumber} manually ended session.`);
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch {
      toast.error('Logout failed');
    } finally {
      setIsLogoutModalOpen(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen w-full relative">
      <Sidebar 
        isLogoutModalOpen={isLogoutModalOpen} 
        setIsLogoutModalOpen={setIsLogoutModalOpen} 
      />
      
      <main className="flex-1 p-6 lg:p-10 mt-16 lg:mt-0 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Logout Confirmation Modal - Root Level Centered */}
      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="Confirm Logout"
        footer={
          <div className="flex gap-4 w-full">
            <Button 
              variant="secondary" 
              onClick={() => setIsLogoutModalOpen(false)}
              className="flex-1 h-12"
              autoFocus
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={handleLogout}
              className="flex-1 h-12"
            >
              Logout
            </Button>
          </div>
        }
      >
        <div className="flex flex-col items-center text-center space-y-6 py-4">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl animate-pulse" />
            <div className="relative w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center text-red-500 text-4xl">
              <BsExclamationTriangleFill />
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-xl font-bold text-[var(--text-primary)]">Are you sure you want to end your current secure session?</p>
            <p className="text-sm text-[var(--text-secondary)] font-medium leading-relaxed">
              You will need to verify your identity again to regain access to your account and device intelligence data.
            </p>
          </div>
        </div>
      </Modal>

      {/* Inactivity Warning Modal */}
      <Modal
        isOpen={showSessionWarning}
        onClose={() => {}} // Force decision
        title="Session Expiry Warning"
        footer={
          <div className="flex gap-4 w-full">
            <Button variant="outline" className="flex-1" onClick={handleLogout}>Logout Now</Button>
            <Button variant="primary" className="flex-1" onClick={extendSession}>Stay Logged In</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-[var(--text-secondary)]">Your session will expire in <span className="text-[var(--text-primary)] font-bold text-lg">5 minutes</span> due to inactivity.</p>
          <p className="text-[var(--text-muted)] text-sm italic">For your security, we automatically end sessions after 12 hours of inactivity.</p>
        </div>
      </Modal>
    </div>
  );
};

export default Layout;
