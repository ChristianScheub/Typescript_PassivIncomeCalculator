import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '@ui/shared';
import { featureFlag_Debug_Settings_View } from '@/config/featureFlags';

interface AboutSectionProps {
  isDeveloperModeEnabled: boolean;
}

export const AboutSection: React.FC<AboutSectionProps> = ({
  isDeveloperModeEnabled,
}) => {
  const { t } = useTranslation();

  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardHeader>
        <CardTitle>{t('settings.about')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>{t('settings.appName')}</strong>
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('settings.version', { version: '1.0.0' })}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('settings.appDescription')}
          </p>

          {featureFlag_Debug_Settings_View || isDeveloperModeEnabled && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-yellow-600 dark:text-yellow-400 font-mono">
                🚧 {t('settings.debugModeActive')}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('settings.debugModeDescription')}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
