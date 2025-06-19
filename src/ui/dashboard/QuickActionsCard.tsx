import React from 'react';
import { useTranslation } from 'react-i18next';
import { Plus} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../common/Card';
import { Button } from '../common/Button';

interface QuickAction {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  translationKey: string;
  onClick: () => void;
}

interface QuickActionsCardProps {
  actions: QuickAction[];
}

export const QuickActionsCard: React.FC<QuickActionsCardProps> = ({ actions }) => {
  const { t } = useTranslation();

  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Plus className="h-5 w-5 text-blue-500" />
          {t('dashboard.quickActions')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {actions.map((action) => {
            const IconComponent = action.icon;
            return (
              <Button 
                key={action.id}
                variant="outline" 
                size="sm"
                onClick={action.onClick}
                className="flex flex-col items-center gap-2 h-auto py-3"
              >
                <IconComponent className={`h-5 w-5 ${action.color}`} />
                <span className="text-xs">{t(action.translationKey)}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
