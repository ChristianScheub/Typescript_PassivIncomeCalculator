import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../hooks/redux';
import { Asset, AssetDefinition } from '../../types';
import { Search } from 'lucide-react';
import { Modal } from '../common/Modal';
import { 
  StandardFormWrapper,
  RequiredSection,
  OptionalSection,
  FormGrid,
  StandardFormField
} from './StandardFormWrapper';

const assetTransactionSchema = z.object({
  assetDefinitionId: z.string().min(1, 'Please select an asset'),
  name: z.string().min(1, 'Name is required'),
  transactionType: z.enum(['buy', 'sell'] as const, {
    required_error: "Transaction type is required"
  }),
  // Buy fields
  purchaseDate: z.string().optional(),
  purchasePrice: z.number().min(0, 'Price must be positive').optional(),
  purchaseQuantity: z.number().min(0.001, 'Quantity must be positive').optional(),
  // Sale fields  
  saleDate: z.string().optional(),
  salePrice: z.number().min(0, 'Sale price must be positive').optional(),
  saleQuantity: z.number().min(0.001, 'Sale quantity must be positive').optional(),
  // Common fields
  transactionCosts: z.number().min(0, 'Transaction costs must be positive'),
  notes: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.transactionType === 'buy') {
    if (!data.purchaseDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Purchase date is required for buy transactions',
        path: ['purchaseDate']
      });
    }
    if (!data.purchasePrice || data.purchasePrice <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Purchase price is required for buy transactions',
        path: ['purchasePrice']
      });
    }
    if (!data.purchaseQuantity || data.purchaseQuantity <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Purchase quantity is required for buy transactions',
        path: ['purchaseQuantity']
      });
    }
  } else if (data.transactionType === 'sell') {
    if (!data.saleDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Sale date is required for sell transactions',
        path: ['saleDate']
      });
    }
    if (!data.salePrice || data.salePrice <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Sale price is required for sell transactions',
        path: ['salePrice']
      });
    }
    if (!data.saleQuantity || data.saleQuantity <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Sale quantity is required for sell transactions',
        path: ['saleQuantity']
      });
    }
  }
});

type AssetTransactionFormData = z.infer<typeof assetTransactionSchema>;

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
      const assetDefinition = assetDefinitions.find(def => def.id === editingAsset.assetDefinitionId);
      
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
        const definition = assetDefinitions.find(def => def.id === editingAsset.assetDefinitionId);
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
  const filteredDefinitions = assetDefinitions.filter(def => 
    def.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (def.ticker && def.ticker.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Calculate total value based on transaction type
  const totalValue = transactionType === 'buy' 
    ? (purchasePrice || 0) * (purchaseQuantity || 1) + (watch('transactionCosts') || 0)
    : (salePrice || 0) * (saleQuantity || 1) - (watch('transactionCosts') || 0);

  const handleDefinitionSelect = (definitionId: string) => {
    const definition = assetDefinitions.find(def => def.id === definitionId);
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
            {/* Asset Selection with custom rendering for search */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                {t('assets.selectAsset')} *
              </label>
              
              {/* Search Bar */}
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder={t('assets.searchAssets')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              {/* Asset Selection Dropdown */}
              <select
                {...register('assetDefinitionId')}
                onChange={(e) => handleDefinitionSelect(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              >
                <option value="">{t('assets.selectAssetOption')}</option>
                {filteredDefinitions.map(definition => (
                  <option key={definition.id} value={definition.id}>
                    {definition.fullName} {definition.ticker && `(${definition.ticker})`}
                    {definition.sector && ` - ${definition.sector}`}
                  </option>
                ))}
              </select>
              {errors.assetDefinitionId && (
                <p className="mt-1 text-sm text-red-600">{errors.assetDefinitionId.message}</p>
              )}

              {/* Selected Asset Info */}
              {selectedDefinition && (
                <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><strong>{t('assets.type')}:</strong> {t(`assets.types.${selectedDefinition.type}`)}</div>
                    <div><strong>{t('assets.sector')}:</strong> {selectedDefinition.sector || 'N/A'}</div>
                    <div><strong>{t('assets.country')}:</strong> {selectedDefinition.country || 'N/A'}</div>
                    <div><strong>{t('assets.currency')}:</strong> {selectedDefinition.currency || 'N/A'}</div>
                    {selectedDefinition.dividendInfo && (
                      <>
                        <div><strong>{t('assets.dividend')}:</strong> {selectedDefinition.dividendInfo.amount}</div>
                        <div><strong>{t('assets.frequency')}:</strong> {t(`paymentFrequency.${selectedDefinition.dividendInfo.frequency}`)}</div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            <StandardFormField
              label={t('assets.transactionName')}
              name="name"
              required
              error={errors.name?.message}
              value={watch('name')}
              onChange={(value: any) => setValue('name', value)}
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
                  onChange={(value: any) => setValue('purchaseDate', value)}
                />

                <StandardFormField
                  label={t('assets.purchasePrice')}
                  name="purchasePrice"
                  type="number"
                  required
                  error={errors.purchasePrice?.message}
                  value={watch('purchasePrice')}
                  onChange={(value: any) => setValue('purchasePrice', value)}
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
                  onChange={(value: any) => setValue('purchaseQuantity', value)}
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
                  onChange={(value: any) => setValue('saleDate', value)}
                />

                <StandardFormField
                  label={t('assets.form.salePrice')}
                  name="salePrice"
                  type="number"
                  required
                  error={errors.salePrice?.message}
                  value={watch('salePrice')}
                  onChange={(value: any) => setValue('salePrice', value)}
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
                  onChange={(value: any) => setValue('saleQuantity', value)}
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
              onChange={(value: any) => setValue('transactionCosts', value)}
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
                  {new Intl.NumberFormat('de-DE', { 
                    style: 'currency', 
                    currency: selectedDefinition?.currency || 'EUR' 
                  }).format(totalValue)}
                </span>
              </div>
            </div>

            <StandardFormField
              label={t('assets.notes')}
              name="notes"
              type="textarea"
              error={errors.notes?.message}
              value={watch('notes')}
              onChange={(value: any) => setValue('notes', value)}
              placeholder={t('assets.notesPlaceholder')}
            />
          </FormGrid>
        </OptionalSection>
      </StandardFormWrapper>
    </Modal>
  );
};

export default AssetTransactionForm;
