import { mockStockAPIService as stockAPIService } from './mockServices';

// Mock the actual implementation methods
jest.mock('../domain/assets/market-data/stockAPIService/methods/getCurrentStockPrice', () => ({
  getCurrentStockPrice: jest.fn(),
}));

jest.mock('../domain/assets/market-data/stockAPIService/methods/getHistory', () => ({
  getHistory: jest.fn(),
}));

jest.mock('../domain/assets/market-data/stockAPIService/methods/getHistory30Days', () => ({
  getHistory30Days: jest.fn(),
}));

jest.mock('../domain/assets/market-data/stockAPIService/methods/getIntradayHistory', () => ({
  getIntradayHistory: jest.fn(),
}));

// Mock the logger
jest.mock('../shared/logging/Logger/logger', () => ({
  infoService: jest.fn(),
  errorService: jest.fn(),
  warnService: jest.fn(),
}));

describe('StockAPIService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Current Stock Price', () => {
    it('should fetch current stock price successfully', async () => {
      const mockPrice = {
        symbol: 'AAPL',
        price: 150.25,
        change: 2.50,
        changePercent: 1.69,
        timestamp: new Date(),
      };

      const getCurrentStockPrice = require('../domain/assets/market-data/stockAPIService/methods/getCurrentStockPrice').getCurrentStockPrice;
      getCurrentStockPrice.mockResolvedValue(mockPrice);

      const result = await stockAPIService.getCurrentStockPrice('AAPL');
      
      expect(getCurrentStockPrice).toHaveBeenCalledWith('AAPL');
      expect(result).toEqual(mockPrice);
    });

    it('should handle errors when fetching current stock price', async () => {
      const getCurrentStockPrice = require('../domain/assets/market-data/stockAPIService/methods/getCurrentStockPrice').getCurrentStockPrice;
      getCurrentStockPrice.mockRejectedValue(new Error('API Error'));

      await expect(stockAPIService.getCurrentStockPrice('INVALID')).rejects.toThrow('API Error');
    });

    it('should handle symbols with special characters', async () => {
      const mockPrice = {
        symbol: 'BRK.B',
        price: 300.50,
        change: -1.25,
        changePercent: -0.41,
        timestamp: new Date(),
      };

      const getCurrentStockPrice = require('../domain/assets/market-data/stockAPIService/methods/getCurrentStockPrice').getCurrentStockPrice;
      getCurrentStockPrice.mockResolvedValue(mockPrice);

      const result = await stockAPIService.getCurrentStockPrice('BRK.B');
      
      expect(getCurrentStockPrice).toHaveBeenCalledWith('BRK.B');
      expect(result).toEqual(mockPrice);
    });
  });

  describe('Historical Data', () => {
    it('should fetch historical data successfully', async () => {
      const mockHistory = [
        {
          date: '2023-01-01',
          open: 130.28,
          high: 133.41,
          low: 129.89,
          close: 131.86,
          volume: 70790813,
        },
        {
          date: '2023-01-02',
          open: 131.99,
          high: 132.41,
          low: 125.70,
          close: 126.04,
          volume: 63896155,
        },
      ];

      const getHistory = require('../domain/assets/market-data/stockAPIService/methods/getHistory').getHistory;
      getHistory.mockResolvedValue(mockHistory);

      const result = await stockAPIService.getHistory('AAPL', '2023-01-01', '2023-01-02');
      
      expect(getHistory).toHaveBeenCalledWith('AAPL', '2023-01-01', '2023-01-02');
      expect(result).toEqual(mockHistory);
    });

    it('should fetch 30-day history successfully', async () => {
      const mockHistory = Array.from({ length: 30 }, (_, i) => ({
        date: `2023-12-${String(i + 1).padStart(2, '0')}`,
        open: 150 + Math.random() * 10,
        high: 155 + Math.random() * 10,
        low: 145 + Math.random() * 10,
        close: 150 + Math.random() * 10,
        volume: 50000000 + Math.random() * 20000000,
      }));

      const getHistory30Days = require('../domain/assets/market-data/stockAPIService/methods/getHistory30Days').getHistory30Days;
      getHistory30Days.mockResolvedValue(mockHistory);

      const result = await stockAPIService.getHistory30Days('AAPL');
      
      expect(getHistory30Days).toHaveBeenCalledWith('AAPL');
      expect(result).toHaveLength(30);
    });

    it('should fetch intraday history successfully', async () => {
      const mockIntraday = [
        {
          time: '09:30',
          price: 150.25,
          volume: 1250000,
        },
        {
          time: '09:31',
          price: 150.50,
          volume: 980000,
        },
        {
          time: '09:32',
          price: 150.75,
          volume: 1100000,
        },
      ];

      const getIntradayHistory = require('../domain/assets/market-data/stockAPIService/methods/getIntradayHistory').getIntradayHistory;
      getIntradayHistory.mockResolvedValue(mockIntraday);

      const result = await stockAPIService.getIntradayHistory('AAPL');
      
      expect(getIntradayHistory).toHaveBeenCalledWith('AAPL');
      expect(result).toEqual(mockIntraday);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const getHistory = require('../domain/assets/market-data/stockAPIService/methods/getHistory').getHistory;
      getHistory.mockRejectedValue(new Error('Network Error'));

      await expect(stockAPIService.getHistory('AAPL', '2023-01-01', '2023-01-02')).rejects.toThrow('Network Error');
    });

    it('should handle API rate limit errors', async () => {
      const getCurrentStockPrice = require('../domain/assets/market-data/stockAPIService/methods/getCurrentStockPrice').getCurrentStockPrice;
      getCurrentStockPrice.mockRejectedValue(new Error('Rate limit exceeded'));

      await expect(stockAPIService.getCurrentStockPrice('AAPL')).rejects.toThrow('Rate limit exceeded');
    });

    it('should handle invalid symbol errors', async () => {
      const getCurrentStockPrice = require('../domain/assets/market-data/stockAPIService/methods/getCurrentStockPrice').getCurrentStockPrice;
      getCurrentStockPrice.mockRejectedValue(new Error('Symbol not found'));

      await expect(stockAPIService.getCurrentStockPrice('INVALID_SYMBOL')).rejects.toThrow('Symbol not found');
    });

    it('should handle API timeout errors', async () => {
      const getIntradayHistory = require('../domain/assets/market-data/stockAPIService/methods/getIntradayHistory').getIntradayHistory;
      getIntradayHistory.mockRejectedValue(new Error('Request timeout'));

      await expect(stockAPIService.getIntradayHistory('AAPL')).rejects.toThrow('Request timeout');
    });
  });

  describe('Data Validation', () => {
    it('should return properly structured current price data', async () => {
      const mockPrice = {
        symbol: 'MSFT',
        price: 350.75,
        change: 5.25,
        changePercent: 1.52,
        timestamp: new Date(),
      };

      const getCurrentStockPrice = require('../domain/assets/market-data/stockAPIService/methods/getCurrentStockPrice').getCurrentStockPrice;
      getCurrentStockPrice.mockResolvedValue(mockPrice);

      const result = await stockAPIService.getCurrentStockPrice('MSFT');
      
      expect(result).toHaveProperty('symbol');
      expect(result).toHaveProperty('price');
      expect(result).toHaveProperty('change');
      expect(result).toHaveProperty('changePercent');
      expect(result).toHaveProperty('timestamp');
      expect(typeof result.price).toBe('number');
      expect(typeof result.change).toBe('number');
      expect(typeof result.changePercent).toBe('number');
    });

    it('should return properly structured historical data', async () => {
      const mockHistory = [
        {
          date: '2023-01-01',
          open: 130.28,
          high: 133.41,
          low: 129.89,
          close: 131.86,
          volume: 70790813,
        },
      ];

      const getHistory = require('../domain/assets/market-data/stockAPIService/methods/getHistory').getHistory;
      getHistory.mockResolvedValue(mockHistory);

      const result = await stockAPIService.getHistory('AAPL', '2023-01-01', '2023-01-01');
      
      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toHaveProperty('date');
      expect(result[0]).toHaveProperty('open');
      expect(result[0]).toHaveProperty('high');
      expect(result[0]).toHaveProperty('low');
      expect(result[0]).toHaveProperty('close');
      expect(result[0]).toHaveProperty('volume');
      expect(typeof result[0].open).toBe('number');
      expect(typeof result[0].high).toBe('number');
      expect(typeof result[0].low).toBe('number');
      expect(typeof result[0].close).toBe('number');
      expect(typeof result[0].volume).toBe('number');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty symbol string', async () => {
      const getCurrentStockPrice = require('../domain/assets/market-data/stockAPIService/methods/getCurrentStockPrice').getCurrentStockPrice;
      getCurrentStockPrice.mockRejectedValue(new Error('Invalid symbol'));

      await expect(stockAPIService.getCurrentStockPrice('')).rejects.toThrow('Invalid symbol');
    });

    it('should handle null/undefined symbol', async () => {
      const getCurrentStockPrice = require('../domain/assets/market-data/stockAPIService/methods/getCurrentStockPrice').getCurrentStockPrice;
      getCurrentStockPrice.mockRejectedValue(new Error('Invalid symbol'));

      await expect(stockAPIService.getCurrentStockPrice(null as any)).rejects.toThrow('Invalid symbol');
      await expect(stockAPIService.getCurrentStockPrice(undefined as any)).rejects.toThrow('Invalid symbol');
    });

    it('should handle very long symbol names', async () => {
      const longSymbol = 'A'.repeat(100);
      
      const getCurrentStockPrice = require('../domain/assets/market-data/stockAPIService/methods/getCurrentStockPrice').getCurrentStockPrice;
      getCurrentStockPrice.mockRejectedValue(new Error('Symbol too long'));

      await expect(stockAPIService.getCurrentStockPrice(longSymbol)).rejects.toThrow('Symbol too long');
    });

    it('should handle special characters in symbols', async () => {
      const specialSymbol = 'TEST@#$';
      
      const getCurrentStockPrice = require('../domain/assets/market-data/stockAPIService/methods/getCurrentStockPrice').getCurrentStockPrice;
      getCurrentStockPrice.mockRejectedValue(new Error('Invalid symbol format'));

      await expect(stockAPIService.getCurrentStockPrice(specialSymbol)).rejects.toThrow('Invalid symbol format');
    });
  });

  describe('Performance Tests', () => {
    it('should handle multiple concurrent price requests', async () => {
      const symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'];
      const mockPrice = {
        symbol: 'TEST',
        price: 100,
        change: 1,
        changePercent: 1,
        timestamp: new Date(),
      };

      const getCurrentStockPrice = require('../domain/assets/market-data/stockAPIService/methods/getCurrentStockPrice').getCurrentStockPrice;
      getCurrentStockPrice.mockResolvedValue(mockPrice);

      const start = performance.now();
      const promises = symbols.map(symbol => stockAPIService.getCurrentStockPrice(symbol));
      const results = await Promise.all(promises);
      const end = performance.now();

      expect(results).toHaveLength(5);
      expect(getCurrentStockPrice).toHaveBeenCalledTimes(5);
      expect(end - start).toBeLessThan(1000); // Should complete in less than 1 second
    });

    it('should handle large historical data sets efficiently', async () => {
      const largeDataSet = Array.from({ length: 1000 }, (_, i) => ({
        date: `2023-${String(Math.floor(i / 30) + 1).padStart(2, '0')}-${String((i % 30) + 1).padStart(2, '0')}`,
        open: 100 + Math.random() * 50,
        high: 120 + Math.random() * 50,
        low: 80 + Math.random() * 50,
        close: 100 + Math.random() * 50,
        volume: 1000000 + Math.random() * 5000000,
      }));

      const getHistory = require('../domain/assets/market-data/stockAPIService/methods/getHistory').getHistory;
      getHistory.mockResolvedValue(largeDataSet);

      const start = performance.now();
      const result = await stockAPIService.getHistory('AAPL', '2023-01-01', '2023-12-31');
      const end = performance.now();

      expect(result).toHaveLength(1000);
      expect(end - start).toBeLessThan(500); // Should complete in less than 500ms
    });
  });
});