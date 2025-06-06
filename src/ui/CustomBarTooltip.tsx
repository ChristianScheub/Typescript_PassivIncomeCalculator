import { useTranslation } from "react-i18next";

interface CustomBarTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  formatCurrency: (value: number) => string;
}

export const CustomBarTooltip: React.FC<CustomBarTooltipProps> = ({ active, payload, label, formatCurrency }) => {
  const { t } = useTranslation();
  
  if (!active || !payload?.length) return null;
  
  return (
    <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 rounded shadow">
      <p className="text-sm font-medium">{label}</p>
      {payload.map((item) => (
        <p key={`${item.dataKey}-${item.value}`} className="text-sm">
          {t(`dashboard.${item.dataKey}`)}: {formatCurrency(item.value)}
        </p>
      ))}
    </div>
  );
};