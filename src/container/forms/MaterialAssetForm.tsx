import React, { useEffect } from 'react';
import { Asset, AssetType, DividendFrequency, PaymentFrequency } from '../../types';
import { usePaymentSchedule } from '../../hooks/usePaymentSchedule';
import { useSharedForm } from '../../hooks/useSharedForm';
import { useTranslation } from 'react-i18next';
import Logger from '../../service/Logger/logger';
import { createAssetSchema } from '../../utils/validationSchemas';
import { MaterialAssetFormView } from '../../view/forms/MaterialAssetFormView';

interface AssetFormData {
  // Required fields
  name: string;
  type: AssetType;
  value: number;
  purchaseDate?: string;
  
  // Stock specific fields
  ticker?: string;
  quantity?: number;
  purchasePrice?: number;
  currentPrice?: number;
  dividendFrequency?: DividendFrequency;
  dividendAmount?: number;
  dividendMonths?: number[];
  dividendPaymentMonths?: number[];
  customDividendAmounts?: { [key: string]: number };

  // Real estate specific fields
  propertyValue?: number;
  rentalAmount?: number;

  // Bond specific fields
  interestRate?: number;
  maturityDate?: string;
  nominalValue?: number;

  // Crypto specific fields
  symbol?: string;
  acquisitionCost?: number;

  // Optional fields
  country?: string;
  continent?: string;
  sector?: string;
  notes?: string;

  // System fields
  id?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Create asset validation schema using shared utilities
const assetSchema = createAssetSchema();

interface AssetFormProps {
  initialData?: Asset;
  onSubmit: (data: Asset) => void;
}

const getDefaultValues = (initialData?: Asset): Partial<AssetFormData> => {
  if (!initialData) {
    return {
      type: 'stock' as AssetType,
      dividendFrequency: 'none' as DividendFrequency,
      purchaseDate: new Date().getFullYear() + '-01-01'
    };
  }

  return {
    ...initialData,
    dividendFrequency: initialData.dividendInfo?.frequency || 'none',
    dividendAmount: initialData.dividendInfo?.amount,
    dividendMonths: initialData.dividendInfo?.months,
    dividendPaymentMonths: initialData.dividendInfo?.paymentMonths,
    customDividendAmounts: initialData.dividendInfo?.customAmounts,
    propertyValue: initialData.propertyValue,
    rentalAmount: initialData.rentalIncome?.amount,
    interestRate: initialData.interestRate,
    maturityDate: initialData.maturityDate,
    nominalValue: initialData.nominalValue,
    symbol: initialData.symbol,
    acquisitionCost: initialData.acquisitionCost
  };
};

// Helper to calculate stock value, difference, and percentage
function calculateStockValues(data: AssetFormData) {
  let finalValue = data.value;
  let valueDifference;
  let percentageDifference;

  if (data.type === 'stock' && data.quantity && data.currentPrice) {
    finalValue = data.quantity * data.currentPrice;
    if (data.purchasePrice) {
      const purchaseValue = data.quantity * data.purchasePrice;
      valueDifference = finalValue - purchaseValue;
      if (valueDifference !== 0) {
        percentageDifference = purchaseValue > 0 ? ((finalValue - purchaseValue) / purchaseValue) * 100 : 0;
      }
    }
    Logger.info(`Stock value calculated: ${data.quantity} × ${data.currentPrice} = ${finalValue}`);
    Logger.info(`Value difference: ${valueDifference}`);
    Logger.info(`Percentage difference: ${percentageDifference}%`);
  }
  return { finalValue, valueDifference, percentageDifference };
}

// Helper to assign type-specific fields
function assignTypeSpecificFields(transformedData: Asset, data: AssetFormData) {
  switch (data.type) {
    case 'stock':
      transformedData.ticker = data.ticker;
      transformedData.quantity = data.quantity;
      transformedData.purchasePrice = data.purchasePrice;
      transformedData.currentPrice = data.currentPrice;
      if (data.dividendFrequency && data.dividendFrequency !== 'none') {
        transformedData.dividendInfo = {
          frequency: data.dividendFrequency,
          amount: data.dividendAmount || 0,
          months: data.dividendMonths,
          paymentMonths: data.dividendPaymentMonths,
          customAmounts: data.customDividendAmounts,
        };
      }
      break;
    case 'real_estate':
      transformedData.propertyValue = data.propertyValue;
      if (data.rentalAmount) {
        transformedData.rentalIncome = {
          amount: data.rentalAmount,
          frequency: 'monthly',
        };
      }
      break;
    case 'bond':
      transformedData.interestRate = data.interestRate;
      transformedData.maturityDate = data.maturityDate;
      transformedData.nominalValue = data.nominalValue;
      break;
    case 'crypto':
      transformedData.symbol = data.symbol;
      transformedData.acquisitionCost = data.acquisitionCost;
      break;
    default:
      break;
  }
}

export const MaterialAssetForm: React.FC<AssetFormProps> = ({ initialData, onSubmit }) => {
  const { t } = useTranslation();
  
  const {
    watch,
    setValue,
    formState: { errors },
    onFormSubmit
  } = useSharedForm<AssetFormData>({
    validationSchema: assetSchema,
    defaultValues: getDefaultValues(initialData) as AssetFormData,
    onSubmit: async (data: AssetFormData) => {
      try {
        Logger.info('Form submission started with data: ' + JSON.stringify(data));
        // Use helper for stock calculations
        const { finalValue, valueDifference, percentageDifference } = calculateStockValues(data);
        // Create the base transformed data
        const transformedData: Asset = {
          id: initialData?.id || Date.now().toString(),
          name: data.name,
          type: data.type,
          value: finalValue || data.value || 0,
          createdAt: initialData?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          purchaseDate: data.purchaseDate,
          valueDifference,
          percentageDifference,
          country: data.country,
          continent: data.continent,
          sector: data.sector,
          notes: data.notes
        };
        // Use helper for type-specific fields
        assignTypeSpecificFields(transformedData, data);
        Logger.info('Transformed data: ' + JSON.stringify(transformedData));
        await onSubmit(transformedData);
        Logger.info('Form submission completed successfully');
      } catch (error) {
        Logger.error('Form submission error: ' + JSON.stringify(error));
        throw error;
      }
    }
  });

  const { fields: paymentFields, handleMonthChange } = usePaymentSchedule(
    initialData?.dividendInfo ? {
      frequency: initialData.dividendInfo.frequency as PaymentFrequency,
      amount: initialData.dividendInfo.amount,
      months: initialData.dividendInfo.paymentMonths || initialData.dividendInfo.months,
      customAmounts: initialData.dividendInfo.customAmounts,
    } : undefined
  );

  // Watch fields that affect validation
  const assetType = watch('type');
  const dividendFrequency = watch('dividendFrequency');
  const quantity = watch('quantity');
  const currentPrice = watch('currentPrice');
  
  useEffect(() => {
    if (assetType === 'stock') {
      if (quantity && currentPrice && quantity > 0 && currentPrice > 0) {
        const calculatedValue = quantity * currentPrice;
        setValue('value', calculatedValue);
        Logger.info(`Auto-calculated stock value: ${quantity} × ${currentPrice} = ${calculatedValue}`);
      }
    }
  }, [assetType, quantity, currentPrice, setValue]);

  return (
    <MaterialAssetFormView 
      assetType={assetType}
      dividendFrequency={dividendFrequency}
      quantity={quantity}
      currentPrice={currentPrice}
      errors={errors}
      watch={watch}
      setValue={setValue}
      onFormSubmit={onFormSubmit}
      paymentFields={paymentFields}
      handleMonthChange={handleMonthChange}
      title={initialData ? t('assets.editAsset') : t('assets.addAsset')}
    />
  );
};
