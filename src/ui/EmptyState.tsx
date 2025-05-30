import React from 'react';
import { Card, CardContent } from './Card';
import { Button } from './Button';
import { Plus } from 'lucide-react';
import { cn } from '../utils/cn';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className
}) => {
  return (
    <Card className={cn("bg-white dark:bg-gray-800 border-dashed", className)}>
      <CardContent className="p-8 flex flex-col items-center justify-center text-center">
        <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-full mb-3">
          {icon}
        </div>
        <h3 className="text-lg font-medium mb-1">{title}</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-md">
          {description}
        </p>
        <Button onClick={onAction}>
          <Plus size={16} className="mr-2" />
          {actionLabel}
        </Button>
      </CardContent>
    </Card>
  );
};
