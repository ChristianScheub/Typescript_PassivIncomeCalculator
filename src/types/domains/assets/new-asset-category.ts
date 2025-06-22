import { AssetCategory } from './categories';

export type NewAssetCategory = Omit<AssetCategory, 'id' | 'createdAt' | 'updatedAt'>;
