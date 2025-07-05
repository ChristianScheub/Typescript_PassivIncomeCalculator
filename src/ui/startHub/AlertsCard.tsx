import React from "react";
import { Button } from "../shared/Button";

interface Alert {
  type: "warning" | "info" | "success";
  title: string;
  description: string;
  action: () => void;
  actionLabel: string;
}

interface AlertsCardProps {
  alerts: Alert[];
}

export const AlertsCard: React.FC<AlertsCardProps> = ({ alerts }) => {
  const getAlertStyles = (type: "warning" | "info" | "success") => {
    if (type === "warning") {
      return "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20";
    }
    if (type === "success") {
      return "border-green-500 bg-green-50 dark:bg-green-900/20";
    }
    return "border-blue-500 bg-blue-50 dark:bg-blue-900/20";
  };

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <div
          key={`${alert.type}-${alert.title}`}
          className={`p-3 rounded-lg border-l-4 ${getAlertStyles(alert.type)}`}
        >
          <h4 className="font-medium text-sm mb-1">{alert.title}</h4>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
            {alert.description}
          </p>
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
  );
};
