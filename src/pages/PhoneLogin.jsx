import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BsShieldLock } from 'react-icons/bs';
import PhoneInput from '../components/auth/PhoneInput';
import Button from '../components/common/Button';

const PhoneLogin = ({ onSendOtp }) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (phone.length === 10) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setLoading(false);
        onSendOtp(`+91 ${phone}`);
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
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/10 rounded-2xl mb-4">
          <BsShieldLock className="text-3xl text-blue-500" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">SecureAuth-OTP</h1>
        <p className="text-slate-400">Verify your identity securely with one-time password authentication.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <PhoneInput value={phone} onChange={setPhone} />
        <Button 
          type="submit" 
          isLoading={loading} 
          disabled={phone.length !== 10}
        >
          Send OTP
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-500 px-4">
        By continuing, you agree to our <span className="text-slate-400 underline">Terms of Service</span> and <span className="text-slate-400 underline">Privacy Policy</span>.
      </p>
    </motion.div>
  );
};

export default PhoneLogin;
