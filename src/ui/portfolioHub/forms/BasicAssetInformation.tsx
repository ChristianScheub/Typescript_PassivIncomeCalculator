import React from "react";
import { useTranslation } from "react-i18next";
import { AssetType } from "@/types/shared/";
import { FormGrid, StandardFormField } from "../forms/FormGrid";
import { getAssetTypeOptions } from "../../../constants";

interface BasicAssetInformationProps {
  fullName: string;
  ticker?: string;
  type: AssetType;
  riskLevel?: "low" | "medium" | "high";
  country?: string;
  currentPrice?: number;
  showTicker?: boolean;
  errors: Record<string, unknown>;
  onChange: (field: string, value: unknown) => void;
}

export const BasicAssetInformation: React.FC<BasicAssetInformationProps> = ({
  fullName,
  ticker,
  type,
  riskLevel,
  country,
  currentPrice,
  showTicker = true,
  errors,
  onChange,
}) => {
  const { t } = useTranslation();

  const getRiskLevelOptions = () => [
    { value: "low", label: t("assets.riskLevels.low") },
    { value: "medium", label: t("assets.riskLevels.medium") },
    { value: "high", label: t("assets.riskLevels.high") },
  ];

  return (
    <FormGrid columns={{ xs: "1fr", sm: "1fr" }}>
      <StandardFormField
        label={t("assets.fullName")}
        name="fullName"
        required
        error={errors.fullName?.message}
        value={fullName}
        onChange={(value) => onChange("fullName", value)}
        placeholder={t("assets.fullNamePlaceholder")}
      />

      {showTicker && (
        <StandardFormField
          label={t("assets.ticker")}
          name="ticker"
          value={ticker}
          onChange={(value) => onChange("ticker", value)}
          placeholder={t("assets.tickerPlaceholder")}
        />
      )}

      <StandardFormField
        label={t("assets.type")}
        name="type"
        type="select"
        required
        options={getAssetTypeOptions(t)}
        error={errors.type?.message}
        value={type}
        onChange={(value) => onChange("type", value)}
      />

      <StandardFormField
        label={t("assets.riskLevel")}
        name="riskLevel"
        type="select"
        options={getRiskLevelOptions()}
        value={riskLevel}
        onChange={(value) => onChange("riskLevel", value)}
      />

      <StandardFormField
        label={t("assets.country")}
        name="country"
        value={country}
        onChange={(value) => onChange("country", value)}
        placeholder={t("assets.countryPlaceholder")}
      />

      <StandardFormField
        label={t("assets.currentPrice")}
        name="currentPrice"
        type="number"
        value={currentPrice}
        onChange={(value) => onChange("currentPrice", value)}
        step={0.01}
        min={0}
        placeholder={t("assets.currentPricePlaceholder")}
      />
    </FormGrid>
  );
};
