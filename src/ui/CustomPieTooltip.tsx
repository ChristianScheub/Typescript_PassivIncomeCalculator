import { useTranslation } from "react-i18next";

interface CustomPieTooltipProps {
  active?: boolean;
  payload?: any[];
  formatCurrency: (value: number) => string;
  formatPercentage: (value: number) => string;
}

export const CustomPieTooltip: React.FC<CustomPieTooltipProps> = ({ active, payload, formatCurrency, formatPercentage }) => {
  const { t } = useTranslation();
  if (active && payload && payload.length) {
    const data = payload?.[0]?.payload;
    if (!data) return null;
    
    const name = data?.category 
      ? t(`expenses.categories.${data.category}`)
      : data?.name;
      
    return (
      <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 rounded shadow">
        <p className="text-sm font-medium">{name}</p>
        <p className="text-sm">{formatCurrency(data.value || data.amount)}</p>
        <p className="text-sm">({formatPercentage(data.percentage)})</p>
      </div>
    );
  }
  return null;
};