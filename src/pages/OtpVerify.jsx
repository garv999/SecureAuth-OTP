import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IoArrowBack } from 'react-icons/io5';
import { BsShieldLock } from 'react-icons/bs';
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
  const { user, confirmationResult, verifyOtp } = useAuth();
  
  const { phoneNumber, from } = location.state || {};

  useEffect(() => {
    console.log("[AUTH SCREEN MOUNT] OtpVerify");
    return () => console.log("[AUTH SCREEN UNMOUNT] OtpVerify");
  }, []);

  // Redirect if already logged in or if no confirmationResult (page refresh)
  useEffect(() => {
    if (user) {
      const destination = from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    } else if (!confirmationResult) {
      navigate('/login');
    }
  }, [user, confirmationResult, navigate, from]);

  const handleVerify = async () => {
    if (otp.length === 6 && confirmationResult) {
      setLoading(true);
      setError('');
      try {
        await verifyOtp(otp);
        toast.success('Phone verified successfully!');
        const destination = from?.pathname || '/dashboard';
        navigate(destination, { replace: true });
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

  const maskPhoneNumber = (phone) => {
    if (!phone) return '';
    // Expected format: +91XXXXXXXXXX
    const countryCode = phone.slice(0, 3);
    const lastThree = phone.slice(-3);
    return `${countryCode} XXXXXXX${lastThree}`;
  };

  if (!confirmationResult) return null;

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
        <button 
          onClick={() => navigate('/login')}
          className="group absolute top-8 left-8 flex items-center gap-2 text-[var(--text-secondary)] hover:text-blue-500 transition-colors font-bold text-sm uppercase tracking-widest"
        >
          <IoArrowBack className="text-lg transition-transform group-hover:-translate-x-1" />
          <span>Back</span>
        </button>

        <div className="text-center mb-10 mt-4">
          <div className="relative inline-flex items-center justify-center w-24 h-24 mb-6 group">
            {/* Logo Glow */}
            <div className="absolute inset-0 bg-blue-500/20 rounded-3xl blur-2xl group-hover:bg-blue-500/30 transition-all duration-500" />
            <div className="relative flex items-center justify-center w-full h-full bg-blue-600 rounded-3xl text-white shadow-xl shadow-blue-500/20 group-hover:scale-110 transition-transform duration-500">
              <BsShieldLock className="text-4xl" />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-[var(--text-primary)] tracking-tight mb-3">
            Verify Your Identity
          </h1>
          <p className="text-[var(--text-secondary)] font-medium text-lg mb-2">
            Enter the 6-digit verification code sent to your registered phone number.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 rounded-full border border-blue-500/20">
            <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">Code sent to:</span>
            <span className="text-sm font-mono font-bold text-[var(--text-primary)]">{maskPhoneNumber(phoneNumber)}</span>
          </div>
        </div>


        <div className="space-y-10">
          <div className="space-y-4">
            <div className="flex justify-center">
              <OtpInput onComplete={setOtp} />
            </div>
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

          
          <div className="space-y-6">
            <Button 
              onClick={handleVerify} 
              isLoading={loading} 
              disabled={otp.length !== 6}
              className="h-14 text-lg shadow-blue-500/25"
            >
              Verify & Continue
            </Button>
            
            <div className="pt-2">
              <Timer onResend={() => navigate('/login')} />
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[var(--border-color)] text-center">
          <p className="text-xs text-[var(--text-muted)] font-medium leading-relaxed uppercase tracking-[0.1em]">
            Secure Verification Layer <br />
            Powered by SecureAuth Enterprise
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default OtpVerify;
