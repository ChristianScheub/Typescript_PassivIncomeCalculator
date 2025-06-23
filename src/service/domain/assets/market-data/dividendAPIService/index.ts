import { fetchDividends } from './methods/dividendApiServiceObject';

const dividendApiService = {
  fetchDividends,
};

// Explizite Exporte
export { dividendApiService };
export default dividendApiService;

// Typen und Provider-Registry weiterhin exportieren
export * from './types';
