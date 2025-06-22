import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { StandardFormField } from '@/ui/forms/FormGrid';
import { TrendingUp } from 'lucide-react';

export interface PriceEntry {
  date: string;
  price: number;
}

interface AddPriceEntryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (entry: PriceEntry) => void;
  assetName?: string;
  currentPrice?: number;
}

export const AddPriceEntryDialog: React.FC<AddPriceEntryDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  assetName,
  currentPrice
}) => {
  const { t } = useTranslation();
  const [date, setDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [price, setPrice] = useState<number>(currentPrice || 0);
  const [errors, setErrors] = useState<{ date?: string; price?: string }>({});

  const validateForm = () => {
    const newErrors: { date?: string; price?: string } = {};
    
    if (!date) {
      newErrors.date = t("validation.required") || "Pflichtfeld";
    }
    
    if (!price || price <= 0) {
      newErrors.price = t("validation.priceRequired") || "Preis muss größer als 0 sein";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = () => {
    if (validateForm()) {
      onConfirm({ date, price });
      handleClose();
    }
  };

  const handleClose = () => {
    setDate(new Date().toISOString().substring(0, 10));
    setPrice(currentPrice || 0);
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <div className="flex items-center justify-center w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full mr-3">
            <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {t("assets.addPriceEntry") || "Preis-Eintrag hinzufügen"}
          </h2>
        </div>

        {/* Asset Name */}
        {assetName && (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("assets.asset") || "Asset"}
            </p>
            <p className="font-medium text-gray-900 dark:text-gray-100">
              {assetName}
            </p>
          </div>
        )}

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          {t("assets.addPriceEntry.description") || "Fügen Sie einen neuen Preiseintrag für einen bestimmten Tag zur Preishistorie hinzu."}
        </p>

        {/* Form Fields */}
        <div className="space-y-4 mb-6">
          <StandardFormField
            label={t("assets.date") || "Datum"}
            name="date"
            type="date"
            required
            value={date}
            onChange={(value) => setDate(value as string)}
            error={errors.date}
          />

          <StandardFormField
            label={t("assets.price") || "Preis"}
            name="price"
            type="number"
            required
            value={price}
            onChange={(value) => setPrice(Number(value))}
            error={errors.price}
            step={0.01}
            min={0.01}
            placeholder="0.00"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={handleClose}
            className="px-4 py-2"
          >
            {t("common.cancel") || "Abbrechen"}
          </Button>
          <Button
            variant="default"
            onClick={handleConfirm}
            className="px-4 py-2"
          >
            {t("common.add") || "Hinzufügen"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AddPriceEntryDialog;
