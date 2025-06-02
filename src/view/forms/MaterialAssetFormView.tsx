import React from 'react';
import { Grid, Box } from '@mui/material';
import { Save } from '@mui/icons-material';
import { AssetType, DividendFrequency } from '../../types';
import { UseFormSetValue } from 'react-hook-form';
import FloatingBtn, { ButtonAlignment } from '../../ui/floatingBtn';
import { 
  MaterialForm, 
  FormSection,
  SectionTitle,
  RequiredFieldsSection,
  OptionalFieldsSection
} from '../../ui/MaterialForm';
import { MonthSelector } from '../../ui/MonthSelector';
import { useTranslation } from 'react-i18next';
import { SharedFormField } from '../../components/SharedFormField';

// Define the AssetFormData interface for the form
interface AssetFormData {
  name: string;
  type: AssetType;
  value: number;
  ticker?: string;
  quantity?: number;
  purchasePrice?: number;
  currentPrice?: number;
  dividendFrequency?: DividendFrequency;
  dividendAmount?: number;
  dividendMonths?: number[];
  dividendPaymentMonths?: number[];
  customDividendAmounts?: { [key: string]: number };
  propertyValue?: number;
  rentalAmount?: number;
  interestRate?: number;
  maturityDate?: string;
  nominalValue?: number;
  symbol?: string;
  acquisitionCost?: number;
  country?: string;
  continent?: string;
  sector?: string;
  notes?: string;
  id?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface MaterialAssetFormViewProps {
  // Form state props
  assetType: AssetType;
  dividendFrequency: DividendFrequency | undefined;
  quantity?: number;
  currentPrice?: number;
  errors: any;
  
  // Form handlers
  watch: (field: string) => any;
  setValue: UseFormSetValue<AssetFormData>;
  onFormSubmit: () => void;
  
  // Payment schedule props
  paymentFields: {
    months?: number[];
  };
  handleMonthChange: (month: number, checked: boolean) => void;
  
  // Title
  title: string;
}

// Options arrays
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

export const MaterialAssetFormView: React.FC<MaterialAssetFormViewProps> = ({
  assetType,
  dividendFrequency,
  quantity,
  currentPrice,
  errors,
  watch,
  setValue,
  onFormSubmit,
  paymentFields,
  handleMonthChange,
  title
}) => {
  const { t } = useTranslation();
  const formRef = React.useRef<HTMLFormElement>(null);

  return (
    <Box sx={{ pb: 10 }}>
      <MaterialForm 
        title={title}
        onSubmit={onFormSubmit}
        formRef={formRef}
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
            {assetType !== 'stock' && (
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
            )}
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
              {quantity && currentPrice && quantity > 0 && currentPrice > 0 && (
                <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }} component="div">
                  <SharedFormField
                    label={t('assets.form.calculatedValue')}
                    name="calculatedValue"
                    type="number"
                    value={quantity * currentPrice}
                    onChange={() => {}} // Read-only
                    placeholder="0.00"
                    step={0.01}
                    min={0}
                    disabled={true}
                    helperText="Automatically calculated from quantity × current price"
                  />
                </Grid>
              )}
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
              {dividendFrequency && dividendFrequency !== 'none' && (
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
                    selectedMonths={paymentFields.months || []}
                    onChange={(month, checked) => {
                      handleMonthChange(month, checked);
                      
                      // Update the form field
                      const currentMonths = paymentFields.months || [];
                      const newMonths = checked 
                        ? [...currentMonths, month].sort((a, b) => a - b)
                        : currentMonths.filter(m => m !== month);
                      
                      setValue('dividendPaymentMonths', newMonths);
                    }}
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
                    onChange={(month, checked) => {
                      handleMonthChange(month, checked);
                      
                      // Update the form field
                      const currentMonths = paymentFields.months || [];
                      const newMonths = checked 
                        ? [...currentMonths, month].sort((a, b) => a - b)
                        : currentMonths.filter(m => m !== month);
                      
                      setValue('dividendMonths', newMonths);
                    }}
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
      
      <FloatingBtn
        alignment={ButtonAlignment.RIGHT}
        icon={Save}
        onClick={onFormSubmit}
      />
    </Box>
  );
};
