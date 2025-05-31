import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { 
  Grid, 
  Box, 
  FormControlLabel, 
  Checkbox,
  Typography,
  Chip
} from '@mui/material';
import { Save, Close } from '@mui/icons-material';
import { Asset, AssetType, DividendFrequency } from '../types';
import { 
  MaterialForm, 
  MaterialFormField, 
  FormSection,
  SectionTitle,
  RequiredFieldsSection,
  OptionalFieldsSection
} from '../ui/MaterialForm';
import FloatingBtn, { ButtonAlignment } from '../ui/floatingBtn';
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
  
  // Stock specific
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

export const MaterialAssetForm: React.FC<AssetFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const { t } = useTranslation();
  
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

  const getDefaultValues = (): Partial<AssetFormData> => {
    if (!initialData) {
      return {
        type: 'stock' as AssetType,
        dividendFrequency: 'none' as DividendFrequency,
      };
    }

    const formData: any = { ...initialData };
    
    if (initialData.dividendInfo) {
      formData.dividendFrequency = initialData.dividendInfo.frequency;
      formData.dividendAmount = initialData.dividendInfo.amount;
      
      if (initialData.dividendInfo.months) {
        formData.dividendMonths = initialData.dividendInfo.months;
      }
      
      if (initialData.dividendInfo.paymentMonths) {
        formData.dividendPaymentMonths = initialData.dividendInfo.paymentMonths;
      }
      
      formData.customDividendAmounts = initialData.dividendInfo.customAmounts;
      delete formData.dividendInfo;
    } else {
      formData.dividendFrequency = 'none';
    }

    if (initialData.rentalIncome) {
      formData.rentalAmount = initialData.rentalIncome.amount;
      delete formData.rentalIncome;
    }

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

  const onFormSubmit = (data: AssetFormData) => {
    Logger.info(`MaterialAssetForm submit: ${JSON.stringify(data)}`);
    
    try {
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
        transformedData.rentalIncome = {
          amount: data.rentalAmount
        };
      }

      // Clean up form-specific fields
      delete transformedData.dividendFrequency;
      delete transformedData.dividendAmount;
      delete transformedData.dividendMonths;
      delete transformedData.dividendPaymentMonths;
      delete transformedData.customDividendAmounts;
      delete transformedData.rentalAmount;
      
      onSubmit(transformedData);
    } catch (error) {
      Logger.error(`Form submission error: ${JSON.stringify(error)}`);
    }
  };

  const handleDividendPaymentMonthChange = (month: number, checked: boolean) => {
    const currentMonths = getValues('dividendPaymentMonths') || [];
    
    let newMonths: number[];
    if (checked) {
      newMonths = [...currentMonths, month].sort((a, b) => a - b);
    } else {
      newMonths = currentMonths.filter(m => m !== month);
    }
    
    setValue('dividendPaymentMonths', newMonths, { shouldValidate: true });
  };

  const handleDividendMonthChange = (month: number, checked: boolean) => {
    const currentMonths = getValues('dividendMonths') || [];
    
    let newMonths: number[];
    if (checked) {
      newMonths = [...currentMonths, month].sort((a, b) => a - b);
    } else {
      newMonths = currentMonths.filter(m => m !== month);
    }
    
    setValue('dividendMonths', newMonths, { shouldValidate: true });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    return handleSubmit(onFormSubmit)(e);
  };

  return (
    <Box sx={{ pb: 10 }}>
      <MaterialForm 
        title={initialData ? t('assets.editAsset') : t('assets.addAsset')}
        onSubmit={handleFormSubmit}
      >
        {/* Required Fields Section */}
        <RequiredFieldsSection>
          <SectionTitle>{t('common.requiredFields')}</SectionTitle>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <MaterialFormField
                label={t('common.name')}
                name="name"
                required
                error={errors.name?.message}
                value={watch('name')}
                onChange={(value) => setValue('name', value)}
                placeholder={t('assets.form.enterAssetName')}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <MaterialFormField
                label={t('common.type')}
                name="type"
                type="select"
                required
                options={assetTypeOptions}
                error={errors.type?.message}
                value={watch('type')}
                onChange={(value) => setValue('type', value as AssetType)}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <MaterialFormField
                label={t('assets.form.value')}
                name="value"
                type="number"
                required
                error={errors.value?.message}
                value={watch('value')}
                onChange={(value) => setValue('value', value)}
                placeholder="0.00"
                step={0.01}
                min={0}
              />
            </Grid>
          </Grid>
        </RequiredFieldsSection>

        {/* Asset Type Specific Fields */}
        {assetType === 'stock' && (
          <FormSection>
            <SectionTitle>{t('assets.form.stockSpecific')}</SectionTitle>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <MaterialFormField
                  label={t('assets.form.ticker')}
                  name="ticker"
                  value={watch('ticker')}
                  onChange={(value) => setValue('ticker', value)}
                  placeholder={t('assets.form.tickerPlaceholder')}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <MaterialFormField
                  label={t('assets.form.quantity')}
                  name="quantity"
                  type="number"
                  value={watch('quantity')}
                  onChange={(value) => setValue('quantity', value)}
                  placeholder="0"
                  step={1}
                  min={0}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <MaterialFormField
                  label={t('assets.form.purchasePrice')}
                  name="purchasePrice"
                  type="number"
                  value={watch('purchasePrice')}
                  onChange={(value) => setValue('purchasePrice', value)}
                  placeholder="0.00"
                  step={0.01}
                  min={0}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <MaterialFormField
                  label={t('assets.form.currentPrice')}
                  name="currentPrice"
                  type="number"
                  value={watch('currentPrice')}
                  onChange={(value) => setValue('currentPrice', value)}
                  placeholder="0.00"
                  step={0.01}
                  min={0}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <MaterialFormField
                  label={t('assets.form.dividendFrequency')}
                  name="dividendFrequency"
                  type="select"
                  options={dividendFrequencyOptions}
                  value={watch('dividendFrequency')}
                  onChange={(value) => setValue('dividendFrequency', value as DividendFrequency)}
                />
              </Grid>

              {dividendFrequency !== 'none' && (
                <Grid item xs={12} md={6}>
                  <MaterialFormField
                    label={t('assets.form.dividendAmountPerShare')}
                    name="dividendAmount"
                    type="number"
                    value={watch('dividendAmount')}
                    onChange={(value) => setValue('dividendAmount', value)}
                    step={0.01}
                    min={0}
                  />
                </Grid>
              )}

              {(dividendFrequency === 'quarterly' || dividendFrequency === 'annually') && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                    {dividendFrequency === 'quarterly' ? t('assets.form.quarterlyPaymentMonths') : t('assets.form.annualPaymentMonth')}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
                      const isChecked = watchedDividendPaymentMonths?.includes(month) || false;
                      
                      return (
                        <Chip
                          key={month}
                          label={new Date(2024, month - 1).toLocaleString('default', { month: 'short' })}
                          clickable
                          color={isChecked ? 'primary' : 'default'}
                          variant={isChecked ? 'filled' : 'outlined'}
                          onClick={() => handleDividendPaymentMonthChange(month, !isChecked)}
                        />
                      );
                    })}
                  </Box>
                </Grid>
              )}

              {dividendFrequency === 'custom' && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                    {t('assets.form.customDividendMonths')}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
                      const isChecked = watchedDividendMonths?.includes(month) || false;
                      
                      return (
                        <Chip
                          key={month}
                          label={new Date(2024, month - 1).toLocaleString('default', { month: 'short' })}
                          clickable
                          color={isChecked ? 'primary' : 'default'}
                          variant={isChecked ? 'filled' : 'outlined'}
                          onClick={() => handleDividendMonthChange(month, !isChecked)}
                        />
                      );
                    })}
                  </Box>
                </Grid>
              )}
            </Grid>
          </FormSection>
        )}

        {assetType === 'real_estate' && (
          <FormSection>
            <SectionTitle>{t('assets.form.realEstateSpecific')}</SectionTitle>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <MaterialFormField
                  label={t('assets.form.propertyValue')}
                  name="propertyValue"
                  type="number"
                  value={watch('propertyValue')}
                  onChange={(value) => setValue('propertyValue', value)}
                  placeholder="0.00"
                  step={0.01}
                  min={0}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <MaterialFormField
                  label={t('assets.form.monthlyRentalIncome')}
                  name="rentalAmount"
                  type="number"
                  value={watch('rentalAmount')}
                  onChange={(value) => setValue('rentalAmount', value)}
                  placeholder="0.00"
                  step={0.01}
                  min={0}
                />
              </Grid>
            </Grid>
          </FormSection>
        )}

        {assetType === 'bond' && (
          <FormSection>
            <SectionTitle>{t('assets.form.bondSpecific')}</SectionTitle>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <MaterialFormField
                  label={t('assets.form.interestRatePercent')}
                  name="interestRate"
                  type="number"
                  value={watch('interestRate')}
                  onChange={(value) => setValue('interestRate', value)}
                  step={0.01}
                  min={0}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <MaterialFormField
                  label={t('assets.form.maturityDate')}
                  name="maturityDate"
                  type="date"
                  value={watch('maturityDate')}
                  onChange={(value) => setValue('maturityDate', value)}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <MaterialFormField
                  label={t('assets.form.nominalValue')}
                  name="nominalValue"
                  type="number"
                  value={watch('nominalValue')}
                  onChange={(value) => setValue('nominalValue', value)}
                  step={0.01}
                  min={0}
                />
              </Grid>
            </Grid>
          </FormSection>
        )}

        {assetType === 'crypto' && (
          <FormSection>
            <SectionTitle>{t('assets.form.cryptoSpecific')}</SectionTitle>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <MaterialFormField
                  label={t('assets.form.tokenSymbol')}
                  name="symbol"
                  value={watch('symbol')}
                  onChange={(value) => setValue('symbol', value)}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <MaterialFormField
                  label={t('assets.form.acquisitionCost')}
                  name="acquisitionCost"
                  type="number"
                  value={watch('acquisitionCost')}
                  onChange={(value) => setValue('acquisitionCost', value)}
                  step={0.01}
                  min={0}
                />
              </Grid>
            </Grid>
          </FormSection>
        )}

        {/* Optional Fields Section */}
        <OptionalFieldsSection>
          <SectionTitle>{t('common.optionalFields')}</SectionTitle>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <MaterialFormField
                label={t('assets.form.country')}
                name="country"
                value={watch('country')}
                onChange={(value) => setValue('country', value)}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <MaterialFormField
                label={t('assets.form.continent')}
                name="continent"
                value={watch('continent')}
                onChange={(value) => setValue('continent', value)}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <MaterialFormField
                label={t('assets.form.sector')}
                name="sector"
                value={watch('sector')}
                onChange={(value) => setValue('sector', value)}
              />
            </Grid>

            <Grid item xs={12}>
              <MaterialFormField
                label={t('common.notes')}
                name="notes"
                type="textarea"
                value={watch('notes')}
                onChange={(value) => setValue('notes', value)}
                rows={3}
              />
            </Grid>
          </Grid>
        </OptionalFieldsSection>
      </MaterialForm>

      {/* Floating Action Buttons */}
      <Box sx={{ position: 'fixed', bottom: 24, right: 24, display: 'flex', gap: 2 }}>
        {/* Cancel Button */}
        <FloatingBtn
          alignment={ButtonAlignment.RIGHT}
          icon={Close}
          onClick={onCancel}
          backgroundColor="#6B7280"
          hoverBackgroundColor="#4B5563"
        />
        
        {/* Save Button */}
        <FloatingBtn
          alignment={ButtonAlignment.RIGHT}
          icon={Save}
          onClick={() => handleSubmit(onFormSubmit)()}
        />
      </Box>
    </Box>
  );
};
