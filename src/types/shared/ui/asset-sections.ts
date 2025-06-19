/**
 * Asset form field types for section components
 */

import { FieldErrors, UseFormSetValue } from 'react-hook-form';
import { AssetFormData } from './asset-selection';

export interface BasicAssetInformationProps {
  watch: <K extends keyof AssetFormData>(field: K) => AssetFormData[K];
  setValue: UseFormSetValue<AssetFormData>;
  errors: FieldErrors<AssetFormData>;
  isDefinition?: boolean;
}

export interface AdditionalInformationSectionProps {
  watch: <K extends keyof AssetFormData>(field: K) => AssetFormData[K];
  setValue: UseFormSetValue<AssetFormData>;
  errors?: FieldErrors<AssetFormData>;
  showExchange?: boolean;
}

export interface SectorSectionProps {
  watch: <K extends keyof AssetFormData>(field: K) => AssetFormData[K];
  setValue: UseFormSetValue<AssetFormData>;
  errors?: FieldErrors<AssetFormData>;
}
