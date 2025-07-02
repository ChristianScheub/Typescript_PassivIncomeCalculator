import React from "react";
import { useTranslation } from "react-i18next";
import { FormGrid, StandardFormField } from "../forms/FormGrid";
import { AssetType } from "@/types/shared/";
import { UseFormSetValue } from "react-hook-form";

interface AdditionalInformationSectionProps {
  watch: (field: string) => any;
  setValue: ((name: string, value: any) => void) | UseFormSetValue<any>;
  selectedType: AssetType;
}

export const AdditionalInformationSection: React.FC<AdditionalInformationSectionProps> = ({
  watch,
  setValue,
  selectedType,
}) => {
  const { t } = useTranslation();

  return (
    <FormGrid columns={{ xs: "1fr", sm: "1fr" }}>
      {selectedType === "stock" && (
        <>
          <StandardFormField
            label={t("assets.exchange")}
            name="exchange"
            value={watch("exchange")}
            onChange={(value) => setValue("exchange", value)}
            placeholder={t("assets.exchangePlaceholder")}
          />

          <StandardFormField
            label={t("assets.isin")}
            name="isin"
            value={watch("isin")}
            onChange={(value) => setValue("isin", value)}
            placeholder={t("assets.isinPlaceholder")}
          />

          <StandardFormField
            label={t("assets.wkn")}
            name="wkn"
            value={watch("wkn")}
            onChange={(value) => setValue("wkn", value)}
            placeholder={t("assets.wknPlaceholder")}
          />
        </>
      )}

      <StandardFormField
        label={t("assets.description")}
        name="description"
        type="textarea"
        value={watch("description")}          onChange={(value) => setValue("description", value)}
        placeholder={t("assets.descriptionPlaceholder")}
        rows={3}
        gridColumn="1 / -1"
      />
    </FormGrid>
  );
};
