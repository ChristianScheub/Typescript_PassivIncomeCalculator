import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@ui/shared';
import { getButtonText } from '@/ui/settings';

interface DeveloperModeSettingsSectionProps {
  isDeveloperModeEnabled: boolean;
  developerPassword: string;
  developerActivationStatus: 'idle' | 'loading' | 'success' | 'error';
  onDeveloperPasswordChange: (password: string) => void;
  onDeveloperModeActivation: () => void;
  onDeveloperModeDeactivation: () => void;
}

export const DeveloperModeSettingsSection: React.FC<DeveloperModeSettingsSectionProps> = ({
  isDeveloperModeEnabled,
  developerPassword,
  developerActivationStatus,
  onDeveloperPasswordChange,
  onDeveloperModeActivation,
  onDeveloperModeDeactivation,
}) => {
  const { t } = useTranslation();
  const developerButtonText = getButtonText(developerActivationStatus, t, 'settings.activating', 'settings.activated', 'settings.activate');

  return (
    <div className="space-y-4">
      {isDeveloperModeEnabled ? (
        // Developer mode is active
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
            <div>
              <h3 className="font-medium text-green-800 dark:text-green-200">
                {t('settings.developerModeActive')}
              </h3>
              <p className="text-sm text-green-600 dark:text-green-400">
                {t('settings.developerModeDescription')}
              </p>
            </div>
            <div className="flex items-center">
              <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded">
                {t('settings.activated')}
              </span>
            </div>
          </div>
          
          {/* Deactivation Button */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">{t('settings.disableDeveloperMode')}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('settings.disableDeveloperModeDescription')}
              </p>
            </div>
            <Button
              onClick={onDeveloperModeDeactivation}
              variant="outline"
              size="sm"
              className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/20"
            >
              {t('settings.deactivate')}
            </Button>
          </div>
        </div>
      ) : (
        // Developer mode activation form
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-medium">{t('settings.enableDeveloperMode')}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('settings.developerModeDescription')}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label htmlFor="developer-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('settings.developerPassword')}
              </label>
              <input
                id="developer-password"
                type="password"
                value={developerPassword}
                onChange={(e) => onDeveloperPasswordChange(e.target.value)}
                placeholder={t('settings.enterDeveloperPassword')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                disabled={developerActivationStatus === 'loading'}
              />
            </div>

            <Button
              onClick={onDeveloperModeActivation}
              disabled={developerActivationStatus === 'loading' || !developerPassword.trim()}
              className="w-full"
            >
              {developerButtonText}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
