import { ILiabilityCalculatorService } from './interfaces/ILiabilityCalculatorService';
import { 
  calculateTotalDebt,
  calculateTotalMonthlyLiabilityPayments,
  calculateLiabilityMonthlyPayment 
} from './methods/calculateLiabilities';

/**
 * Liability Calculator Service that provides all liability-related calculations
 * Handles debt calculations, monthly payments, and liability analysis
 */
const liabilityCalculatorService: ILiabilityCalculatorService = {
  // Liability calculations
  calculateTotalDebt,
  calculateTotalMonthlyLiabilityPayments,
  calculateLiabilityMonthlyPayment,
};

// Export the service interface
export type { ILiabilityCalculatorService };

// Export the service
export { liabilityCalculatorService };

// Export default instance for direct use
export default liabilityCalculatorService;
