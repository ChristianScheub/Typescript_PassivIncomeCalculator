/**
 * Asset selection dropdown types
 */

import { AssetDefinition } from '../../domains/assets';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { AssetFormData } from '../../domains/forms/form-data';

export interface AssetSelectionDropdownProps {
  register: UseFormRegister<AssetFormData>;
  handleDefinitionSelect: (definitionId: string) => void;
  filteredDefinitions: AssetDefinition[];
  errors: FieldErrors<AssetFormData>;
}
