// src/utils/monitoring.js
import { logger } from './logger';
import { featureFlags } from './featureFlags';

export const monitoring = {
  init: () => {
    if (!featureFlags.isMonitoringEnabled) {
      logger.info('Monitoring is disabled via feature flags.');
      return;
    }
    logger.info('Monitoring initialized (Placeholder for Sentry/Crashlytics)');
    // Placeholder: Sentry.init({...})
  },
  captureException: (error, context = {}) => {
    if (!featureFlags.isMonitoringEnabled) return;
    
    logger.error('Captured Exception:', error, context);
    // Placeholder: Sentry.captureException(error, { extra: context })
  },
  captureMessage: (message, level = 'info') => {
    if (!featureFlags.isMonitoringEnabled) return;

    logger[level](`Captured Message: ${message}`);
    // Placeholder: Sentry.captureMessage(message, level)
  }
};
