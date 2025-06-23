import { CapacitorHttp } from '@capacitor/core';
import Logger from '@/service/shared/logging/Logger/logger';
import { DividendData } from '../../types';
import { detectDividendFrequency } from '../../utils/detectDividendFrequency';

export async function fetchDividendsFinnhub(ticker: string, apiKey: string): Promise<DividendData[]> {
  // Use the correct endpoint for Finnhub Dividends 2 API
  const url = `https://finnhub.io/api/v1/stock/dividend2?symbol=${encodeURIComponent(ticker)}&token=${apiKey}`;
  Logger.infoService(`Fetching dividends from Finnhub for ${ticker}`);
  const response = await CapacitorHttp.get({
    url,
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0',
    },
  });
  if (response.status !== 200) {
    throw new Error(`Finnhub API error! status: ${response.status}`);
  }
  // Finnhub returns { data: Dividend[] }
  const dataArr = response.data?.data || [];
  // Map exDate to date (as number) for frequency detection
  const dateArray = dataArr
    .map((item: any) => ({ date: item.exDate ? new Date(item.exDate).getTime() / 1000 : undefined }))
    .filter((item: { date?: number }) => !!item.date);
  const frequency = detectDividendFrequency(dateArray);
  const dividends: DividendData[] = dataArr.map((item: any) => ({
    amount: item.amount,
    frequency,
    lastDividendDate: item.exDate,
  }));
  return dividends;
}
