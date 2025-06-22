import { AssetCategoryOption } from './categories';

export type NewAssetCategoryOption = Omit<AssetCategoryOption, 'id' | 'createdAt' | 'updatedAt' | 'categoryId'>;
export type NewAssetCategoryOptionWithCategory = Omit<AssetCategoryOption, 'id' | 'createdAt' | 'updatedAt'>;
