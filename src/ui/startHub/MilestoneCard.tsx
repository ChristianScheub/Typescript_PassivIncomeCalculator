import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../shared/Card';

interface Milestone {
  title: string;
  progress: number;
  target: number;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
}

interface MilestoneCardProps {
  title: string;
  milestones: Milestone[];
  icon: React.ReactNode;
}

export const MilestoneCard: React.FC<MilestoneCardProps> = ({
  title,
  milestones,
  icon
}) => {
  // Helper function to get color classes (ensures Tailwind includes these classes)
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'green':
        return {
          icon: 'text-green-500',
          text: 'text-green-600',
          bg: 'bg-green-500'
        };
      case 'purple':
        return {
          icon: 'text-purple-500',
          text: 'text-purple-600',
          bg: 'bg-purple-500'
        };
      case 'orange':
        return {
          icon: 'text-orange-500',
          text: 'text-orange-600',
          bg: 'bg-orange-500'
        };
      case 'blue':
        return {
          icon: 'text-blue-500',
          text: 'text-blue-600',
          bg: 'bg-blue-500'
        };
      default:
        return {
          icon: 'text-gray-500',
          text: 'text-gray-600',
          bg: 'bg-gray-500'
        };
    }
  };

  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {milestones.map((milestone) => {
            const IconComponent = milestone.icon;
            const colorClasses = getColorClasses(milestone.color);
            return (
              <div 
                key={milestone.title}
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-3 rounded-lg transition-colors"
                onClick={milestone.onClick}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <IconComponent className={`h-4 w-4 ${colorClasses.icon}`} />
                    <span className="text-sm font-medium">{milestone.title}</span>
                  </div>
                  <span className={`text-sm font-bold ${colorClasses.text}`}>
                    {milestone.progress.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`${colorClasses.bg} h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${Math.min(milestone.progress, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
