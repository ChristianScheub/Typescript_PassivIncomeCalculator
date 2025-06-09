import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AssetDefinition, AssetType, DividendFrequency, PaymentFrequency } from '../../types';
import { 
  StandardFormWrapper,
  RequiredSection,
  OptionalSection,
  FormGrid,
  StandardFormField
} from './StandardFormWrapper';
import { Modal } from '../common/Modal';
import { MonthSelector } from './MonthSelector';
import { CustomAmountsSection } from '../specialized/CustomAmountsSection';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { getAssetTypeOptions } from '../../constants';

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
  
  // Price fields
  currentPrice: z.number().min(0).optional(),
  lastPriceUpdate: z.string().optional(),
  
  // Dividend fields
  hasDividend: z.boolean().optional(),
  dividendAmount: z.number().min(0).optional(),
  dividendFrequency: z.enum(['monthly', 'quarterly', 'annually', 'custom', 'none']).optional(),
  dividendMonths: z.array(z.number().min(1).max(12)).optional(),
  dividendCustomAmounts: z.record(z.string(), z.number()).optional(),
  dividendPaymentMonths: z.array(z.number().min(1).max(12)).optional(),
  
  // Rental fields  
  hasRental: z.boolean().optional(),
  rentalAmount: z.number().min(0).optional(),
  rentalFrequency: z.enum(['monthly', 'quarterly', 'annually', 'custom']).optional(),
  rentalMonths: z.array(z.number().min(1).max(12)).optional(),
  rentalCustomAmounts: z.record(z.string(), z.number()).optional(),
  rentalPaymentMonths: z.array(z.number().min(1).max(12)).optional(),
  
  // Bond fields
  hasBond: z.boolean().optional(),
  interestRate: z.number().min(0).max(100).optional(),
  maturityDate: z.string().optional(),
  nominalValue: z.number().min(0).optional(),
});

type AssetDefinitionFormData = z.infer<typeof assetDefinitionSchema>;

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

  const getRiskLevelOptions = (t: any) => [
    { value: 'low', label: t('assets.riskLevels.low') },
    { value: 'medium', label: t('assets.riskLevels.medium') },
    { value: 'high', label: t('assets.riskLevels.high') }
  ];

  const { handleSubmit, watch, setValue, formState: { errors }, reset } = useForm<AssetDefinitionFormData>({
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
      
      // Price fields
      currentPrice: editingDefinition.currentPrice || undefined,
      lastPriceUpdate: editingDefinition.lastPriceUpdate || undefined,
      
      hasDividend: !!editingDefinition.dividendInfo,
      dividendAmount: editingDefinition.dividendInfo?.amount || 0,
      dividendFrequency: editingDefinition.dividendInfo?.frequency || 'quarterly',
      dividendPaymentMonths: editingDefinition.dividendInfo?.paymentMonths || editingDefinition.dividendInfo?.months || [],
      dividendCustomAmounts: editingDefinition.dividendInfo?.customAmounts || {},
      
      hasRental: !!editingDefinition.rentalInfo,
      rentalAmount: editingDefinition.rentalInfo?.baseRent || 0,
      rentalFrequency: editingDefinition.rentalInfo?.frequency || 'monthly',
      rentalPaymentMonths: editingDefinition.rentalInfo?.months || [],
      rentalCustomAmounts: editingDefinition.rentalInfo?.customAmounts || {},
      
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
      dividendPaymentMonths: [],
      rentalPaymentMonths: [],
      dividendCustomAmounts: {},
      rentalCustomAmounts: {},
    }
  });

  const watchedType = watch('type');
  const hasDividend = watch('hasDividend');
  const hasRental = watch('hasRental');
  const hasBond = watch('hasBond');
  const dividendFrequency = watch('dividendFrequency');
  const rentalFrequency = watch('rentalFrequency');
  const dividendPaymentMonths = watch('dividendPaymentMonths') || [];
  const rentalPaymentMonths = watch('rentalPaymentMonths') || [];
  const dividendCustomAmounts = watch('dividendCustomAmounts') || {};
  const rentalCustomAmounts = watch('rentalCustomAmounts') || {};

  React.useEffect(() => {
    setSelectedType(watchedType as AssetType);
  }, [watchedType]);

  // Handler functions for dividend payment months
  const handleDividendMonthChange = (month: number, checked: boolean) => {
    const currentMonths = dividendPaymentMonths || [];
    let newMonths: number[];
    
    if (checked) {
      newMonths = [...currentMonths, month].sort((a, b) => a - b);
    } else {
      newMonths = currentMonths.filter(m => m !== month);
    }
    
    setValue('dividendPaymentMonths', newMonths);
  };

  const handleDividendCustomAmountChange = (month: number, amount: number) => {
    const currentAmounts = dividendCustomAmounts || {};
    setValue('dividendCustomAmounts', {
      ...currentAmounts,
      [month]: amount
    });
  };

  // Handler functions for rental payment months
  const handleRentalMonthChange = (month: number, checked: boolean) => {
    const currentMonths = rentalPaymentMonths || [];
    let newMonths: number[];
    
    if (checked) {
      newMonths = [...currentMonths, month].sort((a, b) => a - b);
    } else {
      newMonths = currentMonths.filter(m => m !== month);
    }
    
    setValue('rentalPaymentMonths', newMonths);
  };

  const handleRentalCustomAmountChange = (month: number, amount: number) => {
    const currentAmounts = rentalCustomAmounts || {};
    setValue('rentalCustomAmounts', {
      ...currentAmounts,
      [month]: amount
    });
  };

  // Reset form when editingDefinition changes
  React.useEffect(() => {
    if (editingDefinition) {
      // Reset form with editing definition data
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
        
        // Price fields
        currentPrice: editingDefinition.currentPrice || undefined,
        lastPriceUpdate: editingDefinition.lastPriceUpdate || undefined,
        
        hasDividend: !!editingDefinition.dividendInfo,
        dividendAmount: editingDefinition.dividendInfo?.amount || 0,
        dividendFrequency: editingDefinition.dividendInfo?.frequency || 'quarterly',
        dividendPaymentMonths: editingDefinition.dividendInfo?.paymentMonths || editingDefinition.dividendInfo?.months || [],
        dividendCustomAmounts: editingDefinition.dividendInfo?.customAmounts || {},
        
        hasRental: !!editingDefinition.rentalInfo,
        rentalAmount: editingDefinition.rentalInfo?.baseRent || 0,
        rentalFrequency: editingDefinition.rentalInfo?.frequency || 'monthly',
        rentalPaymentMonths: editingDefinition.rentalInfo?.months || [],
        rentalCustomAmounts: editingDefinition.rentalInfo?.customAmounts || {},
        
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
      reset({
        type: 'stock',
        currency: 'EUR',
        riskLevel: 'medium',
        dividendFrequency: 'quarterly',
        rentalFrequency: 'monthly',
      });
    }
  }, [editingDefinition, reset]);

  const handleFormSubmit = (data: AssetDefinitionFormData) => {
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
      
      // Price fields
      currentPrice: data.currentPrice || undefined,
      lastPriceUpdate: data.lastPriceUpdate || undefined,
    };

    // Add dividend info if enabled
    if (data.hasDividend && data.dividendAmount && data.dividendAmount > 0) {
      definitionData.dividendInfo = {
        frequency: data.dividendFrequency as DividendFrequency,
        amount: data.dividendAmount,
        currency: data.currency,
        paymentMonths: data.dividendPaymentMonths && data.dividendPaymentMonths.length > 0 ? data.dividendPaymentMonths : undefined,
        customAmounts: data.dividendCustomAmounts && Object.keys(data.dividendCustomAmounts).length > 0 ? data.dividendCustomAmounts : undefined,
      };
    }

    // Add rental info if enabled
    if (data.hasRental && data.rentalAmount && data.rentalAmount > 0) {
      definitionData.rentalInfo = {
        baseRent: data.rentalAmount,
        frequency: data.rentalFrequency as PaymentFrequency,
        currency: data.currency,
        months: data.rentalPaymentMonths && data.rentalPaymentMonths.length > 0 ? data.rentalPaymentMonths : undefined,
        customAmounts: data.rentalCustomAmounts && Object.keys(data.rentalCustomAmounts).length > 0 ? data.rentalCustomAmounts : undefined,
      };
    }

    // Add bond info if enabled
    if (data.hasBond && data.interestRate && data.interestRate > 0) {
      definitionData.bondInfo = {
        interestRate: data.interestRate,
        maturityDate: data.maturityDate || undefined,
        nominalValue: data.nominalValue || undefined,
        currency: data.currency,
      };
    }

    onSubmit(definitionData);
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <StandardFormWrapper
        title={editingDefinition ? t('assetDefinitions.editDefinition') : t('assetDefinitions.addDefinition')}
        onSubmit={handleSubmit(handleFormSubmit)}
      >
      <RequiredSection>
        <FormGrid columns={{ xs: '1fr', sm: '1fr' }}>
          <StandardFormField
            label={t('assets.fullName')}
            name="fullName"
            required
            error={errors.fullName?.message}
            value={watch('fullName')}
            onChange={(value) => setValue('fullName', value)}
            placeholder={t('assets.fullNamePlaceholder')}
          />

          <StandardFormField
            label={t('assets.ticker')}
            name="ticker"
            value={watch('ticker')}
            onChange={(value) => setValue('ticker', value)}
            placeholder={t('assets.tickerPlaceholder')}
          />

          <StandardFormField
            label={t('assets.type')}
            name="type"
            type="select"
            required
            options={getAssetTypeOptions(t)}
            error={errors.type?.message}
            value={watch('type')}
            onChange={(value) => setValue('type', value)}
          />

          <StandardFormField
            label={t('assets.riskLevel')}
            name="riskLevel"
            type="select"
            options={getRiskLevelOptions(t)}
            value={watch('riskLevel')}
            onChange={(value) => setValue('riskLevel', value)}
          />

          <StandardFormField
            label={t('assets.country')}
            name="country"
            value={watch('country')}
            onChange={(value) => setValue('country', value)}
            placeholder={t('assets.countryPlaceholder')}
          />

          <StandardFormField
            label={t('assets.sector')}
            name="sector"
            value={watch('sector')}
            onChange={(value) => setValue('sector', value)}
            placeholder={t('assets.sectorPlaceholder')}
          />

          <StandardFormField
            label={t('assets.currency')}
            name="currency"
            value={watch('currency')}
            onChange={(value) => setValue('currency', value)}
            placeholder="EUR"
          />

          <StandardFormField
            label={t('assets.currentPrice')}
            name="currentPrice"
            type="number"
            value={watch('currentPrice')}
            onChange={(value) => setValue('currentPrice', value)}
            step={0.01}
            min={0}
            placeholder={t('assets.currentPricePlaceholder')}
          />
        </FormGrid>
      </RequiredSection>

      <OptionalSection title={t('assets.dividendInformation')}>
        <FormGrid columns={{ xs: '1fr', sm: '1fr' }}>
          <StandardFormField
            label={t('assets.hasDividend')}
            name="hasDividend"
            type="checkbox"
            value={watch('hasDividend')}
            onChange={(value) => setValue('hasDividend', value)}
          />

          {hasDividend && (
            <>
              <StandardFormField
                label={t('assets.dividendAmount')}
                name="dividendAmount"
                type="number"
                value={watch('dividendAmount')}
                onChange={(value) => setValue('dividendAmount', value)}
                step={0.01}
                min={0}
              />

              <StandardFormField
                label={t('assets.dividendFrequency')}
                name="dividendFrequency"
                type="select"
                options={[
                  { value: 'monthly', label: t('paymentFrequency.monthly') },
                  { value: 'quarterly', label: t('paymentFrequency.quarterly') },
                  { value: 'annually', label: t('paymentFrequency.annually') },
                  { value: 'custom', label: t('paymentFrequency.custom') }
                ]}
                value={watch('dividendFrequency')}
                onChange={(value) => setValue('dividendFrequency', value)}
              />
            </>
          )}
        </FormGrid>

        {/* Dividend Month Selection */}
        {hasDividend && dividendFrequency && (dividendFrequency === 'quarterly' || dividendFrequency === 'annually' || dividendFrequency === 'custom') && (
          <div style={{ marginTop: '16px' }}>
            <MonthSelector
              selectedMonths={dividendPaymentMonths}
              onChange={handleDividendMonthChange}
              label={
                dividendFrequency === 'quarterly' 
                  ? t('assets.selectQuarterlyMonths')
                  : dividendFrequency === 'annually'
                  ? t('assets.selectAnnualMonth')
                  : t('assets.selectDividendMonths')
              }
            />
          </div>
        )}

        {/* Custom Dividend Amounts */}
        {hasDividend && dividendFrequency === 'custom' && (
          <CustomAmountsSection
            frequency={dividendFrequency}
            selectedMonths={dividendPaymentMonths}
            customAmounts={dividendCustomAmounts}
            onAmountChange={handleDividendCustomAmountChange}
            title={t('assets.customDividendAmounts')}
            currency={watch('currency') || 'EUR'}
          />
        )}
      </OptionalSection>

      {selectedType === 'real_estate' && (
        <OptionalSection title={t('assets.rentalInformation')}>
          <FormGrid columns={{ xs: '1fr', sm: '1fr' }}>
            <StandardFormField
              label={t('assets.hasRental')}
              name="hasRental"
              type="checkbox"
              value={watch('hasRental')}
              onChange={(value) => setValue('hasRental', value)}
            />

            {hasRental && (
              <>
                <StandardFormField
                  label={t('assets.rentalAmount')}
                  name="rentalAmount"
                  type="number"
                  value={watch('rentalAmount')}
                  onChange={(value) => setValue('rentalAmount', value)}
                  step={0.01}
                  min={0}
                />

                <StandardFormField
                  label={t('assets.rentalFrequency')}
                  name="rentalFrequency"
                  type="select"
                  options={[
                    { value: 'monthly', label: t('paymentFrequency.monthly') },
                    { value: 'quarterly', label: t('paymentFrequency.quarterly') },
                    { value: 'annually', label: t('paymentFrequency.annually') },
                    { value: 'custom', label: t('paymentFrequency.custom') }
                  ]}
                  value={watch('rentalFrequency')}
                  onChange={(value) => setValue('rentalFrequency', value)}
                />
              </>
            )}
          </FormGrid>

          {/* Rental Month Selection */}
          {hasRental && rentalFrequency && (rentalFrequency === 'quarterly' || rentalFrequency === 'annually' || rentalFrequency === 'custom') && (
            <div style={{ marginTop: '16px' }}>
              <MonthSelector
                selectedMonths={rentalPaymentMonths}
                onChange={handleRentalMonthChange}
                label={
                  rentalFrequency === 'quarterly' 
                    ? t('assets.selectQuarterlyMonths')
                    : rentalFrequency === 'annually'
                    ? t('assets.selectAnnualMonth')
                    : t('assets.selectRentalMonths')
                }
              />
            </div>
          )}

          {/* Custom Rental Amounts */}
          {hasRental && rentalFrequency === 'custom' && (
            <CustomAmountsSection
              frequency={rentalFrequency}
              selectedMonths={rentalPaymentMonths}
              customAmounts={rentalCustomAmounts}
              onAmountChange={handleRentalCustomAmountChange}
              title={t('assets.customRentalAmounts')}
              currency={watch('currency') || 'EUR'}
            />
          )}
        </OptionalSection>
      )}

      {selectedType === 'bond' && (
        <OptionalSection title={t('assets.bondInformation')}>
          <FormGrid columns={{ xs: '1fr', sm: '1fr' }}>
            <StandardFormField
              label={t('assets.hasBondInfo')}
              name="hasBond"
              type="checkbox"
              value={watch('hasBond')}
              onChange={(value) => setValue('hasBond', value)}
            />

            {hasBond && (
              <>
                <StandardFormField
                  label={t('assets.interestRate')}
                  name="interestRate"
                  type="number"
                  value={watch('interestRate')}
                  onChange={(value) => setValue('interestRate', value)}
                  step={0.01}
                  min={0}
                />

                <StandardFormField
                  label={t('assets.maturityDate')}
                  name="maturityDate"
                  type="date"
                  value={watch('maturityDate')}
                  onChange={(value) => setValue('maturityDate', value)}
                />

                <StandardFormField
                  label={t('assets.nominalValue')}
                  name="nominalValue"
                  type="number"
                  value={watch('nominalValue')}
                  onChange={(value) => setValue('nominalValue', value)}
                  step={0.01}
                  min={0}
                />
              </>
            )}
          </FormGrid>
        </OptionalSection>
      )}

      <OptionalSection title={t('common.additionalInformation')}>
        <FormGrid columns={{ xs: '1fr', sm: '1fr' }}>
          <StandardFormField
            label={t('assets.exchange')}
            name="exchange"
            value={watch('exchange')}
            onChange={(value) => setValue('exchange', value)}
            placeholder={t('assets.exchangePlaceholder')}
          />

          <StandardFormField
            label={t('assets.isin')}
            name="isin"
            value={watch('isin')}
            onChange={(value) => setValue('isin', value)}
            placeholder={t('assets.isinPlaceholder')}
          />

          <StandardFormField
            label={t('assets.wkn')}
            name="wkn"
            value={watch('wkn')}
            onChange={(value) => setValue('wkn', value)}
            placeholder={t('assets.wknPlaceholder')}
          />

          <StandardFormField
            label={t('assets.description')}
            name="description"
            type="textarea"
            value={watch('description')}
            onChange={(value) => setValue('description', value)}
            placeholder={t('assets.descriptionPlaceholder')}
            rows={3}
            gridColumn="1 / -1"
          />
        </FormGrid>
      </OptionalSection>
    </StandardFormWrapper>
    </Modal>
  );
};
