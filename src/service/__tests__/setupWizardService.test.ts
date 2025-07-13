import { SetupWizardStateService } from '../shared/utilities/setupWizardService';

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

// Mock Logger
jest.mock('../shared/logging/Logger/logger', () => ({
  warn: jest.fn()
}));

// Setup localStorage mock
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('SetupWizardStateService', () => {
  let originalLocalStorage: Storage;

  beforeAll(() => {
    originalLocalStorage = window.localStorage;
  });

  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    });
  });

  afterAll(() => {
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
      writable: true
    });
  });

  describe('isSetupCompleted', () => {
    test('should return false when no setup data exists', () => {
      expect(SetupWizardStateService.isSetupCompleted()).toBe(false);
    });

    test('should return true when setup is completed with correct version', () => {
      localStorageMock.setItem('passivetool_setup_completed', 'true');
      localStorageMock.setItem('passivetool_setup_version', '1.0.0');
      
      expect(SetupWizardStateService.isSetupCompleted()).toBe(true);
    });

    test('should return false when setup is completed but version is wrong', () => {
      localStorageMock.setItem('passivetool_setup_completed', 'true');
      localStorageMock.setItem('passivetool_setup_version', '0.9.0');
      
      expect(SetupWizardStateService.isSetupCompleted()).toBe(false);
    });

    test('should return false when setup is not completed', () => {
      localStorageMock.setItem('passivetool_setup_completed', 'false');
      localStorageMock.setItem('passivetool_setup_version', '1.0.0');
      
      expect(SetupWizardStateService.isSetupCompleted()).toBe(false);
    });

    test('should handle localStorage errors gracefully', () => {
      // Mock localStorage to throw error
      jest.spyOn(localStorageMock, 'getItem').mockImplementation(() => {
        throw new Error('localStorage error');
      });
      
      expect(SetupWizardStateService.isSetupCompleted()).toBe(false);
    });
  });

  describe('markSetupCompleted', () => {
    test('should mark setup as completed with current version', () => {
      SetupWizardStateService.markSetupCompleted();
      
      expect(localStorageMock.getItem('passivetool_setup_completed')).toBe('true');
      expect(localStorageMock.getItem('passivetool_setup_version')).toBe('1.0.0');
    });

    test('should handle localStorage errors gracefully', () => {
      // Mock localStorage to throw error
      jest.spyOn(localStorageMock, 'setItem').mockImplementation(() => {
        throw new Error('localStorage error');
      });
      
      expect(() => SetupWizardStateService.markSetupCompleted()).not.toThrow();
    });
  });

  describe('resetSetupState', () => {
    test('should remove setup data from localStorage', () => {
      // First set some data
      localStorageMock.setItem('passivetool_setup_completed', 'true');
      localStorageMock.setItem('passivetool_setup_version', '1.0.0');
      
      // Then reset
      SetupWizardStateService.resetSetupState();
      
      expect(localStorageMock.getItem('passivetool_setup_completed')).toBeNull();
      expect(localStorageMock.getItem('passivetool_setup_version')).toBeNull();
    });

    test('should handle localStorage errors gracefully', () => {
      // Mock localStorage to throw error
      jest.spyOn(localStorageMock, 'removeItem').mockImplementation(() => {
        throw new Error('localStorage error');
      });
      
      expect(() => SetupWizardStateService.resetSetupState()).not.toThrow();
    });
  });

  describe('isFirstTimeUser', () => {
    test('should return true when setup is not completed', () => {
      expect(SetupWizardStateService.isFirstTimeUser()).toBe(true);
    });

    test('should return false when setup is completed', () => {
      localStorageMock.setItem('passivetool_setup_completed', 'true');
      localStorageMock.setItem('passivetool_setup_version', '1.0.0');
      
      expect(SetupWizardStateService.isFirstTimeUser()).toBe(false);
    });
  });

  describe('getCurrentSetupVersion', () => {
    test('should return the current setup version', () => {
      expect(SetupWizardStateService.getCurrentSetupVersion()).toBe('1.0.0');
    });
  });

  describe('getStoredSetupVersion', () => {
    test('should return null when no version is stored', () => {
      expect(SetupWizardStateService.getStoredSetupVersion()).toBeNull();
    });

    test('should return stored version when available', () => {
      localStorageMock.setItem('passivetool_setup_version', '1.0.0');
      
      expect(SetupWizardStateService.getStoredSetupVersion()).toBe('1.0.0');
    });

    test('should handle localStorage errors gracefully', () => {
      // Mock localStorage to throw error
      jest.spyOn(localStorageMock, 'getItem').mockImplementation(() => {
        throw new Error('localStorage error');
      });
      
      expect(SetupWizardStateService.getStoredSetupVersion()).toBeNull();
    });
  });

  describe('Integration tests', () => {
    test('should handle complete setup workflow', () => {
      // Start as first-time user
      expect(SetupWizardStateService.isFirstTimeUser()).toBe(true);
      expect(SetupWizardStateService.isSetupCompleted()).toBe(false);
      
      // Complete setup
      SetupWizardStateService.markSetupCompleted();
      
      // Verify setup is completed
      expect(SetupWizardStateService.isFirstTimeUser()).toBe(false);
      expect(SetupWizardStateService.isSetupCompleted()).toBe(true);
      expect(SetupWizardStateService.getStoredSetupVersion()).toBe('1.0.0');
      
      // Reset setup
      SetupWizardStateService.resetSetupState();
      
      // Verify reset worked
      expect(SetupWizardStateService.isFirstTimeUser()).toBe(true);
      expect(SetupWizardStateService.isSetupCompleted()).toBe(false);
      expect(SetupWizardStateService.getStoredSetupVersion()).toBeNull();
    });

    test('should handle version mismatch scenario', () => {
      // Set old version
      localStorageMock.setItem('passivetool_setup_completed', 'true');
      localStorageMock.setItem('passivetool_setup_version', '0.9.0');
      
      // Should be treated as not completed due to version mismatch
      expect(SetupWizardStateService.isSetupCompleted()).toBe(false);
      expect(SetupWizardStateService.isFirstTimeUser()).toBe(true);
      
      // Update to current version
      SetupWizardStateService.markSetupCompleted();
      
      // Should now be completed
      expect(SetupWizardStateService.isSetupCompleted()).toBe(true);
      expect(SetupWizardStateService.getStoredSetupVersion()).toBe('1.0.0');
    });
  });
});