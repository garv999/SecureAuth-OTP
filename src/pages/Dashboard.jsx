import React from 'react';
import { motion } from 'framer-motion';
import { BsCheckCircleFill, BsPerson, BsPhone, BsFingerprint } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-md w-full"
    >
      <div className="bg-slate-800/50 border border-slate-700 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-green-500/20 blur-2xl rounded-full" />
            <BsCheckCircleFill className="text-6xl text-green-500 relative z-10" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white text-center mb-2">Welcome Back!</h1>
        <p className="text-slate-400 text-center mb-8 text-sm">You have successfully authenticated via OTP.</p>

        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-2xl border border-slate-700/50">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
              <BsPhone />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Phone Number</p>
              <p className="text-slate-200 font-semibold">{user.phoneNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-2xl border border-slate-700/50">
            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500">
              <BsFingerprint />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">User UID</p>
              <p className="text-slate-200 font-semibold truncate text-sm">{user.uid}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-2xl border border-slate-700/50">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
              <BsPerson />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Status</p>
              <p className="text-emerald-400 font-semibold text-sm">Authenticated</p>
            </div>
          </div>
        </div>

        <Button variant="outline" onClick={handleLogout}>
          Logout Session
        </Button>
      </div>
    </motion.div>
  );
};

export default Dashboard;
