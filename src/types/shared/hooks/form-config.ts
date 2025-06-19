/**
 * Form configuration hook types
 */

import { FieldValues, DefaultValues } from 'react-hook-form';
import { z } from 'zod';

export interface UseFormConfigProps<T extends FieldValues> {
  onSubmit: (data: T) => void;
  defaultValues?: DefaultValues<T>;
  validationSchema: z.ZodSchema<T>;
}
