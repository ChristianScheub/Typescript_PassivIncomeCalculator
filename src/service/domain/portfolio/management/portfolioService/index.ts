import { IPortfolioService } from './interfaces/IPortfolioService';
import { calculatePortfolio } from './methods/calculatePortfolio';
import { getPosition } from './methods/getPosition';
import { getPositionTransactions } from './methods/getPositionTransactions';
import { calculateProjectedIncome } from './methods/calculateProjectedIncome';

// Create portfolioService as a functional object
const portfolioService: IPortfolioService = {
  calculatePortfolio,
  getPosition,
  getPositionTransactions,
  calculateProjectedIncome
};

// Export the interface


// Export the service
export { portfolioService };

// Export default instance for direct use
export default portfolioService;
