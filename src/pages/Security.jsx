import React from 'react';
import { motion } from 'framer-motion';
import { BsShieldCheck, BsShieldLock, BsClock, BsLightningCharge, BsInfoCircle } from 'react-icons/bs';
import { useAuth } from '../hooks/useAuth';

const Security = () => {
  const { user } = useAuth();

  const sessions = [
    { label: 'Session Health', value: 'Excellent', icon: <BsShieldCheck />, color: 'text-emerald-500' },
    { label: 'Auth Method', value: 'Phone OTP', icon: <BsShieldLock />, color: 'text-blue-500' },
    { label: 'Session Start', value: new Date(user.metadata.lastSignInTime).toLocaleTimeString(), icon: <BsClock />, color: 'text-indigo-500' },
    { label: 'Connection', value: 'Secure / TLS 1.3', icon: <BsLightningCharge />, color: 'text-amber-500' },
  ];

  const recommendations = [
    "Ensure you don't share your OTP with anyone.",
    "Log out from public or shared devices.",
    "Review your login activity regularly.",
    "Report any suspicious activity immediately."
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10"
    >
      <div>
        <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Security Center</h1>
        <p className="text-slate-400 font-medium">Protect your account and manage security settings.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {sessions.map((session, i) => (
          <div key={i} className="p-6 bg-slate-900/50 border border-slate-700 rounded-3xl">
            <div className={`text-2xl mb-4 ${session.color}`}>{session.icon}</div>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">{session.label}</p>
            <p className="text-white font-bold">{session.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-blue-600/5 border border-blue-500/20 rounded-[2.5rem] p-8">
        <div className="flex items-center gap-3 mb-6">
          <BsInfoCircle className="text-blue-500 text-2xl" />
          <h2 className="text-xl font-bold text-white">Security Recommendations</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec, i) => (
            <div key={i} className="flex items-start gap-4 p-4 bg-slate-900/50 rounded-2xl border border-slate-700/50">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 shrink-0" />
              <p className="text-slate-300 font-medium leading-relaxed">{rec}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Security;
