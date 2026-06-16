import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BsGrid, 
  BsPerson, 
  BsShieldLock, 
  BsClockHistory, 
  BsGear,
  BsBoxArrowRight,
  BsList,
  BsXLg
} from 'react-icons/bs';
import { toast } from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import Modal from './Modal';
import Button from './common/Button';

import { useAppContext } from '../hooks/useAppContext';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const { logout, user } = useAuth();
  const { addHistoryEvent } = useAppContext();
  const navigate = useNavigate();

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: <BsGrid /> },
    { to: '/profile', label: 'Profile', icon: <BsPerson /> },
    { to: '/security', label: 'Security', icon: <BsShieldLock /> },
    { to: '/activity', label: 'Activity', icon: <BsClockHistory /> },
    { to: '/settings', label: 'Settings', icon: <BsGear /> },
  ];

  const handleLogout = async () => {
    try {
      addHistoryEvent('logout', `User ${user?.phoneNumber} ended session.`);
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (err) {
      toast.error('Logout failed');
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full py-8 px-6 bg-[var(--sidebar-bg)] backdrop-blur-2xl border-r border-[var(--border-color)]">
      <div className="flex items-center gap-3 mb-12 px-2">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
          <BsShieldLock size={24} />
        </div>
        <span className="text-xl font-bold tracking-tight text-[var(--text-primary)]">SecureAuth<span className="text-blue-500 italic">Pro</span></span>
      </div>


      <nav className="flex-1 space-y-2">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={() => setIsOpen(false)}
            className={({ isActive }) => `
              flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 group
              ${isActive 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--card-bg)]'
              }
            `}
          >
            <span className="text-xl">{link.icon}</span>
            <span className="font-semibold tracking-wide">{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <button
        onClick={() => setIsLogoutModalOpen(true)}
        className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[var(--text-secondary)] hover:text-red-400 hover:bg-red-400/10 transition-all duration-200 mt-auto"
      >
        <BsBoxArrowRight size={20} />
        <span className="font-semibold tracking-wide">Logout</span>
      </button>


      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="Confirm Logout"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsLogoutModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleLogout} className="bg-red-600 hover:bg-red-700">Logout</Button>
          </>
        }
      >
        <p className="text-slate-400">Are you sure you want to end your current secure session?</p>
      </Modal>
    </div>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900/50 backdrop-blur-xl border-b border-slate-800/50 flex items-center justify-between px-6 z-40">
        <div className="flex items-center gap-2">
          <BsShieldLock className="text-blue-500 text-2xl" />
          <span className="font-bold text-white tracking-tight">SecureAuth Pro</span>
        </div>
        <button onClick={() => setIsOpen(true)} className="p-2 text-slate-400 hover:text-white transition-colors">
          <BsList size={28} />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-80 z-50 lg:hidden shadow-2xl"
            >
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white"
              >
                <BsXLg />
              </button>
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 h-screen sticky top-0">
        <SidebarContent />
      </aside>
    </>
  );
};

export default Sidebar;
