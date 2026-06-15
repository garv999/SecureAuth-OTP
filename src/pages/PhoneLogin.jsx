import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BsShieldLock } from 'react-icons/bs';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/firebase';
import { useAuth } from '../hooks/useAuth';
import PhoneInput from '../components/auth/PhoneInput';
import Button from '../components/common/Button';

import { Toaster, toast } from 'react-hot-toast';

const PhoneLogin = () => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user, setConfirmationResult } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': () => {},
        'expired-callback': () => {
          const msg = 'reCAPTCHA expired. Please try again.';
          setError(msg);
          toast.error(msg);
        }
      });
    }

    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (phone.length === 10) {
      setLoading(true);
      const formattedPhone = `+91${phone}`;
      
      try {
        const appVerifier = window.recaptchaVerifier;
        const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
        setConfirmationResult(result);
        toast.success('OTP sent successfully!');
        // Navigate to verify page with only serializable phone number
        navigate('/verify', { state: { phoneNumber: formattedPhone } });
      } catch (err) {
        console.error("Firebase Error:", err);
        let message = `Error (${err.code}): Failed to send OTP.`;
        if (err.code === 'auth/invalid-phone-number') message = 'Invalid phone number.';
        if (err.code === 'auth/too-many-requests') message = 'Too many requests. Try again later.';
        if (err.code === 'auth/admin-restricted-operation') message = 'Phone authentication is not enabled.';
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-md w-full"
    >
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/10 rounded-2xl mb-4">
          <BsShieldLock className="text-3xl text-blue-500" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">SecureAuth</h1>
        <p className="text-slate-400">Enter your phone number to continue</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <PhoneInput value={phone} onChange={setPhone} />
          {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}
        </div>
        <Button 
          type="submit" 
          isLoading={loading} 
          disabled={phone.length !== 10}
        >
          Send OTP
        </Button>
      </form>

      <div id="recaptcha-container"></div>

      <p className="mt-8 text-center text-sm text-slate-500 px-4">
        By continuing, you agree to our <span className="text-slate-400 underline cursor-pointer">Terms of Service</span> and <span className="text-slate-400 underline cursor-pointer">Privacy Policy</span>.
      </p>
    </motion.div>
  );
};

export default PhoneLogin;
