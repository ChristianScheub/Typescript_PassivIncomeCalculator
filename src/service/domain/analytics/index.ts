// Analytics Domain Services
export { default as financialAnalyticsService } from './calculations/financialAnalyticsService';
export { default as recentActivityService } from './reporting/recentActivityService';

// Re-export types and interfaces for convenience
export type * from './calculations/financialAnalyticsService/interfaces/IFinancialAnalyticsService';
