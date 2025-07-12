import { useState, useEffect, useCallback } from 'react';
import SetupWizardStateService from '@/service/shared/utilities/setupWizardService';

/**
 * Hook for managing setup completion status
 * Provides reactive state for setup completion and methods to update it
 */
export const useSetupStatus = () => {
  const [isSetupCompleted, setIsSetupCompleted] = useState<boolean>(false);
  const [isCheckingSetup, setIsCheckingSetup] = useState<boolean>(true);

  // Check setup status on mount
  useEffect(() => {
    const checkSetupStatus = () => {
      try {
        const completed = SetupWizardStateService.isSetupCompleted();
        setIsSetupCompleted(completed);
      } catch (error) {
        console.warn('Failed to check setup status:', error);
        setIsSetupCompleted(false);
      } finally {
        setIsCheckingSetup(false);
      }
    };

    checkSetupStatus();
  }, []);

  // Method to mark setup as completed
  const markSetupCompleted = useCallback(() => {
    try {
      SetupWizardStateService.markSetupCompleted();
      setIsSetupCompleted(true);
    } catch (error) {
      console.warn('Failed to mark setup as completed:', error);
    }
  }, []);

  // Method to reset setup status (for testing/debugging)
  const resetSetupStatus = useCallback(() => {
    try {
      SetupWizardStateService.resetSetupState();
      setIsSetupCompleted(false);
    } catch (error) {
      console.warn('Failed to reset setup status:', error);
    }
  }, []);

  // Listen for storage changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'passivetool_setup_completed' && event.newValue !== null) {
        const completed = event.newValue === 'true';
        setIsSetupCompleted(completed);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return {
    isSetupCompleted,
    isCheckingSetup,
    isFirstTimeUser: !isSetupCompleted,
    markSetupCompleted,
    resetSetupStatus
  };
};

export default useSetupStatus;
