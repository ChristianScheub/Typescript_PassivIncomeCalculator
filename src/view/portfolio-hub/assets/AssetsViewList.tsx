import { Asset } from "@/types/domains/assets";
import { TranslationProps } from "@/types/shared/ui/view-props";
import { PortfolioData } from "./AssetsView";
import { SwipeableCard } from "@/ui/portfolioHub/common/SwipeableCard";
import { EmptyStateView } from "./EmptyStateAssetView";
import { PortfolioView } from "../PortfolioView";
import { Card, CardContent } from "@/ui/shared/Card";
import { formatService } from "@/service";
import { PortfolioPosition } from "@/types/domains/portfolio/position";

// Helper component for assets list
export const AssetsList: React.FC<{
  viewMode: "portfolio" | "transactions";
  sortedPortfolioAssets: PortfolioPosition[];
  assets: Asset[];
  sortedAssets: Asset[];
  portfolioData: PortfolioData;
  getAssetTypeLabel: (type: string) => string;
  handleAssetClick: (asset: PortfolioPosition) => void;
  onSetEditingAsset: (asset: Asset | null) => void;
  onDeleteAsset: (id: string) => void;
  onSetIsAddingAsset: (isAdding: boolean) => void;
  onNavigateToDefinitions: () => void;
  t: TranslationProps['t'];
}> = ({
  viewMode,
  sortedPortfolioAssets,
  assets,
  sortedAssets,
  getAssetTypeLabel,
  handleAssetClick,
  onSetEditingAsset,
  onDeleteAsset,
  onSetIsAddingAsset,
  onNavigateToDefinitions,
  t
}) => {
  // Extract nested ternary for assets count
  const assetsCount = viewMode === "portfolio" 
    ? sortedPortfolioAssets.length 
    : assets.length;

  if (assetsCount === 0) {
    return <EmptyStateView 
      t={t} 
      onSetIsAddingAsset={onSetIsAddingAsset} 
      onNavigateToDefinitions={onNavigateToDefinitions}
    />;
  }

  return viewMode === "portfolio" ? (
    <PortfolioView
      portfolioAssets={sortedPortfolioAssets}
      getAssetTypeLabel={getAssetTypeLabel}
      onAssetClick={handleAssetClick}
    />
  ) : (
    <>
      {sortedAssets.map(asset => (
        <SwipeableCard
          key={asset.id}
          onEdit={() => onSetEditingAsset(asset)}
          onDelete={() => onDeleteAsset(asset.id)}
          className="hover:shadow-md transition-shadow mb-4"
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col space-y-3">
                {/* Header with Asset Name and Type */}
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                    {asset.name}
                  </h3>
                  <span className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {getAssetTypeLabel(asset.type)}
                  </span>
                </div>

                {/* Transaction Details */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {/* Purchase Date */}
                  <div className="flex flex-col">
                    <span className="text-gray-600 dark:text-gray-400">{t('assets.purchaseDate')}</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {new Date(asset.purchaseDate).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Transaction Type */}
                  <div className="flex flex-col">
                    <span className={`font-medium ${asset.transactionType === 'buy' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {asset.transactionType === 'buy' ? t('assets.buy') : t('assets.sell')}
                    </span>
                  </div>

                  {/* Quantity */}
                  {asset.purchaseQuantity && (
                    <div className="flex flex-col">
                      <span className="text-gray-600 dark:text-gray-400">{t('assets.quantity')}</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {asset.purchaseQuantity.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {/* Purchase Price */}
                  {asset.purchasePrice && (
                    <div className="flex flex-col">
                      <span className="text-gray-600 dark:text-gray-400">{t('assets.purchasePrice')}</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {formatService.formatCurrency(asset.purchasePrice)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Total Volume */}
                {asset.value && (
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">{t('assets.totalVolume')}</span>
                      <span className="font-bold text-lg text-gray-900 dark:text-gray-100">
                        {formatService.formatCurrency(asset.value)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Asset Definition Info */}
                {asset.assetDefinition && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-2">
                    {asset.assetDefinition.ticker && (
                      <span className="mr-2">Ticker: {asset.assetDefinition.ticker}</span>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </SwipeableCard>
      ))}
    </>
  );
};