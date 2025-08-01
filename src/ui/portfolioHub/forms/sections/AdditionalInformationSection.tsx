import React from "react";
import { useTranslation } from "react-i18next";
import { FormGrid, StandardFormField } from "../FormGrid";
import { AssetType } from "@/types/shared/";
import { UseFormSetValue, UseFormWatch, FieldValues } from "react-hook-form";
import { AssetFormData } from "@/types/domains/forms/form-data";

interface AdditionalInformationSectionProps<T extends FieldValues = AssetFormData> {
  watch: UseFormWatch<T>;
  setValue: UseFormSetValue<T>;
  selectedType: AssetType;
}

export const AdditionalInformationSection: React.FC<AdditionalInformationSectionProps<AssetFormData>> = ({
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
