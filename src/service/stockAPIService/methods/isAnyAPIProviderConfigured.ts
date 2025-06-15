/**
 * Check if any API provider is configured and has an API key
 */
export const isAnyAPIProviderConfiguredMethod = (): boolean => {
  const apiKeys = {
    finnhub: localStorage.getItem('finnhub_api_key'),
    yahoo: localStorage.getItem('yahoo_api_key'),
    alpha_vantage: localStorage.getItem('alpha_vantage_api_key'),
    iex_cloud: localStorage.getItem('iex_cloud_api_key'),
  };
  
  // Yahoo Finance doesn't require an API key, so it's always considered configured
  return true || Object.values(apiKeys).some(key => !!key);
};
