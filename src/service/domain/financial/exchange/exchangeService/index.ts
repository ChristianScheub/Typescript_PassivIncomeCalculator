import { IExchangeService } from './interfaces/IExchangeService';
import { refreshExchangeRateMethod } from './methods/refreshExchangeRate';
import { getExchangeRateMethod } from './methods/getExchangeRate';
import { getExchangeRateByDateMethod } from './methods/getExchangeRateByDate';
import { getAllExchangeRatesMethod } from './methods/getAllExchangeRates';
import { clearExchangeRatesMethod } from './methods/clearExchangeRates';

// Function to handle overloaded getExchangeRate implementation
async function getExchangeRate(): Promise<number>;
async function getExchangeRate(date: string): Promise<number | null>;
async function getExchangeRate(date?: string): Promise<number | null> {
  if (date) {
    return getExchangeRateByDateMethod(date);
  }
  return getExchangeRateMethod();
}

// Create exchangeService as a functional object
const exchangeService: IExchangeService = {
  refreshExchangeRate: refreshExchangeRateMethod,
  getExchangeRate,
  getAllExchangeRates: getAllExchangeRatesMethod,
  clearExchangeRates: clearExchangeRatesMethod
};

// Export default instance for direct use
export default exchangeService;

// Export the service and types for use in other modules
export { exchangeService };
export type { IExchangeService };
