// NEW SERVICE LAYER ARCHITECTURE
// MAIN CALCULATOR SERVICE EXPORT (for backward compatibility)
export { default as calculatorService } from './domain/financial/calculations/compositeCalculatorService';

// Domain Services (Business Logic) - specific exports for debugging
export { assetCalculatorService } from './domain/assets';
export { stockAPIService } from './domain/assets';

// Financial services
export { incomeCalculatorService } from './domain/financial';
export { expenseCalculatorService } from './domain/financial';
export { liabilityCalculatorService } from './domain/financial';
export { financialCalculatorService } from './domain/financial';
export { compositeCalculatorService } from './domain/financial';
export { exchangeService } from './domain/financial';

// Analytics services
export { default as recentActivityService } from './domain/analytics/reporting/recentActivityService';

// Infrastructure Services (Technical Details) - direct exports
export { default as sqliteService } from './infrastructure/sqlLiteService';
export { default as formatService } from './infrastructure/formatService';
export { default as cacheService } from './infrastructure/cacheService';
export { default as configService } from './infrastructure/configService';

// Shared Services (Utilities) - direct exports  
export { default as Logger } from './shared/logging/Logger/logger';
