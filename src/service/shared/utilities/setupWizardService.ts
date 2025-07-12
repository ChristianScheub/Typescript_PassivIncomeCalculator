/**
 * Service for managing setup wizard completion state and first-time user detection
 */
export class SetupWizardStateService {
  private static readonly SETUP_COMPLETED_KEY = 'passivetool_setup_completed';
  private static readonly SETUP_VERSION_KEY = 'passivetool_setup_version';
  private static readonly CURRENT_SETUP_VERSION = '1.0.0';

  /**
   * Check if the user has completed the initial setup
   */
  static isSetupCompleted(): boolean {
    try {
      const completed = localStorage.getItem(this.SETUP_COMPLETED_KEY);
      const version = localStorage.getItem(this.SETUP_VERSION_KEY);
      
      // Check if setup is completed and version matches
      return completed === 'true' && version === this.CURRENT_SETUP_VERSION;
    } catch (error) {
      console.warn('Failed to check setup completion status:', error);
      return false;
    }
  }

  /**
   * Mark the setup as completed
   */
  static markSetupCompleted(): void {
    try {
      localStorage.setItem(this.SETUP_COMPLETED_KEY, 'true');
      localStorage.setItem(this.SETUP_VERSION_KEY, this.CURRENT_SETUP_VERSION);
    } catch (error) {
      console.warn('Failed to mark setup as completed:', error);
    }
  }

  /**
   * Reset the setup completion state (for testing or re-onboarding)
   */
  static resetSetupState(): void {
    try {
      localStorage.removeItem(this.SETUP_COMPLETED_KEY);
      localStorage.removeItem(this.SETUP_VERSION_KEY);
    } catch (error) {
      console.warn('Failed to reset setup state:', error);
    }
  }

  /**
   * Check if this is the user's first time opening the application
   */
  static isFirstTimeUser(): boolean {
    return !this.isSetupCompleted();
  }

  /**
   * Get the current setup version
   */
  static getCurrentSetupVersion(): string {
    return this.CURRENT_SETUP_VERSION;
  }

  /**
   * Get the stored setup version
   */
  static getStoredSetupVersion(): string | null {
    try {
      return localStorage.getItem(this.SETUP_VERSION_KEY);
    } catch (error) {
      console.warn('Failed to get stored setup version:', error);
      return null;
    }
  }
}

export default SetupWizardStateService;