import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/hooks/redux';
import { useSharedForm } from '@/hooks/useSharedForm';
import { AssetDefinition,Asset } from '@/types/domains/assets/entities';
import { AssetFormData } from '@/types/domains/forms/form-data';
import { createAssetTransactionSchema } from '@/utils/validationSchemas';
import { Modal } from '@/ui/common/Modal';
import { 
  StandardFormWrapper,
  RequiredSection,
  OptionalSection,
  FormGrid,
  StandardFormField
} from '@/ui/forms/StandardFormWrapper';
import { AssetSearchBar, SelectedAssetInfo } from '@/ui/components';
import { FormFieldValue } from '@/types/shared/ui/specialized';
import { formatService } from '@/service';

const assetTransactionSchema = createAssetTransactionSchema();

type AssetTransactionFormData = AssetFormData;

interface AssetTransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editingAsset?: Asset | null;
}

export const AssetTransactionForm: React.FC<AssetTransactionFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingAsset
}) => {
  const { t } = useTranslation();
  const { items: assetDefinitions } = useAppSelector(state => state.assetDefinitions);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDefinition, setSelectedDefinition] = useState<AssetDefinition | null>(null);
  const formRef = React.useRef<HTMLFormElement>(null);

  const getDefaultValues = (): Partial<AssetTransactionFormData> => {
    if (editingAsset) {
      // Find the asset definition to get the current price if needed
      const assetDefinition = assetDefinitions.find((def: AssetDefinition) => def.id === editingAsset.assetDefinitionId);
      
      // Prepare reset data with proper fallbacks
      return {
        assetDefinitionId: editingAsset.assetDefinitionId || '',
        name: editingAsset.name || '',
        type: editingAsset.type || 'stock',
        value: editingAsset.value || 0,
        transactionType: editingAsset.transactionType || 'buy',
        purchaseDate: editingAsset.purchaseDate?.substring(0, 10) || new Date().toISOString().substring(0, 10),
        purchasePrice: editingAsset.purchasePrice || assetDefinition?.currentPrice || 0,
        purchaseQuantity: editingAsset.purchaseQuantity || 1,
        saleDate: editingAsset.saleDate?.substring(0, 10) || new Date().toISOString().substring(0, 10),
        // For sell transactions, display purchasePrice/purchaseQuantity as positive values in sale fields
        salePrice: editingAsset.transactionType === 'sell' ? (editingAsset.purchasePrice || 0) : 0,
        saleQuantity: editingAsset.transactionType === 'sell' ? Math.abs(editingAsset.purchaseQuantity || 1) : 1,
        transactionCosts: editingAsset.transactionCosts || 0,
        notes: editingAsset.notes || '',
      };
    } else {
      // Reset form for new transaction
      return {
        assetDefinitionId: '',
        name: '',
        type: 'stock',  // Default to stock type until asset definition is selected
        value: 0,
        transactionType: 'buy' as const,
        purchaseDate: new Date().toISOString().substring(0, 10),
        purchasePrice: 0,
        purchaseQuantity: 1,
        saleDate: new Date().toISOString().substring(0, 10),
        salePrice: 0,
        saleQuantity: 1,
        transactionCosts: 0,
        notes: '',
      };
    }
  };

  const {
    watch,
    setValue,
    formState: { errors },
    onFormSubmit,
    reset
  } = useSharedForm<AssetTransactionFormData>({
    validationSchema: assetTransactionSchema,
    defaultValues: getDefaultValues(),
    onSubmit: (data: AssetTransactionFormData) => {
      if (!selectedDefinition) {
        return;
      }

      // Remove assetDefinition if present (to avoid type error)
      const { assetDefinition, ...cleanedData } = data as any;

      // Determine transaction date based on type
      let transactionDate: string;
      if (data.transactionType === 'buy' && data.purchaseDate) {
        transactionDate = new Date(data.purchaseDate).toISOString();
      } else if (data.transactionType === 'sell' && data.saleDate) {
        transactionDate = new Date(data.saleDate).toISOString();
      } else {
        transactionDate = new Date().toISOString();
      }

      const assetData = {
        ...cleanedData,
        // Store only the reference ID, not the full object
        assetDefinitionId: selectedDefinition.id,
        // Asset transaction specific fields
        type: selectedDefinition.type,
        value: totalValue,
        // Convert all transactions to use purchasePrice/purchaseQuantity
        // For sell transactions: use salePrice as purchasePrice and negative saleQuantity as purchaseQuantity
        purchasePrice: data.transactionType === 'buy' 
          ? (data.purchasePrice || 0) 
          : (data.salePrice || 0),
        purchaseQuantity: data.transactionType === 'buy' 
          ? (data.purchaseQuantity || 0) 
          : -(data.saleQuantity || 0), // Negative for sell transactions
        // Clear deprecated sale fields
        salePrice: undefined,
        saleQuantity: undefined,
        // Set dates properly
        purchaseDate: transactionDate,
        saleDate: undefined, // Always clear sale date since we use purchaseDate for both types
      };

      onSubmit(assetData);
      handleFormClose();
    }
  });

  // Watch all form values to reactively update the UI
  const transactionType = watch('transactionType');
  const purchasePrice = watch('purchasePrice');
  const purchaseQuantity = watch('purchaseQuantity');
  const salePrice = watch('salePrice');
  const saleQuantity = watch('saleQuantity');

  // Initialize form values when editing an asset
  useEffect(() => {
    if (editingAsset) {
      // Find the asset definition to get the current price if needed
      const assetDefinition = assetDefinitions.find((def: AssetDefinition) => def.id === editingAsset.assetDefinitionId);
      
      // Prepare reset data with proper fallbacks
      const resetData = {
        assetDefinitionId: editingAsset.assetDefinitionId || '',
        name: editingAsset.name || '',
        type: editingAsset.type || assetDefinition?.type || '',
        value: editingAsset.value || 0,
        transactionType: editingAsset.transactionType || 'buy',
        purchaseDate: editingAsset.purchaseDate?.substring(0, 10) || new Date().toISOString().substring(0, 10),
        purchasePrice: editingAsset.purchasePrice || assetDefinition?.currentPrice || 0,
        purchaseQuantity: Math.abs(editingAsset.purchaseQuantity || 1), // Always positive for display
        saleDate: editingAsset.purchaseDate?.substring(0, 10) || new Date().toISOString().substring(0, 10), // Use purchaseDate for both
        // For sell transactions, display purchasePrice/purchaseQuantity as positive values in sale fields
        salePrice: editingAsset.transactionType === 'sell' ? (editingAsset.purchasePrice || 0) : 0,
        saleQuantity: editingAsset.transactionType === 'sell' ? Math.abs(editingAsset.purchaseQuantity || 1) : 1,
        transactionCosts: editingAsset.transactionCosts || 0,
        notes: editingAsset.notes || '',
      };
      
      // Reset form with editing asset data
      reset(resetData);
      
      // Set selected definition
      if (editingAsset.assetDefinitionId) {
        const definition = assetDefinitions.find((def: AssetDefinition) => def.id === editingAsset.assetDefinitionId);
        setSelectedDefinition(definition || null);
        
        // If we found the definition, also update the search query to make it visible
        if (definition) {
          setSearchQuery('');
        }
      }
    } else {
      // Reset form for new transaction
      const newTransactionData = {
        assetDefinitionId: '',
        name: '',
        type: '',
        value: 0,
        transactionType: 'buy' as const,
        purchaseDate: new Date().toISOString().substring(0, 10),
        purchasePrice: 0,
        purchaseQuantity: 1,
        saleDate: new Date().toISOString().substring(0, 10),
        salePrice: 0,
        saleQuantity: 1,
        transactionCosts: 0,
        notes: '',
      };
      
      reset(newTransactionData);
      setSelectedDefinition(null);
      setSearchQuery('');
    }
  }, [editingAsset, assetDefinitions, reset]);

  // Filter asset definitions based on search
  const filteredDefinitions = assetDefinitions.filter((def: AssetDefinition) => 
    def.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    def.ticker?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate total value based on transaction type
  const totalValue = transactionType === 'buy' 
    ? (purchasePrice || 0) * (purchaseQuantity || 1) + (watch('transactionCosts') || 0)
    : (salePrice || 0) * (saleQuantity || 1) - (watch('transactionCosts') || 0);

  // Update the value field whenever the calculation changes
  useEffect(() => {
    setValue('value', totalValue);
  }, [totalValue, setValue]);

  const handleDefinitionSelect = (definitionId: string) => {
    const definition = assetDefinitions.find((def: AssetDefinition) => def.id === definitionId);
    if (definition) {
      setSelectedDefinition(definition);
      setValue('assetDefinitionId', definitionId);
      setValue('name', definition.fullName + (definition.ticker ? ` (${definition.ticker})` : ''));
      setValue('type', definition.type); // Set the type field
    }
  };

  const handleFormClose = () => {
    reset({
      assetDefinitionId: '',
      name: '',
      transactionType: 'buy',
      purchaseDate: new Date().toISOString().substring(0, 10),
      purchasePrice: 0,
      purchaseQuantity: 1,
      saleDate: new Date().toISOString().substring(0, 10),
      salePrice: 0,
      saleQuantity: 1,
      transactionCosts: 0,
      notes: '',
    });
    setSelectedDefinition(null);
    setSearchQuery('');
    onClose();
  };

  if (!isOpen) return null;

  // Handle case when no asset definitions exist
  if (assetDefinitions.length === 0) {
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <StandardFormWrapper title={t('assets.addTransaction')} onSubmit={() => {}}>
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t('assets.noDefinitionsAvailable')}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
              {t('assets.createDefinitionsFirst')}
            </p>
          </div>
        </StandardFormWrapper>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <StandardFormWrapper
        title={editingAsset ? t('assets.editTransaction') : t('assets.addTransaction')}
        onSubmit={onFormSubmit}
        formRef={formRef}
      >
        <RequiredSection>
          <FormGrid columns={{ xs: '1fr', sm: '1fr' }}>
            {/* Asset Selection Section */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                {t('assets.selectAsset')} *
              </label>
              
              <AssetSearchBar 
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                placeholder={t('assets.searchAssets')}
              />

              <StandardFormField
                label=""
                name="assetDefinitionId"
                type="select"
                required
                error={errors.assetDefinitionId?.message}
                value={watch('assetDefinitionId')}
                onChange={(value: FormFieldValue) => handleDefinitionSelect(value as string)}
                options={[
                  { value: '', label: t('assets.selectAssetOption') },
                  ...filteredDefinitions.map((definition: AssetDefinition) => {
                    const tickerPart = definition.ticker ? ` (${definition.ticker})` : '';
                    const sectorPart = definition.sector ? ` - ${definition.sector}` : '';
                    return {
                      value: definition.id,
                      label: `${definition.fullName}${tickerPart}${sectorPart}`
                    };
                  })
                ]}
              />

              {selectedDefinition && (
                <SelectedAssetInfo 
                  selectedDefinition={selectedDefinition}
                />
              )}
            </div>

            <StandardFormField
              label={t('assets.transactionName')}
              name="name"
              required
              error={errors.name?.message}
              value={watch('name')}
              onChange={(value: FormFieldValue) => setValue('name', value as string)}
              placeholder={t('assets.transactionNamePlaceholder')}
            />

            {/* Transaction Type Selector */}
            <StandardFormField
              label={t('assets.form.transactionType')}
              name="transactionType"
              type="select"
              required
              error={errors.transactionType?.message}
              value={watch('transactionType')}
              onChange={(value: FormFieldValue) => setValue('transactionType', value as 'buy' | 'sell')}
              options={[
                { value: 'buy', label: t('assets.form.buyTransaction') },
                { value: 'sell', label: t('assets.form.sellTransaction') }
              ]}
            />

            {/* Buy Transaction Fields */}
            {transactionType === 'buy' && (
              <>
                <StandardFormField
                  label={t('assets.purchaseDate')}
                  name="purchaseDate"
                  type="date"
                  required
                  error={errors.purchaseDate?.message}
                  value={watch('purchaseDate')}
                  onChange={(value: FormFieldValue) => setValue('purchaseDate', value as string)}
                />

                <StandardFormField
                  label={t('assets.purchasePrice')}
                  name="purchasePrice"
                  type="number"
                  required
                  error={errors.purchasePrice?.message}
                  value={watch('purchasePrice')}
                  onChange={(value: FormFieldValue) => setValue('purchasePrice', value as number)}
                  step={0.01}
                  min={0}
                />

                <StandardFormField
                  label={t('assets.quantity')}
                  name="purchaseQuantity"
                  type="number"
                  required
                  error={errors.purchaseQuantity?.message}
                  value={watch('purchaseQuantity')}
                  onChange={(value: FormFieldValue) => setValue('purchaseQuantity', value as number)}
                  step={0.001}
                  min={0.001}
                />
              </>
            )}

            {/* Sell Transaction Fields */}
            {transactionType === 'sell' && (
              <>
                <StandardFormField
                  label={t('assets.purchaseDate')} // Use same label as purchase date
                  name="saleDate"
                  type="date"
                  required
                  error={errors.saleDate?.message}
                  value={watch('saleDate')}
                  onChange={(value: FormFieldValue) => setValue('saleDate', value as string)}
                />

                <StandardFormField
                  label={t('assets.purchasePrice')} // Use same label as purchase price
                  name="salePrice"
                  type="number"
                  required
                  error={errors.salePrice?.message}
                  value={watch('salePrice')}
                  onChange={(value: FormFieldValue) => setValue('salePrice', value as number)}
                  step={0.01}
                  min={0}
                />

                <StandardFormField
                  label={t('assets.quantity')} // Use same label as purchase quantity
                  name="saleQuantity"
                  type="number"
                  required
                  error={errors.saleQuantity?.message}
                  value={watch('saleQuantity')}
                  onChange={(value: FormFieldValue) => setValue('saleQuantity', value as number)}
                  step={0.001}
                  min={0.001}
                />
              </>
            )}
          </FormGrid>
        </RequiredSection>

        <OptionalSection title={t('common.additionalInformation')}>
          <FormGrid columns={{ xs: '1fr', sm: '1fr' }}>
            <StandardFormField
              label={t('assets.transactionCosts')}
              name="transactionCosts"
              type="number"
              error={errors.transactionCosts?.message}
              value={watch('transactionCosts')}
              onChange={(value: FormFieldValue) => setValue('transactionCosts', value as number)}
              step={0.01}
              min={0}
            />

            {/* Total Value Display */}
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {transactionType === 'buy' ? t('assets.totalInvestment') : t('assets.form.totalSaleValue')}:
                </span>
                <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {formatService.formatCurrency(totalValue)}
                </span>
              </div>
            </div>

            <StandardFormField
              label={t('assets.notes')}
              name="notes"
              type="textarea"
              error={errors.notes?.message}
              value={watch('notes')}
              onChange={(value: FormFieldValue) => setValue('notes', value as string)}
              placeholder={t('assets.notesPlaceholder')}
            />
          </FormGrid>
        </OptionalSection>
      </StandardFormWrapper>
    </Modal>
  );
};

export default AssetTransactionForm;
