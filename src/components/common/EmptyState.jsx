import { motion } from 'framer-motion';
import Button from './Button';

const EmptyState = ({ icon, title, message, actionLabel, onAction }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[2.5rem] shadow-sm"
    >
      <div className="w-20 h-20 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-3xl flex items-center justify-center text-4xl text-[var(--text-muted)] mb-6 shadow-inner">
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">{title}</h3>
      <p className="text-[var(--text-secondary)] max-w-sm mx-auto mb-8 font-medium">
        {message}
      </p>
      {actionLabel && (
        <Button 
          variant="outline" 
          onClick={onAction} 
          className="!w-auto px-8 border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-color)]"
        >
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
};

export default EmptyState;
