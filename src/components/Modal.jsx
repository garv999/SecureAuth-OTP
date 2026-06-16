import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoClose } from 'react-icons/io5';

const Modal = ({ isOpen, onClose, title, children, footer }) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-md"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[3rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-8 border-b border-[var(--border-color)]">
            <h2 id="modal-title" className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">{title}</h2>
            <button 
              onClick={onClose}
              className="p-3 hover:bg-[var(--bg-color)] rounded-2xl text-[var(--text-secondary)] hover:text-red-500 transition-all duration-300"
              aria-label="Close modal"
            >
              <IoClose size={28} />
            </button>
          </div>
          
          {/* Content */}
          <div className="p-8">
            <div className="text-[var(--text-secondary)] font-medium leading-relaxed">
              {children}
            </div>
          </div>
          
          {/* Footer */}
          {footer && (
            <div className="flex items-center gap-4 p-8 bg-[var(--bg-color)]/30 border-t border-[var(--border-color)]">
              {footer}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default Modal;
