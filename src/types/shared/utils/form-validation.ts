/**
 * Form utility types
 */

import { z } from 'zod';

export type FieldType = 'string' | 'number' | 'boolean' | 'date';
export type FieldValidation = z.ZodTypeAny;

export interface ValidationOptions {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  email?: boolean;
  url?: boolean;
  customValidation?: (value: unknown) => boolean | string;
}

export interface FieldConfig extends ValidationOptions {
  type: FieldType;
}

export interface FormFieldProps<T = unknown> {
  name: string;
  value: T;
  onChange: (value: T) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}
