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
        
        {assetType !== 'stock' && (
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
        )}
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
