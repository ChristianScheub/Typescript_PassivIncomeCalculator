import { CapacitorHttp } from '@capacitor/core';
import Logger from '@/service/shared/logging/Logger/logger';
import { DividendData } from '../../types';
import { detectDividendFrequency } from '../../utils/detectDividendFrequency';

interface YahooDividendItem {
  date?: number;
  amount: number;
}

export async function fetchDividendsYahoo(ticker: string, opts?: { interval?: string; range?: string }): Promise<DividendData[]> {
  const interval = opts?.interval || '1m';
  const range = opts?.range || 'max';
  const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=${interval}&range=${range}&events=div`;
  Logger.infoService(`[Yahoo] About to fetch dividends for ${ticker} with URL: ${url}`);
  Logger.infoService(`[Yahoo] CapacitorHttp typeof: ${typeof CapacitorHttp}`);
  Logger.infoService(`[Yahoo] CapacitorHttp.get typeof: ${typeof CapacitorHttp.get}`);
  let response;
  try {
    response = await CapacitorHttp.get({
      url,
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json',
      },
    });
  } catch (httpError) {
    Logger.error(`[Yahoo] CapacitorHttp.get failed: ${JSON.stringify(httpError)}`);
    throw httpError;
  }
  Logger.infoService(`[Yahoo] Response from API: ${JSON.stringify(response)}`);
  if (response.status !== 200) {
    throw new Error(`Yahoo API error! status: ${response.status}`);
  }
  // Parse Yahoo JSON response
  const data = response.data;
  // Extrahiere Dividenden aus dem Yahoo-Response
  const result = data?.chart?.result?.[0];
  const events = result?.events?.dividends || {};
  // Ensure correct typing for dividendArray
  const dividendArray: YahooDividendItem[] = Object.values(events) as YahooDividendItem[];

  // Sort by date
  dividendArray.sort((a, b) => (a.date ?? 0) - (b.date ?? 0));

  const frequency = detectDividendFrequency(dividendArray);

  // Map to DividendData[]
  const dividends: DividendData[] = dividendArray.map((item) => ({
    amount: item.amount,
    frequency,
    lastDividendDate: item.date ? new Date(item.date * 1000).toISOString().slice(0, 10) : undefined,
  }));
  return dividends;
}
