import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Modal from './Modal';
import Button from './common/Button';
import { useAppContext } from '../hooks/useAppContext';
import { useAuth } from '../hooks/useAuth';

const Layout = () => {
  const { showSessionWarning, extendSession } = useAppContext();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen w-full">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-10 mt-16 lg:mt-0 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>

      <Modal
        isOpen={showSessionWarning}
        onClose={() => {}} // Force decision
        title="Session Expiry Warning"
        footer={
          <>
            <Button variant="outline" onClick={handleLogout}>Logout Now</Button>
            <Button variant="primary" onClick={extendSession}>Stay Logged In</Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-slate-400">Your session will expire in <span className="text-white font-bold text-lg">5 minutes</span> due to inactivity.</p>
          <p className="text-slate-500 text-sm italic">For your security, we end sessions after 12 hours of inactivity.</p>
        </div>
      </Modal>
    </div>
  );
};

export default Layout;
