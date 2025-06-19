/**
 * Asset categories state types
 */

import { AssetCategory, AssetCategoryOption, AssetCategoryAssignment } from '../assets';
import { AssetCategoriesStatus } from '../../shared/base/status';

export interface AssetCategoriesState {
  categories: AssetCategory[];
  categoryOptions: AssetCategoryOption[];
  categoryAssignments: AssetCategoryAssignment[];
  status: AssetCategoriesStatus;
  error: string | null;
}
