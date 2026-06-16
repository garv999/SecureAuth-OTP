import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BsShieldCheck, 
  BsShieldLock, 
  BsClock, 
  BsLightningCharge, 
  BsInfoCircle, 
  BsLaptop, 
  BsSmartphone, 
  BsGlobe, 
  BsTrash 
} from 'react-icons/bs';
import { useAuth } from '../hooks/useAuth';
import { useAppContext } from '../hooks/useAppContext';
import Button from '../components/common/Button';

const Security = () => {
  const { user } = useAuth();
  const { sessions, terminateSession, logoutAllOtherSessions, currentSessionId } = useAppContext();

  const sessionStats = [
    { label: 'Session Health', value: 'Excellent', icon: <BsShieldCheck />, color: 'text-emerald-500' },
    { label: 'Auth Method', value: 'Phone OTP', icon: <BsShieldLock />, color: 'text-blue-500' },
    { label: 'Total Devices', value: sessions.length, icon: <BsLaptop />, color: 'text-indigo-500' },
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
      className="space-y-12"
    >
      <div>
        <h1 className="text-4xl font-bold text-[var(--text-primary)] tracking-tight mb-2">Security Center</h1>
        <p className="text-[var(--text-secondary)] font-medium">Protect your account and manage active sessions.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {sessionStats.map((stat, i) => (
          <div key={i} className="p-6 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl">
            <div className={`text-2xl mb-4 ${stat.color}`}>{stat.icon}</div>
            <p className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-[0.2em] mb-1">{stat.label}</p>
            <p className="text-[var(--text-primary)] font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Active Sessions Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BsLaptop className="text-indigo-500 text-2xl" />
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Active Sessions</h2>
          </div>
          {sessions.length > 1 && (
            <Button 
              variant="outline" 
              onClick={logoutAllOtherSessions}
              className="!w-auto px-6 text-red-500 border-red-500/20 hover:bg-red-500/10 transition-colors"
            >
              Logout All Other Devices
            </Button>
          )}
        </div>

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {sessions.map((session) => (
              <motion.div
                key={session.sessionId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`p-6 bg-[var(--card-bg)] border rounded-3xl flex flex-col md:flex-row md:items-center gap-6 transition-colors ${
                  session.sessionId === currentSessionId ? 'border-blue-500/50 shadow-lg shadow-blue-500/5' : 'border-[var(--border-color)]'
                }`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${
                  session.sessionId === currentSessionId ? 'bg-blue-600/20 text-blue-500' : 'bg-[var(--bg-color)] text-[var(--text-secondary)]'
                }`}>
                  {session.deviceType === 'Mobile' ? <BsSmartphone /> : <BsLaptop />}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-[var(--text-primary)] text-lg">
                      {session.operatingSystem} • {session.browserName}
                    </h3>
                    {session.sessionId === currentSessionId && (
                      <span className="px-2.5 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-bold uppercase rounded-full">
                        Current Session
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--text-secondary)]">
                    <span className="flex items-center gap-1.5">
                      <BsGlobe size={14} /> IP: 127.0.0.1 (Local)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <BsClock size={14} /> Logged in: {new Date(session.loginTimestamp).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => terminateSession(session.sessionId)}
                    className="p-3 hover:bg-red-500/10 rounded-xl text-red-500 transition-colors group"
                    title="Terminate Session"
                  >
                    <BsTrash size={20} className="group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      <div className="bg-blue-600/5 border border-blue-500/20 rounded-[2.5rem] p-8">
        <div className="flex items-center gap-3 mb-6">
          <BsInfoCircle className="text-blue-500 text-2xl" />
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Security Recommendations</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec, i) => (
            <div key={i} className="flex items-start gap-4 p-4 bg-[var(--card-bg)] rounded-2xl border border-[var(--border-color)]">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 shrink-0" />
              <p className="text-[var(--text-secondary)] font-medium leading-relaxed">{rec}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>

  );
};

export default Security;
