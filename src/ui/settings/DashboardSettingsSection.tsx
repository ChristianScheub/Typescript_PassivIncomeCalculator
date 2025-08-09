import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonGroup } from '@ui/shared';
import { DashboardMode } from '@/types/shared/analytics';

interface DashboardSettingsSectionProps {
  dashboardMode: DashboardMode;
  onDashboardModeChange: (mode: DashboardMode) => void;
}

export const DashboardSettingsSection: React.FC<DashboardSettingsSectionProps> = ({
  dashboardMode,
  onDashboardModeChange,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">{t('settings.dashboardMode')}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('settings.dashboardModeDescription')}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <ButtonGroup className="flex space-x-3">
          <Button
            onClick={() => onDashboardModeChange('smartSummary')}
            variant={dashboardMode === 'smartSummary' ? 'default' : 'secondary'}
            size="sm"
          >
            {t('settings.smartSummary')}
          </Button>
          <Button
            onClick={() => onDashboardModeChange('assetFocus')}
            variant={dashboardMode === 'assetFocus' ? 'default' : 'secondary'}
            size="sm"
          >
            {t('settings.assetFocus')}
          </Button>
        </ButtonGroup>
        
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {t('settings.currentDashboardMode', {
            mode: dashboardMode === 'smartSummary' ? t('settings.smartSummary') : t('settings.assetFocus'),
          })}
        </p>
      </div>
    </div>
  );
};
