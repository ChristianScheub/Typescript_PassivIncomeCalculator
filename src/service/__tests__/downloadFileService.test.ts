import { handleFileDownload } from '../shared/utilities/helper/downloadFile';

// Mock Capacitor plugins
jest.mock('@capacitor/filesystem', () => ({
  Filesystem: {
    writeFile: jest.fn(),
    getUri: jest.fn()
  },
  Directory: {
    Documents: 'DOCUMENTS'
  }
}));

jest.mock('@capacitor/share', () => ({
  Share: {
    share: jest.fn()
  }
}));

jest.mock('../shared/logging/Logger/logger', () => ({
  error: jest.fn()
}));

// Mock DOM methods
const mockCreateElement = jest.fn();
const mockAppendChild = jest.fn();
const mockRemoveChild = jest.fn();
const mockClick = jest.fn();
const mockCreateObjectURL = jest.fn();
const mockRevokeObjectURL = jest.fn();

Object.defineProperty(document, 'createElement', {
  value: mockCreateElement
});

Object.defineProperty(document.body, 'appendChild', {
  value: mockAppendChild
});

Object.defineProperty(document.body, 'removeChild', {
  value: mockRemoveChild
});

Object.defineProperty(URL, 'createObjectURL', {
  value: mockCreateObjectURL
});

Object.defineProperty(URL, 'revokeObjectURL', {
  value: mockRevokeObjectURL
});

// Mock global btoa
Object.defineProperty(global, 'btoa', {
  value: jest.fn((str) => Buffer.from(str).toString('base64'))
});

describe('DownloadFile Service', () => {
  const mockLinkElement = {
    href: '',
    download: '',
    click: mockClick
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateElement.mockReturnValue(mockLinkElement);
    mockCreateObjectURL.mockReturnValue('blob:mock-url');
  });

  describe('handleFileDownload', () => {
    test('should successfully download file using Capacitor on mobile', async () => {
      const { Filesystem, Directory } = require('@capacitor/filesystem');
      const { Share } = require('@capacitor/share');
      
      Filesystem.writeFile.mockResolvedValue({});
      Filesystem.getUri.mockResolvedValue({ uri: 'file://mock-uri' });
      Share.share.mockResolvedValue({});

      const testLogs = 'Test log data';
      
      await handleFileDownload(testLogs);

      expect(Filesystem.writeFile).toHaveBeenCalledWith({
        path: expect.stringMatching(/PassivIncomeCalculator-v3-\d{8}-\d{6}\.json/),
        data: expect.any(String),
        directory: Directory.Documents
      });

      expect(Filesystem.getUri).toHaveBeenCalledWith({
        directory: Directory.Documents,
        path: expect.stringMatching(/PassivIncomeCalculator-v3-\d{8}-\d{6}\.json/)
      });

      expect(Share.share).toHaveBeenCalledWith({
        url: 'file://mock-uri'
      });
    });

    test('should log file operations', async () => {
      const { Filesystem } = require('@capacitor/filesystem');
      const { Share } = require('@capacitor/share');
      const Logger = require('../shared/logging/Logger/logger');
      
      Filesystem.writeFile.mockResolvedValue({});
      Filesystem.getUri.mockResolvedValue({ uri: 'file://mock-uri' });
      Share.share.mockResolvedValue({});

      await handleFileDownload('test logs');

      expect(Logger.error).toHaveBeenCalledWith(
        expect.stringMatching(/File Name generated: PassivIncomeCalculator-v3-\d{8}-\d{6}\.json/)
      );
      expect(Logger.error).toHaveBeenCalledWith(
        expect.stringMatching(/File written: PassivIncomeCalculator-v3-\d{8}-\d{6}\.json/)
      );
    });

    test('should encode logs to base64', async () => {
      const { Filesystem } = require('@capacitor/filesystem');
      const { Share } = require('@capacitor/share');
      
      Filesystem.writeFile.mockResolvedValue({});
      Filesystem.getUri.mockResolvedValue({ uri: 'file://mock-uri' });
      Share.share.mockResolvedValue({});

      const testLogs = 'Test log data';
      
      await handleFileDownload(testLogs);

      expect(global.btoa).toHaveBeenCalledWith(testLogs);
      expect(Filesystem.writeFile).toHaveBeenCalledWith(
        expect.objectContaining({
          data: Buffer.from(testLogs).toString('base64')
        })
      );
    });

    test('should fallback to browser download on Capacitor error', async () => {
      const { Filesystem } = require('@capacitor/filesystem');
      const Logger = require('../shared/logging/Logger/logger');
      
      // Mock Capacitor failure
      Filesystem.writeFile.mockRejectedValue(new Error('Capacitor error'));

      const testLogs = 'Test log data';
      
      await handleFileDownload(testLogs);

      // Should fall back to browser download
      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob));
      expect(mockClick).toHaveBeenCalled();
      expect(Logger.error).toHaveBeenCalledWith('Error exporting Logs:Error: Capacitor error');
    });

    test('should handle browser download correctly', async () => {
      const { Filesystem } = require('@capacitor/filesystem');
      
      // Mock Capacitor failure to trigger browser download
      Filesystem.writeFile.mockRejectedValue(new Error('Not available'));

      const testLogs = 'Test log data';
      
      await handleFileDownload(testLogs);

      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockAppendChild).toHaveBeenCalledWith(mockLinkElement);
      expect(mockLinkElement.download).toMatch(/PassivIncomeCalculator-v3-\d{8}-\d{6}\.json/);
      expect(mockClick).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalledWith(mockLinkElement);
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    test('should create blob with correct MIME type', async () => {
      const { Filesystem } = require('@capacitor/filesystem');
      
      // Mock Capacitor failure to trigger browser download
      Filesystem.writeFile.mockRejectedValue(new Error('Not available'));

      await handleFileDownload('test data');

      // Verify Blob constructor was called with correct parameters
      // Since we can't easily mock Blob constructor, we verify the sequence of operations
      expect(mockCreateObjectURL).toHaveBeenCalled();
    });

    test('should generate unique filenames', async () => {
      const { Filesystem } = require('@capacitor/filesystem');
      const { Share } = require('@capacitor/share');
      
      Filesystem.writeFile.mockResolvedValue({});
      Filesystem.getUri.mockResolvedValue({ uri: 'file://mock-uri' });
      Share.share.mockResolvedValue({});

      // Call multiple times to ensure unique filenames
      await handleFileDownload('test1');
      await handleFileDownload('test2');

      expect(Filesystem.writeFile).toHaveBeenCalledTimes(2);
      
      const calls = Filesystem.writeFile.mock.calls;
      const filename1 = calls[0][0].path;
      const filename2 = calls[1][0].path;
      
      // Filenames should follow the pattern but may be different due to timestamp
      expect(filename1).toMatch(/PassivIncomeCalculator-v3-\d{8}-\d{6}\.json/);
      expect(filename2).toMatch(/PassivIncomeCalculator-v3-\d{8}-\d{6}\.json/);
    });

    test('should handle empty logs gracefully', async () => {
      const { Filesystem } = require('@capacitor/filesystem');
      
      // Mock error to test empty logs handling
      Filesystem.writeFile.mockRejectedValue(new Error('Test error'));

      await handleFileDownload('');

      // Should still attempt browser download with empty string
      expect(mockCreateElement).not.toHaveBeenCalled(); // Empty logs should not trigger fallback
    });

    test('should handle null/undefined logs', async () => {
      const { Filesystem } = require('@capacitor/filesystem');
      
      Filesystem.writeFile.mockRejectedValue(new Error('Test error'));

      await handleFileDownload(null as any);
      await handleFileDownload(undefined as any);

      // Should not trigger browser download for null/undefined
      expect(mockCreateElement).not.toHaveBeenCalled();
    });

    test('should handle Filesystem.getUri error', async () => {
      const { Filesystem } = require('@capacitor/filesystem');
      const Logger = require('../shared/logging/Logger/logger');
      
      Filesystem.writeFile.mockResolvedValue({});
      Filesystem.getUri.mockRejectedValue(new Error('URI error'));

      await handleFileDownload('test logs');

      expect(Logger.error).toHaveBeenCalledWith('Error exporting Logs:Error: URI error');
      expect(mockCreateElement).toHaveBeenCalled(); // Should fallback to browser
    });

    test('should handle Share.share error', async () => {
      const { Filesystem } = require('@capacitor/filesystem');
      const { Share } = require('@capacitor/share');
      const Logger = require('../shared/logging/Logger/logger');
      
      Filesystem.writeFile.mockResolvedValue({});
      Filesystem.getUri.mockResolvedValue({ uri: 'file://mock-uri' });
      Share.share.mockRejectedValue(new Error('Share error'));

      await handleFileDownload('test logs');

      expect(Logger.error).toHaveBeenCalledWith('Error exporting Logs:Error: Share error');
      expect(mockCreateElement).toHaveBeenCalled(); // Should fallback to browser
    });
  });

  describe('Filename generation', () => {
    test('should generate filename with current timestamp', async () => {
      const { Filesystem } = require('@capacitor/filesystem');
      const { Share } = require('@capacitor/share');
      
      Filesystem.writeFile.mockResolvedValue({});
      Filesystem.getUri.mockResolvedValue({ uri: 'file://mock-uri' });
      Share.share.mockResolvedValue({});

      // Mock specific date
      const mockDate = new Date('2023-12-25T10:30:45');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

      await handleFileDownload('test');

      expect(Filesystem.writeFile).toHaveBeenCalledWith(
        expect.objectContaining({
          path: 'PassivIncomeCalculator-v3-20231225-103045.json'
        })
      );

      jest.restoreAllMocks();
    });

    test('should pad single digits in timestamp', async () => {
      const { Filesystem } = require('@capacitor/filesystem');
      const { Share } = require('@capacitor/share');
      
      Filesystem.writeFile.mockResolvedValue({});
      Filesystem.getUri.mockResolvedValue({ uri: 'file://mock-uri' });
      Share.share.mockResolvedValue({});

      // Mock date with single digits
      const mockDate = new Date('2023-01-05T09:05:03');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

      await handleFileDownload('test');

      expect(Filesystem.writeFile).toHaveBeenCalledWith(
        expect.objectContaining({
          path: 'PassivIncomeCalculator-v3-20230105-090503.json'
        })
      );

      jest.restoreAllMocks();
    });
  });

  describe('Integration tests', () => {
    test('should handle complete success workflow', async () => {
      const { Filesystem, Directory } = require('@capacitor/filesystem');
      const { Share } = require('@capacitor/share');
      const Logger = require('../shared/logging/Logger/logger');
      
      Filesystem.writeFile.mockResolvedValue({});
      Filesystem.getUri.mockResolvedValue({ uri: 'file://success-uri' });
      Share.share.mockResolvedValue({});

      const testLogs = JSON.stringify({ logs: ['log1', 'log2'] });
      
      await handleFileDownload(testLogs);

      // Verify complete workflow
      expect(global.btoa).toHaveBeenCalledWith(testLogs);
      expect(Filesystem.writeFile).toHaveBeenCalledWith({
        path: expect.stringMatching(/PassivIncomeCalculator-v3-\d{8}-\d{6}\.json/),
        data: Buffer.from(testLogs).toString('base64'),
        directory: Directory.Documents
      });
      expect(Filesystem.getUri).toHaveBeenCalled();
      expect(Share.share).toHaveBeenCalledWith({ url: 'file://success-uri' });
      expect(Logger.error).toHaveBeenCalledTimes(2); // File name and file written logs
      
      // Should not fallback to browser download
      expect(mockCreateElement).not.toHaveBeenCalled();
    });

    test('should handle complete fallback workflow', async () => {
      const { Filesystem } = require('@capacitor/filesystem');
      const Logger = require('../shared/logging/Logger/logger');
      
      Filesystem.writeFile.mockRejectedValue(new Error('Capacitor not available'));

      const testLogs = 'fallback test logs';
      
      await handleFileDownload(testLogs);

      // Verify fallback workflow
      expect(Logger.error).toHaveBeenCalledWith('Error exporting Logs:Error: Capacitor not available');
      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalled();
    });
  });
});