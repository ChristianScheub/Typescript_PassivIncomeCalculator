import { AssetDefinition } from '../assets/entities';

export interface AssetWithValue {
  assetDefinition: AssetDefinition;
  value: number;
  quantity: number;
  // Add more fields as needed for analytics, e.g. performance, allocation, etc.
}
