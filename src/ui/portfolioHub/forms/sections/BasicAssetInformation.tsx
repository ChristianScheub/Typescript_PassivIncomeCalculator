import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FormGrid, StandardFormField } from '../FormGrid';
import { RequiredSection } from '../StandardFormWrapper';
import { getAssetTypeOptions } from '../../../../constants';
import { BasicAssetInformationProps } from '@/types/shared/ui/asset-sections';
import { AssetType } from '@/types/shared/base/enums';
import { Button } from "../../../shared/Button";
import { Toggle } from '@/ui/shared';

export function getErrorMessage(error: any): string | undefined {
  if (!error) return undefined;
  if (typeof error === 'string') return error;
  if (typeof error.message === 'string') return error.message;
  return undefined;
}

export const BasicAssetInformation: React.FC<BasicAssetInformationProps> = ({
  watch,
  setValue,
  errors,
  isDefinition = false
}) => {
  const { t } = useTranslation();

  // Multi-country state and handlers
  const [multiCountry, setMultiCountry] = useState(false);
  const [countries, setCountries] = useState([{ id: Date.now(), country: watch('country') || '', percentage: 100 }]);

  // Synchronisiere countries, wenn sich das Land im Formular ändert (z.B. durch Reset)
  React.useEffect(() => {
    // Nur wenn nicht multiCountry, damit User-Eingaben nicht überschrieben werden
    if (!multiCountry) {
      setCountries([{ id: Date.now(), country: watch('country') || '', percentage: 100 }]);
    }
    // eslint-disable-next-line
  }, [watch('country')]);

  const handleCountryChange = (id: number, field: 'country' | 'percentage', value: string | number) => {
    setCountries(prev => {
      const updated = [...prev];
      const index = updated.findIndex(country => country.id === id);
      if (index !== -1) {
        updated[index] = { ...updated[index], [field]: value };
      }
      if (!multiCountry && field === 'country') {
        setValue('country', value as string);
      }
      return updated;
    });
  };

  const addCountry = () => {
    setCountries(prev => [...prev, { id: Date.now(), country: '', percentage: 0 }]);
  };

  const removeCountry = (id: number) => {
    setCountries(prev => prev.filter(country => country.id !== id));
  };

  const totalPercentage = countries.reduce((sum, c) => sum + (typeof c.percentage === 'number' ? c.percentage : 0), 0);

  React.useEffect(() => {
    if (!multiCountry && countries[0]?.country) {
      setValue('country', countries[0].country);
    }
    if (multiCountry) {
      setValue('countries', countries);
    } else {
      setValue('countries', undefined);
    }
    // eslint-disable-next-line
  }, [multiCountry, countries]);

  return (
    <RequiredSection>
      <FormGrid columns={{ xs: "1fr", sm: "1fr" }}>
        <StandardFormField
          label={t(isDefinition ? "assets.fullName" : "assets.name")}
          name={isDefinition ? "fullName" : "name"}
          required
          error={getErrorMessage(errors[isDefinition ? "fullName" : "name"])}
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
          error={getErrorMessage(errors.type)}
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

        {/* Country section with multi-country support */}
        {!multiCountry && (
          <>
            <StandardFormField
              label={t("assets.country")}
              name="country"
              value={countries[0]?.country || ''}
              onChange={v => handleCountryChange(countries[0].id, 'country', v as string)}
              placeholder={t("assets.countryPlaceholder")}
              error={getErrorMessage(errors.country)}
            />
            <div className="flex items-center mb-2 mt-2">
              <Toggle
                checked={multiCountry}
                onChange={setMultiCountry}
                id="multiCountry"
                label={t('assets.useMultipleCountries') || 'Mehrere Länder'}
              />
              <span className="ml-3 text-gray-700 dark:text-gray-300">{t('assets.useMultipleCountries') || 'Mehrere Länder'}</span>
            </div>
          </>
        )}
        {multiCountry && (
          <>
            <div className="flex items-center mb-2 mt-2">
              <Toggle
                checked={multiCountry}
                onChange={setMultiCountry}
                id="multiCountry"
                label={t('assets.useMultipleCountries') || 'Mehrere Länder'}
              />
              <span className="ml-3 text-gray-700 dark:text-gray-300">{t('assets.useMultipleCountries') || 'Mehrere Länder'}</span>
            </div>
            {countries.map((c) => (
              <div key={c.id} className="flex items-center gap-2 mb-2">
                <StandardFormField
                  label={t('assets.country')}
                  name={`countries[${c.id}].country`}
                  value={c.country}
                  onChange={v => handleCountryChange(c.id, 'country', v as string)}
                />
                <StandardFormField
                  label={t('assets.percentage')}
                  name={`countries[${c.id}].percentage`}
                  type="number"
                  value={c.percentage}
                  onChange={v => handleCountryChange(c.id, 'percentage', Number(v))}
                  min={0}
                  max={100}
                />
                {countries.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="iconSm"
                    aria-label={t('common.remove')}
                    onClick={() => removeCountry(c.id)}
                  >
                    <span aria-hidden>✕</span>
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="link"
              size="sm"
              className="mb-2"
              onClick={addCountry}
            >
              {t('common.add')}
            </Button>
            <div className="text-xs text-gray-500">
              {t('assets.totalPercentage') || 'Summe'}: {totalPercentage}%
              {totalPercentage !== 100 && <span className="text-red-500 ml-2">({t('assets.percentageMustBe100') || 'Summe muss 100% sein'})</span>}
            </div>
          </>
        )}
      </FormGrid>
    </RequiredSection>
  );
};
