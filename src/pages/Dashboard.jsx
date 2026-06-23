import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  BsPhone, 
  BsFingerprint, 
  BsCalendarCheck, 
  BsShieldCheck,
  BsCopy,
  BsCheck2All,
  BsSearch,
  BsDownload,
  BsClockHistory,
  BsLaptop,
  BsArrowUpRight,
  BsArrowDownRight,
  BsDash,
  BsArrowRight,
  BsBoxArrowInRight,
  BsBoxArrowRight,
  BsArrowRepeat,
  BsXLg,
  BsShieldX,
  BsLink45Deg,
  BsExclamationTriangleFill,
  BsInfoCircle
} from 'react-icons/bs';
import { FcGoogle } from 'react-icons/fc';
import { toast } from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { useAppContext } from '../hooks/useAppContext';
import { getAuditLogs } from '../services/firestore';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';

const EVENT_TYPE_LABELS = {
  login: 'Login',
  logout: 'Logout',
  phone_login: 'Phone Login',
  google_login: 'Google Login',
  session_restore: 'Session Restored',
  session_expiry: 'Session Expired',
  session_created: 'Session Created',
  session_terminated: 'Session Terminated',
  provider_linked: 'Provider Linked',
  provider_unlinked: 'Provider Unlinked',
  account_merge: 'Account Merged',
  trusted_device_added: 'Trusted Device Added',
  trusted_device_removed: 'Trusted Device Removed',
  security_alert: 'Security Alert'
};

const RISK_BADGES = {
  LOW: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  MEDIUM: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  HIGH: 'bg-red-500/10 text-red-500 border-red-500/20'
};

const getEventIcon = (type) => {
  switch (type) {
    case 'login':
    case 'phone_login':
    case 'google_login':
      return <BsBoxArrowInRight className="text-emerald-500" />;
    case 'logout':
    case 'session_expiry':
      return <BsBoxArrowRight className="text-amber-500" />;
    case 'session_restore':
      return <BsArrowRepeat className="text-blue-500" />;
    case 'session_created':
      return <BsShieldCheck className="text-blue-400" />;
    case 'session_terminated':
      return <BsXLg className="text-red-500" />;
    case 'provider_linked':
      return <BsShieldCheck className="text-emerald-500" />;
    case 'provider_unlinked':
      return <BsShieldX className="text-red-400" />;
    case 'account_merge':
      return <BsLink45Deg className="text-purple-500" />;
    case 'trusted_device_added':
      return <BsShieldCheck className="text-teal-400" />;
    case 'trusted_device_removed':
      return <BsShieldX className="text-rose-500" />;
    case 'security_alert':
      return <BsExclamationTriangleFill className="text-red-500 animate-pulse" />;
    default:
      return <BsInfoCircle className="text-slate-400" />;
  }
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { history, analytics, securityScore } = useAppContext();
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [recentEvents, setRecentEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    const fetchRecentEvents = async () => {
      if (!user) return;
      try {
        const { logs: fetchedLogs } = await getAuditLogs(user.uid, 5);
        setRecentEvents(fetchedLogs);
      } catch (err) {
        console.error("Failed to fetch recent events on dashboard:", err);
      } finally {
        setLoadingEvents(false);
      }
    };
    fetchRecentEvents();
  }, [user]);

  const copyToClipboard = useCallback((text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('UID copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const exportReport = useCallback((format) => {
    const provider = user.providerData[0]?.providerId === 'google.com' ? 'Google' : 'Phone Auth';
    const identifier = user.providerData[0]?.providerId === 'google.com' ? user.email : user.phoneNumber;

    const data = {
      user: {
        uid: user.uid,
        provider,
        identifier,
        lastLogin: user.metadata.lastSignInTime,
        created: user.metadata.creationTime,
        securityScore
      },
      analytics
    };

    const content = format === 'json' 
      ? JSON.stringify(data, null, 2)
      : `SecureAuth Pro - User Report\n\nUID: ${user.uid}\nProvider: ${provider}\nIdentifier: ${identifier}\nSecurity Score: ${securityScore}%\nTotal Logins: ${analytics.totalLogins}`;

    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `secureauth-report-${Date.now()}.${format}`;
    a.click();
    toast.success(`Report exported as ${format.toUpperCase()}`);
  }, [user, analytics, securityScore]);

  const formatDuration = (ms) => {
    if (!ms) return '0m';
    const mins = Math.floor(ms / 60000);
    if (mins < 60) return `${mins}m`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

  const stats = useMemo(() => [
    { label: 'Security Score', value: `${securityScore}%`, icon: <BsShieldCheck className={securityScore > 80 ? 'text-emerald-500' : 'text-amber-500'} />, trend: securityScore > 80 ? 'up' : 'neutral' },
    { label: 'Total Logins', value: analytics.totalLogins, icon: <BsCalendarCheck className="text-blue-500" />, trend: 'up' },
    { label: 'Active Sessions', value: analytics.currentActiveSessions, icon: <BsShieldCheck className="text-emerald-500" />, trend: 'neutral' },
    { label: 'Avg. Duration', value: formatDuration(analytics.avgSessionDuration), icon: <BsClockHistory className="text-amber-500" />, trend: 'neutral' },
    { label: 'Max Duration', value: formatDuration(analytics.longestSession), icon: <BsClockHistory className="text-purple-500" />, trend: 'up' },
    { label: 'Unique Devices', value: analytics.totalDevicesUsed, icon: <BsLaptop className="text-indigo-500" />, trend: 'neutral' },
  ], [analytics, securityScore]);

  const infoCards = useMemo(() => {
    const provider = user.providerData[0]?.providerId === 'google.com' ? 'Google' : 'Phone Auth';
    const mainIdentifier = user.providerData[0]?.providerId === 'google.com' ? user.email : user.phoneNumber;
    
    return [
      { label: `Verified ${provider}`, value: mainIdentifier, icon: provider === 'Google' ? <FcGoogle /> : <BsPhone />, id: 'provider' },
      { label: 'User Unique ID', value: user.uid, icon: <BsFingerprint />, id: 'uid', copy: true },
    ].filter(card => 
      card.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
      card.value?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [user, searchTerm]);

  if (history.length === 0) {
    return (
      <EmptyState 
        icon={<BsCalendarCheck />}
        title="Welcome to SecureAuth Pro"
        message="Your security dashboard is ready. Start by exploring your account settings or checking your security score."
        actionLabel="Explore Security"
        onAction={() => window.location.href = '/security'}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
      role="main"
      aria-label="Security Dashboard"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-[var(--text-primary)] tracking-tight mb-2">System Overview</h1>
          <p className="text-[var(--text-secondary)] font-medium">Real-time authentication analytics and account status.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => exportReport('txt')} 
            className="!w-auto px-6 border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--card-bg)]"
            aria-label="Export report as Text"
          >
            <BsDownload className="mr-2" /> Export TXT
          </Button>
          <Button 
            variant="primary" 
            onClick={() => exportReport('json')} 
            className="!w-auto px-6"
            aria-label="Export report as JSON"
          >
            <BsDownload className="mr-2" /> Export JSON
          </Button>
        </div>
      </div>

      {/* Global Search */}
      <div className="relative group max-w-md">
        <BsSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent-blue)] transition-colors" />
        <input 
          type="text" 
          placeholder="Filter dashboard information..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl py-4 pl-12 pr-4 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-blue)] transition-all"
          aria-label="Filter dashboard information"
        />
      </div>


      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-6 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl group hover:border-[var(--accent-blue)] transition-colors"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-[var(--bg-color)] flex items-center justify-center text-xl border border-[var(--border-color)] group-hover:border-[var(--accent-blue)] transition-colors">
                {stat.icon}
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest ${
                stat.trend === 'up' ? 'text-emerald-500' : stat.trend === 'down' ? 'text-red-500' : 'text-[var(--text-muted)]'
              }`}>
                {stat.trend === 'up' && <BsArrowUpRight />}
                {stat.trend === 'down' && <BsArrowDownRight />}
                {stat.trend === 'neutral' && <BsDash />}
                {stat.trend}
              </div>
            </div>
            <p className="text-[var(--text-secondary)] text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Info Cards */}
      {infoCards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {infoCards.map((card) => (
            <motion.div 
              key={card.id}
              whileHover={{ y: -5 }}
              className="p-6 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[2rem] flex items-center gap-6"
            >
              <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 text-2xl">
                {card.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[var(--text-secondary)] font-bold uppercase tracking-widest mb-1">{card.label}</p>
                <div className="flex items-center gap-3">
                  <p className="text-[var(--text-primary)] font-semibold truncate">{card.value}</p>
                  {card.copy && (
                    <button 
                      onClick={() => copyToClipboard(card.value)}
                      className="p-2 hover:bg-[var(--bg-color)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors border border-transparent hover:border-[var(--border-color)]"
                      title="Copy to clipboard"
                      aria-label={`Copy ${card.label}`}
                    >
                      {copied ? <BsCheck2All className="text-green-500" /> : <BsCopy size={16} />}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState 
          icon={<BsSearch />}
          title="No results found"
          message={`We couldn't find any dashboard items matching "${searchTerm}". Try a different search term.`}
          actionLabel="Clear Search"
          onAction={() => setSearchTerm('')}
        />
      )}

      {/* Recent Security Events Card */}
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl p-6 mt-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Recent Security Events</h2>
            <p className="text-xs text-[var(--text-secondary)] mt-1 font-medium">Latest security activities from your account.</p>
          </div>
          <button 
            onClick={() => navigate('/audit-center')}
            className="flex items-center gap-2 text-xs font-bold text-blue-500 uppercase tracking-wider hover:underline"
          >
            View All <BsArrowRight />
          </button>
        </div>

        {loadingEvents ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-14 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : recentEvents.length === 0 ? (
          <div className="text-center py-6 text-sm text-[var(--text-secondary)] font-medium">
            No recent security events found.
          </div>
        ) : (
          <div className="space-y-4">
            {recentEvents.map(event => (
              <div 
                key={event.id}
                className="flex items-center justify-between p-4 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl text-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[var(--card-bg)] border border-[var(--border-color)] flex items-center justify-center shrink-0">
                    {getEventIcon(event.eventType)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-[var(--text-primary)]">
                        {EVENT_TYPE_LABELS[event.eventType] || event.eventType}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${RISK_BADGES[event.riskLevel]}`}>
                        {event.riskLevel}
                      </span>
                    </div>
                    <p className="text-[var(--text-secondary)] text-xs font-medium mt-0.5">
                      {event.metadata?.details || 'System activity event.'}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
                    {event.device}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] font-semibold mt-0.5 block">
                    {new Date(event.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </motion.div>
  );
};

export default Dashboard;
