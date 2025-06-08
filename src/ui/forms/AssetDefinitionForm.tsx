import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { AssetDefinition, AssetType, DividendFrequency, PaymentFrequency } from '../../types';

const assetDefinitionSchema = z.object({
  fullName: z.string().min(1, 'Name is required'),
  ticker: z.string().optional(),
  type: z.enum(['stock', 'bond', 'real_estate', 'crypto', 'cash', 'other']),
  country: z.string().optional(),
  continent: z.string().optional(),
  sector: z.string().optional(),
  currency: z.string().optional(),
  exchange: z.string().optional(),
  isin: z.string().optional(),
  wkn: z.string().optional(),
  description: z.string().optional(),
  riskLevel: z.enum(['low', 'medium', 'high']).optional(),
  
  // Dividend fields
  hasDividend: z.boolean().optional(),
  dividendAmount: z.number().min(0).optional(),
  dividendFrequency: z.enum(['monthly', 'quarterly', 'annually', 'custom', 'none']).optional(),
  dividendMonths: z.array(z.number().min(1).max(12)).optional(),
  dividendCustomAmounts: z.record(z.string(), z.number()).optional(),
  
  // Rental fields  
  hasRental: z.boolean().optional(),
  rentalAmount: z.number().min(0).optional(),
  rentalFrequency: z.enum(['monthly', 'quarterly', 'annually', 'custom']).optional(),
  rentalMonths: z.array(z.number().min(1).max(12)).optional(),
  rentalCustomAmounts: z.record(z.string(), z.number()).optional(),
  
  // Bond fields
  hasBond: z.boolean().optional(),
  interestRate: z.number().min(0).max(100).optional(),
  maturityDate: z.string().optional(),
  nominalValue: z.number().min(0).optional(),
});

interface AssetDefinitionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<AssetDefinition, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editingDefinition?: AssetDefinition | null;
}

export const AssetDefinitionForm: React.FC<AssetDefinitionFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingDefinition
}) => {
  const { t } = useTranslation();
  const [selectedType, setSelectedType] = useState<AssetType>('stock');
  const [selectedDividendMonths, setSelectedDividendMonths] = useState<number[]>([]);
  const [selectedRentalMonths, setSelectedRentalMonths] = useState<number[]>([]);
  const [customDividendAmounts, setCustomDividendAmounts] = useState<Record<number, number>>({});
  const [customRentalAmounts, setCustomRentalAmounts] = useState<Record<number, number>>({});

  const { register, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm({
    resolver: zodResolver(assetDefinitionSchema),
    defaultValues: editingDefinition ? {
      fullName: editingDefinition.fullName,
      ticker: editingDefinition.ticker || '',
      type: editingDefinition.type,
      country: editingDefinition.country || '',
      continent: editingDefinition.continent || '',
      sector: editingDefinition.sector || '',
      currency: editingDefinition.currency || 'EUR',
      exchange: editingDefinition.exchange || '',
      isin: editingDefinition.isin || '',
      wkn: editingDefinition.wkn || '',
      description: editingDefinition.description || '',
      riskLevel: editingDefinition.riskLevel || 'medium',
      
      hasDividend: !!editingDefinition.dividendInfo,
      dividendAmount: editingDefinition.dividendInfo?.amount || 0,
      dividendFrequency: editingDefinition.dividendInfo?.frequency || 'quarterly',
      
      hasRental: !!editingDefinition.rentalInfo,
      rentalAmount: editingDefinition.rentalInfo?.baseRent || 0,
      rentalFrequency: editingDefinition.rentalInfo?.frequency || 'monthly',
      
      hasBond: !!editingDefinition.bondInfo,
      interestRate: editingDefinition.bondInfo?.interestRate || 0,
      maturityDate: editingDefinition.bondInfo?.maturityDate?.substring(0, 10) || '',
      nominalValue: editingDefinition.bondInfo?.nominalValue || 0,
      
      dividendMonths: editingDefinition.dividendInfo?.months || [],
      rentalMonths: editingDefinition.rentalInfo?.months || [],
      
    } : {
      type: 'stock',
      currency: 'EUR',
      riskLevel: 'medium' as const,
      dividendFrequency: 'quarterly' as DividendFrequency,
      rentalFrequency: 'monthly' as PaymentFrequency,
      dividendMonths: [],
      rentalMonths: [],
    }
  });

  const watchedType = watch('type');
  const hasDividend = watch('hasDividend');
  const hasRental = watch('hasRental');
  const hasBond = watch('hasBond');
  const watchedDividendFrequency = watch('dividendFrequency');
  const watchedRentalFrequency = watch('rentalFrequency');

  React.useEffect(() => {
    setSelectedType(watchedType as AssetType);
  }, [watchedType]);

  // Initialize months from editing definition and reset form when editingDefinition changes
  React.useEffect(() => {
    if (editingDefinition) {
      
      // Set months state
      if (editingDefinition.dividendInfo?.months) {
        setSelectedDividendMonths(editingDefinition.dividendInfo.months);
      } else {
        setSelectedDividendMonths([]);
      }
      
      if (editingDefinition.dividendInfo?.customAmounts) {
        setCustomDividendAmounts(editingDefinition.dividendInfo.customAmounts);
      } else {
        setCustomDividendAmounts({});
      }
      
      if (editingDefinition.rentalInfo?.months) {
        setSelectedRentalMonths(editingDefinition.rentalInfo.months);
      } else {
        setSelectedRentalMonths([]);
      }
      
      if (editingDefinition.rentalInfo?.customAmounts) {
        setCustomRentalAmounts(editingDefinition.rentalInfo.customAmounts);
      } else {
        setCustomRentalAmounts({});
      }

      // Reset form with all editing definition data
      const resetData = {
        fullName: editingDefinition.fullName,
        ticker: editingDefinition.ticker || '',
        type: editingDefinition.type,
        country: editingDefinition.country || '',
        continent: editingDefinition.continent || '',
        sector: editingDefinition.sector || '',
        currency: editingDefinition.currency || 'EUR',
        exchange: editingDefinition.exchange || '',
        isin: editingDefinition.isin || '',
        wkn: editingDefinition.wkn || '',
        description: editingDefinition.description || '',
        riskLevel: editingDefinition.riskLevel || 'medium',
        
        hasDividend: !!editingDefinition.dividendInfo,
        dividendAmount: editingDefinition.dividendInfo?.amount || 0,
        dividendFrequency: editingDefinition.dividendInfo?.frequency || 'quarterly',
        
        hasRental: !!editingDefinition.rentalInfo,
        rentalAmount: editingDefinition.rentalInfo?.baseRent || 0,
        rentalFrequency: editingDefinition.rentalInfo?.frequency || 'monthly',
        
        hasBond: !!editingDefinition.bondInfo,
        interestRate: editingDefinition.bondInfo?.interestRate || 0,
        maturityDate: editingDefinition.bondInfo?.maturityDate?.substring(0, 10) || '',
        nominalValue: editingDefinition.bondInfo?.nominalValue || 0,
        
        dividendMonths: editingDefinition.dividendInfo?.months || [],
        rentalMonths: editingDefinition.rentalInfo?.months || [],
      };

      reset(resetData);
    } else {
      // Reset to default values when not editing
      setSelectedDividendMonths([]);
      setSelectedRentalMonths([]);
      setCustomDividendAmounts({});
      setCustomRentalAmounts({});
      
      reset({
        type: 'stock',
        currency: 'EUR',
        riskLevel: 'medium',
        dividendFrequency: 'quarterly',
        rentalFrequency: 'monthly',
        dividendMonths: [],
        rentalMonths: [],
      });
    }
  }, [editingDefinition, reset]);

  const handleMonthToggle = (month: number, type: 'dividend' | 'rental') => {
    if (type === 'dividend') {
      const newMonths = selectedDividendMonths.includes(month)
        ? selectedDividendMonths.filter(m => m !== month)
        : [...selectedDividendMonths, month].sort();
      setSelectedDividendMonths(newMonths);
      setValue('dividendMonths', newMonths);
    } else {
      const newMonths = selectedRentalMonths.includes(month)
        ? selectedRentalMonths.filter(m => m !== month)
        : [...selectedRentalMonths, month].sort();
      setSelectedRentalMonths(newMonths);
      setValue('rentalMonths', newMonths);
    }
  };

  const handleCustomAmountChange = (month: number, amount: number, type: 'dividend' | 'rental') => {
    if (type === 'dividend') {
      const newAmounts = { ...customDividendAmounts, [month]: amount };
      setCustomDividendAmounts(newAmounts);
      // Note: We handle custom amounts in state, not in form directly
    } else {
      const newAmounts = { ...customRentalAmounts, [month]: amount };
      setCustomRentalAmounts(newAmounts);
      // Note: We handle custom amounts in state, not in form directly
    }
  };

  const getMonthName = (month: number) => {
    return new Date(2024, month - 1, 1).toLocaleDateString('de-DE', { month: 'short' });
  };

  const handleFormSubmit = (data: any) => {
    const definitionData: Omit<AssetDefinition, 'id' | 'createdAt' | 'updatedAt'> = {
      name: data.fullName, // Use fullName as name
      fullName: data.fullName,
      ticker: data.ticker || undefined,
      type: data.type,
      country: data.country || undefined,
      continent: data.continent || undefined,
      sector: data.sector || undefined,
      currency: data.currency || undefined,
      exchange: data.exchange || undefined,
      isin: data.isin || undefined,
      wkn: data.wkn || undefined,
      description: data.description || undefined,
      riskLevel: data.riskLevel || undefined,
      isActive: true,
    };

    // Add dividend info if enabled
    if (data.hasDividend && data.dividendAmount > 0) {
      definitionData.dividendInfo = {
        frequency: data.dividendFrequency,
        amount: data.dividendAmount,
        currency: data.currency,
      };

      // Add months for specific frequencies
      if (data.dividendFrequency === 'quarterly' || data.dividendFrequency === 'annually') {
        definitionData.dividendInfo.months = selectedDividendMonths;
      }

      // Add custom amounts for custom frequency
      if (data.dividendFrequency === 'custom' && Object.keys(customDividendAmounts).length > 0) {
        definitionData.dividendInfo.customAmounts = customDividendAmounts;
        definitionData.dividendInfo.months = Object.keys(customDividendAmounts).map(Number);
      }
    }

    // Add rental info if enabled
    if (data.hasRental && data.rentalAmount > 0) {
      definitionData.rentalInfo = {
        baseRent: data.rentalAmount,
        frequency: data.rentalFrequency,
        currency: data.currency,
      };

      // Add months for specific frequencies
      if (data.rentalFrequency === 'quarterly' || data.rentalFrequency === 'annually') {
        definitionData.rentalInfo.months = selectedRentalMonths;
      }

      // Add custom amounts for custom frequency
      if (data.rentalFrequency === 'custom' && Object.keys(customRentalAmounts).length > 0) {
        definitionData.rentalInfo.customAmounts = customRentalAmounts;
        definitionData.rentalInfo.months = Object.keys(customRentalAmounts).map(Number);
      }
    }

    // Add bond info if enabled
    if (data.hasBond && data.interestRate > 0) {
      definitionData.bondInfo = {
        interestRate: data.interestRate,
        maturityDate: data.maturityDate || undefined,
        nominalValue: data.nominalValue || undefined,
        currency: data.currency,
      };
    }

    onSubmit(definitionData);
    reset();
    setSelectedDividendMonths([]);
    setSelectedRentalMonths([]);
    setCustomDividendAmounts({});
    setCustomRentalAmounts({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {editingDefinition ? t('assetDefinitions.editDefinition') : t('assetDefinitions.addDefinition')}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  {t('assets.fullName')} *
                </label>
                <input
                  {...register('fullName')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder={t('assets.fullNamePlaceholder')}
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  {t('assets.ticker')}
                </label>
                <input
                  {...register('ticker')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder={t('assets.tickerPlaceholder')}
                />
              </div>
            </div>

            {/* Type and Risk */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  {t('assets.type')} *
                </label>
                <select
                  {...register('type')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="stock">{t('assets.types.stock')}</option>
                  <option value="bond">{t('assets.types.bond')}</option>
                  <option value="real_estate">{t('assets.types.real_estate')}</option>
                  <option value="crypto">{t('assets.types.crypto')}</option>
                  <option value="cash">{t('assets.types.cash')}</option>
                  <option value="other">{t('assets.types.other')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  {t('assets.riskLevel')}
                </label>
                <select
                  {...register('riskLevel')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="low">{t('assets.riskLevels.low')}</option>
                  <option value="medium">{t('assets.riskLevels.medium')}</option>
                  <option value="high">{t('assets.riskLevels.high')}</option>
                </select>
              </div>
            </div>

            {/* Location and Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  {t('assets.country')}
                </label>
                <input
                  {...register('country')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder={t('assets.countryPlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  {t('assets.sector')}
                </label>
                <input
                  {...register('sector')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder={t('assets.sectorPlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  {t('assets.currency')}
                </label>
                <input
                  {...register('currency')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="EUR"
                />
              </div>
            </div>

            {/* Dividend Information */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="flex items-center mb-4">
                <input
                  {...register('hasDividend')}
                  type="checkbox"
                  className="mr-2"
                />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('assets.hasDividend')}
                </label>
              </div>

              {hasDividend && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        {t('assets.dividendAmount')}
                      </label>
                      <input
                        {...register('dividendAmount', { valueAsNumber: true })}
                        type="number"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        {t('assets.dividendFrequency')}
                      </label>
                      <select
                        {...register('dividendFrequency')}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="monthly">{t('paymentFrequency.monthly')}</option>
                        <option value="quarterly">{t('paymentFrequency.quarterly')}</option>
                        <option value="annually">{t('paymentFrequency.annually')}</option>
                        <option value="custom">{t('paymentFrequency.custom')}</option>
                      </select>
                    </div>
                  </div>

                  {/* Month Selection for Quarterly/Annually */}
                  {(watchedDividendFrequency === 'quarterly' || watchedDividendFrequency === 'annually') && (
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        {watchedDividendFrequency === 'quarterly' 
                          ? t('assets.selectQuarterlyMonths') 
                          : t('assets.selectAnnualMonth')
                        }
                      </label>
                      <div className="grid grid-cols-6 gap-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(month => (
                          <button
                            key={month}
                            type="button"
                            onClick={() => handleMonthToggle(month, 'dividend')}
                            className={`px-3 py-2 text-sm rounded border ${
                              selectedDividendMonths.includes(month)
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                            }`}
                          >
                            {getMonthName(month)}
                          </button>
                        ))}
                      </div>
                      {watchedDividendFrequency === 'quarterly' && (
                        <p className="text-xs text-gray-500 mt-1">
                          {t('assets.selectQuarterlyHint')}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Custom Amount Selection */}
                  {watchedDividendFrequency === 'custom' && (
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        {t('assets.customDividendAmounts')}
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(month => (
                          <div key={month} className="flex items-center space-x-2">
                            <span className="text-sm min-w-[40px] text-gray-600 dark:text-gray-400">
                              {getMonthName(month)}:
                            </span>
                            <input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={customDividendAmounts[month] || ''}
                              onChange={(e) => handleCustomAmountChange(
                                month, 
                                parseFloat(e.target.value) || 0, 
                                'dividend'
                              )}
                              className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {t('assets.customAmountsHint')}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Rental Information */}
            {selectedType === 'real_estate' && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="flex items-center mb-4">
                  <input
                    {...register('hasRental')}
                    type="checkbox"
                    className="mr-2"
                  />
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('assets.hasRental')}
                  </label>
                </div>

                {hasRental && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                          {t('assets.rentalAmount')}
                        </label>
                        <input
                          {...register('rentalAmount', { valueAsNumber: true })}
                          type="number"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                          {t('assets.rentalFrequency')}
                        </label>
                        <select
                          {...register('rentalFrequency')}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                          <option value="monthly">{t('paymentFrequency.monthly')}</option>
                          <option value="quarterly">{t('paymentFrequency.quarterly')}</option>
                          <option value="annually">{t('paymentFrequency.annually')}</option>
                          <option value="custom">{t('paymentFrequency.custom')}</option>
                        </select>
                      </div>
                    </div>

                    {/* Month Selection for Rental */}
                    {(watchedRentalFrequency === 'quarterly' || watchedRentalFrequency === 'annually') && (
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                          {watchedRentalFrequency === 'quarterly' 
                            ? t('assets.selectQuarterlyMonths') 
                            : t('assets.selectAnnualMonth')
                          }
                        </label>
                        <div className="grid grid-cols-6 gap-2">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(month => (
                            <button
                              key={month}
                              type="button"
                              onClick={() => handleMonthToggle(month, 'rental')}
                              className={`px-3 py-2 text-sm rounded border ${
                                selectedRentalMonths.includes(month)
                                  ? 'bg-green-600 text-white border-green-600'
                                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                              }`}
                            >
                              {getMonthName(month)}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Custom Rental Amounts */}
                    {watchedRentalFrequency === 'custom' && (
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                          {t('assets.customRentalAmounts')}
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(month => (
                            <div key={month} className="flex items-center space-x-2">
                              <span className="text-sm min-w-[40px] text-gray-600 dark:text-gray-400">
                                {getMonthName(month)}:
                              </span>
                              <input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={customRentalAmounts[month] || ''}
                                onChange={(e) => handleCustomAmountChange(
                                  month, 
                                  parseFloat(e.target.value) || 0, 
                                  'rental'
                                )}
                                className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Bond Information */}
            {selectedType === 'bond' && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="flex items-center mb-4">
                  <input
                    {...register('hasBond')}
                    type="checkbox"
                    className="mr-2"
                  />
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('assets.hasBondInfo')}
                  </label>
                </div>

                {hasBond && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        {t('assets.interestRate')} (%)
                      </label>
                      <input
                        {...register('interestRate', { valueAsNumber: true })}
                        type="number"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        {t('assets.maturityDate')}
                      </label>
                      <input
                        {...register('maturityDate')}
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        {t('assets.nominalValue')}
                      </label>
                      <input
                        {...register('nominalValue', { valueAsNumber: true })}
                        type="number"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                {t('assets.description')}
              </label>
              <textarea
                {...register('description')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                rows={3}
                placeholder={t('assets.descriptionPlaceholder')}
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
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {editingDefinition ? t('common.update') : t('common.add')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
