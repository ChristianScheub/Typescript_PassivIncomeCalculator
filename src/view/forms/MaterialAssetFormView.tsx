import React from 'react';
import { AssetType, DividendFrequency } from '../../types';
import { UseFormSetValue } from 'react-hook-form';
import { 
  StandardFormWrapper,
  RequiredSection,
  OptionalSection,
  FormGrid,
  StandardFormField
} from '../../ui/forms/StandardFormWrapper';
import { AssetSpecificFields } from '../../ui/specialized/AssetSpecificFields';
import { useTranslation } from 'react-i18next';

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

  return (
    <StandardFormWrapper
      title={title}
      onSubmit={onFormSubmit}
      backgroundColor="linear-gradient(135deg, rgba(25, 118, 210, 0.03) 0%, rgba(156, 39, 176, 0.03) 100%)"
      formRef={formRef}
    >
      <RequiredSection>
        <FormGrid>
          <StandardFormField
            label={t('common.name')}
            name="name"
            required
            error={errors.name?.message}
            value={watch('name')}
            onChange={(value) => setValue('name', value)}
            placeholder={t('assets.form.enterAssetName')}
          />
          
          <StandardFormField
            label={t('common.type')}
            name="type"
            type="select"
            required
            options={assetTypeOptions}
            error={errors.type?.message}
            value={watch('type')}
            onChange={(value) => setValue('type', value as AssetType)}
          />
          
          {assetType !== 'stock' && (
            <StandardFormField
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
            />
          )}
        </FormGrid>
      </RequiredSection>

      <AssetSpecificFields
        assetType={assetType}
        dividendFrequency={dividendFrequency}
        quantity={quantity}
        currentPrice={currentPrice}
        watch={watch}
        setValue={setValue}
        paymentFields={paymentFields}
        handleMonthChange={handleMonthChange}
      />

      <OptionalSection title={t('common.additionalInformation')}>
        <FormGrid>
          <StandardFormField
            label={t('assets.form.purchaseDate')}
            name="purchaseDate"
            type="date"
            value={watch('purchaseDate')}
            onChange={(value) => setValue('purchaseDate', value)}
          />
          
          <StandardFormField
            label={t('assets.form.country')}
            name="country"
            value={watch('country')}
            onChange={(value) => setValue('country', value)}
            placeholder={t('assets.form.countryPlaceholder')}
          />
          
          <StandardFormField
            label={t('assets.form.continent')}
            name="continent"
            value={watch('continent')}
            onChange={(value) => setValue('continent', value)}
            placeholder={t('assets.form.continentPlaceholder')}
          />
          
          <StandardFormField
            label={t('assets.form.sector')}
            name="sector"
            value={watch('sector')}
            onChange={(value) => setValue('sector', value)}
            placeholder={t('assets.form.sectorPlaceholder')}
          />
          
          <StandardFormField
            label={t('common.notes')}
            name="notes"
            value={watch('notes')}
            onChange={(value) => setValue('notes', value)}
            placeholder={t('common.notesPlaceholder')}
            gridColumn="1 / -1"
          />
        </FormGrid>
      </OptionalSection>
    </StandardFormWrapper>
  );
};
