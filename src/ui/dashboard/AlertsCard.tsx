import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../common/Card';
import { Button } from '../common/Button';

interface Alert {
  type: 'warning' | 'info' | 'success';
  title: string;
  description: string;
  action: () => void;
  actionLabel: string;
}

interface AlertsCardProps {
  title: string;
  alerts: Alert[];
  icon: React.ReactNode;
}

export const AlertsCard: React.FC<AlertsCardProps> = ({
  title,
  alerts,
  icon
}) => {
  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert, index) => (
            <div 
              key={index}
              className={`p-3 rounded-lg border-l-4 ${
                alert.type === 'warning' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
                alert.type === 'success' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' :
                'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              }`}
            >
              <h4 className="font-medium text-sm mb-1">{alert.title}</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{alert.description}</p>
              <Button 
                size="sm" 
                variant="outline"
                onClick={alert.action}
                className="text-xs h-7"
              >
                {alert.actionLabel}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
