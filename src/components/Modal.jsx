import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoClose } from 'react-icons/io5';
import Button from './common/Button';

const Modal = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-[var(--bg-color)] border border-[var(--border-color)] rounded-[2rem] overflow-hidden shadow-2xl"
        >
          <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)]">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">{title}</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-[var(--card-bg)] rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <IoClose size={24} />
            </button>
          </div>
          
          <div className="p-6">
            {children}
          </div>
          
          {footer && (
            <div className="flex items-center gap-4 p-6 bg-[var(--card-bg)] border-t border-[var(--border-color)]">
              {footer}
            </div>
          )}
        </motion.div>

      </div>
    </AnimatePresence>
  );
};

export default Modal;
