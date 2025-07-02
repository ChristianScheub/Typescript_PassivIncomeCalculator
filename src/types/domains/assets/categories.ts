/**
 * Asset categories and classification types
 */

import { BaseEntity, Activatable, Sortable } from '../../shared/base/entities';

// Asset Category Types
export interface AssetCategory extends BaseEntity, Activatable, Sortable {
  description?: string;
}

export interface AssetCategoryOption extends BaseEntity, Activatable, Sortable {
  categoryId: string;
}

export interface AssetCategoryAssignment extends BaseEntity {
  assetDefinitionId: string;
  categoryId: string;
  categoryOptionId: string;
}

// Form data types for creating/updating categories
export type CreateAssetCategoryAssignmentData = Omit<AssetCategoryAssignment, "id" | "createdAt" | "updatedAt">;

// Asset allocation for portfolio analysis
export interface AssetCategoryAllocation {
  type: string;
  name: string;
  value: number;
  percentage: number;
}
