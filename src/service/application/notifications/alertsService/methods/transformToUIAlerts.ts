import type { FinancialAlert, UIAlert } from '@/types/domains/analytics/reporting';

export const transformToUIAlerts = (
  financialAlerts: FinancialAlert[],
  t: (key: string) => string,
  navigate: (route: string) => void
): UIAlert[] => {
  return financialAlerts.map(alert => ({
    type: alert.type as 'warning' | 'info' | 'success',
    title: t(alert.titleKey),
    description: t(alert.descriptionKey),
    action: () => {
      if (alert.actionType === 'navigate' && alert.actionData?.route) {
        navigate(alert.actionData.route);
      }
    },
    actionLabel: alert.actionLabelKey ? t(alert.actionLabelKey) : t('common.viewDetails')
  }));
};
