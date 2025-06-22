import { AssetType } from "@/types/shared";

export interface MaterialAssetFormData {
  // Required fields
  name: string;
  type: AssetType;
  value?: number;
  purchaseDate?: string;

  // Stock specific fields
  ticker?: string;
  quantity?: number;
  purchasePrice?: number;
  currentPrice?: number;

  // Real estate specific fields
  propertyValue?: number;

  // Crypto specific fields
  symbol?: string;
  acquisitionCost?: number;

  // Transaction notes
  notes?: string;

  // System fields
  id?: string;
  createdAt?: string;
  updatedAt?: string;
}
