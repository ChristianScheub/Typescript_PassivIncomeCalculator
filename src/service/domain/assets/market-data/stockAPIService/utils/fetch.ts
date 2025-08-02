import Logger from "@/service/shared/logging/Logger/logger";
import exchangeService from "@/service/domain/financial/exchange/exchangeService/index";

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
 * Get USD to EUR exchange rate from Exchange Service
 */
const getUSDToEURRate = async (): Promise<number> => {
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