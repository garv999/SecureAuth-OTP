// src/utils/healthCheck.js
import { logger } from './logger';
import { featureFlags } from './featureFlags';

export const runHealthCheck = () => {
  logger.info('Running System Health Check...');
  const issues = [];

  // 1. Check Environment Configuration
  const requiredEnvVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_APP_ID'
  ];
  
  requiredEnvVars.forEach(envVar => {
    if (!import.meta.env[envVar]) {
      issues.push(`Missing Environment Variable: ${envVar}`);
    }
  });

  // 2. Check Local Storage Availability
  try {
    const testKey = '__sa_health_test__';
    localStorage.setItem(testKey, 'ok');
    localStorage.removeItem(testKey);
  } catch {
    issues.push('Local Storage is unavailable or restricted.');
  }

  // 3. Feature Flags Status
  logger.info(`Feature Flags: Monitoring=${featureFlags.isMonitoringEnabled}, Analytics=${featureFlags.isAnalyticsEnabled}`);

  if (issues.length > 0) {
    logger.warn('Health Check completed with issues:', issues);
  } else {
    logger.info('Health Check passed perfectly. System is ready.');
  }

  return issues;
};
