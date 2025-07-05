import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { AssetDefinition } from "../../../types/domains/assets";
import { AssetCategoryAssignment } from "../../../types/domains/assets/categories";
import { CreateAssetDefinitionData } from "../../../types/domains/assets/create-asset-definition-data";
import { AssetDefinitionForm } from "../forms/AssetDefinitionForm";
import FloatingBtn, { ButtonAlignment } from "../../../ui/layout/floatingBtn";
import { ViewHeader } from "../../../ui/layout/ViewHeader";
import { Plus, Wallet, RefreshCw, History, DollarSign } from "lucide-react";
import { IconButton } from "../../../ui/common";
import { Tooltip } from "@mui/material";
import { formatService } from "../../../service";
import { TimeRangeSelectionDialog } from "../../../ui/dialog/TimeRangeSelectionDialog";
import { TimeRangePeriod } from "../../../types/shared/time";
import { AddPriceEntryDialog, PriceEntry } from "../../../ui/dialog/AddPriceEntryDialog";
import { SwipeableCard } from "../../../ui/common";
import { SearchInput } from "@/ui/components/inputs/SearchInput";


interface AssetDefinitionsViewProps {
  assetDefinitions: AssetDefinition[];
  status: string;
  isAddingDefinition: boolean;
  editingDefinition: AssetDefinition | null;
  isUpdatingPrices: boolean;
  isUpdatingHistoricalData: boolean;
  isApiEnabled: boolean;
  isDividendApiEnabled: boolean;  // Added this prop
  getAssetTypeIcon: (type: string) => React.ReactNode;
  onAddDefinition: (definition: CreateAssetDefinitionData) => void;
  onUpdateDefinition: (definition: AssetDefinition) => void;
  onDeleteDefinition: (id: string) => void;
  onSetIsAddingDefinition: (isAdding: boolean) => void;
  onSetEditingDefinition: (definition: AssetDefinition | null) => void;
  onUpdateStockPrices: () => void;
  onUpdateHistoricalData: () => void;
  onBack?: () => void;
  onAddDefinitionWithCategories?: (definition: CreateAssetDefinitionData, categoryAssignments: AssetCategoryAssignment[]) => void;
  onUpdateDefinitionWithCategories?: (definition: CreateAssetDefinitionData, categoryAssignments: AssetCategoryAssignment[]) => void;
  onAddPriceEntry?: (assetDefinitionId: string, price: PriceEntry) => void;
  onFetchDividendsForAsset?: (definition: AssetDefinition) => void;
  onFetchAllDividends?: () => void;
}

export const AssetDefinitionsView: React.FC<AssetDefinitionsViewProps> = ({
  assetDefinitions,
  status,
  isAddingDefinition,
  editingDefinition,
  isUpdatingPrices,
  isUpdatingHistoricalData,
  isApiEnabled,
  isDividendApiEnabled,
  getAssetTypeIcon,
  onAddDefinition,
  onUpdateDefinition,
  onDeleteDefinition,
  onSetIsAddingDefinition,
  onSetEditingDefinition,
  onUpdateStockPrices,
  onUpdateHistoricalData,
  onBack,
  onAddDefinitionWithCategories,
  onUpdateDefinitionWithCategories,
  onAddPriceEntry,
  onFetchDividendsForAsset,
  onFetchAllDividends,
}) => {
  const { t } = useTranslation();
  
  // State for the time range selection dialog
  const [isTimeRangeDialogOpen, setIsTimeRangeDialogOpen] = useState(false);
  
  // State for the add price entry dialog
  const [isAddPriceDialogOpen, setIsAddPriceDialogOpen] = useState(false);
  const [selectedDefinitionForPrice, setSelectedDefinitionForPrice] = useState<AssetDefinition | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter asset definitions based on search query
  const filteredAssetDefinitions = assetDefinitions.filter((definition) => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      definition.fullName.toLowerCase().includes(searchLower) ||
      (definition.ticker?.toLowerCase().includes(searchLower)) ||
      (definition.sectors?.some(s => s.sectorName?.toLowerCase().includes(searchLower))) ||
      (definition.country?.toLowerCase().includes(searchLower))
    );
  });

  // Handle opening the time range dialog
  const handleHistoricalDataClick = () => {
    setIsTimeRangeDialogOpen(true);
  };

  // Handle time range selection and close dialog
  const handleTimeRangeConfirm = (period: TimeRangePeriod) => {
    setIsTimeRangeDialogOpen(false);
    onUpdateHistoricalData();
  };

  // Handle dialog close without selection
  const handleTimeRangeClose = () => {
    setIsTimeRangeDialogOpen(false);
  };

  // Handle opening the add price dialog
  const handleAddPriceClick = (definition: AssetDefinition) => {
    setSelectedDefinitionForPrice(definition);
    setIsAddPriceDialogOpen(true);
  };

  // Handle price entry confirmation
  const handlePriceEntryConfirm = (entry: PriceEntry) => {
    if (selectedDefinitionForPrice && onAddPriceEntry) {
      onAddPriceEntry(selectedDefinitionForPrice.id, entry);
    }
    setIsAddPriceDialogOpen(false);
    setSelectedDefinitionForPrice(null);
  };

  // Handle price entry dialog close
  const handlePriceEntryClose = () => {
    setIsAddPriceDialogOpen(false);
    setSelectedDefinitionForPrice(null);
  };

  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">{t("common.loading")}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <ViewHeader
          title={t("assetDefinitions.title")}
          onBack={onBack}
          rightContent={
            <>
              {/* Hide "Kurse aktualisieren" button when disabled */}
              {!isUpdatingPrices && isApiEnabled && (
                <Tooltip 
                  title={t("assets.updatePrices")} 
                  arrow 
                  componentsProps={{
                    tooltip: {
                      sx: {
                        bgcolor: 'rgba(0, 0, 0, 0.8)',
                        '& .MuiTooltip-arrow': {
                          color: 'rgba(0, 0, 0, 0.8)',
                        },
                        padding: '8px 12px',
                        fontSize: '0.875rem',
                      },
                    },
                  }}
                >
                  <IconButton
                    onClick={onUpdateStockPrices}
                    icon={<RefreshCw className="h-4 w-4" />}
                    aria-label={t("assets.updateStockPrices")}
                    variant="outline"
                    size="iconSm"
                  />
                </Tooltip>
              )}
              
              {/* Button for historical data */}
              {!isUpdatingHistoricalData && isApiEnabled && (
                <Tooltip 
                  title={t("assets.updateHistoricalData")} 
                  arrow 
                  componentsProps={{
                    tooltip: {
                      sx: {
                        bgcolor: 'rgba(0, 0, 0, 0.8)',
                        '& .MuiTooltip-arrow': {
                          color: 'rgba(0, 0, 0, 0.8)',
                        },
                        padding: '8px 12px',
                        fontSize: '0.875rem',
                      },
                    },
                  }}
                >
                  <IconButton
                    onClick={handleHistoricalDataClick}
                    icon={<History className="h-4 w-4" />}
                    aria-label={t("assets.updateHistoricalData")}
                    variant="outline"
                    size="iconSm"
                    className="ml-2"
                  />
                </Tooltip>
              )}

              {/* Button for updating all dividends */}
              {isApiEnabled && isDividendApiEnabled && (
                <Tooltip 
                  title={t("assets.fetchAllDividendsFromApi")} 
                  arrow 
                  componentsProps={{
                    tooltip: {
                      sx: {
                        bgcolor: 'rgba(0, 0, 0, 0.8)',
                        '& .MuiTooltip-arrow': {
                          color: 'rgba(0, 0, 0, 0.8)',
                        },
                        padding: '8px 12px',
                        fontSize: '0.875rem',
                      },
                    },
                  }}
                >
                  <IconButton
                    onClick={onFetchAllDividends}
                    icon={<DollarSign className="h-4 w-4" />}
                    aria-label={t("assets.fetchAllDividendsFromApi")}
                    variant="outline"
                    size="iconSm"
                    className="ml-2"
                  />
                </Tooltip>
              )}
            </>
          }
        />
        
        <div className="mb-6">
          {/* Search Input */}
          <div className="mb-4">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={t("assets.searchPlaceholder") || "Search assets..."}
              className="max-w-md mx-auto"
            />
          </div>

          {/* Asset Definitions List */}
          {filteredAssetDefinitions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAssetDefinitions.map((definition) => (
                <SwipeableCard
                  key={definition.id}
                  onEdit={() => onSetEditingDefinition(definition)}
                  onDelete={() => onDeleteDefinition(definition.id)}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-all duration-300"
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        {getAssetTypeIcon(definition.type)}
                        <div className="ml-3">
                          <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                            {definition.fullName}
                          </h3>
                          {definition.ticker && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {definition.ticker}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300">
                        {t(`assets.types.${definition.type}`)}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      {definition.sectors && definition.sectors.length > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">
                            {t("assets.sector")}:
                          </span>
                          <span className="text-gray-900 dark:text-gray-100">
                            {definition.sectors.map(s => s.sectorName).join(', ')}
                          </span>
                        </div>
                      )}

                      {definition.country && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">
                            {t("assets.country")}:
                          </span>
                          <span className="text-gray-900 dark:text-gray-100">
                            {definition.country}
                          </span>
                        </div>
                      )}

                      {definition.currentPrice && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">
                            {t("assets.currentPrice")}:
                          </span>
                          <div className="text-right">
                            <span className="text-gray-900 dark:text-gray-100">
                              {formatService.formatCurrency(definition.currentPrice || 0)}
                            </span>
                            {definition.priceHistory && definition.priceHistory.length > 1 && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {definition.priceHistory.length} {t("assets.priceHistory.entries")}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {definition.dividendInfo && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">
                            {t("assets.dividend")}:
                          </span>
                          <span className="text-green-600 dark:text-green-400">
                            {definition.dividendInfo.amount} (
                            {t(
                              `paymentFrequency.${definition.dividendInfo.frequency}`
                            )}
                            )
                          </span>
                        </div>
                      )}

                      {definition.rentalInfo && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">
                            {t("assets.rent")}:
                          </span>
                          <span className="text-green-600 dark:text-green-400">
                            {definition.rentalInfo.baseRent} (
                            {t(
                              `paymentFrequency.${definition.rentalInfo.frequency}`
                            )}
                            )
                          </span>
                        </div>
                      )}

                      {definition.bondInfo && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">
                            {t("assets.interestRate")}:
                          </span>
                          <span className="text-green-600 dark:text-green-400">
                            {definition.bondInfo.interestRate}%
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Add Price Button */}
                    {onAddPriceEntry && (
                      <button
                        className="mt-4 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded transition-colors"
                        onClick={() => handleAddPriceClick(definition)}
                        type="button"
                      >
                        {t("assets.addPriceEntry")}
                      </button>
                    )}
                  </div>
                </SwipeableCard>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Wallet className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {t("assetDefinitions.noDefinitions")}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t("assetDefinitions.noDefinitionsDesc")}
              </p>
            </div>
          )}

          {/* Add/Edit Form Modal */}
          <AssetDefinitionForm
            isOpen={isAddingDefinition || !!editingDefinition}
            onClose={() => {
              onSetIsAddingDefinition(false);
              onSetEditingDefinition(null);
            }}
            onSubmit={(data, categoryAssignments) => {
              // Transform sectors data to match SectorAllocation interface
              const transformedData = {
                ...data,
                sectors: (data.sectors || []).map(sector => ({
                  sector: sector.sectorName || "",
                  sectorName: sector.sectorName,
                  value: 0, // Will be calculated later
                  percentage: sector.percentage,
                  count: 0, // Will be calculated later
                })),
              };

              // Transform category assignments to include required fields
              const transformedCategoryAssignments = categoryAssignments.map(assignment => ({
                name: assignment.name || `${assignment.categoryId}-${assignment.categoryOptionId}`,
                assetDefinitionId: editingDefinition?.id || '',
                categoryId: assignment.categoryId || '',
                categoryOptionId: assignment.categoryOptionId || ''
              } as AssetCategoryAssignment));

              if (editingDefinition) {
                // For updates, merge the form data with the existing definition's metadata
                if (onUpdateDefinitionWithCategories) {
                  onUpdateDefinitionWithCategories(
                    {
                      ...editingDefinition,
                      ...transformedData,
                    },
                    transformedCategoryAssignments
                  );
                } else {
                  onUpdateDefinition({
                    ...editingDefinition,
                    ...transformedData,
                  });
                }
              } else {
                // For new definitions, just pass the form data
                if (onAddDefinitionWithCategories) {
                  onAddDefinitionWithCategories(transformedData, transformedCategoryAssignments);
                }
                if (onAddDefinition && !onAddDefinitionWithCategories) {
                  onAddDefinition(transformedData);
                }
              }
            }}
            editingDefinition={editingDefinition}
          />

          {/* Floating Add Button - hidden when form is open */}
          {!isAddingDefinition && !editingDefinition && (
            <FloatingBtn
              alignment={ButtonAlignment.RIGHT}
              icon={Plus}
              onClick={() => onSetIsAddingDefinition(true)}
              backgroundColor="#2563eb"
              hoverBackgroundColor="#1d4ed8"
            />
          )}
        </div>
      </div>

      {/* Time Range Selection Dialog */}
      <TimeRangeSelectionDialog
        isOpen={isTimeRangeDialogOpen}
        onClose={handleTimeRangeClose}
        onConfirm={handleTimeRangeConfirm}
        title={t("assets.selectTimeRange") || "Zeitraum für historische Daten auswählen"}
      />

      {/* Add Price Entry Dialog */}
      <AddPriceEntryDialog
        isOpen={isAddPriceDialogOpen}
        onClose={handlePriceEntryClose}
        onConfirm={handlePriceEntryConfirm}
        assetName={selectedDefinitionForPrice?.fullName || ""}
      />
    </div>
  );
};
