/**
 * Asset categories state types
 */

import { AssetCategory, AssetCategoryOption, AssetCategoryAssignment } from '../assets';
import { StoreStatus } from '../../shared/base/status';

export interface AssetCategoriesState {
  categories: AssetCategory[];
  categoryOptions: AssetCategoryOption[];
  categoryAssignments: AssetCategoryAssignment[];
  status: StoreStatus;
  error: string | null;
}
