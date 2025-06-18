/**
 * Type guards and validation utilities
 */

import { BaseEntity } from '../../shared/base/entities';
import { AssetType, TransactionType } from '../../shared/base/enums';

// Type guards
export function isBaseEntity(obj: any): obj is BaseEntity {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.createdAt === 'string' &&
    typeof obj.updatedAt === 'string'
  );
}

export function isAssetType(value: any): value is AssetType {
  const assetTypes: AssetType[] = ['stock', 'bond', 'real_estate', 'crypto', 'cash', 'other'];
  return assetTypes.includes(value);
}

export function isTransactionType(value: any): value is TransactionType {
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
