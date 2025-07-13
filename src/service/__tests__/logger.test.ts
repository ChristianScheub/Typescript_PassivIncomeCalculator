import Logger from '../shared/logging/Logger/logger';

// Mock dependencies
jest.mock('@capacitor/core', () => ({
  Capacitor: {
    getPlatform: jest.fn(() => 'web')
  }
}));

jest.mock('../../../../config/featureFlags', () => ({
  featureFlag_Debug_AllLogs: false,
  featureFlag_Debug_Log_Cache: false,
  featureFlag_Debug_Log_Error: true,
  featureFlag_Debug_Log_Info: true,
  featureFlag_Debug_Log_Service: true,
  featureFlag_Debug_Log_Warning: true,
  featureFlag_Debug_Log_infoRedux: false,
  featureFlag_Debug_StoreLogs: true,
  featureFlag_Debug_Log_API: true
}));

jest.mock('../../utilities/helper/downloadFile', () => ({
  handleFileDownload: jest.fn()
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => {
      return store[key] || null;
    },
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('Logger', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    localStorageMock.clear();
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('Basic logging functionality', () => {
    test('should log messages to console', () => {
      Logger.log('Test message');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Test message')
      );
    });

    test('should include function name in log message', () => {
      Logger.log('Test with function name');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/\[.*\] Test with function name/)
      );
    });

    test('should store logs in localStorage when StoreLogs feature flag is enabled', () => {
      Logger.log('Stored message');
      
      const storedLogs = JSON.parse(localStorageMock.getItem('app_logs') || '[]');
      expect(storedLogs).toHaveLength(1);
      expect(storedLogs[0]).toContain('Stored message');
    });

    test('should limit stored logs to 1000 entries', () => {
      // Fill localStorage with 1000+ entries
      const existingLogs = Array.from({ length: 1000 }, (_, i) => `Log entry ${i}`);
      localStorageMock.setItem('app_logs', JSON.stringify(existingLogs));
      
      Logger.log('New message');
      
      const storedLogs = JSON.parse(localStorageMock.getItem('app_logs') || '[]');
      expect(storedLogs).toHaveLength(1000); // Should maintain 1000 entries
      expect(storedLogs[storedLogs.length - 1]).toContain('New message');
    });
  });

  describe('Specialized logging methods', () => {
    test('should log info messages when info flag is enabled', () => {
      Logger.info('Info message');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Info message')
      );
    });

    test('should log service messages when service flag is enabled', () => {
      Logger.infoService('Service message');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Service message')
      );
    });

    test('should log warning messages when warning flag is enabled', () => {
      Logger.warn('Warning message');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Warning message')
      );
    });

    test('should log error messages when error flag is enabled', () => {
      Logger.error('Error message');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error message')
      );
    });

    test('should log API messages when API flag is enabled', () => {
      Logger.infoAPI('API message');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('API message')
      );
    });

    test('should not log redux messages when redux flag is disabled', () => {
      Logger.infoRedux('Redux message');
      
      // Since featureFlag_Debug_Log_infoRedux is false, this should not log
      expect(consoleSpy).not.toHaveBeenCalled();
    });

    test('should not log cache messages when cache flag is disabled', () => {
      Logger.infoCache('Cache message');
      
      // Since featureFlag_Debug_Log_Cache is false, this should not log
      expect(consoleSpy).not.toHaveBeenCalled();
    });
  });

  describe('Feature flag behavior', () => {
    test('should log everything when AllLogs flag is enabled', () => {
      // Mock the feature flag
      const featureFlags = require('../../../../config/featureFlags');
      featureFlags.featureFlag_Debug_AllLogs = true;
      
      // Re-import to get the updated flag
      jest.resetModules();
      const LoggerWithAllLogs = require('../shared/logging/Logger/logger').default;
      
      LoggerWithAllLogs.infoRedux('Redux with all logs');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Redux with all logs')
      );
    });
  });

  describe('Platform-specific behavior', () => {
    test('should format messages differently on mobile platforms', () => {
      const { Capacitor } = require('@capacitor/core');
      Capacitor.getPlatform.mockReturnValue('ios');
      
      // Re-import to get the updated platform detection
      jest.resetModules();
      const LoggerMobile = require('../shared/logging/Logger/logger').default;
      
      LoggerMobile.info('Mobile message');
      
      // On mobile, should not include emoji prefix
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Mobile message')
      );
    });

    test('should include emoji prefix on web platforms', () => {
      const { Capacitor } = require('@capacitor/core');
      Capacitor.getPlatform.mockReturnValue('web');
      
      Logger.warn('Web warning');
      
      // On web, should include emoji
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/⚠️.*Web warning/)
      );
    });
  });

  describe('Log management', () => {
    test('should delete all logs when deleteLogs is called', () => {
      // Add some logs first
      Logger.log('Log 1');
      Logger.log('Log 2');
      
      expect(JSON.parse(localStorageMock.getItem('app_logs') || '[]')).toHaveLength(2);
      
      Logger.deleteLogs();
      
      expect(JSON.parse(localStorageMock.getItem('app_logs') || '[]')).toHaveLength(0);
    });

    test('should export logs when exportLogs is called', () => {
      const { handleFileDownload } = require('../../utilities/helper/downloadFile');
      
      // Add some logs first
      Logger.log('Export test log');
      
      Logger.exportLogs();
      
      expect(handleFileDownload).toHaveBeenCalledWith(
        expect.any(String),
        'logs.txt'
      );
    });
  });

  describe('Worker environment', () => {
    test('should handle worker environment without localStorage', () => {
      // Mock worker environment
      Object.defineProperty(global, 'window', {
        value: undefined,
        writable: true
      });
      
      // Re-import to get worker behavior
      jest.resetModules();
      const LoggerWorker = require('../shared/logging/Logger/logger').default;
      
      // Should not throw error in worker environment
      expect(() => {
        LoggerWorker.log('Worker message');
      }).not.toThrow();
      
      // Restore window
      Object.defineProperty(global, 'window', {
        value: window,
        writable: true
      });
    });
  });

  describe('Error handling', () => {
    test('should handle localStorage errors gracefully', () => {
      // Mock localStorage to throw error
      jest.spyOn(localStorageMock, 'setItem').mockImplementation(() => {
        throw new Error('localStorage error');
      });
      
      // Should not throw error
      expect(() => {
        Logger.log('Message with localStorage error');
      }).not.toThrow();
      
      // Console should still work
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Message with localStorage error')
      );
    });

    test('should handle JSON parsing errors gracefully', () => {
      // Set invalid JSON in localStorage
      localStorageMock.setItem('app_logs', 'invalid json');
      
      // Should not throw error and should default to empty array
      expect(() => {
        Logger.log('Message with JSON error');
      }).not.toThrow();
    });
  });

  describe('Integration tests', () => {
    test('should handle high-volume logging', () => {
      const messageCount = 100;
      
      for (let i = 0; i < messageCount; i++) {
        Logger.log(`Message ${i}`);
      }
      
      expect(consoleSpy).toHaveBeenCalledTimes(messageCount);
      
      const storedLogs = JSON.parse(localStorageMock.getItem('app_logs') || '[]');
      expect(storedLogs).toHaveLength(messageCount);
    });

    test('should maintain log order', () => {
      Logger.log('First message');
      Logger.warn('Second message');
      Logger.error('Third message');
      
      const storedLogs = JSON.parse(localStorageMock.getItem('app_logs') || '[]');
      expect(storedLogs[0]).toContain('First message');
      expect(storedLogs[1]).toContain('Second message');
      expect(storedLogs[2]).toContain('Third message');
    });
  });
});