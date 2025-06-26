import { store ,RootState} from '@/store';
import { DividendApiProvider, DividendData } from '../types';
import { dividendProviders } from './dividendProviders';

export async function fetchDividends(
  ticker: string,
  opts?: { interval?: string; range?: string }
): Promise<{ dividends: DividendData[] }> {
  const state: RootState = store.getState();
  // Use apiConfig.selectedDiviProvider and apiConfig.dividendApiKey for dividend provider selection
  const provider = (state.apiConfig?.selectedDiviProvider || 'yahoo') as DividendApiProvider;
  const apiKey = state.apiConfig?.dividendApiKey?.[provider] || '';
  const providerFn = dividendProviders[provider];
  if (!providerFn) throw new Error(`No provider implementation for ${provider}`);
  return providerFn(ticker, { ...opts, apiKey });
}
