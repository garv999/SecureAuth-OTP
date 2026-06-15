import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BsCheckCircleFill, 
  BsPerson, 
  BsPhone, 
  BsFingerprint, 
  BsCalendarCheck, 
  BsShieldCheck,
  BsCopy,
  BsCheck2All
} from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (err) {
      console.error("Logout failed", err);
      toast.error('Logout failed');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('UID copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user) return null;

  // Format date
  const lastLogin = user.metadata.lastSignInTime 
    ? new Date(user.metadata.lastSignInTime).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    : 'N/A';

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  const cardHover = {
    scale: 1.02,
    backgroundColor: "rgba(30, 41, 59, 0.8)",
    transition: { type: "spring", stiffness: 400, damping: 10 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-md w-full px-4 sm:px-0"
    >
      <div className="bg-slate-800/50 border border-slate-700 rounded-[2.5rem] p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        {/* Decorative background circle */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full" />
        
        <motion.div variants={itemVariants} className="flex justify-center mb-6">
          <div className="relative">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.3 }}
              className="absolute inset-0 bg-green-500/20 blur-2xl rounded-full" 
            />
            <BsCheckCircleFill className="text-7xl text-green-500 relative z-10" />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Access Granted</h1>
          <p className="text-slate-400 text-sm font-medium">Your identity has been verified securely.</p>
        </motion.div>

        <div className="space-y-4 mb-10">
          {/* Info Cards */}
          <motion.div 
            variants={itemVariants}
            whileHover={cardHover}
            className="group flex items-center gap-4 p-4 bg-slate-900/40 rounded-2xl border border-slate-700/50 transition-colors"
          >
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 group-hover:bg-blue-500/20 transition-colors">
              <BsPhone className="text-xl" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.1em] mb-0.5">Verified Phone</p>
              <p className="text-slate-100 font-semibold tracking-wide">{user.phoneNumber}</p>
            </div>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            whileHover={cardHover}
            className="group flex items-center gap-4 p-4 bg-slate-900/40 rounded-2xl border border-slate-700/50 transition-colors"
          >
            <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500 group-hover:bg-indigo-500/20 transition-colors">
              <BsFingerprint className="text-xl" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.1em] mb-0.5">User Unique ID</p>
              <div className="flex items-center gap-2">
                <p className="text-slate-100 font-semibold truncate text-sm">{user.uid}</p>
                <button 
                  onClick={() => copyToClipboard(user.uid)}
                  className="p-1.5 hover:bg-slate-700 rounded-md text-slate-400 hover:text-white transition-colors"
                  title="Copy UID"
                >
                  {copied ? <BsCheck2All className="text-green-500" /> : <BsCopy size={14} />}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Activity Section */}
          <motion.div variants={itemVariants} className="pt-4 pb-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] px-1 mb-4">Authentication Activity</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-900/30 rounded-2xl border border-slate-700/30">
                <BsCalendarCheck className="text-blue-400 mb-2" />
                <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Last Login</p>
                <p className="text-slate-300 text-[11px] leading-tight font-medium">{lastLogin}</p>
              </div>
              <div className="p-4 bg-slate-900/30 rounded-2xl border border-slate-700/30">
                <BsShieldCheck className="text-emerald-400 mb-2" />
                <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Provider</p>
                <p className="text-slate-300 text-[11px] font-medium leading-tight">Phone Auth</p>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div variants={itemVariants} className="flex items-center gap-4">
          <div className="flex-1">
             <Button variant="outline" onClick={handleLogout} className="border-slate-700 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-500">
              Sign Out
            </Button>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-500 uppercase">Live</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
