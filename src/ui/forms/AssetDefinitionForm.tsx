import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AssetDefinition,
  AssetType,
  DividendFrequency,
  PaymentFrequency,
  AssetCategoryAssignment,
  SectorAllocation,
} from "../../types";
import { updateAssetDefinitionPrice } from "../../utils/priceHistoryUtils";
import {
  StandardFormWrapper,
  RequiredSection,
  OptionalSection,
  FormGrid,
  StandardFormField,
} from "./StandardFormWrapper";
import { Modal } from "../common/Modal";
import { MonthSelector } from "./MonthSelector";
import { CustomAmountsSection } from "../specialized/CustomAmountsSection";
import { AssetCategoryAssignmentSelector } from "../specialized/AssetCategoryAssignmentSelector";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { getAssetTypeOptions } from "../../constants";
import { useAppSelector } from "../../hooks/redux";

const assetDefinitionSchema = z.object({
  fullName: z.string().min(1, "Name is required"),
  ticker: z.string().optional(),
  type: z.enum(["stock", "bond", "real_estate", "crypto", "cash", "other"]),
  country: z.string().optional(),
  continent: z.string().optional(),
  sector: z.string().optional(),

  // Multi-sector support
  useMultipleSectors: z.boolean().optional(),
  sectors: z
    .array(
      z.object({
        sectorName: z.string().min(1, "Sector name is required"),
        percentage: z.number().min(0.1).max(100),
      })
    )
    .optional(),
  currency: z.string().optional(),
  exchange: z.string().optional(),
  isin: z.string().optional(),
  wkn: z.string().optional(),
  description: z.string().optional(),
  riskLevel: z.enum(["low", "medium", "high"]).optional(),

  // Price fields
  currentPrice: z.number().min(0).optional(),
  lastPriceUpdate: z.string().optional(),
  autoUpdatePrice: z.boolean().optional(),

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
    .enum(["monthly", "quarterly", "annually", "custom"])
    .optional(),
  rentalMonths: z.array(z.number().min(1).max(12)).optional(),
  rentalCustomAmounts: z.record(z.string(), z.number()).optional(),
  rentalPaymentMonths: z.array(z.number().min(1).max(12)).optional(),

  // Bond fields
  hasBond: z.boolean().optional(),
  interestRate: z.number().min(0).max(100).optional(),
  maturityDate: z.string().optional(),
  nominalValue: z.number().min(0).optional(),
});

type AssetDefinitionFormData = z.infer<typeof assetDefinitionSchema>;

interface AssetDefinitionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data: Omit<AssetDefinition, "id" | "createdAt" | "updatedAt">,
    categoryAssignments: Omit<
      AssetCategoryAssignment,
      "id" | "createdAt" | "updatedAt"
    >[]
  ) => void;
  editingDefinition?: AssetDefinition | null;
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
  const { isEnabled: isApiEnabled } = useAppSelector(
    (state) => state.apiConfig
  );

  const getRiskLevelOptions = (t: any) => [
    { value: "low", label: t("assets.riskLevels.low") },
    { value: "medium", label: t("assets.riskLevels.medium") },
    { value: "high", label: t("assets.riskLevels.high") },
  ];

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<AssetDefinitionFormData>({
    resolver: zodResolver(assetDefinitionSchema),
    defaultValues: editingDefinition
      ? {
          fullName: editingDefinition.fullName,
          ticker: editingDefinition.ticker || "",
          type: editingDefinition.type,
          country: editingDefinition.country || "",
          continent: editingDefinition.continent || "",
          sector: editingDefinition.sector || "",
          useMultipleSectors: !!(
            editingDefinition.sectors && editingDefinition.sectors.length > 0
          ),
          sectors: editingDefinition.sectors || [],
          currency: editingDefinition.currency || "EUR",
          exchange: editingDefinition.exchange || "",
          isin: editingDefinition.isin || "",
          wkn: editingDefinition.wkn || "",
          description: editingDefinition.description || "",
          riskLevel: editingDefinition.riskLevel || "medium",

          // Price fields
          currentPrice: editingDefinition.currentPrice || undefined,
          lastPriceUpdate: editingDefinition.lastPriceUpdate || undefined,
          autoUpdatePrice: editingDefinition.autoUpdatePrice || false,

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
        }
      : {
          type: "stock",
          currency: "EUR",
          riskLevel: "medium" as const,
          dividendFrequency: "quarterly" as DividendFrequency,
          rentalFrequency: "monthly" as PaymentFrequency,
          dividendMonths: [],
          rentalMonths: [],
          dividendPaymentMonths: [],
          rentalPaymentMonths: [],
          dividendCustomAmounts: {},
          rentalCustomAmounts: {},
          useMultipleSectors: false,
          sectors: [],
        },
  });

  const watchedType = watch("type");
  const hasDividend = watch("hasDividend");
  const hasRental = watch("hasRental");
  const hasBond = watch("hasBond");
  const dividendFrequency = watch("dividendFrequency");
  const rentalFrequency = watch("rentalFrequency");
  const dividendPaymentMonths = watch("dividendPaymentMonths") || [];
  const rentalPaymentMonths = watch("rentalPaymentMonths") || [];
  const dividendCustomAmounts = watch("dividendCustomAmounts") || {};
  const rentalCustomAmounts = watch("rentalCustomAmounts") || {};
  const useMultipleSectors = watch("useMultipleSectors");

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
      newMonths = currentMonths.filter((m) => m !== month);
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
      newMonths = currentMonths.filter((m) => m !== month);
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

  // Handler functions for multiple sectors
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

  // Reset form when editingDefinition changes
  React.useEffect(() => {
    if (editingDefinition) {
      // Initialize sectors state based on editing definition
      if (editingDefinition.sectors && editingDefinition.sectors.length > 0) {
        setSectors(editingDefinition.sectors);
      } else if (editingDefinition.sector) {
        // If only single sector exists, convert to multi-sector format but keep toggle off
        setSectors([{ sectorName: editingDefinition.sector, percentage: 100 }]);
      } else {
        setSectors([{ sectorName: "", percentage: 100 }]);
      }

      // Reset form with editing definition data
      const resetData = {
        fullName: editingDefinition.fullName,
        ticker: editingDefinition.ticker || "",
        type: editingDefinition.type,
        country: editingDefinition.country || "",
        continent: editingDefinition.continent || "",
        sector: editingDefinition.sector || "",
        useMultipleSectors: !!(
          editingDefinition.sectors && editingDefinition.sectors.length > 0
        ),
        sectors: editingDefinition.sectors || [],
        currency: editingDefinition.currency || "EUR",
        exchange: editingDefinition.exchange || "",
        isin: editingDefinition.isin || "",
        wkn: editingDefinition.wkn || "",
        description: editingDefinition.description || "",
        riskLevel: editingDefinition.riskLevel || "medium",

        // Price fields
        currentPrice: editingDefinition.currentPrice || undefined,
        lastPriceUpdate: editingDefinition.lastPriceUpdate || undefined,
        autoUpdatePrice: editingDefinition.autoUpdatePrice || false,

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
      };

      reset(resetData);
    } else {
      // Reset to default values when not editing
      setSectors([{ sectorName: "", percentage: 100 }]);
      reset({
        type: "stock",
        currency: "EUR",
        riskLevel: "medium",
        dividendFrequency: "quarterly",
        rentalFrequency: "monthly",
        useMultipleSectors: false,
        sectors: [],
      });
    }
  }, [editingDefinition, reset]);

  const handleFormSubmit = (data: AssetDefinitionFormData) => {
    // Get existing definition if editing to preserve price history
    const existingDefinition = editingDefinition || null;

    let definitionData: Omit<
      AssetDefinition,
      "id" | "createdAt" | "updatedAt"
    > = {
      name: data.fullName, // Use fullName as name
      fullName: data.fullName,
      ticker: data.ticker || undefined,
      type: data.type,
      country: data.country || undefined,
      continent: data.continent || undefined,
      sector: data.useMultipleSectors ? undefined : data.sector || undefined, // Only use single sector if multi-sector is disabled
      sectors: data.useMultipleSectors
        ? data.sectors?.filter((s) => s.sectorName.trim() !== "")
        : undefined, // Only use sectors if multi-sector is enabled
      currency: data.currency || undefined,
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
      priceHistory: existingDefinition?.priceHistory || [],
    };

    // If current price has changed, use utility function to update price and history
    if (
      data.currentPrice &&
      (!existingDefinition?.currentPrice ||
        data.currentPrice !== existingDefinition.currentPrice)
    ) {
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

      // Update our definition data with the new price and history
      definitionData.currentPrice = updatedDefinition.currentPrice;
      definitionData.lastPriceUpdate = updatedDefinition.lastPriceUpdate;
      definitionData.priceHistory = updatedDefinition.priceHistory;
    }

    // Add dividend info if enabled
    if (data.hasDividend && data.dividendAmount && data.dividendAmount > 0) {
      definitionData.dividendInfo = {
        frequency: data.dividendFrequency as DividendFrequency,
        amount: data.dividendAmount,
        currency: data.currency,
        paymentMonths:
          data.dividendPaymentMonths && data.dividendPaymentMonths.length > 0
            ? data.dividendPaymentMonths
            : undefined,
        customAmounts:
          data.dividendCustomAmounts &&
          Object.keys(data.dividendCustomAmounts).length > 0
            ? data.dividendCustomAmounts
            : undefined,
      };
    }

    // Add rental info if enabled
    if (data.hasRental && data.rentalAmount && data.rentalAmount > 0) {
      definitionData.rentalInfo = {
        baseRent: data.rentalAmount,
        frequency: data.rentalFrequency as PaymentFrequency,
        currency: data.currency,
        months:
          data.rentalPaymentMonths && data.rentalPaymentMonths.length > 0
            ? data.rentalPaymentMonths
            : undefined,
        customAmounts:
          data.rentalCustomAmounts &&
          Object.keys(data.rentalCustomAmounts).length > 0
            ? data.rentalCustomAmounts
            : undefined,
      };
    }

    // Add bond info if enabled
    if (data.hasBond && data.interestRate && data.interestRate > 0) {
      definitionData.bondInfo = {
        interestRate: data.interestRate,
        maturityDate: data.maturityDate || undefined,
        nominalValue: data.nominalValue || undefined,
        currency: data.currency,
      };
    }

    onSubmit(definitionData, categoryAssignments);
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
        <RequiredSection>
          <FormGrid columns={{ xs: "1fr", sm: "1fr" }}>
            <StandardFormField
              label={t("assets.fullName")}
              name="fullName"
              required
              error={errors.fullName?.message}
              value={watch("fullName")}
              onChange={(value) => setValue("fullName", value)}
              placeholder={t("assets.fullNamePlaceholder")}
            />

            {selectedType !== "real_estate" && (
              <StandardFormField
                label={t("assets.ticker")}
                name="ticker"
                value={watch("ticker")}
                onChange={(value) => setValue("ticker", value)}
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
              value={watch("type")}
              onChange={(value) => setValue("type", value)}
            />

            <StandardFormField
              label={t("assets.riskLevel")}
              name="riskLevel"
              type="select"
              options={getRiskLevelOptions(t)}
              value={watch("riskLevel")}
              onChange={(value) => setValue("riskLevel", value)}
            />

            <StandardFormField
              label={t("assets.country")}
              name="country"
              value={watch("country")}
              onChange={(value) => setValue("country", value)}
              placeholder={t("assets.countryPlaceholder")}
            />

            <StandardFormField
              label={t("assets.currency")}
              name="currency"
              value={watch("currency")}
              onChange={(value) => setValue("currency", value)}
              placeholder="EUR"
            />

            <StandardFormField
              label={t("assets.currentPrice")}
              name="currentPrice"
              type="number"
              value={watch("currentPrice")}
              onChange={(value) => setValue("currentPrice", value)}
              step={0.01}
              min={0}
              placeholder={t("assets.currentPricePlaceholder")}
            />

            {/* Auto Update Price Toggle - only visible for stocks when API is enabled */}
            {selectedType === "stock" && isApiEnabled && (
              <StandardFormField
                label={t("assets.autoUpdatePrice")}
                name="autoUpdatePrice"
                type="checkbox"
                value={watch("autoUpdatePrice")}
                onChange={(value) => setValue("autoUpdatePrice", value)}
              />
            )}
            {/* Sector Configuration */}
            {!useMultipleSectors ? (
              <StandardFormField
                label={t("assets.sector")}
                name="sector"
                value={watch("sector")}
                onChange={(value) => setValue("sector", value)}
                placeholder={t("assets.sectorPlaceholder")}
              />
            ) : (
              <OptionalSection title={t("assets.sectors")}>
                <div className="space-y-4">
                  {sectors.map((sector, index) => (
                    <div key={index} className="space-y-3">
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
            )}
            <StandardFormField
              label={t("assets.useMultipleSectors")}
              name="useMultipleSectors"
              type="checkbox"
              value={watch("useMultipleSectors")}
              onChange={(value) => {
                setValue("useMultipleSectors", value);
                if (
                  value &&
                  sectors.length === 1 &&
                  sectors[0].sectorName === ""
                ) {
                  // Initialize with one empty sector when enabling multi-sector
                  setSectors([{ sectorName: "", percentage: 100 }]);
                }
              }}
            />
          </FormGrid>
        </RequiredSection>

        {selectedType !== "real_estate" && (
          <OptionalSection title={t("assets.dividendInformation")}>
            <FormGrid columns={{ xs: "1fr", sm: "1fr" }}>
              <StandardFormField
                label={t("assets.hasDividend")}
                name="hasDividend"
                type="checkbox"
                value={watch("hasDividend")}
                onChange={(value) => setValue("hasDividend", value)}
              />

              {hasDividend && (
                <>
                  <StandardFormField
                    label={t("assets.dividendAmount")}
                    name="dividendAmount"
                    type="number"
                    value={watch("dividendAmount")}
                    onChange={(value) => setValue("dividendAmount", value)}
                    step={0.01}
                    min={0}
                  />

                  <StandardFormField
                    label={t("assets.dividendFrequency")}
                    name="dividendFrequency"
                    type="select"
                    options={[
                      {
                        value: "monthly",
                        label: t("paymentFrequency.monthly"),
                      },
                      {
                        value: "quarterly",
                        label: t("paymentFrequency.quarterly"),
                      },
                      {
                        value: "annually",
                        label: t("paymentFrequency.annually"),
                      },
                      { value: "custom", label: t("paymentFrequency.custom") },
                    ]}
                    value={watch("dividendFrequency")}
                    onChange={(value) => setValue("dividendFrequency", value)}
                  />
                </>
              )}
            </FormGrid>

            {/* Dividend Month Selection */}
            {hasDividend &&
              dividendFrequency &&
              (dividendFrequency === "quarterly" ||
                dividendFrequency === "annually" ||
                dividendFrequency === "custom") && (
                <div style={{ marginTop: "16px" }}>
                  <MonthSelector
                    selectedMonths={dividendPaymentMonths}
                    onChange={handleDividendMonthChange}
                    label={
                      dividendFrequency === "quarterly"
                        ? t("assets.selectQuarterlyMonths")
                        : dividendFrequency === "annually"
                        ? t("assets.selectAnnualMonth")
                        : t("assets.selectDividendMonths")
                    }
                  />
                </div>
              )}

            {/* Custom Dividend Amounts */}
            {hasDividend && dividendFrequency === "custom" && (
              <CustomAmountsSection
                frequency={dividendFrequency}
                selectedMonths={dividendPaymentMonths}
                customAmounts={dividendCustomAmounts}
                onAmountChange={handleDividendCustomAmountChange}
                title={t("assets.customDividendAmounts")}
                currency={watch("currency") || "EUR"}
              />
            )}
          </OptionalSection>
        )}

        {selectedType === "real_estate" && (
          <OptionalSection title={t("assets.rentalInformation")}>
            <FormGrid columns={{ xs: "1fr", sm: "1fr" }}>
              <StandardFormField
                label={t("assets.hasRental")}
                name="hasRental"
                type="checkbox"
                value={watch("hasRental")}
                onChange={(value) => setValue("hasRental", value)}
              />

              {hasRental && (
                <>
                  <StandardFormField
                    label={t("assets.rentalAmount")}
                    name="rentalAmount"
                    type="number"
                    value={watch("rentalAmount")}
                    onChange={(value) => setValue("rentalAmount", value)}
                    step={0.01}
                    min={0}
                  />

                  <StandardFormField
                    label={t("assets.rentalFrequency")}
                    name="rentalFrequency"
                    type="select"
                    options={[
                      {
                        value: "monthly",
                        label: t("paymentFrequency.monthly"),
                      },
                      {
                        value: "quarterly",
                        label: t("paymentFrequency.quarterly"),
                      },
                      {
                        value: "annually",
                        label: t("paymentFrequency.annually"),
                      },
                      { value: "custom", label: t("paymentFrequency.custom") },
                    ]}
                    value={watch("rentalFrequency")}
                    onChange={(value) => setValue("rentalFrequency", value)}
                  />
                </>
              )}
            </FormGrid>

            {/* Rental Month Selection */}
            {hasRental &&
              rentalFrequency &&
              (rentalFrequency === "quarterly" ||
                rentalFrequency === "annually" ||
                rentalFrequency === "custom") && (
                <div style={{ marginTop: "16px" }}>
                  <MonthSelector
                    selectedMonths={rentalPaymentMonths}
                    onChange={handleRentalMonthChange}
                    label={
                      rentalFrequency === "quarterly"
                        ? t("assets.selectQuarterlyMonths")
                        : rentalFrequency === "annually"
                        ? t("assets.selectAnnualMonth")
                        : t("assets.selectRentalMonths")
                    }
                  />
                </div>
              )}

            {/* Custom Rental Amounts */}
            {hasRental && rentalFrequency === "custom" && (
              <CustomAmountsSection
                frequency={rentalFrequency}
                selectedMonths={rentalPaymentMonths}
                customAmounts={rentalCustomAmounts}
                onAmountChange={handleRentalCustomAmountChange}
                title={t("assets.customRentalAmounts")}
                currency={watch("currency") || "EUR"}
              />
            )}
          </OptionalSection>
        )}

        {selectedType === "bond" && (
          <OptionalSection title={t("assets.bondInformation")}>
            <FormGrid columns={{ xs: "1fr", sm: "1fr" }}>
              <StandardFormField
                label={t("assets.hasBondInfo")}
                name="hasBond"
                type="checkbox"
                value={watch("hasBond")}
                onChange={(value) => setValue("hasBond", value)}
              />

              {hasBond && (
                <>
                  <StandardFormField
                    label={t("assets.interestRate")}
                    name="interestRate"
                    type="number"
                    value={watch("interestRate")}
                    onChange={(value) => setValue("interestRate", value)}
                    step={0.01}
                    min={0}
                  />

                  <StandardFormField
                    label={t("assets.maturityDate")}
                    name="maturityDate"
                    type="date"
                    value={watch("maturityDate")}
                    onChange={(value) => setValue("maturityDate", value)}
                  />

                  <StandardFormField
                    label={t("assets.nominalValue")}
                    name="nominalValue"
                    type="number"
                    value={watch("nominalValue")}
                    onChange={(value) => setValue("nominalValue", value)}
                    step={0.01}
                    min={0}
                  />
                </>
              )}
            </FormGrid>
          </OptionalSection>
        )}

        <OptionalSection title={t("common.additionalInformation")}>
          <FormGrid columns={{ xs: "1fr", sm: "1fr" }}>
            {selectedType !== "real_estate" && (
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
          </FormGrid>
        </OptionalSection>

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
