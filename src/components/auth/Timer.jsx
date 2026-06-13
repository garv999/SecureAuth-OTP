import React, { useState, useEffect } from 'react';

const Timer = ({ initialSeconds = 30, onResend }) => {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (seconds > 0) {
      const timer = setTimeout(() => setSeconds(seconds - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [seconds]);

  const handleResend = () => {
    setSeconds(initialSeconds);
    onResend();
  };

  return (
    <div className="text-center mt-6">
      {seconds > 0 ? (
        <p className="text-slate-400">
          Resend code in <span className="text-blue-500 font-medium">{seconds}s</span>
        </p>
      ) : (
        <button
          onClick={handleResend}
          className="text-blue-500 hover:text-blue-400 font-medium transition-colors"
        >
          Resend Code
        </button>
      )}
    </div>
  );
};

export default Timer;
