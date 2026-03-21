import React from 'react';
import { AssetType } from '@/types/shared/base/enums';
import { UseFormSetValue, FieldErrors } from 'react-hook-form';
import type { AssetFormData } from '@/types/domains/forms/form-data';
import {
  StandardFormField,
  StandardFormWrapper,
  OptionalSection,
  RequiredSection
} from "@/ui/portfolioHub/forms";
import { BasicAssetInformation } from '@/ui/portfolioHub/forms/sections';
import { AssetSpecificFields } from '@/ui/portfolioHub/forms/AssetSpecificFields';
import { AdditionalInformationSection } from '@ui/portfolioHub';
import { useTranslation } from 'react-i18next';
import { useFormMode } from '@/ui/portfolioHub/forms/FormModeContext';

interface MaterialAssetFormViewProps {
  assetType: AssetType;
  quantity?: number;
  currentPrice?: number;
  errors: FieldErrors<AssetFormData>;
  watch: (field: string) => unknown;
  setValue: UseFormSetValue<AssetFormData>;
  onFormSubmit: () => void;
  title: string;
}

export const MaterialAssetFormView: React.FC<MaterialAssetFormViewProps> = ({
  assetType,
  quantity,
  currentPrice,
  errors,
  watch,
  setValue,
  onFormSubmit,
  title
}) => {
  const { t } = useTranslation();
  const formRef = React.useRef<HTMLFormElement>(null);
  const { quickMode } = useFormMode();

  /** Returns the single most relevant price/value field for Quick Mode */
  const renderQuickPriceField = () => {
    switch (assetType) {
      case 'stock':
        return (
          <StandardFormField
            label={t('assets.form.currentPrice')}
            name="currentPrice"
            type="number"
            required
            error={errors.currentPrice?.message as string | undefined}
            value={watch('currentPrice') as number | undefined}
            onChange={(v) => setValue('currentPrice', v as number)}
            placeholder={t('common.zeroAmountPlaceholder')}
            step={0.01}
            min={0}
          />
        );
      case 'real_estate':
        return (
          <StandardFormField
            label={t('assets.form.propertyValue')}
            name="propertyValue"
            type="number"
            required
            error={errors.propertyValue?.message as string | undefined}
            value={watch('propertyValue') as number | undefined}
            onChange={(v) => setValue('propertyValue', v as number)}
            placeholder={t('common.zeroAmountPlaceholder')}
            step={0.01}
            min={0}
          />
        );
      case 'bond':
        return (
          <StandardFormField
            label={t('assets.form.nominalValue')}
            name="nominalValue"
            type="number"
            required
            error={errors.nominalValue?.message as string | undefined}
            value={watch('nominalValue') as number | undefined}
            onChange={(v) => setValue('nominalValue', v as number)}
            placeholder={t('common.zeroAmountPlaceholder')}
            step={0.01}
            min={0}
          />
        );
      case 'crypto':
        return (
          <StandardFormField
            label={t('assets.form.acquisitionCost')}
            name="acquisitionCost"
            type="number"
            required
            error={errors.acquisitionCost?.message as string | undefined}
            value={watch('acquisitionCost') as number | undefined}
            onChange={(v) => setValue('acquisitionCost', v as number)}
            placeholder={t('common.zeroAmountPlaceholder')}
            step={0.01}
            min={0}
          />
        );
      default:
        return (
          <StandardFormField
            label={t('assets.form.value')}
            name="value"
            type="number"
            required
            error={errors.value?.message}
            value={watch('value') as number | undefined}
            onChange={(v) => setValue('value', v as number)}
            placeholder={t('common.zeroAmountPlaceholder')}
            step={0.01}
            min={0}
          />
        );
    }
  };

  return (
    <StandardFormWrapper
      title={title}
      onSubmit={onFormSubmit}
      backgroundColor="linear-gradient(135deg, rgba(25, 118, 210, 0.03) 0%, rgba(156, 39, 176, 0.03) 100%)"
      formRef={formRef}
    >
      <RequiredSection>
        <BasicAssetInformation 
          watch={watch as <K extends keyof AssetFormData>(field: K) => AssetFormData[K]}
          setValue={setValue}
          errors={errors}
          isDefinition={false}
        />

        {quickMode
          ? renderQuickPriceField()
          : assetType !== 'stock' && (
              <StandardFormField
                label={t('assets.form.value')}
                name="value"
                type="number"
                required
                error={errors.value?.message}
                value={watch('value') as number | undefined}
                onChange={(value) => setValue('value', value as number)}
                placeholder={t('common.zeroAmountPlaceholder')}
                step={0.01}
                min={0}
              />
            )
        }
      </RequiredSection>

      <AssetSpecificFields
        assetType={assetType}
        quantity={quantity}
        currentPrice={currentPrice}
        watch={watch}
        setValue={setValue}
      />

      <OptionalSection title={t('common.additionalInformation')}>
        <AdditionalInformationSection
          watch={watch}
          setValue={setValue}
          selectedType={assetType}
        />
      </OptionalSection>
    </StandardFormWrapper>
  );
};
