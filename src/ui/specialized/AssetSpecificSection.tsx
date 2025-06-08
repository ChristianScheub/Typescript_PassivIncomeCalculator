import React from 'react';
import { Box } from '@mui/material';
import { AssetType, DividendFrequency } from '../../types';
import { UseFormSetValue } from 'react-hook-form';
import { FormSection, SectionTitle } from '../forms/MaterialForm';
import { FormGrid, StandardFormField } from '../forms/FormGrid';
import { MonthSelector } from '../forms/MonthSelector';
import { useTranslation } from 'react-i18next';
import formatService from '../../service/formatService';

interface AssetSpecificSectionProps {
  assetType: AssetType;
  dividendFrequency?: DividendFrequency;
  quantity?: number;
  currentPrice?: number;
  watch: (field: string) => any;
  setValue: UseFormSetValue<any>;
  paymentFields: {
    months?: number[];
  };
  handleMonthChange: (month: number, checked: boolean) => void;
}

export const AssetSpecificSection: React.FC<AssetSpecificSectionProps> = ({
  assetType,
  dividendFrequency,
  quantity,
  currentPrice,
  watch,
  setValue,
  paymentFields,
  handleMonthChange
}) => {
  const { t } = useTranslation();

  const dividendFrequencyOptions = [
    { value: 'monthly', label: t('frequency.monthly') },
    { value: 'quarterly', label: t('frequency.quarterly') },
    { value: 'annually', label: t('frequency.annually') },
    { value: 'custom', label: t('frequency.custom') },
    { value: 'none', label: t('frequency.none') }
  ];

  if (assetType === 'stock') {
    return (
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
        
        <FormGrid>
          <StandardFormField
            label={t('assets.form.ticker')}
            name="ticker"
            value={watch('ticker')}
            onChange={(value) => setValue('ticker', value)}
            placeholder={t('assets.form.tickerPlaceholder')}
          />
          
          <StandardFormField
            label={t('assets.form.quantity')}
            name="quantity"
            type="number"
            value={watch('quantity')}
            onChange={(value) => setValue('quantity', value)}
            placeholder={t('common.zeroPlaceholder')}
            step={1}
            min={0}
          />
          
          <StandardFormField
            label={t('assets.form.purchasePrice')}
            name="purchasePrice"
            type="number"
            value={watch('purchasePrice')}
            onChange={(value) => setValue('purchasePrice', value)}
            placeholder={t('common.zeroAmountPlaceholder')}
            step={0.01}
            min={0}
          />
          
          <StandardFormField
            label={t('assets.form.currentPrice')}
            name="currentPrice"
            type="number"
            value={watch('currentPrice')}
            onChange={(value) => setValue('currentPrice', value)}
            placeholder={t('common.zeroAmountPlaceholder')}
            step={0.01}
            min={0}
          />
          
          {quantity && currentPrice && quantity > 0 && currentPrice > 0 && (
            <StandardFormField
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
              gridColumn="span 2"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'action.hover'
                }
              }}
            />
          )}
          
          <StandardFormField
            label={t('assets.form.dividendFrequency')}
            name="dividendFrequency"
            type="select"
            options={dividendFrequencyOptions}
            value={watch('dividendFrequency')}
            onChange={(value) => setValue('dividendFrequency', value as DividendFrequency)}
          />
          
          {dividendFrequency && dividendFrequency !== 'none' && (
            <StandardFormField
              label={t('assets.form.dividendAmountPerShare')}
              name="dividendAmount"
              type="number"
              value={watch('dividendAmount')}
              onChange={(value) => setValue('dividendAmount', value)}
              step={0.01}
              min={0}
            />
          )}
        </FormGrid>
        
        {(dividendFrequency === 'quarterly' || dividendFrequency === 'annually') && (
          <Box sx={{ mt: 2 }}>
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
          <Box sx={{ mt: 2 }}>
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
      </FormSection>
    );
  }

  if (assetType === 'real_estate') {
    return (
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
        
        <FormGrid>
          <StandardFormField
            label={t('assets.form.propertyValue')}
            name="propertyValue"
            type="number"
            value={watch('propertyValue')}
            onChange={(value) => setValue('propertyValue', value)}
            placeholder={t('common.zeroAmountPlaceholder')}
            step={0.01}
            min={0}
          />
          
          <StandardFormField
            label={t('assets.form.monthlyRentalIncome')}
            name="rentalAmount"
            type="number"
            value={watch('rentalAmount')}
            onChange={(value) => setValue('rentalAmount', value)}
            placeholder={t('common.zeroAmountPlaceholder')}
            step={0.01}
            min={0}
          />
        </FormGrid>
      </Box>
    );
  }

  if (assetType === 'bond') {
    return (
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
        
        <FormGrid>
          <StandardFormField
            label={t('assets.form.interestRatePercent')}
            name="interestRate"
            type="number"
            value={watch('interestRate')}
            onChange={(value) => setValue('interestRate', value)}
            step={0.01}
            min={0}
          />
          
          <StandardFormField
            label={t('assets.form.maturityDate')}
            name="maturityDate"
            type="date"
            value={watch('maturityDate')}
            onChange={(value) => setValue('maturityDate', value)}
          />
          
          <StandardFormField
            label={t('assets.form.nominalValue')}
            name="nominalValue"
            type="number"
            value={watch('nominalValue')}
            onChange={(value) => setValue('nominalValue', value)}
            placeholder={t('common.zeroAmountPlaceholder')}
            step={0.01}
            min={0}
            gridColumn="span 2"
          />
        </FormGrid>
      </Box>
    );
  }

  if (assetType === 'cash') {
    return (
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
        
        <FormGrid>
          <StandardFormField
            label={t('assets.form.interestRatePercent') || 'Interest Rate (%)'}
            name="interestRate"
            type="number"
            value={watch('interestRate')}
            onChange={(value) => setValue('interestRate', value)}
            step={0.01}
            min={0}
          />
        </FormGrid>
      </Box>
    );
  }

  if (assetType === 'crypto') {
    return (
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
        
        <FormGrid>
          <StandardFormField
            label={t('assets.form.tokenSymbol')}
            name="symbol"
            value={watch('symbol')}
            onChange={(value) => setValue('symbol', value)}
          />
          
          <StandardFormField
            label={t('assets.form.acquisitionCost')}
            name="acquisitionCost"
            type="number"
            value={watch('acquisitionCost')}
            onChange={(value) => setValue('acquisitionCost', value)}
            step={0.01}
            min={0}
          />
        </FormGrid>
      </Box>
    );
  }

  return null;
};
