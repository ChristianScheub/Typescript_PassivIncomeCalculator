import React from 'react';
import { Card, CardContent } from '../common/Card';
import { Button } from '../common/Button';
import { Plus, ArrowRight, TrendingUp, Target, Lightbulb } from 'lucide-react';
import { cn } from '@/utils/cn';

interface BaseEmptyStateProps {
  className?: string;
}

interface MotivationalEmptyStateProps extends BaseEmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  motivationalText?: string;
  primaryAction: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'primary';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  tips?: string[];
}

interface ChartEmptyStateProps extends BaseEmptyStateProps {
  title?: string; 
  description: string;
  actionButton?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'chart' | 'minimal';
}

// Enhanced Motivational Empty State for main data sections
export const MotivationalEmptyState: React.FC<MotivationalEmptyStateProps> = ({
  icon,
  title,
  description,
  motivationalText,
  primaryAction,
  secondaryAction,
  tips,
  className
}) => {
  return (
    <Card className={cn("bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 border-dashed border-2 border-blue-200 dark:border-blue-800", className)}>
      <CardContent className="p-8 flex flex-col items-center justify-center text-center">
        {/* Icon with gradient background */}
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-full mb-4 shadow-lg">
          <div className="text-white">
            {icon}
          </div>
        </div>
        
        {/* Main content */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-3 max-w-md leading-relaxed">
          {description}
        </p>
        
        {/* Motivational text */}
        {motivationalText && (
          <div className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg p-3 mb-4 border border-green-200 dark:border-green-800">
            <div className="flex items-center text-green-700 dark:text-green-300">
              <TrendingUp size={16} className="mr-2 flex-shrink-0" />
              <p className="text-sm font-medium">{motivationalText}</p>
            </div>
          </div>
        )}
        
        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <Button 
            onClick={primaryAction.onClick}
            className={cn(
              "flex items-center",
              primaryAction.variant === 'primary' && "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            )}
          >
            <Plus size={16} className="mr-2" />
            {primaryAction.label}
          </Button>
          
          {secondaryAction && (
            <Button 
              variant="outline" 
              onClick={secondaryAction.onClick}
              className="flex items-center"
            >
              <ArrowRight size={16} className="mr-2" />
              {secondaryAction.label}
            </Button>
          )}
        </div>
        
        {/* Tips section */}
        {tips && Array.isArray(tips) && tips.length > 0 && (
          <div className="w-full max-w-md">
            <div className="flex items-center text-amber-600 dark:text-amber-400 mb-2">
              <Lightbulb size={16} className="mr-2" />
              <span className="text-sm font-medium">Tipp:</span>
            </div>
            <div className="space-y-1">
              {tips.map((tip) => (
                <p key={tip} className="text-sm text-gray-600 dark:text-gray-400 text-left">
                  • {tip}
                </p>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Simple empty state for charts and smaller components
export const ChartEmptyState: React.FC<ChartEmptyStateProps> = ({
  title,
  description,
  actionButton,
  variant = 'chart',
  className
}) => {
  if (variant === 'minimal') {
    return (
      <div className={cn("flex items-center justify-center h-full min-h-[200px]", className)}>
        <div className="text-center">
          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
            <Target className="h-5 w-5 text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs">
            {description}
          </p>
          {actionButton && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={actionButton.onClick}
              className="mt-3"
            >
              {actionButton.label}
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-center h-full min-h-[300px] p-6", className)}>
      <div className="text-center max-w-sm">
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <Target className="h-6 w-6 text-gray-400" />
        </div>
        {title && (
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            {title}
          </h4>
        )}
        <p className="text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
          {description}
        </p>
        {actionButton && (
          <Button 
            variant="outline" 
            onClick={actionButton.onClick}
            className="flex items-center mx-auto"
          >
            <Plus size={16} className="mr-2" />
            {actionButton.label}
          </Button>
        )}
      </div>
    </div>
  );
};