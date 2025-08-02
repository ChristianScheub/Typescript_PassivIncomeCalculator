/**
 * Identifier types and reference utilities
 */

// Reference types
export interface EntityReference<T = string> {
  id: T;
  name?: string;
}

export interface AssetReference extends EntityReference {
  ticker?: string;
  type?: string;
}

export interface CategoryReference extends EntityReference {
  level?: number;
  parentId?: string;
}
