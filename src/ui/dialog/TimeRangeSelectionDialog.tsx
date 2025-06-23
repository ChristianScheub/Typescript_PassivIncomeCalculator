import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Calendar, Clock } from 'lucide-react';
import { TimeRangePeriod, TimeRangeOption } from '@/types/shared/time';

interface TimeRangeSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (period: TimeRangePeriod) => void;
  title?: string;
}

export const TimeRangeSelectionDialog: React.FC<TimeRangeSelectionDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title
}) => {
  const { t } = useTranslation();
  const [selectedPeriod, setSelectedPeriod] = useState<TimeRangePeriod>("1y");

  const timeRangeOptions: TimeRangeOption[] = [
    { 
      value: "1d", 
      label: t("timeRange.1d") || "1 Tag", 
      description: t("timeRange.1d.description") || "Daten für den letzten Tag" 
    },
    { 
      value: "5d", 
      label: t("timeRange.5d") || "5 Tage", 
      description: t("timeRange.5d.description") || "Daten für die letzten 5 Tage" 
    },
    { 
      value: "1mo", 
      label: t("timeRange.1mo") || "1 Monat", 
      description: t("timeRange.1mo.description") || "Daten für den letzten Monat" 
    },
    { 
      value: "3mo", 
      label: t("timeRange.3mo") || "3 Monate", 
      description: t("timeRange.3mo.description") || "Daten für die letzten 3 Monate" 
    },
    { 
      value: "6mo", 
      label: t("timeRange.6mo") || "6 Monate", 
      description: t("timeRange.6mo.description") || "Daten für die letzten 6 Monate" 
    },
    { 
      value: "1y", 
      label: t("timeRange.1y") || "1 Jahr", 
      description: t("timeRange.1y.description") || "Daten für das letzte Jahr" 
    },
    { 
      value: "2y", 
      label: t("timeRange.2y") || "2 Jahre", 
      description: t("timeRange.2y.description") || "Daten für die letzten 2 Jahre" 
    },
    { 
      value: "5y", 
      label: t("timeRange.5y") || "5 Jahre", 
      description: t("timeRange.5y.description") || "Daten für die letzten 5 Jahre" 
    },
    { 
      value: "10y", 
      label: t("timeRange.10y") || "10 Jahre", 
      description: t("timeRange.10y.description") || "Daten für die letzten 10 Jahre" 
    },
    { 
      value: "ytd", 
      label: t("timeRange.ytd") || "Jahr bis heute", 
      description: t("timeRange.ytd.description") || "Daten seit Jahresbeginn" 
    },
    { 
      value: "max", 
      label: t("timeRange.max") || "Maximum", 
      description: t("timeRange.max.description") || "Alle verfügbaren historischen Daten" 
    }
  ];

  const handleConfirm = () => {
    onConfirm(selectedPeriod);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full mr-3">
            <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {title || t("assets.selectTimeRange") || "Zeitraum auswählen"}
          </h2>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          {t("assets.selectTimeRange.description") || "Wählen Sie den gewünschten Zeitraum für die historischen Preisdaten aus."}
        </p>

        {/* Time Range Options */}
        <div className="space-y-2 mb-6 max-h-64 overflow-y-auto">
          {timeRangeOptions.map((option) => (
            <div
              key={option.value}
              className={`
                relative cursor-pointer rounded-lg border p-3 transition-all
                ${selectedPeriod === option.value 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }
              `}
              onClick={() => setSelectedPeriod(option.value)}
            >
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    type="radio"
                    checked={selectedPeriod === option.value}
                    onChange={() => setSelectedPeriod(option.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-400 mr-2" />
                    <label className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer">
                      {option.label}
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {option.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="px-4 py-2"
          >
            {t("common.cancel") || "Abbrechen"}
          </Button>
          <Button
            variant="default"
            onClick={handleConfirm}
            className="px-4 py-2"
          >
            {t("common.save") || "Bestätigen"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default TimeRangeSelectionDialog;
