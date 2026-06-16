import { BsPhone } from 'react-icons/bs';

const PhoneInput = ({ value, onChange, countryCode = '+91' }) => {
  return (
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-[var(--text-secondary)] group-focus-within:text-blue-500 transition-colors">
        <BsPhone className="text-xl" />
        <span className="font-medium border-r border-[var(--border-color)] pr-2">{countryCode}</span>
      </div>
      <input
        type="tel"
        placeholder="Enter phone number"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 10))}
        className="w-full bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl py-4 pl-24 pr-4 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-lg tracking-wider"
      />
    </div>
  );
};

export default PhoneInput;
