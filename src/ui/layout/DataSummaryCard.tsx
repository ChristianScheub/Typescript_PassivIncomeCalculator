import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import { cn } from '../../utils/cn';

interface SummaryItem {
  id: string;
  label: string;
  value: string | number;
  subValue?: string;
  valueClassName?: string;
}

interface DataSummaryCardProps {
  title: string;
  items: SummaryItem[][];
  className?: string;
}

export const DataSummaryCard: React.FC<DataSummaryCardProps> = ({
  title,
  items,
  className
}) => {
  return (
    <Card className={cn("bg-white dark:bg-gray-800", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((row) => (
            <div key={row.map(item => item.id).join('-')} className="space-y-4">
              {row.map((item) => (
                <div key={item.id} className="space-y-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {item.label}
                  </p>
                  <div className={cn(
                    "text-3xl font-bold",
                    item.valueClassName
                  )}>
                    {item.value}
                  </div>
                  {item.subValue && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {item.subValue}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
