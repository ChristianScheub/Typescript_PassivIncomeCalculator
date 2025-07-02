import sqliteService from "@/service/infrastructure/sqlLiteService";
import Logger from "@/service/shared/logging/Logger/logger";
import { ExchangeRate } from '../interfaces/IExchangeService';

/**
 * Refresh exchange rate for today from ECB XML
 * Only fetches if today's rate is not already stored
 */
export const refreshExchangeRateMethod = async (): Promise<void> => {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    Logger.infoService(`Checking if exchange rate exists for ${today}`);

    // Check if today's rate already exists
    const existingRates = await sqliteService.getAll('exchangeRates');
    const todayRate = existingRates.find(rate => rate.date === today);

    if (todayRate) {
      Logger.infoService(`Exchange rate for ${today} already exists: ${todayRate.usdToEur}`);
      return;
    }

    Logger.infoService(`Fetching exchange rate from ECB for ${today}`);

    // Fetch from ECB XML API - Gets USD/EUR rate (how many dollars per euro)
    const response = await fetch(`https://data-api.ecb.europa.eu/service/data/EXR/D.USD.EUR.SP00.A?startPeriod=${today}&endPeriod=${today}`);
    if (!response.ok) {
      throw new Error(`ECB API responded with status: ${response.status}`);
    }

    const xmlText = await response.text();
    Logger.infoService('ECB XML fetched successfully');

    // Parse XML to extract USD/EUR rate (dollars per euro)
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

    // Find the observation value in the SDMX XML structure
    const obsElements = xmlDoc.getElementsByTagName('generic:Obs');
    let usdPerEuroRate: number | null = null;
    let xmlDate: string | null = null;

    if (obsElements.length > 0) {
      const obs = obsElements[0];
      
      // Get date from ObsDimension
      const obsDimension = obs.getElementsByTagName('generic:ObsDimension')[0];
      if (obsDimension) {
        xmlDate = obsDimension.getAttribute('value');
      }

      // Get rate from ObsValue 
      const obsValue = obs.getElementsByTagName('generic:ObsValue')[0];
      if (obsValue) {
        const rateStr = obsValue.getAttribute('value');
        if (rateStr) {
          usdPerEuroRate = parseFloat(rateStr);
          Logger.infoService(`Found USD/EUR rate in ECB XML: ${usdPerEuroRate} USD per EUR (date: ${xmlDate})`);
        }
      }
    }

    if (!usdPerEuroRate || !xmlDate) {
      throw new Error('USD/EUR exchange rate not found in ECB XML');
    }

    // ECB provides USD/EUR rate (dollars per euro), we need EUR/USD rate (euros per dollar)
    // Formula: 1 USD = 1 / usdPerEuroRate EUR
    const eurPerUsdRate = 1 / usdPerEuroRate;

    Logger.infoService(`Calculated EUR/USD rate: 1 USD = ${eurPerUsdRate.toFixed(6)} EUR (from ${usdPerEuroRate} USD/EUR)`);

    // Save to database
    const exchangeRate: ExchangeRate = {
      date: xmlDate, // Use ECB date
      usdToEur: eurPerUsdRate, // Store EUR per USD (euros per dollar)
      createdAt: new Date().toISOString()
    };

    await sqliteService.add('exchangeRates', exchangeRate);
    Logger.infoService(`Exchange rate saved: ${xmlDate} -> ${eurPerUsdRate.toFixed(6)} EUR per USD`);

  } catch (error) {
    Logger.error(`Error refreshing exchange rate: ${JSON.stringify(error)}`);
    throw new Error(`Failed to refresh exchange rate: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
