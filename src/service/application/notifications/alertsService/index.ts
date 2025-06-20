import { IAlertsService } from './interfaces/IAlertsService';
import { generateFinancialAlerts } from './methods/generateFinancialAlerts';
import { calculateAlertPriority } from './methods/calculateAlertPriority';
import { filterAlertsByType } from './methods/filterAlertsByType';
import { transformToUIAlerts } from './methods/transformToUIAlerts';

/**
 * Alerts Service that provides financial alert generation and management
 * Implementing the functional object pattern for consistency with other services
 */
const alertsService: IAlertsService = {
  generateFinancialAlerts,
  calculateAlertPriority,
  filterAlertsByType,
  transformToUIAlerts,
};

// Export types
export type { IAlertsService } from './interfaces/IAlertsService';

// Export the service
export { alertsService };

// Export default instance for direct use
export default alertsService;
