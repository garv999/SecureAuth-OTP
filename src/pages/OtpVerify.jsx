import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IoArrowBack } from 'react-icons/io5';
import { useLocation, useNavigate } from 'react-router-dom';
import OtpInput from '../components/auth/OtpInput';
import Timer from '../components/auth/Timer';
import Button from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';

import { toast } from 'react-hot-toast';

const OtpVerify = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user, confirmationResult } = useAuth();
  
  const { phoneNumber } = location.state || {};

  // Redirect if already logged in or if no confirmationResult (page refresh)
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    } else if (!confirmationResult) {
      navigate('/login');
    }
  }, [user, confirmationResult, navigate]);

  const handleVerify = async () => {
    if (otp.length === 6 && confirmationResult) {
      setLoading(true);
      setError('');
      try {
        await confirmationResult.confirm(otp);
        toast.success('Phone verified successfully!');
        navigate('/dashboard');
      } catch (err) {
        console.error(err);
        let message = 'Invalid OTP code. Please try again.';
        if (err.code === 'auth/code-expired') message = 'OTP code expired. Please resend.';
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }
  };

  if (!confirmationResult) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-md w-full"
    >
      <button 
        onClick={() => navigate('/login')}
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
        <div className="space-y-4">
          <OtpInput onComplete={setOtp} />
          {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}
        </div>
        
        <div className="space-y-4">
          <Button 
            onClick={handleVerify} 
            isLoading={loading} 
            disabled={otp.length !== 6}
          >
            Verify & Continue
          </Button>
          
          <Timer onResend={() => navigate('/login')} />
        </div>
      </div>
    </motion.div>
  );
};

export default OtpVerify;
