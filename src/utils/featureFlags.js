// src/utils/featureFlags.js
import { features } from '../config/productionConfig';

export const featureFlags = {
  isMonitoringEnabled: features.monitoring,
  isAnalyticsEnabled: features.analytics,
  isExperimentalEnabled: features.experimental,
};
