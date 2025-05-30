import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Asset, AssetType, DividendFrequency } from '../types';
import { Button } from '../ui/Button';
import Logger from '../service/Logger/logger';

// Create a conditional schema that validates fields based on asset type
const createAssetSchema = () => z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['stock', 'bond', 'real_estate', 'crypto', 'cash', 'other']),
  value: z.number().min(0, 'Value must be positive'),
  notes: z.string().optional(),
  country: z.string().optional(),
  continent: z.string().optional(),
  sector: z.string().optional(),
  
  // Stock specific - make them truly optional by allowing undefined
  ticker: z.string().optional(),
  quantity: z.union([z.number(), z.undefined(), z.nan()]).optional().transform(val => 
    val === undefined || isNaN(val as number) ? undefined : val
  ),
  purchasePrice: z.union([z.number(), z.undefined(), z.nan()]).optional().transform(val => 
    val === undefined || isNaN(val as number) ? undefined : val
  ),
  currentPrice: z.union([z.number(), z.undefined(), z.nan()]).optional().transform(val => 
    val === undefined || isNaN(val as number) ? undefined : val
  ),
  dividendFrequency: z.enum(['monthly', 'quarterly', 'annually', 'custom', 'none']).optional(),
  dividendAmount: z.union([z.number(), z.undefined(), z.nan()]).optional().transform(val => 
    val === undefined || isNaN(val as number) ? undefined : val
  ),
  dividendMonths: z.array(z.number().min(1).max(12)).optional(),
  customDividendAmounts: z.record(z.number()).optional(),
  
  // For quarterly/annually - specify payment months
  dividendPaymentMonths: z.array(z.union([z.number(), z.string()]).transform(val => 
    typeof val === 'string' ? parseInt(val, 10) : val
  )).optional(),
  
  // Real Estate specific
  propertyValue: z.union([z.number(), z.undefined(), z.nan()]).optional().transform(val => 
    val === undefined || isNaN(val as number) ? undefined : val
  ),
  rentalAmount: z.union([z.number().min(0), z.undefined(), z.nan()]).optional().transform(val => 
    val === undefined || isNaN(val as number) ? undefined : val
  ),
  
  // Bond specific
  interestRate: z.union([z.number(), z.undefined(), z.nan()]).optional().transform(val => 
    val === undefined || isNaN(val as number) ? undefined : val
  ),
  maturityDate: z.string().optional(),
  nominalValue: z.union([z.number(), z.undefined(), z.nan()]).optional().transform(val => 
    val === undefined || isNaN(val as number) ? undefined : val
  ),
  
  // Crypto specific
  symbol: z.string().optional(),
  acquisitionCost: z.union([z.number(), z.undefined(), z.nan()]).optional().transform(val => 
    val === undefined || isNaN(val as number) ? undefined : val
  ),
});

const assetSchema = createAssetSchema();

type AssetFormData = z.infer<typeof assetSchema>;

interface AssetFormProps {
  initialData?: Asset;
  onSubmit: (data: AssetFormData) => void;
  onCancel: () => void;
}

export const AssetForm: React.FC<AssetFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const { t } = useTranslation();
  
  // Create dynamic options arrays with translations
  const assetTypeOptions = [
    { value: 'stock', label: t('assets.types.stock') },
    { value: 'bond', label: t('assets.types.bond') },
    { value: 'real_estate', label: t('assets.types.real_estate') },
    { value: 'crypto', label: t('assets.types.crypto') },
    { value: 'cash', label: t('assets.types.cash') },
    { value: 'other', label: t('assets.types.other') }
  ];

  const dividendFrequencyOptions = [
    { value: 'none', label: t('frequency.none') },
    { value: 'monthly', label: t('frequency.monthly') },
    { value: 'quarterly', label: t('frequency.quarterly') },
    { value: 'annually', label: t('frequency.annually') },
    { value: 'custom', label: t('frequency.custom') }
  ];

  // Transform Asset data to form data format
  const getDefaultValues = (): Partial<AssetFormData> => {
    if (!initialData) {
      return {
        type: 'stock' as AssetType,
        dividendFrequency: 'none' as DividendFrequency,
      };
    }

    // Transform dividendInfo back to form fields
    const formData: any = { ...initialData };
    
    if (initialData.dividendInfo) {
      formData.dividendFrequency = initialData.dividendInfo.frequency;
      formData.dividendAmount = initialData.dividendInfo.amount;
      
      // Handle custom dividend months
      if (initialData.dividendInfo.months) {
        formData.dividendMonths = initialData.dividendInfo.months;
      }
      
      // Handle quarterly/annually payment months
      if (initialData.dividendInfo.paymentMonths) {
        formData.dividendPaymentMonths = initialData.dividendInfo.paymentMonths;
      }
      
      formData.customDividendAmounts = initialData.dividendInfo.customAmounts;
      // Remove the dividendInfo object since we've extracted its fields
      delete formData.dividendInfo;
    } else {
      formData.dividendFrequency = 'none';
    }

    // Transform rentalIncome back to form field
    if (initialData.rentalIncome) {
      formData.rentalAmount = initialData.rentalIncome.amount;
      // Remove the rentalIncome object since we've extracted its field
      delete formData.rentalIncome;
    }

    Logger.info(`Form default values: ${JSON.stringify(formData)}`);
    return formData;
  };

  const { register, handleSubmit, watch, formState: { errors, isSubmitting }, setValue, getValues } = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: getDefaultValues()
  });

  const assetType = watch('type');
  const dividendFrequency = watch('dividendFrequency');
  const watchedDividendPaymentMonths = watch('dividendPaymentMonths');
  const watchedDividendMonths = watch('dividendMonths');

  // Add extensive logging for debugging
  React.useEffect(() => {
    Logger.info(`AssetForm mounted - initialData: ${JSON.stringify(initialData)}`);
    Logger.info(`Form errors: ${JSON.stringify(errors)}`);
    Logger.info(`Asset type: ${assetType}`);
    Logger.info(`Dividend frequency: ${dividendFrequency}`);
    Logger.info(`Watched payment months: ${JSON.stringify(watchedDividendPaymentMonths)}`);
    Logger.info(`Watched dividend months: ${JSON.stringify(watchedDividendMonths)}`);
    Logger.info(`Is submitting: ${isSubmitting}`);
  }, [initialData, errors, assetType, isSubmitting, dividendFrequency, watchedDividendPaymentMonths, watchedDividendMonths]);

  // Set initial values when component mounts or initialData changes
  React.useEffect(() => {
    if (initialData?.dividendInfo) {
      if (initialData.dividendInfo.paymentMonths) {
        Logger.info(`Setting dividend payment months: ${JSON.stringify(initialData.dividendInfo.paymentMonths)}`);
        setValue('dividendPaymentMonths', initialData.dividendInfo.paymentMonths);
      }
      if (initialData.dividendInfo.months) {
        Logger.info(`Setting dividend months: ${JSON.stringify(initialData.dividendInfo.months)}`);
        setValue('dividendMonths', initialData.dividendInfo.months);
      }
    }
  }, [initialData, setValue]);

  // Clear irrelevant fields when asset type changes
  React.useEffect(() => {
    Logger.info(`Asset type changed to: ${assetType}`);
    
    // Clear stock-specific fields when not stock
    if (assetType !== 'stock') {
      setValue('ticker', undefined);
      setValue('quantity', undefined);
      setValue('purchasePrice', undefined);
      setValue('currentPrice', undefined);
      setValue('dividendFrequency', 'none');
      setValue('dividendAmount', undefined);
      setValue('dividendMonths', undefined);
    }
    
    // Clear real estate fields when not real estate
    if (assetType !== 'real_estate') {
      setValue('rentalAmount', undefined);
    }
    
    // Clear bond fields when not bond
    if (assetType !== 'bond') {
      setValue('interestRate', undefined);
      setValue('maturityDate', undefined);
      setValue('nominalValue', undefined);
    }
    
    // Clear crypto fields when not crypto
    if (assetType !== 'crypto') {
      setValue('symbol', undefined);
      setValue('acquisitionCost', undefined);
    }
  }, [assetType, setValue]);

  const onFormSubmit = (data: AssetFormData) => {
    Logger.info(`=== AssetForm onFormSubmit CALLED ===`);
    Logger.info(`Asset type: ${data.type}`);
    Logger.info(`Form data: ${JSON.stringify(data)}`);
    
    try {
      // Transform form data to Asset format
      let transformedData: any = {
        ...data,
        id: initialData?.id || Date.now().toString(),
        createdAt: initialData?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Handle stock dividend info
      if (data.type === 'stock' && data.dividendFrequency !== 'none' && data.dividendAmount) {
        transformedData.dividendInfo = {
          frequency: data.dividendFrequency,
          amount: data.dividendAmount,
          months: data.dividendMonths,
          paymentMonths: data.dividendPaymentMonths,
          customAmounts: data.customDividendAmounts
        };
      }

      // Handle real estate rental income
      if (data.type === 'real_estate' && data.rentalAmount) {
        Logger.info(`Adding rental income for ${data.name}: ${data.rentalAmount}`);
        transformedData.rentalIncome = {
          amount: data.rentalAmount
        };
      } else if (data.type === 'real_estate') {
        Logger.info(`Real estate asset ${data.name} has no rental amount`);
      }

      // Clean up form-specific fields
      delete transformedData.dividendFrequency;
      delete transformedData.dividendAmount;
      delete transformedData.dividendMonths;
      delete transformedData.dividendPaymentMonths;
      delete transformedData.customDividendAmounts;
      delete transformedData.rentalAmount;
      
      Logger.info(`Calling onSubmit with transformed data: ${JSON.stringify(transformedData)}`);
      onSubmit(transformedData);
    } catch (error) {
      Logger.error(`Form submission error: ${JSON.stringify(error)}`);
    }
  };

  const onFormError = (errors: any) => {
    Logger.error(`=== AssetForm VALIDATION ERRORS ===`);
    Logger.error(`Validation errors: ${JSON.stringify(errors)}`);
    console.error('Form validation errors:', errors);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    Logger.info(`=== Form submit event triggered ===`);
    Logger.info(`Event type: ${e.type}`);
    Logger.info(`Current asset type: ${assetType}`);
    
    // Call the react-hook-form handleSubmit
    return handleSubmit(onFormSubmit, onFormError)(e);
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    Logger.info(`=== Submit button clicked ===`);
    Logger.info(`Button type: ${e.currentTarget.getAttribute('type')}`);
    Logger.info(`Form errors before submit: ${JSON.stringify(errors)}`);
  };

  // Handle checkbox changes manually
  const handleDividendPaymentMonthChange = (month: number, checked: boolean) => {
    const currentMonths = getValues('dividendPaymentMonths') || [];
    Logger.info(`Changing payment month ${month}, checked: ${checked}, current: ${JSON.stringify(currentMonths)}`);
    
    let newMonths: number[];
    if (checked) {
      newMonths = [...currentMonths, month].sort((a, b) => a - b);
    } else {
      newMonths = currentMonths.filter(m => m !== month);
    }
    
    Logger.info(`New payment months: ${JSON.stringify(newMonths)}`);
    setValue('dividendPaymentMonths', newMonths, { shouldValidate: true });
  };

  const handleDividendMonthChange = (month: number, checked: boolean) => {
    const currentMonths = getValues('dividendMonths') || [];
    Logger.info(`Changing custom month ${month}, checked: ${checked}, current: ${JSON.stringify(currentMonths)}`);
    
    let newMonths: number[];
    if (checked) {
      newMonths = [...currentMonths, month].sort((a, b) => a - b);
    } else {
      newMonths = currentMonths.filter(m => m !== month);
    }
    
    Logger.info(`New custom months: ${JSON.stringify(newMonths)}`);
    setValue('dividendMonths', newMonths, { shouldValidate: true });
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      {/* Debug info */}
      {Object.keys(errors).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded p-3">
          <h4 className="text-red-800 font-medium">Form Errors:</h4>
          <pre className="text-xs text-red-600 mt-1">
            {JSON.stringify(errors, null, 2)}
          </pre>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('common.name')} *
          </label>
          <input
            type="text"
            {...register('name')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder={t('assets.form.enterAssetName')}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('common.type')} *
          </label>
          <select
            {...register('type')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {assetTypeOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          {errors.type && (
            <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('assets.form.value')} *
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            {...register('value', { 
              valueAsNumber: true,
              setValueAs: (value) => {
                Logger.info(`Value input: ${value}, type: ${typeof value}`);
                return value === '' ? 0 : Number(value);
              }
            })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="0.00"
          />
          {errors.value && (
            <p className="mt-1 text-sm text-red-600">{errors.value.message}</p>
          )}
        </div>

        {/* Optional fields */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('assets.form.country')} ({t('common.optional')})
          </label>
          <input
            type="text"
            {...register('country')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('assets.form.continent')} ({t('common.optional')})
          </label>
          <input
            type="text"
            {...register('continent')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('assets.form.sector')} ({t('common.optional')})
          </label>
          <input
            type="text"
            {...register('sector')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Stock specific fields */}
        {assetType === 'stock' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('assets.form.ticker')}
              </label>
              <input
                type="text"
                {...register('ticker')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder={t('assets.form.tickerPlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('assets.form.quantity')}
              </label>
              <input
                type="number"
                min="0"
                step="1"
                {...register('quantity', { 
                  setValueAs: (value) => {
                    Logger.info(`Quantity input: "${value}", type: ${typeof value}`);
                    if (value === '' || value === null || value === undefined) return undefined;
                    const num = Number(value);
                    return isNaN(num) ? undefined : num;
                  }
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('assets.form.purchasePrice')}
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                {...register('purchasePrice', { 
                  setValueAs: (value) => {
                    Logger.info(`Purchase price input: "${value}", type: ${typeof value}`);
                    if (value === '' || value === null || value === undefined) return undefined;
                    const num = Number(value);
                    return isNaN(num) ? undefined : num;
                  }
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('assets.form.currentPrice')}
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                {...register('currentPrice', { 
                  setValueAs: (value) => {
                    Logger.info(`Current price input: "${value}", type: ${typeof value}`);
                    if (value === '' || value === null || value === undefined) return undefined;
                    const num = Number(value);
                    return isNaN(num) ? undefined : num;
                  }
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('assets.form.dividendFrequency')}
              </label>
              <select
                {...register('dividendFrequency')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {dividendFrequencyOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            {dividendFrequency !== 'none' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('assets.form.dividendAmountPerShare')}
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('dividendAmount', { valueAsNumber: true })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            )}

            {(dividendFrequency === 'quarterly' || dividendFrequency === 'annually') && (
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {dividendFrequency === 'quarterly' ? t('assets.form.quarterlyPaymentMonths') : t('assets.form.annualPaymentMonth')}
                </label>
                <div className="grid grid-cols-4 gap-2 mt-1">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
                    const isChecked = watchedDividendPaymentMonths?.includes(month) || false;
                    
                    return (
                      <label key={month} className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleDividendPaymentMonthChange(month, e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          {new Date(2024, month - 1).toLocaleString('default', { month: 'short' })}
                        </span>
                      </label>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {dividendFrequency === 'quarterly' 
                    ? t('assets.form.quarterlyPaymentHint')
                    : t('assets.form.annualPaymentHint')
                  }
                </p>
              </div>
            )}

            {dividendFrequency === 'custom' && (
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('assets.form.customDividendMonths')}
                </label>
                <div className="grid grid-cols-4 gap-2 mt-1">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
                    const isChecked = watchedDividendMonths?.includes(month) || false;
                    
                    return (
                      <label key={month} className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleDividendMonthChange(month, e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          {new Date(2024, month - 1).toLocaleString('default', { month: 'short' })}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* Real Estate specific fields */}
        {assetType === 'real_estate' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('assets.form.propertyValue')} ({t('common.optional')})
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('propertyValue', { 
                  setValueAs: (value) => {
                    Logger.info(`Property value input: "${value}", type: ${typeof value}`);
                    if (value === '' || value === null || value === undefined) return undefined;
                    const num = Number(value);
                    return isNaN(num) ? undefined : num;
                  }
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('assets.form.monthlyRentalIncome')}
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('rentalAmount', { 
                  setValueAs: (value) => {
                    Logger.info(`Rental amount input: "${value}", type: ${typeof value}`);
                    if (value === '' || value === null || value === undefined) return undefined;
                    const num = Number(value);
                    return isNaN(num) ? undefined : num;
                  }
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="0.00"
              />
              {errors.rentalAmount && (
                <p className="mt-1 text-sm text-red-600">{errors.rentalAmount.message}</p>
              )}
            </div>
          </>
        )}

        {/* Bond specific fields */}
        {assetType === 'bond' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('assets.form.interestRatePercent')}
              </label>
              <input
                type="number"
                step="0.01"
                {...register('interestRate', { 
                  setValueAs: (value) => {
                    if (value === '' || value === null || value === undefined) return undefined;
                    const num = Number(value);
                    return isNaN(num) ? undefined : num;
                  }
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('assets.form.maturityDate')}
              </label>
              <input
                type="date"
                {...register('maturityDate')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('assets.form.nominalValue')}
              </label>
              <input
                type="number"
                step="0.01"
                {...register('nominalValue', { 
                  setValueAs: (value) => {
                    if (value === '' || value === null || value === undefined) return undefined;
                    const num = Number(value);
                    return isNaN(num) ? undefined : num;
                  }
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </>
        )}

        {/* Crypto specific fields */}
        {assetType === 'crypto' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('assets.form.tokenSymbol')}
              </label>
              <input
                type="text"
                {...register('symbol')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('assets.form.acquisitionCost')}
              </label>
              <input
                type="number"
                step="0.01"
                {...register('acquisitionCost', { 
                  setValueAs: (value) => {
                    if (value === '' || value === null || value === undefined) return undefined;
                    const num = Number(value);
                    return isNaN(num) ? undefined : num;
                  }
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('common.notes')}
        </label>
        <textarea
          {...register('notes')}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button 
          type="submit" 
          onClick={handleButtonClick}
          disabled={isSubmitting}
        >
          {isSubmitting ? t('assets.form.adding') : (initialData ? t('assets.form.updateAsset') : t('assets.form.addAsset'))}
        </Button>
      </div>
    </form>
  );
};