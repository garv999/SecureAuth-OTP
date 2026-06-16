import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BsShieldLock, 
  BsLaptop, 
  BsPhone, 
  BsTablet,
  BsChevronRight,
  BsDot,
  BsInfoCircle,
  BsExclamationTriangle,
  BsCheckCircleFill,
  BsPlusCircle,
  BsXCircle,
  BsCpu,
  BsWindows,
  BsApple,
  BsAndroid2
} from 'react-icons/bs';
import { useAppContext } from '../hooks/useAppContext';
import Button from '../components/common/Button';
import Modal from '../components/Modal';
import { formatSessionAge } from '../utils/session';
import EmptyState from '../components/common/EmptyState';

const Security = () => {
  const { sessions, terminateSession, logoutAllOtherSessions, currentSessionId, trustedDevices, toggleTrustDevice } = useAppContext();
  const [selectedSession, setSelectedSession] = useState(null);

  const recommendations = useMemo(() => [
    "Enable biometric authentication for faster and more secure access.",
    "Regularly review your active sessions and revoke any that you don't recognize.",
    "Keep your browser and operating system up to date to ensure you have the latest security patches.",
    "Avoid using public Wi-Fi when accessing sensitive account information."
  ], []);

  const sortedSessions = useMemo(() => [...sessions].sort((a, b) => {
    if (a.sessionId === currentSessionId) return -1;
    if (b.sessionId === currentSessionId) return 1;
    return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
  }), [sessions, currentSessionId]);

  const calculateSecurityScore = useCallback(() => {
    let score = 100;
    if (sessions.length > 3) score -= 15;
    if (sessions.length > 6) score -= 20;
    
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const inactiveSessions = sessions.filter(s => new Date(s.lastActivity).getTime() < oneWeekAgo);
    if (inactiveSessions.length > 0) score -= 10;
    
    return Math.max(score, 0);
  }, [sessions]);

  const score = useMemo(() => calculateSecurityScore(), [calculateSecurityScore]);

  const getDeviceIcon = (type) => {
    switch (type) {
      case 'Mobile': return <BsPhone />;
      case 'Tablet': return <BsTablet />;
      default: return <BsLaptop />;
    }
  };

  const getOSIcon = (os) => {
    if (os.includes('Mac') || os.includes('iOS')) return <BsApple />;
    if (os.includes('Windows')) return <BsWindows />;
    if (os.includes('Android')) return <BsAndroid2 />;
    return <BsCpu />;
  };

  if (sessions.length === 0) {
    return (
      <EmptyState 
        icon={<BsShieldLock />}
        title="No Active Sessions"
        message="Your account has no active sessions. This might happen if you've recently logged out of all devices."
        actionLabel="Back to Dashboard"
        onAction={() => window.location.href = '/dashboard'}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12"
      role="main"
      aria-label="Security Management"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-[var(--text-primary)] tracking-tight mb-2">Security Center</h1>
          <p className="text-[var(--text-secondary)] font-medium">Device intelligence and session health.</p>
        </div>
        
        <div className="flex items-center gap-4 p-4 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl shadow-xl">
          <div className="relative w-12 h-12 flex items-center justify-center">
             <svg className="w-full h-full transform -rotate-90">
              <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-[var(--border-color)]" />
              <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" 
                strokeDasharray={125.6} 
                strokeDashoffset={125.6 * (1 - score / 100)} 
                className={score > 80 ? 'text-emerald-500' : score > 50 ? 'text-amber-500' : 'text-red-500'} 
              />
            </svg>
            <span className="absolute text-[10px] font-bold text-[var(--text-primary)]">{score}%</span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Security Score</p>
            <p className="text-sm font-bold text-[var(--text-primary)]">{score > 80 ? 'Excellent' : 'Needs Review'}</p>
          </div>
        </div>
      </div>

      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BsShieldLock className="text-blue-500 text-2xl" />
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Active Sessions</h2>
          </div>
          {sessions.length > 1 && (
            <Button 
              variant="outline" 
              onClick={logoutAllOtherSessions} 
              className="!w-auto px-6 text-red-500 border-red-500/20 hover:bg-red-500/10"
              aria-label="Revoke all other active sessions"
            >
              Revoke Other Sessions
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence mode="popLayout">
            {sortedSessions.map((session) => {
              const isCurrent = session.sessionId === currentSessionId;
              const isTrusted = trustedDevices.includes(session.stableId);
              
              return (
                <motion.div
                  key={session.sessionId}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => setSelectedSession(session)}
                  className={`group p-6 bg-[var(--card-bg)] border rounded-3xl flex items-center gap-6 cursor-pointer transition-all hover:border-[var(--accent-blue)] ${
                    isCurrent ? 'border-blue-500/40 shadow-xl' : 'border-[var(--border-color)]'
                  }`}
                  role="button"
                  aria-label={`View details for ${session.sessionName}`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
                    isCurrent ? 'bg-blue-600/20 text-blue-500' : 'bg-[var(--bg-color)] text-[var(--text-secondary)]'
                  }`}>
                    {getDeviceIcon(session.deviceType)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-bold text-[var(--text-primary)] truncate">
                        {session.sessionName}
                      </h3>
                      {isCurrent && (
                        <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[9px] font-bold uppercase rounded-full">Current Device</span>
                      )}
                      {isTrusted && (
                        <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] font-bold uppercase rounded-full flex items-center gap-1">
                          <BsCheckCircleFill className="text-[8px]" /> Trusted
                        </span>
                      )}
                      {!isTrusted && !isCurrent && (
                        <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[9px] font-bold uppercase rounded-full">New Device</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)] font-medium">
                      <span className="flex items-center gap-1 uppercase tracking-tighter">
                         {getOSIcon(session.operatingSystem)} {session.operatingSystem}
                      </span>
                      <BsDot />
                      <span>Last active {formatSessionAge(session.lastActivity)} ago</span>
                    </div>
                  </div>

                  <BsChevronRight className="text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors" />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </section>

      <div className="bg-blue-600/5 border border-blue-500/20 rounded-[2.5rem] p-8">
        <div className="flex items-center gap-3 mb-6">
          <BsInfoCircle className="text-blue-500 text-2xl" />
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Security Insights</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec, i) => (
            <div key={i} className="flex items-start gap-4 p-4 bg-[var(--card-bg)] rounded-2xl border border-[var(--border-color)]">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 shrink-0" />
              <p className="text-[var(--text-secondary)] text-sm font-medium leading-relaxed">{rec}</p>
            </div>
          ))}
          {sessions.length > 3 && (
            <div className="flex items-start gap-4 p-4 bg-amber-500/5 rounded-2xl border border-amber-500/20">
              <BsExclamationTriangle className="text-amber-500 mt-1 shrink-0" />
              <p className="text-amber-600 dark:text-amber-400 text-sm font-medium leading-relaxed">Multiple active sessions detected. Consider revoking unused devices.</p>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={!!selectedSession}
        onClose={() => setSelectedSession(null)}
        title="Session Intelligence"
        footer={
          <div className="flex flex-wrap gap-3 w-full justify-between">
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  toggleTrustDevice(selectedSession.stableId);
                  setSelectedSession(null);
                }}
                className="!w-auto px-4"
              >
                {trustedDevices.includes(selectedSession?.stableId) ? (
                  <><BsXCircle className="mr-2" /> Remove Trust</>
                ) : (
                  <><BsPlusCircle className="mr-2" /> Trust Device</>
                )}
              </Button>
              <Button 
                variant="primary" 
                className="!w-auto px-4 bg-red-600 hover:bg-red-700"
                onClick={() => {
                  terminateSession(selectedSession.sessionId);
                  setSelectedSession(null);
                }}
              >
                Terminate Session
              </Button>
            </div>
            <Button variant="outline" className="!w-auto px-4" onClick={() => setSelectedSession(null)}>Close</Button>
          </div>
        }
      >
        {selectedSession && (
          <div className="space-y-6">
            <div className="p-4 bg-[var(--bg-color)] rounded-2xl border border-[var(--border-color)] space-y-4 text-sm">
               <div className="flex justify-between items-center">
                <span className="text-[var(--text-secondary)] uppercase text-[10px] font-bold">Session Identifier</span>
                <span className="text-[var(--text-primary)] font-mono font-bold text-xs">{selectedSession.sessionId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-secondary)] uppercase text-[10px] font-bold">Hardware Profile</span>
                <span className="text-[var(--text-primary)] font-bold">{selectedSession.deviceName} ({selectedSession.deviceType})</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-secondary)] uppercase text-[10px] font-bold">Software Engine</span>
                <span className="text-[var(--text-primary)] font-bold">{selectedSession.browserName} on {selectedSession.operatingSystem}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-secondary)] uppercase text-[10px] font-bold">Trust Status</span>
                <span className={`font-bold ${trustedDevices.includes(selectedSession.stableId) ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {trustedDevices.includes(selectedSession.stableId) ? 'Verified Trusted' : 'Standard Access'}
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-[var(--border-color)] pt-4">
                <span className="text-[var(--text-secondary)] uppercase text-[10px] font-bold">First Authorized</span>
                <span className="text-[var(--text-primary)] font-bold">{new Date(selectedSession.loginTimestamp).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-secondary)] uppercase text-[10px] font-bold">Last Synchronized</span>
                <span className="text-[var(--text-primary)] font-bold">{new Date(selectedSession.lastActivity).toLocaleString()}</span>
              </div>
            </div>
            <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl flex items-start gap-3">
              <BsInfoCircle className="text-blue-500 mt-1 shrink-0" />
              <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">
                Trusting this device will bypass secondary verification for 30 days. Only trust devices that you own and are secure.
              </p>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
};

export default Security;
