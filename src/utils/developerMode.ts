/**
 * Developer Mode Utilities
 * Provides functions to check and manage developer mode state
 */

const DEVELOPER_MODE_KEY = 'developerModeEnabled';

/**
 * Checks if developer mode is currently enabled
 * @returns True if developer mode is enabled, false otherwise
 */
export const isDeveloperModeEnabled = (): boolean => {
  try {
    const value = localStorage.getItem(DEVELOPER_MODE_KEY);
    return value === 'true';
  } catch (error) {
    // In case localStorage is not available (e.g., in some environments)
    console.warn('Failed to access localStorage for developer mode check:', error);
    return false;
  }
};

/**
 * Enables developer mode by setting the localStorage value
 */
export const enableDeveloperMode = (): void => {
  try {
    localStorage.setItem(DEVELOPER_MODE_KEY, 'true');
  } catch (error) {
    console.warn('Failed to enable developer mode in localStorage:', error);
  }
};

/**
 * Disables developer mode by removing the localStorage value
 */
export const disableDeveloperMode = (): void => {
  try {
    localStorage.removeItem(DEVELOPER_MODE_KEY);
  } catch (error) {
    console.warn('Failed to disable developer mode in localStorage:', error);
  }
};

/**
 * Toggles developer mode state
 * @returns The new state after toggling
 */
export const toggleDeveloperMode = (): boolean => {
  const currentState = isDeveloperModeEnabled();
  if (currentState) {
    disableDeveloperMode();
    return false;
  } else {
    enableDeveloperMode();
    return true;
  }
};
