/**
 * Standardized slice state interfaces and patterns
 * Diese Datei definiert einheitliche State-Patterns für alle Standard-CRUD-Slices
 */

import { BaseEntity } from '@/types/shared/base/entities';

/**
 * Standard-Status für async operations
 */
export type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

/**
 * Standard-State-Interface für alle CRUD-Slices
 * Verwendet für: Income, Expenses, Liabilities
 */
export interface StandardCrudState<T extends BaseEntity> {
  items: T[];
  status: AsyncStatus;
  error: string | null;
}

/**
 * Extended State für Slices mit Cache-Funktionalität
 * Verwendet für: Transactions, AssetDefinitions, etc.
 */
export interface CacheableState<T extends BaseEntity, C = unknown> {
  items: T[];
  status: AsyncStatus;
  error: string | null;
  
  // Cache-Management
  cache?: C;
  lastCalculated?: string;
  
  // Cache-Metadaten (erweitert für komplexe Caches wie Portfolio)
  calculationMetadata?: {
    lastCalculated: string;
    [key: string]: unknown;
  };
}

/**
 * Spezialisierte Cache-State für Portfolio/Transactions
 * Unterstützt erweiterte Metadaten für Portfolio-Berechnungen
 */
export interface PortfolioCacheableState<T extends BaseEntity, C = unknown> extends CacheableState<T, C> {
  calculationMetadata: {
    lastCalculated: string;
    totalValue: number;
    totalInvestment: number;
    totalReturn: number;
    totalReturnPercentage: number;
    assetDefinitions: unknown[];
    categories: unknown[];
    categoryOptions: unknown[];
    categoryAssignments: unknown[];
  };
}

/**
 * Logging-Pattern für alle Slices
 * Einheitliche Namenskonvention: [SliceName]: [Operation] [State]
 */
export const createSliceLogger = (sliceName: string) => ({
  startOperation: (operation: string, details?: string) => {
    const detailsText = details ? ` ${details}` : '';
    return `${sliceName}: Starting ${operation} operation${detailsText}`;
  },
  
  completeOperation: (operation: string, result?: string) => {
    const resultText = result ? ` - ${result}` : '';
    return `${sliceName}: ${operation} completed successfully${resultText}`;
  },
  
  failOperation: (operation: string, error: string) => 
    `${sliceName}: ${operation} failed - ${error}`,
  
  cacheHit: (operation: string) => 
    `${sliceName}: Cache hit for ${operation}`,
  
  cacheUpdate: (operation: string) => 
    `${sliceName}: Cache updated for ${operation}`
});

/**
 * Standard-Reducer-Patterns für consistency
 */
export const standardReducerPatterns = {
  // Standard CRUD pattern ohne exzessives Logging
  pending: (state: { status: AsyncStatus }) => {
    state.status = 'loading';
  },
  
  fulfilled: (state: { status: AsyncStatus }) => {
    state.status = 'succeeded';
  },
  
  rejected: (state: { status: AsyncStatus; error: string | null }, error: string) => {
    state.status = 'failed';
    state.error = error;
  },
  
  // Cache invalidation pattern for CacheableState
  invalidateCache: <T extends BaseEntity>(state: CacheableState<T>) => {
    state.cache = undefined;
    state.lastCalculated = undefined;
  },
  
  // Cache invalidation pattern for PortfolioCacheableState
  invalidatePortfolioCache: <T extends BaseEntity>(state: PortfolioCacheableState<T>) => {
    state.cache = undefined;
    state.lastCalculated = undefined;
  },
};
