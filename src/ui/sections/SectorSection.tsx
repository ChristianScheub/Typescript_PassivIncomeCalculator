import React from 'react';
import { UseFormSetValue } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { OptionalSection } from '../forms/StandardFormWrapper';
import { SectorAllocation } from '../../types';

interface SectorSectionProps {
  watch: (field: string) => any;
  setValue: UseFormSetValue<any>;
  sectors: SectorAllocation[];
  setSectors: React.Dispatch<React.SetStateAction<SectorAllocation[]>>;
  usesMultipleSectors?: boolean;
}

export const SectorSection: React.FC<SectorSectionProps> = ({
  watch,
  setValue,
  sectors,
  setSectors,
  usesMultipleSectors = false
}) => {
  const { t } = useTranslation();

  const addSector = () => {
    const newSectors = [...sectors, { sectorName: "", percentage: 0 }];
    setSectors(newSectors);
    setValue("sectors", newSectors);
  };

  const removeSector = (index: number) => {
    const newSectors = sectors.filter((_, i) => i !== index);
    setSectors(newSectors);
    setValue("sectors", newSectors);
  };

  const updateSector = (
    index: number,
    field: "sectorName" | "percentage",
    value: string | number
  ) => {
    const newSectors = [...sectors];
    newSectors[index] = { ...newSectors[index], [field]: value };
    setSectors(newSectors);
    setValue("sectors", newSectors);
  };

  const calculateTotalPercentage = () => {
    return sectors.reduce(
      (total, sector) => total + (sector.percentage || 0),
      0
    );
  };

  if (!usesMultipleSectors) {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
          {t("assets.sector")}
        </label>
        <input
          type="text"
          value={watch("sector")}
          onChange={(e) => setValue("sector", e.target.value)}
          placeholder={t("assets.sectorPlaceholder")}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
      </div>
    );
  }

  return (
    <OptionalSection title={t("assets.sectors")}>
      <div className="space-y-4">
        {sectors.map((sector, index) => {
          // Generate stable key using sector name when available, fallback to index
          const stableKey = sector.sectorName.trim() 
            ? `sector-${sector.sectorName.trim()}-${index}` 
            : `sector-empty-${index}`;
          
          return (
            <div key={stableKey} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  {t("assets.sectorName")} {index + 1}
                </label>
                <input
                  type="text"
                  placeholder={t("assets.sectorPlaceholder")}
                  value={sector.sectorName}
                  onChange={(e) =>
                    updateSector(index, "sectorName", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  {t("assets.percentage")} (%)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="0"
                    value={sector.percentage}
                    onChange={(e) =>
                      updateSector(
                        index,
                        "percentage",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    min="0"
                    max="100"
                    step="0.1"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                  {sectors.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSector(index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded border border-red-300 dark:border-red-600"
                    >
                      {t("common.remove")}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={addSector}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {t("assets.addSector")}
          </button>
          <div className="text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {t("assets.total")}:
            </span>
            <span
              className={`ml-1 font-medium ${
                Math.abs(calculateTotalPercentage() - 100) < 0.01
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {calculateTotalPercentage().toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <label className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            checked={watch("useMultipleSectors")}
            onChange={(e) => {
              setValue("useMultipleSectors", e.target.checked);
              if (
                e.target.checked &&
                sectors.length === 1 &&
                sectors[0].sectorName === ""
              ) {
                setSectors([{ sectorName: "", percentage: 100 }]);
              }
            }}
            className="form-checkbox h-4 w-4 text-blue-600"
          />
          <span>{t("assets.useMultipleSectors")}</span>
        </label>
      </div>
    </OptionalSection>
  );
};
