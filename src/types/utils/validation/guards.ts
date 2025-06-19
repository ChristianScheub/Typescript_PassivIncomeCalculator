/**
 * Type guards and validation utilities
 */

import { BaseEntity } from '../../shared/base/entities';
import { AssetType, TransactionType } from '../../shared/base/enums';

// Type guards
export function isBaseEntity(obj: unknown): obj is BaseEntity {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    'id' in obj &&
    'name' in obj &&
    'createdAt' in obj &&
    'updatedAt' in obj &&
    typeof (obj as Record<string, unknown>).id === 'string' &&
    typeof (obj as Record<string, unknown>).name === 'string' &&
    typeof (obj as Record<string, unknown>).createdAt === 'string' &&
    typeof (obj as Record<string, unknown>).updatedAt === 'string'
  );
}

export function isAssetType(value: unknown): value is AssetType {
  const assetTypes: AssetType[] = ['stock', 'bond', 'real_estate', 'crypto', 'cash', 'other'];
  return typeof value === 'string' && assetTypes.includes(value as AssetType);
}

export function isTransactionType(value: unknown): value is TransactionType {
  return value === 'buy' || value === 'sell';
}

// Type predicates
export function hasId<T extends { id?: string }>(obj: T): obj is T & { id: string } {
  return obj.id !== undefined && obj.id !== '';
}

export function isNotNull<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

export function isDefinedAndNotEmpty<T>(value: T[] | undefined | null): value is T[] {
  return Array.isArray(value) && value.length > 0;
}
