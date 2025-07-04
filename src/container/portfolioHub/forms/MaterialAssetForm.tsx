import React, { useEffect } from 'react';
import { Asset } from '@/types/domains/assets/entities';
import { AssetType } from '@/types/shared/base/enums';
import { MaterialAssetFormData } from '@/types/domains/assets';
import { useSharedForm } from '@/hooks/useSharedForm';
import { useTranslation } from 'react-i18next';
import Logger from '@/service/shared/logging/Logger/logger';
import { createMaterialAssetSchema } from '@/utils/validationSchemas';
import { MaterialAssetFormView } from '@/view/portfolio-hub/forms/MaterialAssetFormView';
import { getCurrentQuantity } from '@/utils/transactionCalculations';

const assetSchema = createMaterialAssetSchema();

interface AssetFormProps {
  initialData?: Asset;
  onSubmit: (data: Asset) => void;
}

const getDefaultValues = (initialData?: Asset): Partial<MaterialAssetFormData> => {
  if (!initialData) {
    return {
      type: 'stock' as AssetType,
      purchaseDate: new Date().getFullYear() + '-01-01'
    };
  }

  return {
    ...initialData,
    quantity: getCurrentQuantity(initialData), // Use helper function instead of accessing currentQuantity directly
    propertyValue: initialData.value,
    // Get ticker and symbol from AssetDefinition
    ticker: initialData.assetDefinition?.ticker,
    symbol: initialData.assetDefinition?.ticker, // Use ticker for crypto symbol as well
    acquisitionCost: initialData.purchasePrice, // Use purchasePrice as acquisitionCost for crypto
    currentPrice: initialData.assetDefinition?.currentPrice // Get currentPrice directly
  };
};

// Helper to calculate stock value, difference, and percentage
function calculateStockValues(data: MaterialAssetFormData) {
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
    Logger.info(`Note: currentPrice (${data.currentPrice}) should be stored in AssetDefinition, not transaction`);
  }
  return { finalValue, valueDifference, percentageDifference };
}

// Helper to assign type-specific fields
function assignTypeSpecificFields(transformedData: Asset, data: MaterialAssetFormData) {
  switch (data.type) {
    case 'stock':
      // Note: ticker and currentPrice are now stored in AssetDefinition, not directly on Asset
      // currentQuantity is now derived from purchaseQuantity - no need to set it explicitly
      transformedData.purchaseQuantity = data.quantity;
      if (data.purchasePrice !== undefined) {
        transformedData.purchasePrice = data.purchasePrice;
      }
      // currentPrice is no longer stored on the transaction
      break;
    case 'real_estate':
      if (data.propertyValue !== undefined) {
        transformedData.value = data.propertyValue;
      }
      break;
    case 'crypto':
      // Note: symbol is now stored in AssetDefinition as ticker
      // acquisitionCost is now stored as purchasePrice
      if (data.acquisitionCost !== undefined) {
        transformedData.purchasePrice = data.acquisitionCost;
      }
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
    reset,
    formState: { errors },
    onFormSubmit
  } = useSharedForm<MaterialAssetFormData>({
    validationSchema: assetSchema,
    defaultValues: getDefaultValues(initialData) as MaterialAssetFormData,
    onSubmit: async (data: MaterialAssetFormData) => {
      try {
        Logger.info('Form submission started with data: ' + JSON.stringify(data));
        // Use helper for stock calculations
        const { finalValue } = calculateStockValues(data);
        // Create the base transformed data
        const transformedData: Asset = {
          id: initialData?.id || Date.now().toString(),
          name: data.name,
          type: data.type,
          value: finalValue || data.value || 0,
          transactionType: 'buy', // Default transaction type for material asset form
          createdAt: initialData?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          purchaseDate: data.purchaseDate || new Date().getFullYear() + '-01-01',
          purchasePrice: data.purchasePrice || 0,
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

  // Watch fields that affect validation
  const assetType = watch('type');
  const quantity = watch('quantity');
  const currentPrice = watch('currentPrice');
  
  // Pre-populate form fields when editing an existing asset
  useEffect(() => {
    if (initialData) {
      Logger.info('Pre-populating form fields with initial data: ' + JSON.stringify(initialData));
      
      const formData: Partial<MaterialAssetFormData> = {
        name: initialData.name || '',
        type: initialData.type,
        value: initialData.value || 0,
        purchaseDate: initialData.purchaseDate || new Date().getFullYear() + '-01-01',
        notes: initialData.notes || '',
      };

      // Type-specific fields
      if (initialData.type === 'stock') {
        formData.ticker = initialData.assetDefinition?.ticker || '';
        formData.quantity = getCurrentQuantity(initialData); // Use helper function
        formData.purchasePrice = initialData.purchasePrice || 0;
        formData.currentPrice = initialData.assetDefinition?.currentPrice || 0;
      } else if (initialData.type === 'real_estate') {
        formData.propertyValue = initialData.value || 0;
      } else if (initialData.type === 'crypto') {
        formData.symbol = initialData.assetDefinition?.ticker || '';
        formData.acquisitionCost = initialData.purchasePrice || 0;
      }

      reset(formData);
    }
  }, [initialData, reset]);
  
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
      quantity={quantity}
      currentPrice={currentPrice}
      errors={errors}
      watch={watch}
      setValue={setValue}
      onFormSubmit={onFormSubmit}
      title={initialData ? t('assets.editAsset') : t('assets.addAsset')}
    />
  );
};
