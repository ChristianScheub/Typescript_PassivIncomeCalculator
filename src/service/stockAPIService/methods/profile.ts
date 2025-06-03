import { CompanyProfile, FinnhubCompanyProfile } from '../types';
import Logger from '../../Logger/logger';
import { fetchFromFinnhub } from '../utils/fetch';

/**
 * Get company profile information
 */
export const getCompanyProfile = async (symbol: string): Promise<CompanyProfile> => {
  try {
    Logger.infoService(`Fetching company profile for ${symbol}`);
    
    const response: FinnhubCompanyProfile = await fetchFromFinnhub('/stock/profile2', { symbol: symbol });

    // Map Finnhub response to our application's CompanyProfile type
    const profile: CompanyProfile = {
      industry: response.finnhubIndustry || 'Unknown',
      sector: response.finnhubIndustry || 'Unknown', // Finnhub doesn't separate sector/industry
      country: response.country,
      description: `${response.name} is a company listed on ${response.exchange}. More information: ${response.weburl}`,
      fullTimeEmployees: response.shareOutstanding, // Use shareOutstanding as proxy
      website: response.weburl,
      officers: [] // Finnhub doesn't provide officer information in basic profile
    };

    Logger.infoService(`Company profile fetched successfully for ${symbol}`);
    return profile;
  } catch (error) {
    Logger.error(`Error fetching company profile for ${symbol}: ${JSON.stringify(error)}`);
    throw new Error(`Failed to fetch company profile for ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
