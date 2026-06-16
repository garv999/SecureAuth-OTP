// src/utils/logger.js
export const logger = {
  info: (message, ...args) => {
    if (import.meta.env.MODE !== 'production' || import.meta.env.VITE_ENABLE_LOGGING === 'true') {
      console.log(`[INFO]: ${message}`, ...args);
    }
  },
  warn: (message, ...args) => {
    if (import.meta.env.MODE !== 'production' || import.meta.env.VITE_ENABLE_LOGGING === 'true') {
      console.warn(`[WARN]: ${message}`, ...args);
    }
  },
  error: (message, ...args) => {
    // Errors are always logged, but structured for potential external ingestion
    console.error(`[ERROR]: ${message}`, ...args);
  }
};
