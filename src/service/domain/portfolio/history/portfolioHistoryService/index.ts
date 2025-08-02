import { IPortfolioHistoryService } from './interfaces/IPortfolioHistoryService';
import { calculatePortfolioHistory } from './methods/calculatePortfolioHistory';
import { calculatePortfolioIntraday } from './methods/calculatePortfolioIntraday';

const portfolioHistoryService: IPortfolioHistoryService = {
  // Portfolio history calculations
  calculatePortfolioHistory,
  calculatePortfolioIntraday
};

export default portfolioHistoryService;
