import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  subtitle: string;
  value: string;
  valueDescription: string;
  secondaryValue?: string;
  secondaryValueDescription?: string;
  icon: LucideIcon;
  gradientFrom: string;
  gradientTo: string;
  darkGradientFrom: string;
  darkGradientTo: string;
  accentColor: string; // For text colors like "red-100/80"
  className?: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  subtitle,
  value,
  valueDescription,
  secondaryValue,
  secondaryValueDescription,
  icon: Icon,
  gradientFrom,
  gradientTo,
  darkGradientFrom,
  darkGradientTo,
  accentColor,
  className = ""
}) => {
  return (
    <Card className={`bg-gradient-to-br ${gradientFrom} ${gradientTo} dark:${darkGradientFrom} dark:${darkGradientTo} rounded-[2rem] overflow-hidden ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-lg font-medium text-white">
              {title}
            </CardTitle>
            <p className={`text-sm font-medium text-${accentColor}`}>
              {subtitle}
            </p>
          </div>
          <div className="bg-white/10 p-2 rounded-xl backdrop-blur-sm">
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="text-3xl font-bold text-white">
            {value}
          </div>
          <p className={`text-sm text-${accentColor.replace('/80', '/90')}`}>
            {valueDescription}
          </p>
          {secondaryValue && secondaryValueDescription && (
            <div className="mt-3 pt-3 border-t border-white/20">
              <div className="text-xl font-semibold text-white">
                {secondaryValue}
              </div>
              <p className={`text-xs text-${accentColor.replace('/80', '/90')}`}>
                {secondaryValueDescription}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
