import React from 'react';
import { motion } from 'framer-motion';
import { BsBoxArrowInRight, BsBoxArrowRight, BsArrowRepeat, BsXLg } from 'react-icons/bs';
import { useAppContext } from '../hooks/useAppContext';
import Button from '../components/common/Button';

const Activity = () => {
  const { history, clearHistory } = useAppContext();

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
      default: return type.replace(/_/g, ' ').toUpperCase();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-3xl"
    >
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-bold text-[var(--text-primary)] tracking-tight mb-2">Login Activity</h1>
          <p className="text-[var(--text-secondary)] font-medium">Historical timeline of your recent sessions.</p>
        </div>
        <Button variant="outline" onClick={clearHistory} className="!w-auto px-6 text-red-500 border-red-500/30 hover:bg-red-500/10 transition-colors">
          Clear Logs
        </Button>
      </div>


      <div className="space-y-6 relative before:absolute before:left-[21px] before:top-4 before:bottom-4 before:w-[2px] before:bg-[var(--border-color)]">
        {history.length === 0 ? (
          <div className="p-12 text-center bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl">
            <p className="text-[var(--text-secondary)] italic font-medium">No activity logs found.</p>
          </div>
        ) : (
          history.map((event, i) => (
            <motion.div 
              key={event.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex gap-6 relative z-10"
            >
              <div className="w-11 h-11 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-full flex items-center justify-center text-xl shrink-0">
                {getIcon(event.type)}
              </div>
              <div className="flex-1 p-5 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <span className="font-bold text-[var(--text-primary)] text-lg">{getLabel(event.type)}</span>
                  <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">
                    {new Date(event.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-[var(--text-secondary)] text-sm font-medium">{event.details || 'Success authentication via Phone OTP.'}</p>
              </div>
            </motion.div>
          ))
        )}
      </div>

    </motion.div>
  );
};

export default Activity;
