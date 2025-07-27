import React from "react";
import { useTranslation } from "react-i18next";
import { OptionalSection } from "../StandardFormWrapper";
import { UseFormSetValue, FieldValues } from "react-hook-form";
import { SectorAllocation } from "@/types/domains/portfolio/allocations";
import { AssetFormData } from "@/types/domains/forms/form-data";

interface SectorSectionProps<T extends FieldValues = AssetFormData> {
  setValue: UseFormSetValue<T>;
  sectors: SectorAllocation[];
  setSectors: (sectors: SectorAllocation[]) => void;
  updateSector: (index: number, field: "sector" | "percentage", value: string | number) => void;
}

export const SectorSection: React.FC<SectorSectionProps<AssetFormData>> = ({
  setValue,
  sectors,
  setSectors,
  updateSector,
}) => {
  const { t } = useTranslation();

  const addSector = () => {
    const newSectors = [...sectors, { sector: "", value: 0, percentage: 0, count: 0 }];
    setSectors(newSectors);
    setValue("sectors", newSectors);
  };

  const removeSector = (index: number) => {
    const newSectors = sectors.filter((_, i) => i !== index);
    setSectors(newSectors);
    setValue("sectors", newSectors);
  };

  const calculateTotalPercentage = () => {
    return sectors.reduce(
      (total: number, sector: SectorAllocation) => total + (sector.percentage || 0),
      0
    );
  };

  return (
    <OptionalSection title={t("assets.sectors")}>
      <div className="space-y-4">
        {sectors.map((sector: SectorAllocation, index: number) => (
          <div key={`sector-${sector.sector}-${index}`} className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                {t("assets.sectorName")} {index + 1}
              </label>
              <input
                type="text"
                placeholder={t("assets.sectorPlaceholder")}
                value={sector.sector}
                onChange={(e) => updateSector(index, "sector", e.target.value)}
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
                  onChange={(e) => updateSector(index, "percentage", parseFloat(e.target.value) || 0)}
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
        ))}

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
    </OptionalSection>
  );
};
