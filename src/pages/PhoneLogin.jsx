import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BsShieldLock } from 'react-icons/bs';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../services/firebase';
import PhoneInput from '../components/auth/PhoneInput';
import Button from '../components/common/Button';

const PhoneLogin = ({ onSendOtp, onError, error }) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      'size': 'invisible',
      'callback': (response) => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
      },
      'expired-callback': () => {
        onError('reCAPTCHA expired. Please try again.');
      }
    });

    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }
    };
  }, [onError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (phone.length === 10) {
      setLoading(true);
      const formattedPhone = `+91${phone}`;
      
      try {
        const appVerifier = window.recaptchaVerifier;
        const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
        onSendOtp(formattedPhone, confirmationResult);
      } catch (err) {
        console.error("Firebase Error:", err);
        let message = `Error (${err.code}): Failed to send OTP.`;
        if (err.code === 'auth/invalid-phone-number') message = 'Invalid phone number.';
        if (err.code === 'auth/too-many-requests') message = 'Too many requests. Try again later.';
        if (err.code === 'auth/admin-restricted-operation') message = 'Phone authentication is not enabled in Firebase Console.';
        if (err.code === 'auth/unauthorized-domain') message = 'This domain is not authorized in Firebase Console.';
        onError(message);
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
          {error && <p className="text-red-500 text-sm">{error}</p>}
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
        By continuing, you agree to our <span className="text-slate-400 underline">Terms of Service</span> and <span className="text-slate-400 underline">Privacy Policy</span>.
      </p>
    </motion.div>
  );
};

export default PhoneLogin;
