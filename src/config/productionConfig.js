// src/config/productionConfig.js

/**
 * Enterprise Production Configuration
 * Utilizes Vite's import.meta.env for environment-specific variables.
 */

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export const features = {
  monitoring: import.meta.env.VITE_ENABLE_MONITORING === 'true',
  analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  experimental: import.meta.env.VITE_ENABLE_EXPERIMENTAL_FEATURES === 'true'
};

export const appConfig = {
  isCI: import.meta.env.VITE_CI === 'true' || import.meta.env.CI === 'true'
};
