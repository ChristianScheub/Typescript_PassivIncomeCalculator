import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormGrid, StandardFormField } from '../forms/FormGrid';
import { RequiredSection } from '../forms/StandardFormWrapper';
import { getAssetTypeOptions } from '../../constants';
import { BasicAssetInformationProps } from '../../types/shared/ui/asset-sections';

export const BasicAssetInformation: React.FC<BasicAssetInformationProps> = ({
  watch,
  setValue,
  errors,
  isDefinition = false
}) => {
  const { t } = useTranslation();

  return (
    <RequiredSection>
      <FormGrid columns={{ xs: "1fr", sm: "1fr" }}>
        <StandardFormField
          label={t(isDefinition ? "assets.fullName" : "assets.name")}
          name={isDefinition ? "fullName" : "name"}
          required
          error={errors[isDefinition ? "fullName" : "name"]?.message}
          value={watch(isDefinition ? "fullName" : "name")}
          onChange={(value) => setValue(isDefinition ? "fullName" : "name", value)}
          placeholder={t(isDefinition ? "assets.fullNamePlaceholder" : "assets.namePlaceholder")}
        />

        <StandardFormField
          label={t("assets.type")}
          name="type"
          type="select"
          required
          options={getAssetTypeOptions(t)}
          error={errors.type?.message}
          value={watch("type")}
          onChange={(value) => setValue("type", value as AssetType)}
        />

        <StandardFormField
          label={t("assets.riskLevel")}
          name="riskLevel"
          type="select"
          options={[
            { value: "low", label: t("assets.riskLevels.low") },
            { value: "medium", label: t("assets.riskLevels.medium") },
            { value: "high", label: t("assets.riskLevels.high") },
          ]}
          value={watch("riskLevel")}
          onChange={(value) => setValue("riskLevel", value)}
        />

        {watch("type") !== "real_estate" && (
          <StandardFormField
            label={t("assets.ticker")}
            name="ticker"
            value={watch("ticker")}
            onChange={(value) => setValue("ticker", value)}
            placeholder={t("assets.tickerPlaceholder")}
          />
        )}
      </FormGrid>
    </RequiredSection>
  );
};
