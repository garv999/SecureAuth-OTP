import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import PhoneLogin from './pages/PhoneLogin';
import OtpVerify from './pages/OtpVerify';
import Success from './pages/Success';

function App() {
  const [step, setStep] = useState('phone'); // phone, otp, success
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleSendOtp = (phone) => {
    setPhoneNumber(phone);
    setStep('otp');
  };

  const handleVerify = () => {
    setStep('success');
  };

  const handleBack = () => {
    setStep('phone');
  };

  const handleReset = () => {
    setStep('phone');
    setPhoneNumber('');
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
          <PhoneLogin key="phone" onSendOtp={handleSendOtp} />
        )}
        
        {step === 'otp' && (
          <OtpVerify 
            key="otp" 
            phoneNumber={phoneNumber} 
            onVerify={handleVerify} 
            onBack={handleBack} 
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
