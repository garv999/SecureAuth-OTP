import React from 'react';
import { motion } from 'framer-motion';
import { BsPalette, BsBell, BsLightning, BsClipboardCheck } from 'react-icons/bs';
import { useAppContext } from '../hooks/useAppContext';
import { toast } from 'react-hot-toast';

const Settings = () => {
  const { theme, setTheme, settings, setSettings } = useAppContext();

  const themes = [
    { id: 'dark', label: 'Dark Default', color: 'bg-[#0f172a]' },
    { id: 'midnight', label: 'Midnight Black', color: 'bg-black' },
    { id: 'light', label: 'Light Professional', color: 'bg-white' },
  ];

  const toggleSetting = (key) => {
    const newVal = !settings[key];
    setSettings(prev => ({ ...prev, [key]: newVal }));
    if (settings.toasts) {
      toast.success(`${key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')} ${newVal ? 'Enabled' : 'Disabled'}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-4xl"
    >
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-[var(--text-primary)] tracking-tight mb-2">Preferences</h1>
        <p className="text-[var(--text-secondary)] font-medium">Customize your SecureAuth Pro experience.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Theme Selection */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <BsPalette className="text-[var(--accent-blue)] text-xl" />
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Interface Theme</h2>
          </div>
          <div className="space-y-3">
            {themes.map(t => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`w-full p-5 rounded-3xl border-2 flex items-center justify-between transition-all ${
                  theme === t.id 
                    ? 'border-blue-500 bg-blue-500/10' 
                    : 'border-[var(--border-color)] bg-[var(--card-bg)] hover:border-[var(--text-muted)]'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full border border-[var(--border-color)] ${t.color}`} />
                  <span className={`font-bold ${theme === t.id ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>{t.label}</span>
                </div>
                {theme === t.id && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
              </button>
            ))}
          </div>
        </div>

        {/* Global Settings */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <BsLightning className="text-amber-500 text-xl" />
            <h2 className="text-xl font-bold text-[var(--text-primary)]">App Features</h2>
          </div>
          <div className="space-y-4">
            {[
              { id: 'toasts', label: 'Push Notifications', icon: <BsBell />, desc: 'Show toast alerts for system events.' },
              { id: 'animations', label: 'UI Animations', icon: <BsLightning />, desc: 'Enable fluid Framer Motion transitions.' },
              { id: 'autoCopy', label: 'Auto-Copy UID', icon: <BsClipboardCheck />, desc: 'Copy UID automatically on dashboard view.' },
            ].map(item => (
              <div 
                key={item.id}
                className="p-6 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl flex items-center justify-center text-[var(--text-muted)]">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-bold text-[var(--text-primary)]">{item.label}</p>
                    <p className="text-xs text-[var(--text-muted)] font-medium">{item.desc}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleSetting(item.id)}
                  className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${
                    settings[item.id] ? 'bg-blue-600' : 'bg-slate-700'
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200 ${
                    settings[item.id] ? 'left-7' : 'left-1'
                  }`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>

  );
};

export default Settings;
