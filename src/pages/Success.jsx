import React from 'react';
import { motion } from 'framer-motion';
import { BsCheckCircleFill } from 'react-icons/bs';
import Button from '../components/common/Button';

const Success = ({ onContinue }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md w-full text-center"
    >
      <div className="mb-8 flex justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 260, 
            damping: 20,
            delay: 0.2 
          }}
          className="relative"
        >
          <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full" />
          <BsCheckCircleFill className="text-8xl text-green-500 relative z-10" />
        </motion.div>
      </div>

      <h1 className="text-3xl font-bold text-white mb-2">Verification Successful</h1>
      <p className="text-slate-400 mb-10">
        Your phone number has been verified. You can now access your dashboard.
      </p>

      <Button onClick={onContinue}>
        Go to Dashboard
      </Button>
    </motion.div>
  );
};

export default Success;
