/**
 * Specialized UI component types
 */


import type { Asset } from '@/types/domains/assets';

import type { FieldErrors, UseFormSetValue } from 'react-hook-form';

// Generic field change handler
export type FieldChangeHandler = (field: string, value: unknown) => void;

// Basic asset information props
export interface BasicAssetInformationProps {
  selectedAsset: Asset;
  onAssetSelect: (asset: Asset) => void;
  onChange: FieldChangeHandler;
  errors: FieldErrors; // Properly typed react-hook-form errors
}

// Additional information section props
export interface AdditionalInformationSectionProps {
  setValue: UseFormSetValue<Record<string, unknown>> | ((name: string, value: unknown) => void);
  errors: FieldErrors; // Properly typed react-hook-form errors
}

// Form field value type
export type FormFieldValue = string | number | boolean | Date | null | undefined;

// Generic form change handler
export type FormChangeHandler<T = FormFieldValue> = (value: T) => void;

// Asset transaction form field handlers  
export interface AssetTransactionFieldHandlers {
  onNameChange: FormChangeHandler<string>;
  onPurchaseDateChange: FormChangeHandler<string>;
  onPurchasePriceChange: FormChangeHandler<number>;
  onPurchaseQuantityChange: FormChangeHandler<number>; // For both buy and sell transactions
  // DEPRECATED: Legacy sale-specific handlers - use purchase handlers instead
  onSaleDateChange: FormChangeHandler<string>; // @deprecated Use onPurchaseDateChange instead
  onSalePriceChange: FormChangeHandler<number>; // @deprecated Use onPurchasePriceChange instead
  onSaleQuantityChange: FormChangeHandler<number>; // @deprecated Use onPurchaseQuantityChange instead
  onTransactionCostsChange: FormChangeHandler<number>;
  onNotesChange: FormChangeHandler<string>;
}

// Portfolio recent activities types
export type PortfolioActivityEntry = {
  type: string;
  name: string;
  amount?: number;
  date?: string;
  [key: string]: unknown;
};

export interface PortfolioRecentActivitiesProps {
  activities: PortfolioActivityEntry[];
  maxItems?: number;
}
