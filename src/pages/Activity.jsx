import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BsBoxArrowInRight, 
  BsBoxArrowRight, 
  BsArrowRepeat, 
  BsXLg, 
  BsShieldCheck, 
  BsSearch, 
  BsFilter,
  BsCalendarDate,
  BsTrash,
  BsClockHistory
} from 'react-icons/bs';
import { useAppContext } from '../hooks/useAppContext';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';

const Activity = () => {
  const { history, clearHistory } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  const filterChips = [
    { id: 'all', label: 'All Events' },
    { id: 'login', label: 'Logins' },
    { id: 'logout', label: 'Logouts' },
    { id: 'session_restore', label: 'Restored' },
    { id: 'session_expiry', label: 'Expired' },
    { id: 'session_created', label: 'Created' },
    { id: 'session_terminated', label: 'Terminated' },
    { id: 'session_extended', label: 'Extended' },
  ];

  const filteredHistory = useMemo(() => {
    return history.filter(event => {
      const matchesSearch = event?.details?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           event?.type?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || event?.type === filterType;
      const matchesDate = !dateFilter || (event?.timestamp && typeof event.timestamp === 'string' && event.timestamp.startsWith(dateFilter));
      
      return matchesSearch && matchesType && matchesDate;
    });
  }, [history, searchTerm, filterType, dateFilter]);

  const getIcon = (type) => {
    switch (type) {
      case 'login': return <BsBoxArrowInRight className="text-emerald-500" />;
      case 'logout': return <BsBoxArrowRight className="text-red-500" />;
      case 'session_restore': return <BsArrowRepeat className="text-blue-500" />;
      case 'session_expiry': return <BsXLg className="text-amber-500" />;
      case 'session_extended': return <BsShieldCheck className="text-blue-400" />;
      default: return <BsArrowRepeat />;
    }
  };

  const getLabel = (type) => {
    switch (type) {
      case 'login': return 'Logged In';
      case 'logout': return 'Logged Out';
      case 'session_restore': return 'Session Restored';
      case 'session_expiry': return 'Session Expired';
      case 'session_extended': return 'Session Extended';
      default: return (type || '').replace(/_/g, ' ').toUpperCase();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-4xl"
      role="main"
      aria-label="Activity Logs"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-bold text-[var(--text-primary)] tracking-tight mb-2">Login Activity</h1>
          <p className="text-[var(--text-secondary)] font-medium">Historical timeline of your recent sessions.</p>
        </div>
        <Button 
          variant="outline" 
          onClick={clearHistory} 
          className="!w-auto px-6 text-red-500 border-red-500/30 hover:bg-red-500/10 transition-colors"
          aria-label="Clear all activity logs"
        >
          <BsTrash className="mr-2" /> Clear Logs
        </Button>
      </div>

      <div className="space-y-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1 group">
            <BsSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent-blue)] transition-colors" />
            <input 
              type="text" 
              placeholder="Search activity details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl py-3.5 pl-12 pr-4 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-blue)] transition-all"
              aria-label="Search activity logs"
            />
          </div>
          <div className="relative group">
            <BsCalendarDate className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent-blue)] transition-colors" />
            <input 
              type="date" 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl py-3.5 pl-12 pr-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-blue)] transition-all"
              aria-label="Filter by date"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter events by type">
          {filterChips.map(chip => (
            <button
              key={chip.id}
              onClick={() => setFilterType(chip.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                filterType === chip.id 
                  ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20' 
                  : 'bg-[var(--card-bg)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>


      <div className="space-y-6 relative before:absolute before:left-[21px] before:top-4 before:bottom-4 before:w-[2px] before:bg-[var(--border-color)]">
        {filteredHistory.length === 0 ? (
          <EmptyState 
            icon={searchTerm || dateFilter || filterType !== 'all' ? <BsFilter /> : <BsClockHistory />}
            title={history.length === 0 ? "No activity yet" : "No results found"}
            message={history.length === 0 ? "Events like logins and session updates will appear here." : "Try adjusting your filters or search term to find what you're looking for."}
            actionLabel={history.length === 0 ? null : "Reset All Filters"}
            onAction={() => {
              setSearchTerm('');
              setFilterType('all');
              setDateFilter('');
            }}
          />
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredHistory.map((event, i) => (
              <motion.div 
                key={event.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ delay: i * 0.02 }}
                className="flex gap-6 relative z-10"
              >
                <div className="w-11 h-11 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-full flex items-center justify-center text-xl shrink-0">
                  {getIcon(event.type)}
                </div>
                <div className="flex-1 p-5 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl hover:border-[var(--accent-blue)] transition-all group">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <span className="font-bold text-[var(--text-primary)] text-lg group-hover:text-[var(--accent-blue)] transition-colors">{getLabel(event.type)}</span>
                    <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest bg-[var(--bg-color)] px-3 py-1 rounded-full border border-[var(--border-color)]">
                      {event?.timestamp ? new Date(event.timestamp).toLocaleString() : 'Unknown Time'}
                    </span>
                  </div>
                  <p className="text-[var(--text-secondary)] text-sm font-medium leading-relaxed">{event.details || 'System event processed successfully.'}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

    </motion.div>
  );
};

export default Activity;
