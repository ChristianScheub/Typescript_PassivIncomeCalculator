import React from 'react';
import { Box } from '@mui/material';
import { Save } from '@mui/icons-material';
import { AssetType, DividendFrequency } from '../../types';
import { UseFormSetValue } from 'react-hook-form';
import FloatingBtn, { ButtonAlignment } from '../../ui/floatingBtn';
import { 
  MaterialForm, 
  FormSection,
  SectionTitle,
  RequiredFieldsSection
} from '../../ui/MaterialForm';
import { MonthSelector } from '../../ui/MonthSelector';
import { useTranslation } from 'react-i18next';
import { SharedFormField } from '../../ui/SharedFormField';
import formatService from '../../service/formatService';

// Define the AssetFormData interface for the form
interface AssetFormData {
  name: string;
  type: AssetType;
  value: number;
  purchaseDate?: string;
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

  // Options arrays (localized)
  const assetTypeOptions = [
    { value: 'stock', label: t('assets.types.stock') },
    { value: 'bond', label: t('assets.types.bond') },
    { value: 'real_estate', label: t('assets.types.real_estate') },
    { value: 'crypto', label: t('assets.types.crypto') },
    { value: 'cash', label: t('assets.types.cash') },
    { value: 'other', label: t('assets.types.other') }
  ];

  const dividendFrequencyOptions = [
    { value: 'monthly', label: t('frequency.monthly') },
    { value: 'quarterly', label: t('frequency.quarterly') },
    { value: 'annually', label: t('frequency.annually') },
    { value: 'custom', label: t('frequency.custom') },
    { value: 'none', label: t('frequency.none') }
  ];

  return (
    <Box sx={{ 
      pb: { xs: 12, sm: 10 },
      pt: { xs: 3, sm: 4 },
      px: { xs: 1, sm: 2 },
      minHeight: '100vh',
      background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.03) 0%, rgba(156, 39, 176, 0.03) 100%)'
    }}>
      <MaterialForm 
        title={title}
        onSubmit={onFormSubmit}
        formRef={formRef}
      >
        <RequiredFieldsSection>
          <SectionTitle sx={{ 
            fontSize: { xs: '1rem', sm: '1.1rem' }, 
            mb: { xs: 2, sm: 3 },
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            '&::before': {
              content: '"*"',
              color: 'error.main',
              fontWeight: 'bold',
              fontSize: '1.2em'
            }
          }}>
            {t('common.requiredFields')}
          </SectionTitle>
          
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
            gap: { xs: 2.5, sm: 3 },
            mb: 2
          }}>
            <SharedFormField
              label={t('common.name')}
              name="name"
              required
              error={errors.name?.message}
              value={watch('name')}
              onChange={(value) => setValue('name', value)}
              placeholder={t('assets.form.enterAssetName')}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  minHeight: { xs: 56, sm: 48 },
                  fontSize: { xs: '1rem', sm: '0.875rem' }
                }
              }}
            />
            
            <SharedFormField
              label={t('common.type')}
              name="type"
              type="select"
              required
              options={assetTypeOptions}
              error={errors.type?.message}
              value={watch('type')}
              onChange={(value) => setValue('type', value as AssetType)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  minHeight: { xs: 56, sm: 48 }
                }
              }}
            />
            
            {assetType !== 'stock' && (
              <SharedFormField
                label={t('assets.form.value')}
                name="value"
                type="number"
                required
                error={errors.value?.message}
                value={watch('value')}
                onChange={(value) => setValue('value', value)}
                placeholder={t('common.zeroAmountPlaceholder')}
                step={0.01}
                min={0}
                sx={{
                  gridColumn: { xs: '1', sm: 'span 1' },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    minHeight: { xs: 56, sm: 48 }
                  }
                }}
              />
            )}
          </Box>
        </RequiredFieldsSection>

        {/* Asset Type Specific Fields */}
        {assetType === 'stock' && (
          <FormSection>
            <SectionTitle sx={{ 
              fontSize: { xs: '1rem', sm: '1.1rem' },
              mb: { xs: 2, sm: 3 },
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              {t('assets.form.stockSpecific')}
            </SectionTitle>
            
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              gap: { xs: 2.5, sm: 3 }
            }}>
              <SharedFormField
                label={t('assets.form.ticker')}
                name="ticker"
                value={watch('ticker')}
                onChange={(value) => setValue('ticker', value)}
                placeholder={t('assets.form.tickerPlaceholder')}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    minHeight: { xs: 56, sm: 48 }
                  }
                }}
              />
              
              <SharedFormField
                label={t('assets.form.quantity')}
                name="quantity"
                type="number"
                value={watch('quantity')}
                onChange={(value) => setValue('quantity', value)}
                placeholder={t('common.zeroPlaceholder')}
                step={1}
                min={0}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    minHeight: { xs: 56, sm: 48 }
                  }
                }}
              />
              
              <SharedFormField
                label={t('assets.form.purchasePrice')}
                name="purchasePrice"
                type="number"
                value={watch('purchasePrice')}
                onChange={(value) => setValue('purchasePrice', value)}
                placeholder={t('common.zeroAmountPlaceholder')}
                step={0.01}
                min={0}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    minHeight: { xs: 56, sm: 48 }
                  }
                }}
              />
              
              <SharedFormField
                label={t('assets.form.currentPrice')}
                name="currentPrice"
                type="number"
                value={watch('currentPrice')}
                onChange={(value) => setValue('currentPrice', value)}
                placeholder={t('common.zeroAmountPlaceholder')}
                step={0.01}
                min={0}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    minHeight: { xs: 56, sm: 48 }
                  }
                }}
              />
              
              {quantity && currentPrice && quantity > 0 && currentPrice > 0 && (
                <Box sx={{ gridColumn: { xs: '1', sm: 'span 2' } }}>
                  <SharedFormField
                    label={t('assets.form.calculatedValue')}
                    name="calculatedValue"
                    type="number"
                    value={quantity * currentPrice}
                    onChange={() => {}} // Read-only
                    placeholder={t('common.zeroAmountPlaceholder')}
                    step={0.01}
                    min={0}
                    disabled={true}
                    helperText={`${t('assets.calculatedValue')}: ${formatService.formatCurrency(quantity * currentPrice)}`}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: 'action.hover'
                      }
                    }}
                  />
                </Box>
              )}
              
              <SharedFormField
                label={t('assets.form.dividendFrequency')}
                name="dividendFrequency"
                type="select"
                options={dividendFrequencyOptions}
                value={watch('dividendFrequency')}
                onChange={(value) => setValue('dividendFrequency', value as DividendFrequency)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    minHeight: { xs: 56, sm: 48 }
                  }
                }}
              />
              
              {dividendFrequency && dividendFrequency !== 'none' && (
                <SharedFormField
                  label={t('assets.form.dividendAmountPerShare')}
                  name="dividendAmount"
                  type="number"
                  value={watch('dividendAmount')}
                  onChange={(value) => setValue('dividendAmount', value)}
                  step={0.01}
                  min={0}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      minHeight: { xs: 56, sm: 48 }
                    }
                  }}
                />
              )}
              
              {(dividendFrequency === 'quarterly' || dividendFrequency === 'annually') && (
                <Box sx={{ gridColumn: { xs: '1', sm: 'span 2' }, mt: 2 }}>
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
                </Box>
              )}
              
              {dividendFrequency === 'custom' && (
                <Box sx={{ gridColumn: { xs: '1', sm: 'span 2' }, mt: 2 }}>
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
                </Box>
              )}
            </Box>
          </FormSection>
        )}

        {assetType === 'real_estate' && (
          <Box sx={{ 
            mb: { xs: 3, sm: 4 },
            p: { xs: 2, sm: 3 },
            borderRadius: 2,
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider'
          }}>
            <SectionTitle sx={{ 
              fontSize: { xs: '1rem', sm: '1.1rem' }, 
              mb: { xs: 2, sm: 3 },
              color: 'primary.main',
              fontWeight: 600
            }}>
              {t('assets.form.realEstateSpecific')}
            </SectionTitle>
            
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              gap: { xs: 2.5, sm: 3 }
            }}>
              <SharedFormField
                label={t('assets.form.propertyValue')}
                name="propertyValue"
                type="number"
                value={watch('propertyValue')}
                onChange={(value) => setValue('propertyValue', value)}
                placeholder={t('common.zeroAmountPlaceholder')}
                step={0.01}
                min={0}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    minHeight: { xs: '56px', sm: '48px' }
                  }
                }}
              />
              
              <SharedFormField
                label={t('assets.form.monthlyRentalIncome')}
                name="rentalAmount"
                type="number"
                value={watch('rentalAmount')}
                onChange={(value) => setValue('rentalAmount', value)}
                placeholder={t('common.zeroAmountPlaceholder')}
                step={0.01}
                min={0}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    minHeight: { xs: '56px', sm: '48px' }
                  }
                }}
              />
            </Box>
          </Box>
        )}

        {assetType === 'bond' && (
          <Box sx={{ 
            mb: { xs: 3, sm: 4 },
            p: { xs: 2, sm: 3 },
            borderRadius: 2,
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider'
          }}>
            <SectionTitle sx={{ 
              fontSize: { xs: '1rem', sm: '1.1rem' }, 
              mb: { xs: 2, sm: 3 },
              color: 'primary.main',
              fontWeight: 600
            }}>
              {t('assets.form.bondSpecific')}
            </SectionTitle>
            
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              gap: { xs: 2.5, sm: 3 }
            }}>
              <SharedFormField
                label={t('assets.form.interestRatePercent')}
                name="interestRate"
                type="number"
                value={watch('interestRate')}
                onChange={(value) => setValue('interestRate', value)}
                step={0.01}
                min={0}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    minHeight: { xs: '56px', sm: '48px' }
                  }
                }}
              />
              
              <SharedFormField
                label={t('assets.form.maturityDate')}
                name="maturityDate"
                type="date"
                value={watch('maturityDate')}
                onChange={(value) => setValue('maturityDate', value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    minHeight: { xs: '56px', sm: '48px' }
                  }
                }}
              />
              
              <SharedFormField
                label={t('assets.form.nominalValue')}
                name="nominalValue"
                type="number"
                value={watch('nominalValue')}
                onChange={(value) => setValue('nominalValue', value)}
                placeholder={t('common.zeroAmountPlaceholder')}
                step={0.01}
                min={0}
                sx={{
                  gridColumn: { xs: '1', sm: 'span 2' },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    minHeight: { xs: '56px', sm: '48px' }
                  }
                }}
              />
            </Box>
          </Box>
        )}

        {assetType === 'cash' && (
          <Box sx={{ 
            mb: { xs: 3, sm: 4 },
            p: { xs: 2, sm: 3 },
            borderRadius: 2,
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider'
          }}>
            <SectionTitle sx={{ 
              fontSize: { xs: '1rem', sm: '1.1rem' }, 
              mb: { xs: 2, sm: 3 },
              color: 'primary.main',
              fontWeight: 600
            }}>
              {t('assets.form.cashSpecific') || 'Cash Details'}
            </SectionTitle>
            
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              gap: { xs: 2.5, sm: 3 }
            }}>
              <SharedFormField
                label={t('assets.form.interestRatePercent') || 'Interest Rate (%)'}
                name="interestRate"
                type="number"
                value={watch('interestRate')}
                onChange={(value) => setValue('interestRate', value)}
                step={0.01}
                min={0}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    minHeight: { xs: '56px', sm: '48px' }
                  }
                }}
              />
            </Box>
          </Box>
        )}

        {assetType === 'crypto' && (
          <Box sx={{ 
            mb: { xs: 3, sm: 4 },
            p: { xs: 2, sm: 3 },
            borderRadius: 2,
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider'
          }}>
            <SectionTitle sx={{ 
              fontSize: { xs: '1rem', sm: '1.1rem' }, 
              mb: { xs: 2, sm: 3 },
              color: 'primary.main',
              fontWeight: 600
            }}>
              {t('assets.form.cryptoSpecific')}
            </SectionTitle>
            
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              gap: { xs: 2.5, sm: 3 }
            }}>
              <SharedFormField
                label={t('assets.form.tokenSymbol')}
                name="symbol"
                value={watch('symbol')}
                onChange={(value) => setValue('symbol', value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    minHeight: { xs: '56px', sm: '48px' }
                  }
                }}
              />
              
              <SharedFormField
                label={t('assets.form.acquisitionCost')}
                name="acquisitionCost"
                type="number"
                value={watch('acquisitionCost')}
                onChange={(value) => setValue('acquisitionCost', value)}
                step={0.01}
                min={0}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    minHeight: { xs: '56px', sm: '48px' }
                  }
                }}
              />
            </Box>
          </Box>
        )}

        <Box sx={{ 
          mb: { xs: 3, sm: 4 },
          p: { xs: 2, sm: 3 },
          borderRadius: 2,
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider'
        }}>
          <SectionTitle sx={{ 
            fontSize: { xs: '1rem', sm: '1.1rem' }, 
            mb: { xs: 2, sm: 3 },
            color: 'primary.main',
            fontWeight: 600
          }}>
            {t('common.optionalFields')}
          </SectionTitle>
          
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
            gap: { xs: 2.5, sm: 3 }
          }}>
            <SharedFormField
              label={t('assets.form.purchaseDate')}
              name="purchaseDate"
              type="date"
              value={watch('purchaseDate')}
              onChange={(value) => setValue('purchaseDate', value || new Date().getFullYear() + '-01-01')}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  minHeight: { xs: '56px', sm: '48px' }
                }
              }}
            />
            
            <SharedFormField
              label={t('assets.form.country')}
              name="country"
              value={watch('country')}
              onChange={(value) => setValue('country', value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  minHeight: { xs: '56px', sm: '48px' }
                }
              }}
            />
            
            <SharedFormField
              label={t('assets.form.continent')}
              name="continent"
              value={watch('continent')}
              onChange={(value) => setValue('continent', value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  minHeight: { xs: '56px', sm: '48px' }
                }
              }}
            />
            
            <SharedFormField
              label={t('assets.form.sector')}
              name="sector"
              value={watch('sector')}
              onChange={(value) => setValue('sector', value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  minHeight: { xs: '56px', sm: '48px' }
                }
              }}
            />
            
            <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
              <SharedFormField
                label={t('common.notes')}
                name="notes"
                type="textarea"
                value={watch('notes')}
                onChange={(value) => setValue('notes', value)}
                rows={3}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
            </Box>
          </Box>
        </Box>
      </MaterialForm>
      
      <FloatingBtn
        alignment={ButtonAlignment.RIGHT}
        icon={Save}
        onClick={onFormSubmit}
      />
    </Box>
  );
};
