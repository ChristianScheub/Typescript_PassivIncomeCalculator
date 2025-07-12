import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AssetDefinition,
  AssetCategoryAssignment,
} from "@/types/domains/assets";
import {
  AssetType,
  DividendFrequency,
  PaymentFrequency,
} from "@/types/shared/base/enums";
import { updateAssetDefinitionPrice } from "../../../utils/priceHistoryUtils";
import { Modal } from "../../../ui/portfolioHub/dialog/Modal";
import { Toggle } from "../../../ui/shared/common/Toggle";
import { AssetCategoryAssignmentSelector } from "../../../ui/portfolioHub/forms/sections/AssetCategoryAssignmentSelector";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { useAppSelector } from "../../../hooks/redux";
import { BasicAssetInformation } from "../../../ui/portfolioHub/forms/sections";
import { SectorSection } from "../../../ui/portfolioHub/forms/sections/SectorSection";
import { AdditionalInformationSection } from "../../../ui/portfolioHub/forms/sections/AdditionalInformationSection";
import { AssetIncomeSection } from "@/ui/portfolioHub";
import {
  StandardFormField,
  StandardFormWrapper,
  OptionalSection,
  FormGrid,
} from "@/ui/portfolioHub/forms";
import { AssetFormData } from '@/types/domains/forms/form-data';
import { getErrorMessage } from "@ui/portfolioHub/forms/sections/BasicAssetInformation";

// Add useDividendApi to schema
const assetDefinitionSchema = z.object({
  fullName: z.string().min(1, "Name is required"),
  ticker: z.string().optional(),
  type: z.enum(["stock", "bond", "real_estate", "crypto", "cash", "other"]),
  country: z.string().optional(),
  continent: z.string().optional(),
  // sector: z.string().optional(), // removed
  // Multi-sector support only
  sectors: z
    .array(
      z.object({
        sectorName: z.string().min(1, "Sector name is required"),
        percentage: z.number().min(0.1).max(100),
      })
    )
    .optional(),
  exchange: z.string().optional(),
  isin: z.string().optional(),
  wkn: z.string().optional(),
  description: z.string().optional(),
  riskLevel: z.enum(["low", "medium", "high"]).optional(),

  // Price fields
  currentPrice: z.number().min(0).optional(),
  lastPriceUpdate: z.string().optional(),
  autoUpdatePrice: z.boolean().optional(),
  autoUpdateHistoricalPrices: z.boolean().optional(),

  // Dividend fields
  hasDividend: z.boolean().optional(),
  dividendAmount: z.number().min(0).optional(),
  dividendFrequency: z
    .enum(["monthly", "quarterly", "annually", "custom", "none"])
    .optional(),
  dividendMonths: z.array(z.number().min(1).max(12)).optional(),
  dividendCustomAmounts: z.record(z.string(), z.number()).optional(),
  dividendPaymentMonths: z.array(z.number().min(1).max(12)).optional(),

  // Rental fields
  hasRental: z.boolean().optional(),
  rentalAmount: z.number().min(0).optional(),
  rentalFrequency: z
    .enum(["monthly", "quarterly", "annually", "custom", "none"])
    .optional(),
  rentalMonths: z.array(z.number().min(1).max(12)).optional(),
  rentalCustomAmounts: z.record(z.string(), z.number()).optional(),
  rentalPaymentMonths: z.array(z.number().min(1).max(12)).optional(),

  // Bond fields
  hasBond: z.boolean().optional(),
  interestRate: z.number().min(0).max(100).optional(),
  maturityDate: z.string().optional(),
  nominalValue: z.number().min(0).optional(),

  // API fields
  useDividendApi: z.boolean().optional(),
});

// Type alias for form data from schema
type AssetDefinitionFormData = z.infer<typeof assetDefinitionSchema>;

// Type aliases for better maintainability
type CategoryAssignmentFormData = Omit<
  AssetCategoryAssignment,
  "id" | "createdAt" | "updatedAt"
>;
type OptionalAssetDefinition = AssetDefinition | null;

interface AssetDefinitionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data: Omit<AssetDefinition, "id" | "createdAt" | "updatedAt">,
    categoryAssignments: CategoryAssignmentFormData[]
  ) => void;
  editingDefinition?: OptionalAssetDefinition;
}

export const AssetDefinitionForm: React.FC<AssetDefinitionFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingDefinition,
}) => {
  const { t } = useTranslation();
  const [selectedType, setSelectedType] = useState<AssetType>("stock");
  const [categoryAssignments, setCategoryAssignments] = useState<
    Omit<AssetCategoryAssignment, "id" | "createdAt" | "updatedAt">[]
  >([]);
  const [sectors, setSectors] = useState<
    { sectorName: string; percentage: number }[]
  >([{ sectorName: "", percentage: 100 }]);

  // Get category data from Redux store
  const {
    categories,
    categoryOptions,
    categoryAssignments: allAssignments,
  } = useAppSelector((state) => state.assetCategories);

  // Get API configuration from Redux store
  const { enabled: isApiEnabled } = useAppSelector(
    (state) => state.config.apis.stock
  );

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<AssetFormData>({
    resolver: zodResolver(assetDefinitionSchema),
    defaultValues: editingDefinition
      ? {
          fullName: editingDefinition.fullName,
          ticker: editingDefinition.ticker || "",
          type: editingDefinition.type,
          country: editingDefinition.country || "",
          continent: editingDefinition.continent || "",
          // sector: editingDefinition.sector || "", // removed
          sectors: editingDefinition.sectors || [],
          exchange: editingDefinition.exchange || "",
          isin: editingDefinition.isin || "",
          wkn: editingDefinition.wkn || "",
          description: editingDefinition.description || "",
          riskLevel: editingDefinition.riskLevel || "medium",

          // Price fields
          currentPrice: editingDefinition.currentPrice || undefined,
          lastPriceUpdate: editingDefinition.lastPriceUpdate || undefined,
          autoUpdatePrice: editingDefinition.autoUpdatePrice || false,
          autoUpdateHistoricalPrices:
            editingDefinition.autoUpdateHistoricalPrices || false,

          // Dividend fields
          hasDividend: !!editingDefinition.dividendInfo,
          dividendAmount: editingDefinition.dividendInfo?.amount || 0,
          dividendFrequency:
            editingDefinition.dividendInfo?.frequency || "quarterly",
          dividendPaymentMonths:
            editingDefinition.dividendInfo?.paymentMonths ||
            editingDefinition.dividendInfo?.months ||
            [],
          dividendCustomAmounts:
            editingDefinition.dividendInfo?.customAmounts || {},

          hasRental: !!editingDefinition.rentalInfo,
          rentalAmount: editingDefinition.rentalInfo?.baseRent || 0,
          rentalFrequency: editingDefinition.rentalInfo?.frequency || "monthly",
          rentalPaymentMonths: editingDefinition.rentalInfo?.months || [],
          rentalCustomAmounts:
            editingDefinition.rentalInfo?.customAmounts || {},

          hasBond: !!editingDefinition.bondInfo,
          interestRate: editingDefinition.bondInfo?.interestRate || 0,
          maturityDate:
            editingDefinition.bondInfo?.maturityDate?.substring(0, 10) || "",
          nominalValue: editingDefinition.bondInfo?.nominalValue || 0,

          dividendMonths: editingDefinition.dividendInfo?.months || [],
          rentalMonths: editingDefinition.rentalInfo?.months || [],
          useDividendApi: editingDefinition.useDividendApi ?? false,
        }
      : {
          type: "stock",
          riskLevel: "medium" as const,
          dividendFrequency: "quarterly" as DividendFrequency,
          rentalFrequency: "monthly" as PaymentFrequency,
          dividendMonths: [],
          rentalMonths: [],
          dividendPaymentMonths: [],
          rentalPaymentMonths: [],
          dividendCustomAmounts: {},
          rentalCustomAmounts: {},
          sectors: [],
        },
  });

  const watchedType = watch("type");
  const hasDividend = watch("hasDividend");
  const hasRental = watch("hasRental");
  const hasBond = watch("hasBond");
  const useDividendApiRaw = watch("useDividendApi");
  const useDividendApi =
    typeof useDividendApiRaw === "boolean" ? useDividendApiRaw : false;
  const dividendPaymentMonths = watch("dividendPaymentMonths") || [];
  const rentalPaymentMonths = watch("rentalPaymentMonths") || [];
  const dividendCustomAmounts = watch("dividendCustomAmounts") || {};
  const rentalCustomAmounts = watch("rentalCustomAmounts") || {};
  React.useEffect(() => {
    setSelectedType(watchedType as AssetType);
  }, [watchedType]);

  // Handler functions for dividend payment months
  const handleDividendMonthChange = (month: number, checked: boolean) => {
    const currentMonths = dividendPaymentMonths || [];
    let newMonths: number[];

    if (checked) {
      newMonths = [...currentMonths, month].sort((a, b) => a - b);
    } else {
      newMonths = currentMonths.filter((m: number) => m !== month);
    }

    setValue("dividendPaymentMonths", newMonths);
  };

  const handleDividendCustomAmountChange = (month: number, amount: number) => {
    const currentAmounts = dividendCustomAmounts || {};
    setValue("dividendCustomAmounts", {
      ...currentAmounts,
      [month]: amount,
    });
  };

  // Handler functions for rental payment months
  const handleRentalMonthChange = (month: number, checked: boolean) => {
    const currentMonths = rentalPaymentMonths || [];
    let newMonths: number[];

    if (checked) {
      newMonths = [...currentMonths, month].sort((a, b) => a - b);
    } else {
      newMonths = currentMonths.filter((m: number) => m !== month);
    }

    setValue("rentalPaymentMonths", newMonths);
  };

  const handleRentalCustomAmountChange = (month: number, amount: number) => {
    const currentAmounts = rentalCustomAmounts || {};
    setValue("rentalCustomAmounts", {
      ...currentAmounts,
      [month]: amount,
    });
  };

  const updateSector = (
    index: number,
    field: "sector" | "percentage",
    value: string | number
  ) => {
    const newSectors = [...sectors];
    newSectors[index] = { ...newSectors[index], [field]: value };
    setSectors(newSectors);
    setValue("sectors", newSectors);
  };

  // Reset form when editingDefinition changes
  React.useEffect(() => {
    if (editingDefinition) {
      // Initialize sectors state based on editing definition
      if (editingDefinition.sectors && editingDefinition.sectors.length > 0) {
        // Convert SectorAllocation to local state format
        const convertedSectors = editingDefinition.sectors.map((sector) => ({
          sectorName: sector.sectorName || sector.sector || "",
          percentage: sector.percentage,
        }));
        setSectors(convertedSectors);
      } else {
        setSectors([{ sectorName: "", percentage: 100 }]);
      }

      // Reset form with editing definition data
      const resetData = {
        fullName: editingDefinition.fullName,
        ticker: editingDefinition.ticker || "",
        type: editingDefinition.type,
        country: editingDefinition.country || "", // <-- explizit immer setzen
        continent: editingDefinition.continent || "",
        // sectors: editingDefinition.sectors || [],
        sectors:
          editingDefinition.sectors && editingDefinition.sectors.length > 0
            ? editingDefinition.sectors.map((sector) => ({
                sectorName: sector.sectorName || sector.sector || "",
                percentage: sector.percentage,
              }))
            : [],
        exchange: editingDefinition.exchange || "",
        isin: editingDefinition.isin || "",
        wkn: editingDefinition.wkn || "",
        description: editingDefinition.description || "",
        riskLevel: editingDefinition.riskLevel || "medium",

        // Price fields
        currentPrice: editingDefinition.currentPrice || undefined,
        lastPriceUpdate: editingDefinition.lastPriceUpdate || undefined,
        autoUpdatePrice: editingDefinition.autoUpdatePrice || false,
        autoUpdateHistoricalPrices:
          editingDefinition.autoUpdateHistoricalPrices || false,

        hasDividend: !!editingDefinition.dividendInfo,
        dividendAmount: editingDefinition.dividendInfo?.amount || 0,
        dividendFrequency:
          editingDefinition.dividendInfo?.frequency || "quarterly",
        dividendPaymentMonths:
          editingDefinition.dividendInfo?.paymentMonths ||
          editingDefinition.dividendInfo?.months ||
          [],
        dividendCustomAmounts:
          editingDefinition.dividendInfo?.customAmounts || {},

        hasRental: !!editingDefinition.rentalInfo,
        rentalAmount: editingDefinition.rentalInfo?.baseRent || 0,
        rentalFrequency: editingDefinition.rentalInfo?.frequency || "monthly",
        rentalPaymentMonths: editingDefinition.rentalInfo?.months || [],
        rentalCustomAmounts: editingDefinition.rentalInfo?.customAmounts || {},

        hasBond: !!editingDefinition.bondInfo,
        interestRate: editingDefinition.bondInfo?.interestRate || 0,
        maturityDate:
          editingDefinition.bondInfo?.maturityDate?.substring(0, 10) || "",
        nominalValue: editingDefinition.bondInfo?.nominalValue || 0,

        dividendMonths: editingDefinition.dividendInfo?.months || [],
        rentalMonths: editingDefinition.rentalInfo?.months || [],
        useDividendApi: editingDefinition.useDividendApi ?? false,
      };

      reset(resetData);
    } else {
      // Reset to default values when not editing
      setSectors([{ sectorName: "", percentage: 100 }]);
      reset({
        type: "stock",
        riskLevel: "medium",
        dividendFrequency: "quarterly",
        rentalFrequency: "monthly",
        sectors: [],
        useDividendApi: false,
        country: "", // <-- explizit auch beim Reset auf leer setzen
      });
    }
  }, [editingDefinition, reset]);

  // Define type alias for the asset definition data structure
  type AssetDefinitionDataType = Omit<
    AssetDefinition,
    "id" | "createdAt" | "updatedAt"
  >;

  // Helper functions to reduce cognitive complexity
  const createBaseDefinitionData = (
    data: AssetDefinitionFormData,
    existingDefinition: AssetDefinition | null
  ): AssetDefinitionDataType => {
    return {
      name: data.fullName, // Use fullName as name
      fullName: data.fullName,
      ticker: data.ticker || undefined,
      type: data.type,
      country: data.country || undefined,
      continent: data.continent || undefined,
      sectors: (data.sectors || [])
        .filter((s) => s.sectorName.trim() !== "")
        .map((s) => ({
          sector: s.sectorName,
          sectorName: s.sectorName,
          percentage: s.percentage,
          value: 0, // Will be calculated later
          count: 0, // Will be calculated later
        })),
      exchange: data.exchange || undefined,
      isin: data.isin || undefined,
      wkn: data.wkn || undefined,
      description: data.description || undefined,
      riskLevel: data.riskLevel || undefined,
      isActive: true,

      // Price fields and history
      currentPrice: data.currentPrice || undefined,
      lastPriceUpdate: data.lastPriceUpdate || undefined,
      autoUpdatePrice: data.autoUpdatePrice || false,
      autoUpdateHistoricalPrices: data.autoUpdateHistoricalPrices || false,
      priceHistory: existingDefinition?.priceHistory || [],
    };
  };

  const updatePriceHistoryIfNeeded = (
    definitionData: AssetDefinitionDataType,
    data: AssetDefinitionFormData,
    existingDefinition: AssetDefinition | null
  ): AssetDefinitionDataType => {
    // Check if price has changed
    if (
      !data.currentPrice ||
      (existingDefinition?.currentPrice &&
        data.currentPrice === existingDefinition.currentPrice)
    ) {
      return definitionData;
    }

    // Create a temporary definition object for the utility function
    const tempDefinition: AssetDefinition = {
      ...definitionData,
      id: existingDefinition?.id || "",
      createdAt: existingDefinition?.createdAt || new Date().toISOString(),
      updatedAt: existingDefinition?.updatedAt || new Date().toISOString(),
    };

    // Use utility function to properly manage price history
    const updatedDefinition = updateAssetDefinitionPrice(
      tempDefinition,
      data.currentPrice,
      "manual"
    );

    // Return updated definition data
    return {
      ...definitionData,
      currentPrice: updatedDefinition.currentPrice,
      lastPriceUpdate: updatedDefinition.lastPriceUpdate,
      priceHistory: updatedDefinition.priceHistory,
    };
  };

  const addDividendInfoIfNeeded = (
    definitionData: AssetDefinitionDataType,
    data: AssetDefinitionFormData
  ): AssetDefinitionDataType => {
    // If hasDividend is explicitly false, ensure dividendInfo is undefined (disabled)
    if (data.hasDividend === false) {
      return {
        ...definitionData,
        dividendInfo: undefined,
      };
    }

    // Skip adding dividend info if no valid amount or not enabled
    if (!data.hasDividend || !data.dividendAmount || data.dividendAmount <= 0) {
      return definitionData;
    }

    return {
      ...definitionData,
      dividendInfo: {
        frequency: data.dividendFrequency as DividendFrequency,
        amount: data.dividendAmount,
        paymentMonths:
          data.dividendPaymentMonths && data.dividendPaymentMonths.length > 0
            ? data.dividendPaymentMonths
            : undefined,
        customAmounts:
          data.dividendCustomAmounts &&
          Object.keys(data.dividendCustomAmounts).length > 0
            ? data.dividendCustomAmounts
            : undefined,
      },
    };
  };

  const addRentalInfoIfNeeded = (
    definitionData: AssetDefinitionDataType,
    data: AssetDefinitionFormData
  ): AssetDefinitionDataType => {
    if (!data.hasRental || !data.rentalAmount || data.rentalAmount <= 0) {
      return definitionData;
    }

    return {
      ...definitionData,
      rentalInfo: {
        baseRent: data.rentalAmount,
        frequency: data.rentalFrequency as PaymentFrequency,
        months:
          data.rentalPaymentMonths && data.rentalPaymentMonths.length > 0
            ? data.rentalPaymentMonths
            : undefined,
        customAmounts:
          data.rentalCustomAmounts &&
          Object.keys(data.rentalCustomAmounts).length > 0
            ? data.rentalCustomAmounts
            : undefined,
      },
    };
  };

  const addBondInfoIfNeeded = (
    definitionData: AssetDefinitionDataType,
    data: AssetDefinitionFormData
  ): AssetDefinitionDataType => {
    if (!data.hasBond || !data.interestRate || data.interestRate <= 0) {
      return definitionData;
    }

    return {
      ...definitionData,
      bondInfo: {
        interestRate: data.interestRate,
        maturityDate: data.maturityDate || undefined,
        nominalValue: data.nominalValue || undefined,
      },
    };
  };

  const handleFormSubmit = (data: AssetFormData) => {
    const definitionData = { ...data, fullName: data.name, type: data.type as AssetType, useDividendApi: data.useDividendApi ?? false };

    // If needed, transform AssetFormData to AssetDefinitionFormData shape here
    // Get existing definition if editing to preserve price history
    const existingDefinition = editingDefinition || null;

    // Build the definition data step by step to reduce complexity
    let finalDefinitionData = createBaseDefinitionData(
      definitionData,
      existingDefinition
    );
    finalDefinitionData = updatePriceHistoryIfNeeded(
      finalDefinitionData,
      definitionData,
      existingDefinition
    );
    finalDefinitionData = addDividendInfoIfNeeded(finalDefinitionData, definitionData);
    finalDefinitionData = addRentalInfoIfNeeded(finalDefinitionData, definitionData);
    finalDefinitionData = addBondInfoIfNeeded(finalDefinitionData, definitionData);
    // Add useDividendApi at the root
    finalDefinitionData.useDividendApi = definitionData.useDividendApi ?? false;

    // Submit the form and reset state
    onSubmit(finalDefinitionData, categoryAssignments);
    reset();
    setSectors([{ sectorName: "", percentage: 100 }]);
    setCategoryAssignments([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <StandardFormWrapper
        title={
          editingDefinition
            ? t("assetDefinitions.editDefinition")
            : t("assetDefinitions.addDefinition")
        }
        onSubmit={handleSubmit(handleFormSubmit)}
      >
        <BasicAssetInformation
          watch={watch}
          setValue={setValue}
          errors={errors}
          isDefinition={true}
        />

        {/* Price Information Section */}
        <OptionalSection title={t("assets.priceInformation")}>
          <FormGrid columns={{ xs: "1fr", sm: "1fr 1fr" }}>
            <StandardFormField
              label={t("assets.currentPrice")}
              name="currentPrice"
              type="number"
              value={watch("currentPrice") || ""}
              onChange={(value) =>
                setValue(
                  "currentPrice",
                  value ? parseFloat(value as string) : undefined
                )
              }
              step={0.01}
              min={0}
              error={getErrorMessage(errors.currentPrice)}
            />
          </FormGrid>
        </OptionalSection>

        {selectedType === "stock" && isApiEnabled && (
          <>
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-700 dark:text-gray-300">
                {t("assets.autoUpdatePrice")}
              </span>
              <Toggle
                checked={watch("autoUpdatePrice") || false}
                onChange={(checked) => setValue("autoUpdatePrice", checked)}
                id="autoUpdatePrice"
                label={t("assets.autoUpdatePrice")}
              />
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-700 dark:text-gray-300">
                {t("assets.autoUpdateHistoricalPrices")}
              </span>
              <Toggle
                checked={watch("autoUpdateHistoricalPrices") || false}
                onChange={(checked) =>
                  setValue("autoUpdateHistoricalPrices", checked)
                }
                id="autoUpdateHistoricalPrices"
                label={t("assets.autoUpdateHistoricalPrices")}
              />
            </div>
          </>
        )}

        <SectorSection
          setValue={setValue}
          sectors={sectors.map(s => ({
            sector: s.sectorName, // map sectorName to sector
            sectorName: s.sectorName, // keep for backward compatibility
            percentage: s.percentage,
            value: 0,
            count: 0,
          }))}
          setSectors={(sectorAllocations) => {
            setSectors(
              sectorAllocations.map(sa => ({
                sectorName: sa.sector || '',
                percentage: sa.percentage,
              }))
            );
            setValue('sectors', sectorAllocations.map(sa => ({
              sectorName: sa.sector || '',
              percentage: sa.percentage,
            })));
          }}
          updateSector={updateSector} // Pass updateSector to SectorSection
        />

        {/* Dividend Section */}
        {selectedType === "stock" && (
          <OptionalSection title={t("assets.dividendInformation")}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-700 dark:text-gray-300">
                {t("assets.useDividendApi")}
              </span>
              <Toggle
                checked={useDividendApi}
                onChange={(checked) => setValue("useDividendApi", checked)}
                id="useDividendApi"
                label={t("assets.useDividendApi")}
              />
            </div>
            {!useDividendApi && (
              <FormGrid columns={{ xs: "1fr", sm: "1fr" }}>
                <AssetIncomeSection
                  type="dividend"
                  hasIncome={hasDividend}
                  onHasIncomeChange={(checked) =>
                    setValue("hasDividend", checked)
                  }
                  amount={watch("dividendAmount") || 0}
                  onAmountChange={(value) => setValue("dividendAmount", value)}
                  frequency={watch("dividendFrequency") as PaymentFrequency}
                  onFrequencyChange={(value) =>
                    setValue("dividendFrequency", value as PaymentFrequency)
                  }
                  paymentMonths={dividendPaymentMonths}
                  onPaymentMonthChange={handleDividendMonthChange}
                  customAmounts={dividendCustomAmounts}
                  onCustomAmountChange={handleDividendCustomAmountChange}
                />
              </FormGrid>
            )}
          </OptionalSection>
        )}

        {/* Real Estate Section */}
        {selectedType === "real_estate" && (
          <OptionalSection title={t("assets.rentalInformation")}>
            <FormGrid columns={{ xs: "1fr", sm: "1fr" }}>
              <AssetIncomeSection
                type="rental"
                hasIncome={hasRental}
                onHasIncomeChange={(checked) => setValue("hasRental", checked)}
                amount={watch("rentalAmount") || 0}
                onAmountChange={(value) => setValue("rentalAmount", value)}
                frequency={watch("rentalFrequency") as PaymentFrequency}
                onFrequencyChange={(value) =>
                  setValue("rentalFrequency", value as PaymentFrequency)
                }
                paymentMonths={rentalPaymentMonths}
                onPaymentMonthChange={handleRentalMonthChange}
                customAmounts={rentalCustomAmounts}
                onCustomAmountChange={handleRentalCustomAmountChange}
              />
            </FormGrid>
          </OptionalSection>
        )}

        {/* Bond Section */}
        {selectedType === "bond" && (
          <OptionalSection title={t("assets.bondInformation")}>
            <FormGrid columns={{ xs: "1fr", sm: "1fr" }}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-700 dark:text-gray-300">
                  {t("assets.hasBondInfo")}
                </span>
                <Toggle
                  checked={watch("hasBond") || false}
                  onChange={(checked) => setValue("hasBond", checked)}
                  id="hasBond"
                  label={t("assets.hasBondInfo")}
                />
              </div>

              {hasBond && (
                <>
                  <StandardFormField
                    label={t("assets.interestRate")}
                    name="interestRate"
                    type="number"
                    value={watch("interestRate")}
                    onChange={(value) =>
                      setValue(
                        "interestRate",
                        typeof value === "string"
                          ? parseFloat(value)
                          : (value as number)
                      )
                    }
                    step={0.01}
                    min={0}
                  />

                  <StandardFormField
                    label={t("assets.maturityDate")}
                    name="maturityDate"
                    type="date"
                    value={watch("maturityDate")}
                    onChange={(value) =>
                      setValue("maturityDate", value as string)
                    }
                  />

                  <StandardFormField
                    label={t("assets.nominalValue")}
                    name="nominalValue"
                    type="number"
                    value={watch("nominalValue")}
                    onChange={(value) =>
                      setValue(
                        "nominalValue",
                        typeof value === "string"
                          ? parseFloat(value)
                          : (value as number)
                      )
                    }
                    step={0.01}
                    min={0}
                  />
                </>
              )}
            </FormGrid>
          </OptionalSection>
        )}

        <AdditionalInformationSection
          watch={watch}
          setValue={setValue}
          selectedType={selectedType}
        />

        {/* Asset Categories Section */}
        <OptionalSection title={t("categories.assetCategories")}>
          <AssetCategoryAssignmentSelector
            assetDefinitionId={editingDefinition?.id}
            categories={categories}
            categoryOptions={categoryOptions}
            currentAssignments={allAssignments}
            onChange={setCategoryAssignments}
          />
        </OptionalSection>
      </StandardFormWrapper>
    </Modal>
  );
};
