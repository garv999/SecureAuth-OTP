import { useState, useRef, useEffect } from 'react';

const OtpInput = ({ length = 6, onComplete }) => {
  const [otp, setOtp] = useState(new Array(length).fill(""));
  const inputRefs = useRef([]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;

    const newOtp = [...otp];
    // Take only the last character entered
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Trigger onComplete if all fields are filled
    const combinedOtp = newOtp.join("");
    if (combinedOtp.length === length) onComplete(combinedOtp);

    // Move to next input if value is entered
    if (value && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const data = e.clipboardData.getData("text").slice(0, length);
    if (!/^\d+$/.test(data)) return;

    const newOtp = [...otp];
    data.split("").forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);
    if (data.length === length) onComplete(data);
    
    // Focus the last filled input or the first empty one
    const focusIndex = data.length < length ? data.length : length - 1;
    inputRefs.current[focusIndex].focus();
  };

  return (
    <div className="flex justify-center gap-3 sm:gap-4 w-full">
      {otp.map((digit, index) => (
        <input
          key={index}
          type="text"
          ref={(el) => (inputRefs.current[index] = el)}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          inputMode="numeric"
          pattern="\d*"
          maxLength={1}
          className={`
            w-12 h-14 sm:w-16 sm:h-20 
            bg-[var(--bg-color)] border-2 border-[var(--border-color)] 
            rounded-2xl text-center text-3xl font-bold text-[var(--text-primary)] 
            focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 
            focus:outline-none transition-all duration-300 
            shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]
            placeholder:text-[var(--text-muted)]
          `}
          aria-label={`Digit ${index + 1}`}
        />
      ))}
    </div>
  );
};

export default OtpInput;
