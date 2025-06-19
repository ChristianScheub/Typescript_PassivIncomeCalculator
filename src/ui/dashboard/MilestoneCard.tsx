import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../common/Card';

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
            return (
              <div 
                key={milestone.title}
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-3 rounded-lg transition-colors"
                onClick={milestone.onClick}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <IconComponent className={`h-4 w-4 text-${milestone.color}-500`} />
                    <span className="text-sm font-medium">{milestone.title}</span>
                  </div>
                  <span className={`text-sm font-bold text-${milestone.color}-600`}>
                    {milestone.progress.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`bg-${milestone.color}-500 h-2 rounded-full transition-all duration-300`}
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
