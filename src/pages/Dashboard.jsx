import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BsPhone, 
  BsFingerprint, 
  BsCalendarCheck, 
  BsShieldCheck,
  BsCopy,
  BsCheck2All,
  BsSearch,
  BsDownload
} from 'react-icons/bs';
import { toast } from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { useAppContext } from '../hooks/useAppContext';
import Button from '../components/common/Button';

const Dashboard = () => {
  const { user } = useAuth();
  const { history } = useAppContext();
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('UID copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const exportReport = (format) => {
    const data = {
      user: {
        uid: user.uid,
        phone: user.phoneNumber,
        lastLogin: user.metadata.lastSignInTime,
        created: user.metadata.creationTime
      },
      stats: {
        totalLogins: history.filter(e => e.type === 'login').length,
        lastActive: new Date().toISOString()
      }
    };

    const content = format === 'json' 
      ? JSON.stringify(data, null, 2)
      : `SecureAuth Pro - User Report\n\nUID: ${user.uid}\nPhone: ${user.phoneNumber}\nLast Login: ${user.metadata.lastSignInTime}`;

    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `secureauth-report-${Date.now()}.${format}`;
    a.click();
    toast.success(`Report exported as ${format.toUpperCase()}`);
  };

  const stats = [
    { label: 'Total Sessions', value: history.filter(e => e.type === 'login' || e.type === 'session_restore').length, icon: <BsCalendarCheck className="text-blue-500" /> },
    { label: 'Security Health', value: '100%', icon: <BsShieldCheck className="text-emerald-500" /> },
    { label: 'Auth Provider', value: 'Phone', icon: <BsPhone className="text-indigo-500" /> },
  ];

  const infoCards = [
    { label: 'Verified Phone', value: user.phoneNumber, icon: <BsPhone />, id: 'phone' },
    { label: 'User Unique ID', value: user.uid, icon: <BsFingerprint />, id: 'uid', copy: true },
  ].filter(card => 
    card.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
    card.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-2">System Overview</h1>
          <p className="text-slate-400 font-medium">Real-time authentication analytics and account status.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => exportReport('txt')} className="!w-auto px-6">
            <BsDownload className="mr-2" /> Export TXT
          </Button>
          <Button variant="primary" onClick={() => exportReport('json')} className="!w-auto px-6">
            <BsDownload className="mr-2" /> Export JSON
          </Button>
        </div>
      </div>

      {/* Global Search */}
      <div className="relative group max-w-md">
        <BsSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
        <input 
          type="text" 
          placeholder="Filter dashboard information..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500 transition-all"
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 bg-slate-900/50 border border-slate-700 rounded-3xl"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center mb-4 text-xl">
              {stat.icon}
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {infoCards.map((card, i) => (
          <motion.div 
            key={card.id}
            whileHover={{ y: -5 }}
            className="p-6 bg-slate-800/50 border border-slate-700 rounded-[2rem] flex items-center gap-6"
          >
            <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 text-2xl">
              {card.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">{card.label}</p>
              <div className="flex items-center gap-3">
                <p className="text-white font-semibold truncate">{card.value}</p>
                {card.copy && (
                  <button 
                    onClick={() => copyToClipboard(card.value)}
                    className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
                  >
                    {copied ? <BsCheck2All className="text-green-500" /> : <BsCopy size={16} />}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Dashboard;
