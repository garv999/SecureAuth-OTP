import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BsShieldLock, BsArrowLeft } from 'react-icons/bs';
import { RecaptchaVerifier } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { useAuth } from '../../hooks/useAuth';
import { useAppContext } from '../../hooks/useAppContext';
import Button from '../common/Button';
import Modal from '../Modal';
import PhoneInput from './PhoneInput';
import OtpInput from './OtpInput';
import { toast } from 'react-hot-toast';

const PhoneLinkModal = ({ isOpen, onClose }) => {
  const { linkPhone, verifyOtp } = useAuth();
  const { addHistoryEvent } = useAppContext();
  
  const [step, setStep] = useState('input'); // input, verify
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const recaptchaRef = useRef(null);
  const recaptchaContainerRef = useRef(null);

  useEffect(() => {
    if (isOpen && recaptchaContainerRef.current) {
      console.log("[LINK STEP 1] RecaptchaVerifier initialization");
      console.log("[LINK] Container element:", recaptchaContainerRef.current);
      // Initialize reCAPTCHA when modal opens
      if (!recaptchaRef.current) {
        try {
          console.log("[STEP new RecaptchaVerifier ENTER]");
          recaptchaRef.current = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
            'size': 'invisible',
            'callback': (response) => {
              console.log('[LINK STEP 2] reCAPTCHA verified/rendered', response);
            }
          });
          console.log("[STEP new RecaptchaVerifier EXIT]");
          console.log("[LINK] Recaptcha instance:", recaptchaRef.current);
        } catch (err) {
          console.error("[LINK ERROR] reCAPTCHA init failed:", err);
        }
      }
    }

    return () => {
      if (recaptchaRef.current) {
        console.log("[LINK] Cleanup triggered. Verifier state:", recaptchaRef.current ? "Present" : "Null");
        // [PHASE 20.4 DIAGNOSIS] Temporarily disabling clear() to verify lifecycle hypothesis
        // console.log("[LINK] Clearing Recaptcha instance");
        // recaptchaRef.current.clear();
        // recaptchaRef.current = null;
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setStep('input');
        setPhoneNumber('');
        setOtp('');
        setLoading(false);
        setError('');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleStartLinking = async (e) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(phoneNumber)) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }

    setLoading(true);
    setError('');
    const formattedPhone = `+91${phoneNumber}`;
    console.log("[LINK STEP 3] verifyPhoneNumber called for:", formattedPhone);
    console.log("[LINK] Firebase Config Check:", {
      projectId: auth.app.options.projectId,
      apiKey: auth.app.options.apiKey?.substring(0, 5) + "...",
      authDomain: auth.app.options.authDomain
    });
    
    try {
      const appVerifier = recaptchaRef.current;
      if (!appVerifier) {
        console.error("[LINK ERROR] reCAPTCHA not initialized");
        throw new Error("reCAPTCHA not initialized");
      }
      
      await linkPhone(formattedPhone, appVerifier);
      console.log("[LINK STEP 4] verificationId received (via AuthProvider state)");
      setStep('verify');
    } catch (error) {
      console.group("FULL PHONE AUTH ERROR");
      console.log("RAW ERROR:", error);
      console.log("TYPE:", typeof error);
      console.log("INSTANCEOF ERROR:", error instanceof Error);
      console.log("CODE:", error?.code);
      console.log("MESSAGE:", error?.message);
      console.log("NAME:", error?.name);
      console.log("STACK:", error?.stack);
      console.log("STRINGIFIED:");
      try {
        console.log(JSON.stringify(error, null, 2));
      } catch {
        console.log("Unable to stringify");
      }
      console.groupEnd();
      console.error("PHONE AUTH ERROR (LINK)", error);
      // Errors are toasted in AuthProvider
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    setError('');
    console.log("[LINK STEP 5] linkWithCredential called via verifyOtp");
    try {
      const result = await verifyOtp(otp);
      const user = result.user;
      console.log("[LINK STEP 6] provider linked successfully.", {
        uid: user.uid,
        providers: user.providerData.map(p => p.providerId)
      });
      
      addHistoryEvent('provider_linked', `Phone number ${phoneNumber} linked to account.`);
      toast.success('Phone linked successfully!');
      onClose();
    } catch (error) {
      console.group("FULL PHONE AUTH ERROR");
      console.log("RAW ERROR:", error);
      console.log("TYPE:", typeof error);
      console.log("INSTANCEOF ERROR:", error instanceof Error);
      console.log("CODE:", error?.code);
      console.log("MESSAGE:", error?.message);
      console.log("NAME:", error?.name);
      console.log("STACK:", error?.stack);
      console.log("STRINGIFIED:");
      try {
        console.log(JSON.stringify(error, null, 2));
      } catch {
        console.log("Unable to stringify");
      }
      console.groupEnd();
      console.error("PHONE AUTH ERROR (LINK VERIFY)", error);
      // Errors are toasted in AuthProvider
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Link Phone Number"
    >
      <div className="space-y-6 py-4">
        <AnimatePresence mode="wait">
          {step === 'input' ? (
            <motion.div
              key="input"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4 p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl">
                <BsShieldLock className="text-blue-500 text-xl shrink-0" />
                <p className="text-sm text-[var(--text-secondary)] font-medium">
                  Adding a phone number allows you to use Phone OTP as a backup login method.
                </p>
              </div>

              <form onSubmit={handleStartLinking} className="space-y-6">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] ml-1">
                    Enter Phone Number
                  </label>
                  <PhoneInput value={phoneNumber} onChange={setPhoneNumber} />
                  {error && (
                    <p className="text-red-500 text-xs font-bold bg-red-500/10 py-2 px-4 rounded-lg border border-red-500/20">
                      {error}
                    </p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  isLoading={loading} 
                  disabled={phoneNumber.length !== 10}
                  className="w-full h-14 text-lg"
                >
                  Send Verification Code
                </Button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="verify"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <button 
                onClick={() => setStep('input')}
                className="flex items-center gap-2 text-xs font-bold text-blue-500 uppercase tracking-widest hover:underline"
              >
                <BsArrowLeft /> Change Number
              </button>

              <div className="text-center space-y-4">
                <p className="text-sm text-[var(--text-secondary)] font-medium">
                  Enter the 6-digit code sent to <span className="text-[var(--text-primary)] font-bold">+91 {phoneNumber}</span>
                </p>
                <div className="flex justify-center">
                  <OtpInput onComplete={setOtp} />
                </div>
                {error && (
                   <p className="text-red-500 text-xs font-bold bg-red-500/10 py-2 px-4 rounded-lg border border-red-500/20">
                    {error}
                  </p>
                )}
              </div>

              <Button 
                onClick={handleVerifyOtp} 
                isLoading={loading} 
                disabled={otp.length !== 6}
                className="w-full h-14 text-lg"
              >
                Verify & Link Phone
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={recaptchaContainerRef}></div>
      </div>
    </Modal>
  );
};

export default PhoneLinkModal;
