/**
 * Specialized UI component types
 */

import { UseFormSetValue } from 'react-hook-form';

// Generic field change handler
export type FieldChangeHandler = (field: string, value: any) => void;

// Basic asset information props
export interface BasicAssetInformationProps {
  selectedAsset: any; // TODO: Type this as Asset when available
  onAssetSelect: (asset: any) => void; // TODO: Type this as Asset when available
  onChange: FieldChangeHandler;
  errors: Record<string, any>; // TODO: Type this properly with react-hook-form error types
}

// Additional information section props
export interface AdditionalInformationSectionProps {
  setValue: UseFormSetValue<any> | ((name: string, value: any) => void);
  errors: Record<string, any>; // TODO: Type this properly with react-hook-form error types
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
  [key: string]: any;
};

export interface PortfolioRecentActivitiesProps {
  activities: PortfolioActivityEntry[];
  maxItems?: number;
}
