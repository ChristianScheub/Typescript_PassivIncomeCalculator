import React from 'react';
import { Grid } from '@mui/material';
import { Asset, AssetType, DividendFrequency } from '../types';
import { 
  MaterialForm, 
  FormSection,
  SectionTitle,
  RequiredFieldsSection,
  OptionalFieldsSection
} from '../ui/MaterialForm';
import { MonthSelector } from '../ui/MonthSelector';
import { usePaymentSchedule } from '../hooks/usePaymentSchedule';
import { useSharedForm } from '../hooks/useSharedForm';
import { useTranslation } from 'react-i18next';
import { SharedFormField } from '../components/SharedFormField';
import Logger from '../service/Logger/logger';
import { createAssetSchema } from '../utils/validationSchemas';

interface AssetFormData {
  // Required fields
  name: string;
  type: AssetType;
  value: number;
  
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

// Existing code for assetTypeOptions...
const assetTypeOptions = [
  { value: 'stock', label: 'Stock' },
  { value: 'bond', label: 'Bond' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'crypto', label: 'Crypto' },
  { value: 'cash', label: 'Cash' },
  { value: 'other', label: 'Other' }
];

const dividendFrequencyOptions = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annually', label: 'Annually' },
  { value: 'custom', label: 'Custom' },
  { value: 'none', label: 'None' }
];

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
      dividendFrequency: 'none' as DividendFrequency
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

export const MaterialAssetForm: React.FC<AssetFormProps> = ({ initialData, onSubmit }) => {
  const { t } = useTranslation();
  const { fields: paymentFields, handleMonthChange } = usePaymentSchedule(
    initialData?.dividendInfo ? {
      frequency: initialData.dividendInfo.frequency,
      amount: initialData.dividendInfo.amount,
      months: initialData.dividendInfo.months,
      paymentMonths: initialData.dividendInfo.paymentMonths,
      customAmounts: initialData.dividendInfo.customAmounts,
    } : undefined
  );

  const {
    watch,
    setValue,
    formState: { errors },
    onFormSubmit
  } = useSharedForm<AssetFormData>({
    validationSchema: assetSchema,
    defaultValues: getDefaultValues(initialData) as AssetFormData,
    onSubmit: (data: AssetFormData) => {
      Logger.info(`MaterialAssetForm submit: ${JSON.stringify(data)}`);
      try {
        const transformedData: any = {
          ...data,
          id: initialData?.id || Date.now().toString(),
          createdAt: initialData?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        if (data.type === 'stock' && data.dividendFrequency !== 'none' && data.dividendAmount) {
          transformedData.dividendInfo = {
            frequency: data.dividendFrequency,
            amount: data.dividendAmount,
            months: data.dividendMonths,
            paymentMonths: data.dividendPaymentMonths,
            customAmounts: data.customDividendAmounts
          };
        }

        if (data.type === 'real_estate' && data.rentalAmount) {
          transformedData.rentalIncome = {
            amount: data.rentalAmount
          };
        }

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
    }
  });

  const assetType = watch('type');
  const dividendFrequency = watch('dividendFrequency');

  return (
    <MaterialForm 
      title={initialData ? t('assets.editAsset') : t('assets.addAsset')}
      onSubmit={onFormSubmit}
    >
      <RequiredFieldsSection>
        <SectionTitle>{t('common.requiredFields')}</SectionTitle>
        <Grid container spacing={3}>
          <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }} component="div">
            <SharedFormField
              label={t('common.name')}
              name="name"
              required
              error={errors.name?.message}
              value={watch('name')}
              onChange={(value) => setValue('name', value)}
              placeholder={t('assets.form.enterAssetName')}
            />
          </Grid>
          <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }} component="div">
            <SharedFormField
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
          <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }} component="div">
            <SharedFormField
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
            <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }} component="div">
              <SharedFormField
                label={t('assets.form.ticker')}
                name="ticker"
                value={watch('ticker')}
                onChange={(value) => setValue('ticker', value)}
                placeholder={t('assets.form.tickerPlaceholder')}
              />
            </Grid>
            <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }} component="div">
              <SharedFormField
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
            <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }} component="div">
              <SharedFormField
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
            <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }} component="div">
              <SharedFormField
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
            <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }} component="div">
              <SharedFormField
                label={t('assets.form.dividendFrequency')}
                name="dividendFrequency"
                type="select"
                options={dividendFrequencyOptions}
                value={watch('dividendFrequency')}
                onChange={(value) => setValue('dividendFrequency', value as DividendFrequency)}
              />
            </Grid>
            {dividendFrequency !== 'none' && (
              <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }} component="div">
                <SharedFormField
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
              <Grid sx={{ gridColumn: 'span 12' }} component="div">
                <MonthSelector
                  selectedMonths={paymentFields.paymentMonths || []}
                  onChange={handleMonthChange}
                  label={dividendFrequency === 'quarterly' ? 
                    t('assets.form.quarterlyPaymentMonths') : 
                    t('assets.form.annualPaymentMonth')}
                />
              </Grid>
            )}
            {dividendFrequency === 'custom' && (
              <Grid sx={{ gridColumn: 'span 12' }} component="div">
                <MonthSelector
                  selectedMonths={paymentFields.months || []}
                  onChange={handleMonthChange}
                  label={t('assets.form.customDividendMonths')}
                />
              </Grid>
            )}
          </Grid>
        </FormSection>
      )}

      {assetType === 'real_estate' && (
        <FormSection>
          <SectionTitle>{t('assets.form.realEstateSpecific')}</SectionTitle>
          <Grid container spacing={3}>
            <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }} component="div">
              <SharedFormField
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
            <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }} component="div">
              <SharedFormField
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
            <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }} component="div">
              <SharedFormField
                label={t('assets.form.interestRatePercent')}
                name="interestRate"
                type="number"
                value={watch('interestRate')}
                onChange={(value) => setValue('interestRate', value)}
                step={0.01}
                min={0}
              />
            </Grid>
            <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }} component="div">
              <SharedFormField
                label={t('assets.form.maturityDate')}
                name="maturityDate"
                type="date"
                value={watch('maturityDate')}
                onChange={(value) => setValue('maturityDate', value)}
              />
            </Grid>
            <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }} component="div">
              <SharedFormField
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
            <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }} component="div">
              <SharedFormField
                label={t('assets.form.tokenSymbol')}
                name="symbol"
                value={watch('symbol')}
                onChange={(value) => setValue('symbol', value)}
              />
            </Grid>
            <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }} component="div">
              <SharedFormField
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

      <OptionalFieldsSection>
        <SectionTitle>{t('common.optionalFields')}</SectionTitle>
        <Grid container spacing={3}>
          <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }} component="div">
            <SharedFormField
              label={t('assets.form.country')}
              name="country"
              value={watch('country')}
              onChange={(value) => setValue('country', value)}
            />
          </Grid>
          <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }} component="div">
            <SharedFormField
              label={t('assets.form.continent')}
              name="continent"
              value={watch('continent')}
              onChange={(value) => setValue('continent', value)}
            />
          </Grid>
          <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }} component="div">
            <SharedFormField
              label={t('assets.form.sector')}
              name="sector"
              value={watch('sector')}
              onChange={(value) => setValue('sector', value)}
            />
          </Grid>
          <Grid sx={{ gridColumn: 'span 12' }} component="div">
            <SharedFormField
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
  );
};
