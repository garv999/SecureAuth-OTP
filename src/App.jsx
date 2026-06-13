import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import PhoneLogin from './pages/PhoneLogin';
import OtpVerify from './pages/OtpVerify';
import Success from './pages/Success';

function App() {
  const [step, setStep] = useState('phone'); // phone, otp, success
  const [phoneNumber, setPhoneNumber] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [error, setError] = useState('');

  const handleSendOtp = (phone, result) => {
    setPhoneNumber(phone);
    setConfirmationResult(result);
    setError('');
    setStep('otp');
  };

  const handleVerify = () => {
    setStep('success');
    setError('');
  };

  const handleBack = () => {
    setStep('phone');
    setError('');
  };

  const handleReset = () => {
    setStep('phone');
    setPhoneNumber('');
    setConfirmationResult(null);
    setError('');
  };

  const handleError = (msg) => {
    setError(msg);
  };

  return (
    <div className="min-h-screen w-full bg-[#0f172a] flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
      </div>

      <AnimatePresence mode="wait">
        {step === 'phone' && (
          <PhoneLogin 
            key="phone" 
            onSendOtp={handleSendOtp} 
            onError={handleError}
            error={error}
          />
        )}
        
        {step === 'otp' && (
          <OtpVerify 
            key="otp" 
            phoneNumber={phoneNumber} 
            confirmationResult={confirmationResult}
            onVerify={handleVerify} 
            onBack={handleBack}
            onError={handleError}
            error={error}
          />
        )}

        {step === 'success' && (
          <Success key="success" onContinue={handleReset} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
