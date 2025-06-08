import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../hooks/redux';
import { Asset, AssetDefinition } from '../../types';
import { Search } from 'lucide-react';

const assetTransactionSchema = z.object({
  assetDefinitionId: z.string().min(1, 'Please select an asset'),
  name: z.string().min(1, 'Name is required'),
  purchaseDate: z.string().min(1, 'Purchase date is required'),
  purchasePrice: z.number().min(0, 'Price must be positive'),
  purchaseQuantity: z.number().min(0.001, 'Quantity must be positive'),
  transactionCosts: z.number().min(0, 'Transaction costs must be positive'),
  notes: z.string().optional(),
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
      purchaseDate: new Date().toISOString().substring(0, 10),
      purchasePrice: 0,
      purchaseQuantity: 1,
      transactionCosts: 0,
      notes: '',
    }
  });

  // Watch all form values to reactively update the UI
  const purchasePrice = watch('purchasePrice');
  const purchaseQuantity = watch('purchaseQuantity');

  // Initialize form values when editing an asset
  useEffect(() => {
    if (editingAsset) {
      
      // Prepare reset data with proper fallbacks
      const resetData = {
        assetDefinitionId: editingAsset.assetDefinitionId || '',
        name: editingAsset.name || '',
        purchaseDate: editingAsset.purchaseDate?.substring(0, 10) || new Date().toISOString().substring(0, 10),
        purchasePrice: editingAsset.purchasePrice || editingAsset.currentPrice || 0,
        purchaseQuantity: editingAsset.purchaseQuantity || editingAsset.currentQuantity || 1,
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
        purchaseDate: new Date().toISOString().substring(0, 10),
        purchasePrice: 0,
        purchaseQuantity: 1,
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

  // Calculate total value
  const totalValue = (purchasePrice || 0) * (purchaseQuantity || 1) + (watch('transactionCosts') || 0);

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
      currentValue: totalValue,
      currentPrice: data.purchasePrice,
      currentQuantity: data.purchaseQuantity || 1,
      
      // Note: Dividend/rental income is now calculated centrally from AssetDefinitions
      // at the portfolio level, not stored in individual transactions
      
      // Copy metadata for easier access (denormalization for performance)
      country: selectedDefinition.country,
      continent: selectedDefinition.continent,
      sector: selectedDefinition.sector,
      ticker: selectedDefinition.ticker,
      symbol: selectedDefinition.ticker, // Legacy compatibility
      acquisitionCost: totalValue,
      
      // Set purchase date properly
      purchaseDate: new Date(data.purchaseDate).toISOString(),
    };

    onSubmit(assetData);
    handleFormClose();
  };

  const handleFormClose = () => {
    reset({
      assetDefinitionId: '',
      name: '',
      purchaseDate: new Date().toISOString().substring(0, 10),
      purchasePrice: 0,
      purchaseQuantity: undefined,
      transactionCosts: 0,
      notes: '',
    });
    setSelectedDefinition(null);
    setSearchQuery('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {editingAsset ? t('assets.editTransaction') : t('assets.addTransaction')}
            </h2>
            <button
              onClick={handleFormClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>

          {assetDefinitions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t('assets.noDefinitionsAvailable')}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                {t('assets.createDefinitionsFirst')}
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {t('common.close')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
              {/* Asset Selection */}
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

              {/* Transaction Name */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  {t('assets.transactionName')} *
                </label>
                <input
                  {...register('name')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder={t('assets.transactionNamePlaceholder')}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              {/* Purchase Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    {t('assets.purchaseDate')} *
                  </label>
                  <input
                    {...register('purchaseDate')}
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                  {errors.purchaseDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.purchaseDate.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    {t('assets.purchasePrice')} *
                  </label>
                  <input
                    {...register('purchasePrice', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                  {errors.purchasePrice && (
                    <p className="mt-1 text-sm text-red-600">{errors.purchasePrice.message}</p>
                  )}
                </div>
              </div>

              {/* Quantity and Transaction Costs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    {t('assets.quantity')}
                  </label>
                  <input
                    {...register('purchaseQuantity', { valueAsNumber: true })}
                    type="number"
                    step="0.001"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                  {errors.purchaseQuantity && (
                    <p className="mt-1 text-sm text-red-600">{errors.purchaseQuantity.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    {t('assets.transactionCosts')}
                  </label>
                  <input
                    {...register('transactionCosts', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                  {errors.transactionCosts && (
                    <p className="mt-1 text-sm text-red-600">{errors.transactionCosts.message}</p>
                  )}
                </div>
              </div>

              {/* Total Value Display */}
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{t('assets.totalInvestment')}:</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {new Intl.NumberFormat('de-DE', { 
                      style: 'currency', 
                      currency: selectedDefinition?.currency || 'EUR' 
                    }).format(totalValue)}
                  </span>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  {t('assets.notes')}
                </label>
                <textarea
                  {...register('notes')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  rows={3}
                  placeholder={t('assets.notesPlaceholder')}
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={!selectedDefinition}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingAsset ? t('common.update') : t('common.add')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
