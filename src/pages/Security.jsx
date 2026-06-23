import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BsShieldLock, 
  BsLaptop, 
  BsPhone, 
  BsTablet,
  BsChevronRight,
  BsDot,
  BsInfoCircle,
  BsCheckCircleFill,
  BsPlusCircle,
  BsXCircle,
  BsCpu,
  BsWindows,
  BsApple,
  BsAndroid2,
  BsTrash,
  BsLink45Deg,
  BsBell
} from 'react-icons/bs';
import { FcGoogle } from 'react-icons/fc';
import { useAppContext } from '../hooks/useAppContext';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import Modal from '../components/Modal';
import ReauthModal from '../components/auth/ReauthModal';
import PhoneLinkModal from '../components/auth/PhoneLinkModal';
import { formatSessionAge } from '../utils/session';
import EmptyState from '../components/common/EmptyState';
import { toast } from 'react-hot-toast';

const Security = () => {
  const { 
    sessions, 
    terminateSession, 
    logoutAllOtherSessions, 
    currentSessionId, 
    trustedDevices, 
    toggleTrustDevice,
    securityScore,
    securityNotifications,
    addHistoryEvent
  } = useAppContext();

  useEffect(() => {
    console.log("[AUTH SCREEN MOUNT] Security");
    return () => console.log("[AUTH SCREEN UNMOUNT] Security");
  }, []);

  const { 
    user, 
    linkGoogle, 
    unlinkProvider, 
    deleteAccount 
  } = useAuth();

  const [selectedSession, setSelectedSession] = useState(null);
  const [showReauth, setShowReauth] = useState(false);
  const [showPhoneLink, setShowPhoneLink] = useState(false);
  const [reauthAction, setReauthAction] = useState(null); // 'delete', 'unlink_google', 'unlink_phone'

  const recommendations = useMemo(() => [
    "Link multiple authentication providers to prevent account lockout.",
    "Regularly review your active sessions and revoke any that you don't recognize.",
    "Trust only your primary personal devices to improve your security score.",
    "Monitor security notifications for any unrecognized login attempts."
  ], []);

  const sortedSessions = useMemo(() => {
    if (!sessions) return [];
    return [...sessions].sort((a, b) => {
      if (a.sessionId === currentSessionId) return -1;
      if (b.sessionId === currentSessionId) return 1;
      return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
    });
  }, [sessions, currentSessionId]);

  const providers = useMemo(() => {
    const data = user?.providerData || [];
    return {
      google: data.find(p => p.providerId === 'google.com'),
      phone: data.find(p => p.providerId === 'phone')
    };
  }, [user]);

  const handleUnlink = (providerId) => {
    if (user.providerData.length <= 1) {
      toast.error('Cannot unlink your only authentication provider.');
      return;
    }
    setReauthAction(`unlink_${providerId}`);
    setShowReauth(true);
  };

  const handleDeleteAccount = () => {
    setReauthAction('delete');
    setShowReauth(true);
  };

  const onReauthenticated = async () => {
    setShowReauth(false);
    try {
      if (reauthAction === 'delete') {
        await deleteAccount();
        addHistoryEvent('account_deleted', 'Account and all associated data removed.');
        window.location.href = '/login';
      } else if (reauthAction === 'unlink_google.com') {
        await unlinkProvider('google.com');
        addHistoryEvent('provider_unlinked', 'Google account disconnected.');
      } else if (reauthAction === 'unlink_phone') {
        await unlinkProvider('phone');
        addHistoryEvent('provider_unlinked', 'Phone number disconnected.');
      } else if (reauthAction === 'logout_all') {
        await logoutAllOtherSessions();
      }
    } catch (error) {
      console.error("Action failed after reauth:", error);
    }
  };

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

  if (sessions === null) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent-blue)]"></div>
      </div>
    );
  }

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
      className="space-y-12 pb-20"
      role="main"
      aria-label="Security Management"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-[var(--text-primary)] tracking-tight mb-2">Security Center</h1>
          <p className="text-[var(--text-secondary)] font-medium">Enterprise account authorization & monitoring.</p>
        </div>
        
        <div className="flex items-center gap-4 p-4 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl shadow-xl">
          <div className="relative w-12 h-12 flex items-center justify-center">
             <svg className="w-full h-full transform -rotate-90">
              <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-[var(--border-color)]" />
              <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" 
                strokeDasharray={125.6} 
                strokeDashoffset={125.6 * (1 - securityScore / 100)} 
                className={securityScore > 80 ? 'text-emerald-500' : securityScore > 50 ? 'text-amber-500' : 'text-red-500'} 
              />
            </svg>
            <span className="absolute text-[10px] font-bold text-[var(--text-primary)]">{securityScore}%</span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Security Score</p>
            <p className="text-sm font-bold text-[var(--text-primary)]">
              {securityScore > 80 ? 'Enterprise Grade' : securityScore > 50 ? 'Standard' : 'Action Required'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-12">
          {/* Connected Providers */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <BsLink45Deg className="text-blue-500 text-2xl" />
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">Authentication Providers</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Google Provider */}
              <div className="p-6 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl flex flex-col justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[var(--bg-color)] rounded-xl flex items-center justify-center text-2xl border border-[var(--border-color)]">
                    <FcGoogle />
                  </div>
                  <div>
                    <h3 className="font-bold text-[var(--text-primary)] text-sm">Google Account</h3>
                    <p className="text-xs text-[var(--text-secondary)] font-medium">
                      {providers.google ? providers.google.email : 'Not connected'}
                    </p>
                  </div>
                </div>
                {providers.google ? (
                  <Button 
                    variant="outline" 
                    onClick={() => handleUnlink('google.com')}
                    className="h-10 text-xs border-red-500/20 text-red-500 hover:bg-red-500/5"
                  >
                    Disconnect
                  </Button>
                ) : (
                  <Button 
                    variant="primary" 
                    onClick={linkGoogle}
                    className="h-10 text-xs"
                  >
                    Connect Google
                  </Button>
                )}
              </div>

              {/* Phone Provider */}
              <div className="p-6 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl flex flex-col justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[var(--bg-color)] rounded-xl flex items-center justify-center text-2xl border border-[var(--border-color)] text-blue-500">
                    <BsPhone />
                  </div>
                  <div>
                    <h3 className="font-bold text-[var(--text-primary)] text-sm">Phone OTP</h3>
                    <p className="text-xs text-[var(--text-secondary)] font-medium">
                      {providers.phone ? providers.phone.phoneNumber : 'Not connected'}
                    </p>
                  </div>
                </div>
                {providers.phone ? (
                  <Button 
                    variant="outline" 
                    onClick={() => handleUnlink('phone')}
                    className="h-10 text-xs border-red-500/20 text-red-500 hover:bg-red-500/5"
                  >
                    Disconnect
                  </Button>
                ) : (
                  <Button 
                    variant="primary" 
                    className="h-10 text-xs"
                    onClick={() => setShowPhoneLink(true)}
                  >
                    Connect Phone
                  </Button>
                )}
              </div>
            </div>
          </section>

          {/* Active Sessions */}
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <BsShieldLock className="text-blue-500 text-2xl" />
                <h2 className="text-2xl font-bold text-[var(--text-primary)]">Active Sessions</h2>
              </div>
              {sessions.length > 1 && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setReauthAction('logout_all');
                    setShowReauth(true);
                  }}
                  className="!w-auto px-6 text-red-500 border-red-500/20 hover:bg-red-500/10"
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
        </div>

        <div className="space-y-8">
          {/* Notifications Center */}
          <section className="p-6 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[2rem] space-y-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BsBell className="text-blue-500 text-xl" />
                <h3 className="font-bold text-[var(--text-primary)]">Security Log</h3>
              </div>
              <span className="px-2 py-1 bg-blue-500/10 text-blue-500 text-[10px] font-bold rounded-lg">LIVE</span>
            </div>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {securityNotifications.length > 0 ? (
                securityNotifications.map((note) => (
                  <div key={note.id} className="p-4 bg-[var(--bg-color)] rounded-2xl border border-[var(--border-color)] space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${
                        note.type === 'security_alert' ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/10 text-blue-500'
                      }`}>
                        {note.type.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)] font-bold">{formatSessionAge(note.timestamp)} ago</span>
                    </div>
                    <p className="text-xs text-[var(--text-primary)] font-medium leading-relaxed">{note.details}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[var(--text-muted)] text-center py-8">No recent security events.</p>
              )}
            </div>
          </section>

          {/* Account Management */}
          <section className="p-6 bg-red-500/5 border border-red-500/10 rounded-[2rem] space-y-6">
            <h3 className="font-bold text-red-500 flex items-center gap-2">
              <BsTrash /> Account Management
            </h3>
            <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">
              Permanently delete your account and all associated security data. This action is irreversible.
            </p>
            <Button 
              variant="outline" 
              onClick={handleDeleteAccount}
              className="w-full border-red-500/20 text-red-500 hover:bg-red-500/10 h-12"
            >
              Delete Account
            </Button>
          </section>
        </div>
      </div>

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
        </div>
      </div>

      {/* Session Detail Modal */}
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
            </div>
          </div>
        )}
      </Modal>

      {/* Reauthentication Modal */}
      <ReauthModal 
        isOpen={showReauth}
        onClose={() => setShowReauth(false)}
        onAuthenticated={onReauthenticated}
        title={reauthAction === 'delete' ? 'Confirm Account Deletion' : 'Confirm Security Change'}
      />

      {/* Phone Link Modal */}
      <PhoneLinkModal 
        isOpen={showPhoneLink}
        onClose={() => setShowPhoneLink(false)}
      />
    </motion.div>
  );
};

export default Security;
