import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../hooks/redux';
import { Asset } from '../../../types/domains/assets/entities';
import { AssetDefinition } from '../../../types/domains/assets/entities';
import { AssetFormData } from '../../../types/domains/forms/form-data';
import { createAssetTransactionSchema } from '../../../utils/validationSchemas';
import { Modal } from '../../../ui/common/Modal';
import { 
  StandardFormWrapper,
  RequiredSection,
  OptionalSection,
  FormGrid,
  StandardFormField
} from '../../../ui/forms/StandardFormWrapper';
import { AssetSearchBar, AssetSelectionDropdown, SelectedAssetInfo } from '../../../ui/components';
import formatService from '../../../service/formatService';

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

  const { register, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm<AssetTransactionFormData>({
    resolver: zodResolver(assetTransactionSchema),
    defaultValues: {
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
        transactionType: editingAsset.transactionType || 'buy',
        purchaseDate: editingAsset.purchaseDate?.substring(0, 10) || new Date().toISOString().substring(0, 10),
        purchasePrice: editingAsset.purchasePrice || assetDefinition?.currentPrice || 0,
        purchaseQuantity: editingAsset.purchaseQuantity || 1,
        saleDate: editingAsset.saleDate?.substring(0, 10) || new Date().toISOString().substring(0, 10),
        salePrice: editingAsset.salePrice || 0,
        saleQuantity: editingAsset.saleQuantity || 1,
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

  const handleDefinitionSelect = (definitionId: string) => {
    const definition = assetDefinitions.find((def: AssetDefinition) => def.id === definitionId);
    if (definition) {
      setSelectedDefinition(definition);
      setValue('assetDefinitionId', definitionId);
      setValue('name', definition.fullName + (definition.ticker ? ` (${definition.ticker})` : ''));
    }
  };

  const handleFormSubmit = (data: AssetTransactionFormData) => {
    if (!selectedDefinition) return;

    const assetData = {
      ...data,
      // Store only the reference ID, not the full object
      assetDefinitionId: selectedDefinition.id,
      
      // Asset transaction specific fields
      type: selectedDefinition.type,
      value: totalValue,
      
      // Ensure required fields are set with fallbacks
      purchasePrice: data.transactionType === 'buy' ? (data.purchasePrice || 0) : 0,
      purchaseQuantity: data.transactionType === 'buy' ? (data.purchaseQuantity || 0) : 0,
      salePrice: data.transactionType === 'sell' ? (data.salePrice || 0) : undefined,
      saleQuantity: data.transactionType === 'sell' ? (data.saleQuantity || 0) : undefined,
      
      // Set dates properly
      purchaseDate: data.transactionType === 'buy' && data.purchaseDate 
        ? new Date(data.purchaseDate).toISOString()
        : new Date().toISOString(),
      saleDate: data.transactionType === 'sell' && data.saleDate 
        ? new Date(data.saleDate).toISOString()
        : undefined,
    };

    onSubmit(assetData);
    handleFormClose();
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
        onSubmit={handleSubmit(handleFormSubmit)}
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

              <AssetSelectionDropdown
                register={register}
                handleDefinitionSelect={handleDefinitionSelect}
                filteredDefinitions={filteredDefinitions}
                errors={errors}
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
              onChange={(value: string | number | boolean) => setValue('name', value as string)}
              placeholder={t('assets.transactionNamePlaceholder')}
            />

            {/* Transaction Type Selector */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                {t('assets.form.transactionType')} *
              </label>
              <select
                {...register('transactionType')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              >
                <option value="buy">{t('assets.form.buyTransaction')}</option>
                <option value="sell">{t('assets.form.sellTransaction')}</option>
              </select>
              {errors.transactionType && (
                <p className="mt-1 text-sm text-red-600">{errors.transactionType.message}</p>
              )}
            </div>

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
                  onChange={(value: string | number | boolean) => setValue('purchaseDate', value as string)}
                />

                <StandardFormField
                  label={t('assets.purchasePrice')}
                  name="purchasePrice"
                  type="number"
                  required
                  error={errors.purchasePrice?.message}
                  value={watch('purchasePrice')}
                  onChange={(value: string | number | boolean) => setValue('purchasePrice', value as number)}
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
                  onChange={(value: string | number | boolean) => setValue('purchaseQuantity', value as number)}
                  step={0.001}
                  min={0.001}
                />
              </>
            )}

            {/* Sell Transaction Fields */}
            {transactionType === 'sell' && (
              <>
                <StandardFormField
                  label={t('assets.form.saleDate')}
                  name="saleDate"
                  type="date"
                  required
                  error={errors.saleDate?.message}
                  value={watch('saleDate')}
                  onChange={(value: string | number | boolean) => setValue('saleDate', value as string)}
                />

                <StandardFormField
                  label={t('assets.form.salePrice')}
                  name="salePrice"
                  type="number"
                  required
                  error={errors.salePrice?.message}
                  value={watch('salePrice')}
                  onChange={(value: string | number | boolean) => setValue('salePrice', value as number)}
                  step={0.01}
                  min={0}
                />

                <StandardFormField
                  label={t('assets.form.saleQuantity')}
                  name="saleQuantity"
                  type="number"
                  required
                  error={errors.saleQuantity?.message}
                  value={watch('saleQuantity')}
                  onChange={(value: string | number | boolean) => setValue('saleQuantity', value as number)}
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
              onChange={(value: string | number | boolean) => setValue('transactionCosts', value as number)}
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
              onChange={(value: string | number | boolean) => setValue('notes', value as string)}
              placeholder={t('assets.notesPlaceholder')}
            />
          </FormGrid>
        </OptionalSection>
      </StandardFormWrapper>
    </Modal>
  );
};

export default AssetTransactionForm;
