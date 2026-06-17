import { useState, useEffect } from 'react';
import { BsPhone, BsExclamationTriangle } from 'react-icons/bs';
import { FcGoogle } from 'react-icons/fc';
import { 
  PhoneAuthProvider, 
  GoogleAuthProvider, 
  reauthenticateWithCredential,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from 'firebase/auth';
import { auth } from '../../services/firebase';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import Modal from '../Modal';
import OtpInput from './OtpInput';
import { toast } from 'react-hot-toast';

const ReauthModal = ({ isOpen, onClose, onAuthenticated, title = "Confirm Your Identity" }) => {
  const { user } = useAuth();
  const [step, setStep] = useState('select'); // select, phone_otp
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);

  const providers = user?.providerData || [];
  const hasGoogle = providers.some(p => p.providerId === 'google.com');
  const hasPhone = providers.some(p => p.providerId === 'phone');

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setStep('select');
        setLoading(false);
        setOtp('');
        setConfirmationResult(null);
      }, 300); // Wait for modal close animation
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleGoogleReauth = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await import('firebase/auth').then(m => m.signInWithPopup(auth, provider));
      const credential = GoogleAuthProvider.credentialFromResult(result);
      await reauthenticateWithCredential(auth.currentUser, credential);
      onAuthenticated();
    } catch (err) {
      console.error('Google reauth failed:', err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const initRecaptcha = () => {
    if (!window.reauthRecaptcha) {
      window.reauthRecaptcha = new RecaptchaVerifier(auth, 'reauth-recaptcha-container', {
        'size': 'invisible'
      });
    }
  };

  const handlePhoneReauthStart = async () => {
    setLoading(true);
    try {
      initRecaptcha();
      const appVerifier = window.reauthRecaptcha;
      const result = await signInWithPhoneNumber(auth, user.phoneNumber, appVerifier);
      setConfirmationResult(result);
      setStep('phone_otp');
      toast.success('Verification code sent');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneReauthVerify = async () => {
    setLoading(true);
    try {
      const credential = PhoneAuthProvider.credential(confirmationResult.verificationId, otp);
      await reauthenticateWithCredential(auth.currentUser, credential);
      onAuthenticated();
    } catch (err) {
      console.error('Phone reauth failed:', err);
      toast.error('Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
    >
      <div className="space-y-6 py-4">
        <div className="flex items-center gap-4 p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
          <BsExclamationTriangle className="text-amber-500 text-xl shrink-0" />
          <p className="text-sm text-[var(--text-secondary)] font-medium">
            This is a sensitive action. Please confirm your identity to continue.
          </p>
        </div>

        {step === 'select' && (
          <div className="space-y-3">
            {hasGoogle && (
              <Button 
                variant="outline" 
                onClick={handleGoogleReauth}
                isLoading={loading}
                className="w-full h-14 justify-start px-6 gap-4 border-[var(--border-color)]"
              >
                <FcGoogle className="text-2xl" />
                <span>Confirm with Google</span>
              </Button>
            )}
            {hasPhone && (
              <Button 
                variant="outline" 
                onClick={handlePhoneReauthStart}
                isLoading={loading}
                className="w-full h-14 justify-start px-6 gap-4 border-[var(--border-color)]"
              >
                <BsPhone className="text-2xl text-blue-500" />
                <span>Confirm with {user.phoneNumber}</span>
              </Button>
            )}
          </div>
        )}

        {step === 'phone_otp' && (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-[var(--text-secondary)] mb-4">
                Enter the 6-digit code sent to your phone.
              </p>
              <div className="flex justify-center">
                <OtpInput onComplete={setOtp} />
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('select')}>Back</Button>
              <Button 
                variant="primary" 
                onClick={handlePhoneReauthVerify}
                isLoading={loading}
                disabled={otp.length !== 6}
              >
                Verify & Continue
              </Button>
            </div>
          </div>
        )}

        <div id="reauth-recaptcha-container"></div>
      </div>
    </Modal>
  );
};

export default ReauthModal;
