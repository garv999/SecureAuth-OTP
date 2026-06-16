import { motion } from 'framer-motion';
import { BsPhone, BsFingerprint, BsCalendarEvent, BsClock, BsShieldCheck } from 'react-icons/bs';
import { useAuth } from '../hooks/useAuth';

const Profile = () => {
  const { user } = useAuth();

  const details = [
    { label: 'Phone Number', value: user.phoneNumber, icon: <BsPhone className="text-blue-500" /> },
    { label: 'User ID', value: user.uid, icon: <BsFingerprint className="text-indigo-500" /> },
    { label: 'Account Created', value: new Date(user.metadata.creationTime).toLocaleString(), icon: <BsCalendarEvent className="text-emerald-500" /> },
    { label: 'Last Login', value: new Date(user.metadata.lastSignInTime).toLocaleString(), icon: <BsClock className="text-amber-500" /> },
    { label: 'Provider', value: 'Phone Auth', icon: <BsShieldCheck className="text-cyan-500" /> },
    { label: 'Status', value: 'Verified', icon: <BsShieldCheck className="text-green-500" /> },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-4xl"
    >
      <div className="flex items-center gap-6 mb-10">
        <div className="w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center text-white text-4xl font-bold shadow-2xl shadow-blue-500/20">
          {user.phoneNumber.slice(-2)}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-1">User Profile</h1>
          <p className="text-[var(--text-secondary)] font-medium">{user.phoneNumber}</p>
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {details.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-6 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl flex items-center gap-5"
          >
            <div className="w-12 h-12 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl flex items-center justify-center text-2xl">
              {item.icon}
            </div>
            <div>
              <p className="text-xs text-[var(--text-secondary)] font-bold uppercase tracking-widest mb-1">{item.label}</p>
              <p className="text-[var(--text-primary)] font-semibold break-all">{item.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

    </motion.div>
  );
};

export default Profile;
