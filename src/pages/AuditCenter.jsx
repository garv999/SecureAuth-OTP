import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BsBoxArrowInRight, 
  BsBoxArrowRight, 
  BsArrowRepeat, 
  BsXLg, 
  BsShieldCheck, 
  BsShieldX,
  BsLink45Deg,
  BsExclamationTriangleFill,
  BsSearch, 
  BsFilter,
  BsCalendarDate,
  BsClipboard,
  BsClipboardCheck,
  BsInfoCircle
} from 'react-icons/bs';
import { useAuth } from '../hooks/useAuth';
import { getAuditLogs } from '../services/firestore';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import { toast } from 'react-hot-toast';

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

const AuditCenter = () => {
  const { user } = useAuth();
  const [now] = useState(() => Date.now());
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [copiedId, setCopiedId] = useState(false);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterRisk, setFilterRisk] = useState('all');
  const [filterDevice, setFilterDevice] = useState('all');
  const [dateRangeOption, setDateRangeOption] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchLogs = useCallback(async (isInitial = false) => {
    if (!user) return;
    if (isInitial) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const limitVal = 20;
      const { logs: newLogs, lastVisible } = await getAuditLogs(
        user.uid, 
        limitVal, 
        isInitial ? null : lastDoc
      );

      setLogs(prev => isInitial ? newLogs : [...prev, ...newLogs]);
      setLastDoc(lastVisible);
      setHasMore(newLogs.length === limitVal);
    } catch (err) {
      toast.error('Failed to load audit logs');
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [user, lastDoc]);

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      await Promise.resolve();
      if (isMounted) {
        fetchLogs(true);
      }
    };
    run();
    return () => {
      isMounted = false;
    };
  }, [user, fetchLogs]);

  // Unique devices computed from all loaded logs
  const uniqueDevices = useMemo(() => {
    const devices = new Set();
    logs.forEach(log => {
      if (log.device) devices.add(log.device);
    });
    return Array.from(devices);
  }, [logs]);

  // Combined client-side filtering on all fetched logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // 1. Search term match
      const searchLower = searchTerm.toLowerCase();
      const eventName = (EVENT_TYPE_LABELS[log.eventType] || log.eventType || '').toLowerCase();
      const matchesSearch = 
        eventName.includes(searchLower) ||
        (log.device || '').toLowerCase().includes(searchLower) ||
        (log.browser || '').toLowerCase().includes(searchLower) ||
        (log.os || '').toLowerCase().includes(searchLower) ||
        (log.sessionId || '').toLowerCase().includes(searchLower) ||
        (log.metadata?.details || '').toLowerCase().includes(searchLower);

      // 2. Event Type match
      const matchesType = filterType === 'all' || log.eventType === filterType;

      // 3. Risk match
      const matchesRisk = filterRisk === 'all' || log.riskLevel === filterRisk;

      // 4. Device match
      const matchesDevice = filterDevice === 'all' || log.device === filterDevice;

      // 5. Date match
      let matchesDate = true;
      const logTime = new Date(log.timestamp).getTime();

      if (dateRangeOption === '24h') {
        matchesDate = now - logTime <= 24 * 60 * 60 * 1000;
      } else if (dateRangeOption === '7d') {
        matchesDate = now - logTime <= 7 * 24 * 60 * 60 * 1000;
      } else if (dateRangeOption === '30d') {
        matchesDate = now - logTime <= 30 * 24 * 60 * 60 * 1000;
      } else if (dateRangeOption === 'custom') {
        if (startDate) {
          const start = new Date(startDate).getTime();
          matchesDate = matchesDate && logTime >= start;
        }
        if (endDate) {
          // Add 1 day to end date to include the full end date
          const end = new Date(endDate).getTime() + 24 * 60 * 60 * 1000;
          matchesDate = matchesDate && logTime <= end;
        }
      }

      return matchesSearch && matchesType && matchesRisk && matchesDevice && matchesDate;
    });
  }, [logs, searchTerm, filterType, filterRisk, filterDevice, dateRangeOption, startDate, endDate, now]);

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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    toast.success('Session ID copied to clipboard');
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setFilterRisk('all');
    setFilterDevice('all');
    setDateRangeOption('all');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="relative min-h-[80vh]">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-bold text-[var(--text-primary)] tracking-tight mb-2">Enterprise Audit Center</h1>
          <p className="text-[var(--text-secondary)] font-medium">Real-time security analytics and event logs.</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => fetchLogs(true)} 
          isLoading={loading && logs.length > 0}
          className="!w-auto px-6 text-xs h-10 border-[var(--border-color)] text-[var(--text-primary)]"
        >
          Refresh Feed
        </Button>
      </div>

      {/* Filter and Search Panel */}
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl p-6 mb-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative group">
            <BsSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent-blue)] transition-colors" />
            <input 
              type="text" 
              placeholder="Search audit details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl py-3 pl-12 pr-4 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-blue)] transition-all text-sm font-medium"
            />
          </div>

          {/* Event Type Filter */}
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl py-3 px-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-blue)] transition-all text-sm font-medium"
          >
            <option value="all">All Event Types</option>
            {Object.entries(EVENT_TYPE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          {/* Risk Level Filter */}
          <select 
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl py-3 px-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-blue)] transition-all text-sm font-medium"
          >
            <option value="all">All Risk Levels</option>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
          </select>

          {/* Device Filter */}
          <select 
            value={filterDevice}
            onChange={(e) => setFilterDevice(e.target.value)}
            className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl py-3 px-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-blue)] transition-all text-sm font-medium"
          >
            <option value="all">All Devices</option>
            {uniqueDevices.map(dev => (
              <option key={dev} value={dev}>{dev}</option>
            ))}
          </select>
        </div>

        {/* Date Filter Panel */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 border-t border-[var(--border-color)] pt-6">
          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] font-bold uppercase tracking-wider">
            <BsCalendarDate />
            <span>Time Range:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All Time' },
              { id: '24h', label: 'Last 24h' },
              { id: '7d', label: 'Last 7 Days' },
              { id: '30d', label: 'Last 30 Days' },
              { id: 'custom', label: 'Custom Range' }
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => setDateRangeOption(opt.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                  dateRangeOption === opt.id 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20' 
                    : 'bg-[var(--bg-color)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {dateRangeOption === 'custom' && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 mt-4 lg:mt-0"
            >
              <input 
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl py-2 px-3 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-blue)] transition-all font-semibold"
              />
              <span className="text-[var(--text-muted)] font-semibold text-xs">to</span>
              <input 
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl py-2 px-3 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-blue)] transition-all font-semibold"
              />
            </motion.div>
          )}
        </div>
      </div>

      {/* Main List Area */}
      <div className="space-y-4">
        {loading ? (
          // Skeleton Loader
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-20 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredLogs.length === 0 ? (
          <EmptyState 
            icon={<BsFilter />}
            title="No audit events match filters"
            message="Try widening your search terms or adjusting the date/risk filters."
            actionLabel="Reset All Filters"
            onAction={handleResetFilters}
          />
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredLogs.map((log) => (
                <motion.div
                  key={log.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onClick={() => setSelectedEvent(log)}
                  className="flex items-center justify-between p-5 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl hover:border-blue-500 cursor-pointer transition-all hover:shadow-lg hover:shadow-blue-500/5 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-full flex items-center justify-center text-xl shrink-0 group-hover:bg-blue-500/10 group-hover:border-blue-500/20 transition-all">
                      {getEventIcon(log.eventType)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-[var(--text-primary)] text-sm md:text-base group-hover:text-blue-500 transition-colors">
                          {EVENT_TYPE_LABELS[log.eventType] || log.eventType}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${RISK_BADGES[log.riskLevel || 'LOW']}`}>
                          {log.riskLevel || 'LOW'}
                        </span>
                      </div>
                      <p className="text-[var(--text-secondary)] text-xs md:text-sm font-medium mt-1">
                        {log.metadata?.details || 'System activity event.'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
                      {log.device}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] font-semibold mt-1 block">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center pt-6">
                <Button 
                  variant="outline" 
                  onClick={() => fetchLogs(false)} 
                  isLoading={loadingMore}
                  className="!w-auto px-10 h-12 text-sm border-[var(--border-color)] text-[var(--text-primary)]"
                >
                  Load More Events
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Side Details Drawer overlay */}
      <AnimatePresence>
        {selectedEvent && (
          <>
            {/* Drawer Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEvent(null)}
              className="fixed inset-0 bg-black z-50"
            />

            {/* Side Drawer Content */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-[var(--card-bg)] border-l border-[var(--border-color)] shadow-2xl z-50 flex flex-col"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-[var(--border-color)] flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">Event Details</h2>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 font-semibold tracking-wider">
                    ID: {selectedEvent.id}
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedEvent(null)}
                  className="w-10 h-10 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
                >
                  <BsXLg />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Event Type card */}
                <div className="p-6 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-3xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl flex items-center justify-center text-2xl shrink-0">
                      {getEventIcon(selectedEvent.eventType)}
                    </div>
                    <div>
                      <h3 className="font-bold text-[var(--text-primary)] text-sm md:text-base">
                        {EVENT_TYPE_LABELS[selectedEvent.eventType] || selectedEvent.eventType}
                      </h3>
                      <p className="text-xs text-[var(--text-muted)] font-semibold mt-1">
                        {new Date(selectedEvent.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${RISK_BADGES[selectedEvent.riskLevel || 'LOW']}`}>
                    {selectedEvent.riskLevel || 'LOW'}
                  </span>
                </div>

                {/* Event Context Fields */}
                <div className="space-y-6">
                  <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em]">Context Information</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl">
                      <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">Device</span>
                      <span className="font-bold text-sm text-[var(--text-primary)] mt-1 block">{selectedEvent.device || 'Unknown'}</span>
                    </div>
                    <div className="p-4 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl">
                      <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">Operating System</span>
                      <span className="font-bold text-sm text-[var(--text-primary)] mt-1 block">{selectedEvent.os || 'Unknown'}</span>
                    </div>
                    <div className="p-4 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl">
                      <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">Browser</span>
                      <span className="font-bold text-sm text-[var(--text-primary)] mt-1 block">{selectedEvent.browser || 'Unknown'}</span>
                    </div>
                    <div className="p-4 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl">
                      <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">Risk Assessment</span>
                      <span className={`font-bold text-sm mt-1 block ${
                        selectedEvent.riskLevel === 'HIGH' ? 'text-red-500' : selectedEvent.riskLevel === 'MEDIUM' ? 'text-amber-500' : 'text-emerald-500'
                      }`}>
                        {selectedEvent.riskLevel} Risk
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl space-y-2">
                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">Session ID</span>
                    <div className="flex items-center justify-between gap-4">
                      <code className="text-xs font-mono break-all text-blue-500">{selectedEvent.sessionId || 'N/A'}</code>
                      {selectedEvent.sessionId && (
                        <button 
                          onClick={() => copyToClipboard(selectedEvent.sessionId)}
                          className="text-[var(--text-secondary)] hover:text-blue-500 transition-colors shrink-0"
                        >
                          {copiedId ? <BsClipboardCheck className="text-emerald-500" /> : <BsClipboard />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Metadata details map */}
                {selectedEvent.metadata && Object.keys(selectedEvent.metadata).length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em]">Extended Metadata</h4>
                    <div className="p-4 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl">
                      <pre className="text-xs font-mono text-[var(--text-secondary)] whitespace-pre-wrap break-all overflow-x-auto">
                        {JSON.stringify(selectedEvent.metadata, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AuditCenter;
