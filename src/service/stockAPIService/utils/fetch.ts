import Logger from '../../Logger/logger';
import { CapacitorHttp } from '@capacitor/core';
import exchangeService from '../../exchangeService/index';

const BASE_URL = 'https://finnhub.io/api/v1';

/**
 * Get API key from localStorage
 */
const getApiKey = (): string => {
  const apiKey = localStorage.getItem('finnhub_api_key');
  if (!apiKey) {
    throw new Error('Finnhub API key not found. Please set your API key in Settings.');
  }
  return apiKey;
};

/**
 * Check if API key is configured
 */
export const isApiKeyConfigured = (): boolean => {
  return !!localStorage.getItem('finnhub_api_key');
};

/**
 * Set API key in localStorage
 */
export const setApiKey = (apiKey: string): void => {
  localStorage.setItem('finnhub_api_key', apiKey);
};

/**
 * Remove API key from localStorage
 */
export const removeApiKey = (): void => {
  localStorage.removeItem('finnhub_api_key');
};

/**
 * Get currency setting from localStorage (default: EUR)
 */
export const getCurrency = (): 'EUR' | 'USD' => {
  const currency = localStorage.getItem('stock_currency');
  return (currency === 'USD') ? 'USD' : 'EUR'; // Default to EUR
};

/**
 * Set currency in localStorage
 */
export const setCurrency = (currency: 'EUR' | 'USD'): void => {
  localStorage.setItem('stock_currency', currency);
};

/**
 * Format symbol - keep original symbol since we'll convert prices instead
 */
export const formatSymbol = (symbol: string): string => {
  // Always return the original symbol - we handle currency via price conversion
  return symbol;
};

/**
 * Get USD to EUR exchange rate from Exchange Service
 */
export const getUSDToEURRate = async (): Promise<number> => {
  try {
    Logger.infoService('Getting USD/EUR exchange rate from Exchange Service');
    const rate = await exchangeService.getExchangeRate();
    Logger.infoService(`USD/EUR exchange rate from Exchange Service: ${rate}`);
    return rate;
  } catch (error) {
    Logger.error(`Error getting USD/EUR rate from Exchange Service: ${JSON.stringify(error)}`);
    // Return fallback rate if service fails
    const fallbackRate = 0.85;
    Logger.warn(`Using fallback USD/EUR rate: ${fallbackRate}`);
    return fallbackRate;
  }
};

/**
 * Convert USD price to EUR if currency setting is EUR
 */
export const convertPrice = async (priceUSD: number): Promise<number> => {
  const currency = getCurrency();
  
  if (currency === 'USD') {
    return priceUSD;
  }
  
  // Convert to EUR
  const usdToEurRate = await getUSDToEURRate();
  const priceEUR = priceUSD * usdToEurRate;
  
  Logger.infoService(`Converted price: ${priceUSD} USD -> ${priceEUR.toFixed(4)} EUR (rate: ${usdToEurRate})`);
  return priceEUR;
};

/**
 * Convert multiple USD prices to EUR if currency setting is EUR
 */
export const convertPrices = async (pricesUSD: number[]): Promise<number[]> => {
  const currency = getCurrency();
  
  if (currency === 'USD') {
    return pricesUSD;
  }
  
  // Convert all prices to EUR using the same exchange rate
  const usdToEurRate = await getUSDToEURRate();
  const pricesEUR = pricesUSD.map(price => price * usdToEurRate);
  
  Logger.infoService(`Converted ${pricesUSD.length} prices from USD to EUR (rate: ${usdToEurRate})`);
  return pricesEUR;
};

/**
 * Convert endpoint to full URL with API key
 */
const getFullUrl = (endpoint: string, params: Record<string, string> = {}): string => {
  const apiKey = getApiKey();
  const url = new URL(`${BASE_URL}${endpoint}`);
  
  // Add API key
  url.searchParams.append('token', apiKey);
  
  // Add other parameters
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });
  
  return url.toString();
};

/**
 * Fetch data from Finnhub API
 */
export const fetchFromFinnhub = async (endpoint: string, params: Record<string, string> = {}): Promise<any> => {
  try {
    const url = getFullUrl(endpoint, params);
    Logger.infoService(`Fetching from Finnhub: ${endpoint}`);

    const response = await CapacitorHttp.request({
      method: 'GET',
      url,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'PassiveIncomeCalculator/1.0'
      }
    });

    if (response.status !== 200) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Finnhub returns data directly, not wrapped in a response object
    return response.data;
  } catch (error) {
    Logger.error(`Error fetching from Finnhub: ${JSON.stringify(error)}`);
    throw error;
  }
};
