import { getCurrency } from '../../../domain/assets/market-data/stockAPIService/utils/fetch';

export const formatCurrency = (amount: number): string => {
  const currency = getCurrency();
  
  // Bestimme Locale basierend auf Währung
  const locale = currency === 'USD' ? 'en-US' : 'de-DE';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};
