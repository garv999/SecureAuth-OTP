import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { IoArrowBack } from 'react-icons/io5';
import OtpInput from '../components/auth/OtpInput';
import Timer from '../components/auth/Timer';
import Button from '../components/common/Button';

const OtpVerify = ({ phoneNumber, onVerify, onBack }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = () => {
    if (otp.length === 6) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setLoading(false);
        onVerify();
      }, 1500);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-md w-full"
    >
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
      >
        <IoArrowBack />
        <span>Back</span>
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Verify OTP</h1>
        <p className="text-slate-400">
          We sent a 6-digit code to <span className="text-white font-medium">{phoneNumber}</span>
        </p>
      </div>

      <div className="space-y-8">
        <OtpInput onComplete={setOtp} />
        
        <div className="space-y-4">
          <Button 
            onClick={handleVerify} 
            isLoading={loading} 
            disabled={otp.length !== 6}
          >
            Verify & Continue
          </Button>
          
          <Timer onResend={() => console.log('Resending OTP...')} />
        </div>
      </div>
    </motion.div>
  );
};

export default OtpVerify;
