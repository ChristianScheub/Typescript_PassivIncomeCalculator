/**
 * Asset domain entities
 */

import { BaseEntity } from '../../shared/base/entities';
import { AssetType, TransactionType, RiskLevel, PaymentFrequency, DividendFrequency } from '../../shared/base/enums';
import { MarketData, PriceHistoryEntry } from './market-data';
import { AssetCategoryAssignment } from './categories';
import { SectorAllocation } from '../portfolio/allocations';
import { CachedDividends } from './calculations';

// Asset-specific information interfaces
export interface DividendInfo {
  frequency: DividendFrequency;
  amount: number;
  months?: number[];
  paymentMonths?: number[];
  customAmounts?: Record<number, number>;
  lastDividendDate?: string;
  nextDividendDate?: string;
  dividendGrowthRate?: number; // Jährliche Steigerung in %
}

export interface RentalInfo {
  baseRent: number;
  rentGrowthRate?: number; // Jährliche Mietsteigerung in %
  frequency: PaymentFrequency;
  months?: number[];
  customAmounts?: Record<number, number>;
}

export interface BondInfo {
  interestRate: number;
  maturityDate?: string;
  nominalValue?: number;
}

// Main asset entities
export interface AssetDefinition extends BaseEntity {
  ticker?: string;
  fullName: string;
  type: AssetType;
  country?: string;
  continent?: string;
  currency?: string;
  sector?: string; // Single sector for backward compatibility
  sectors?: SectorAllocation[]; // New multi-sector support
  exchange?: string;
  isin?: string;
  wkn?: string;
  
  // Current price (directly stored for convenience)
  currentPrice?: number;
  lastPriceUpdate?: string;
  autoUpdatePrice?: boolean;
  autoUpdateHistoricalPrices?: boolean;
  
  // Market data
  marketData?: MarketData;
  priceHistory?: PriceHistoryEntry[];
  
  // Asset-specific information
  dividendInfo?: DividendInfo;
  rentalInfo?: RentalInfo;
  bondInfo?: BondInfo;

  // Dividend API integration
  useDividendApi?: boolean;

  // Dividend history (API and manual entries)
  dividendHistory?: import('./dividends').DividendHistoryEntry[];
  
  // Additional metadata
  description?: string;
  riskLevel?: RiskLevel;
  isActive?: boolean;
}

// Enhanced AssetDefinition with categories
export interface EnhancedAssetDefinition extends AssetDefinition {
  categoryAssignments?: AssetCategoryAssignment[];
}

// Transaction Type für Asset-Transaktionen
export interface Transaction extends BaseEntity {
  type: AssetType;
  value: number;
  
  // Reference to Asset Definition
  assetDefinitionId?: string;
  assetDefinition?: AssetDefinition; // Populated reference
  
  // Transaction type (buy/sell)
  transactionType: TransactionType;
  
  // Transaction specific data
  purchaseDate: string;
  purchasePrice: number; // For both buy and sell transactions
  purchaseQuantity?: number; // For both buy and sell transactions (quantity being bought/sold)
  transactionCosts?: number;
  
  // DEPRECATED: Legacy sale-specific fields - use purchasePrice and purchaseQuantity instead
  // These fields are kept for backwards compatibility but should not be used in new code
  saleDate?: string; // @deprecated Use purchaseDate instead
  salePrice?: number; // @deprecated Use purchasePrice instead  
  saleQuantity?: number; // @deprecated Use purchaseQuantity instead
  
  // Calculated fields (derived values - not stored)
  totalReturn?: number;
  totalReturnPercentage?: number;
  
  notes?: string;
  cachedDividends?: CachedDividends;
}

// Alias für Rückwärtskompatibilität während der Migration
export type Asset = Transaction;
