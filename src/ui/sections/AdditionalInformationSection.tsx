import React from 'react';
import { UseFormSetValue } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FormGrid, StandardFormField } from '../forms/FormGrid';
import { OptionalSection } from '../forms/StandardFormWrapper';

interface AdditionalInformationSectionProps {
  watch: (field: string) => any;
  setValue: UseFormSetValue<any>;
  showExchange?: boolean;
}

export const AdditionalInformationSection: React.FC<AdditionalInformationSectionProps> = ({
  watch,
  setValue,
  showExchange = true
}) => {
  const { t } = useTranslation();

  return (
    <OptionalSection title={t("common.additionalInformation")}>
      <FormGrid columns={{ xs: "1fr", sm: "1fr" }}>
        {showExchange && (
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
          value={watch("description")}
          onChange={(value) => setValue("description", value)}
          placeholder={t("assets.descriptionPlaceholder")}
          rows={3}
          gridColumn="1 / -1"
        />

        <StandardFormField
          label={t("common.notes")}
          name="notes"
          type="textarea"
          value={watch("notes")}
          onChange={(value) => setValue("notes", value)}
          placeholder={t("common.notesPlaceholder")}
          rows={3}
          gridColumn="1 / -1"
        />
      </FormGrid>
    </OptionalSection>
  );
};
