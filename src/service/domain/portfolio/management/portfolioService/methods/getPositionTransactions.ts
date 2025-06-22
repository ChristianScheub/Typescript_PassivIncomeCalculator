import { Asset } from "@/types/domains/assets";

export function getPositionTransactions(assets: Asset[], positionId: string): Asset[] {
  return assets.filter(asset => {
    const key = asset.assetDefinitionId || `fallback_${asset.name}_${asset.type}`;
    return key === positionId;
  });
}
