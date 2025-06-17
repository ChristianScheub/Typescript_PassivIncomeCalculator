import React from 'react';
import { Card, CardContent } from '../common/Card';

interface MiniAnalyticsCardProps {
  title: string;
  value: string;
  icon?: React.ReactNode;
  color: string;
  onClick?: () => void;
}

export const MiniAnalyticsCard: React.FC<MiniAnalyticsCardProps> = ({
  title,
  value,
  icon,
  color,
  onClick
}) => {
  return (
    <Card 
      className={`bg-white dark:bg-gray-800 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className={`text-xl font-bold ${color}`}>
              {value}
            </p>
          </div>
          {icon && (
            <div className={`bg-${color.split('-')[1]}-100 dark:bg-${color.split('-')[1]}-900 p-2 rounded-full`}>
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
