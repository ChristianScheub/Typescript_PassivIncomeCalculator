import { IExchangeService, ExchangeRate } from './interfaces/IExchangeService';
import { refreshExchangeRateMethod } from './methods/refreshExchangeRate';
import { getExchangeRateMethod } from './methods/getExchangeRate';
import { getExchangeRateByDateMethod } from './methods/getExchangeRateByDate';
import { getAllExchangeRatesMethod } from './methods/getAllExchangeRates';
import { clearExchangeRatesMethod } from './methods/clearExchangeRates';

class ExchangeService implements IExchangeService {
  async refreshExchangeRate(): Promise<void> {
    return refreshExchangeRateMethod();
  }

  async getExchangeRate(): Promise<number>;
  async getExchangeRate(date: string): Promise<number | null>;
  async getExchangeRate(date?: string): Promise<number | null> {
    if (date) {
      return getExchangeRateByDateMethod(date);
    }
    return getExchangeRateMethod();
  }

  async getAllExchangeRates(): Promise<ExchangeRate[]> {
    return getAllExchangeRatesMethod();
  }

  async clearExchangeRates(): Promise<void> {
    return clearExchangeRatesMethod();
  }
}

// Export singleton instance
const exchangeService = new ExchangeService();
export default exchangeService;

// Export types for use in other modules
export type { IExchangeService, ExchangeRate };
