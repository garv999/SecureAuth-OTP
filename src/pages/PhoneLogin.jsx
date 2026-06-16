import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BsShieldLock } from 'react-icons/bs';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../services/firebase';
import { useAuth } from '../hooks/useAuth';
import PhoneInput from '../components/auth/PhoneInput';
import Button from '../components/common/Button';

import { toast } from 'react-hot-toast';

const PhoneLogin = () => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setConfirmationResult } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

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
    
    // Input validation: Must be exactly 10 digits
    if (!/^\d{10}$/.test(phone)) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }

    if (phone.length === 10) {
      setLoading(true);
      const formattedPhone = `+91${phone}`;
      
      try {
        const appVerifier = window.recaptchaVerifier;
        const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
        setConfirmationResult(result);
        toast.success('OTP sent successfully!');
        // Navigate to verify page with only serializable phone number and destination
        navigate('/verify', { state: { phoneNumber: formattedPhone, from: location.state?.from } });
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
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[var(--bg-color)] overflow-hidden relative">
      {/* Background Decorative Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] -z-10 animate-pulse delay-700" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        className="w-full max-w-[500px] bg-[var(--card-bg)] border border-[var(--border-color)] p-8 md:p-12 rounded-[2.5rem] shadow-2xl backdrop-blur-xl relative z-10"
      >
        <div className="text-center mb-10">
          <div className="relative inline-flex items-center justify-center w-24 h-24 mb-6 group">
            {/* Logo Glow */}
            <div className="absolute inset-0 bg-blue-500/20 rounded-3xl blur-2xl group-hover:bg-blue-500/30 transition-all duration-500" />
            <div className="relative flex items-center justify-center w-full h-full bg-blue-600 rounded-3xl text-white shadow-xl shadow-blue-500/20 group-hover:scale-110 transition-transform duration-500">
              <BsShieldLock className="text-4xl" />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-[var(--text-primary)] tracking-tight mb-3">
            SecureAuth<span className="text-blue-500 italic">Pro</span>
          </h1>
          <p className="text-[var(--text-secondary)] font-medium text-lg">
            Enterprise Identity & Access Management
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] ml-1">
              Authorized Phone Number
            </label>
            <PhoneInput value={phone} onChange={setPhone} />
            {error && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm text-center font-bold bg-red-500/10 py-3 rounded-xl border border-red-500/20"
              >
                {error}
              </motion.p>
            )}
          </div>

          <Button 
            type="submit" 
            isLoading={loading} 
            disabled={phone.length !== 10}
            className="h-14 text-lg shadow-blue-500/25"
          >
            Request Access OTP
          </Button>
        </form>

        <div id="recaptcha-container" className="mt-4"></div>

        <div className="mt-12 pt-8 border-t border-[var(--border-color)] text-center">
          <p className="text-sm text-[var(--text-secondary)] font-medium leading-relaxed">
            By accessing this system, you agree to our <br className="hidden sm:block" />
            <span className="text-[var(--text-primary)] font-bold underline cursor-pointer hover:text-blue-500 transition-colors">Terms of Service</span> and <span className="text-[var(--text-primary)] font-bold underline cursor-pointer hover:text-blue-500 transition-colors">Privacy Policy</span>.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default PhoneLogin;
