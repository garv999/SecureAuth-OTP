// src/utils/featureFlags.js
export const featureFlags = {
  isMonitoringEnabled: import.meta.env.VITE_ENABLE_MONITORING === 'true',
  isAnalyticsEnabled: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  isExperimentalEnabled: import.meta.env.VITE_ENABLE_EXPERIMENTAL_FEATURES === 'true',
};
