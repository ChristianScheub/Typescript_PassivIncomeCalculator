import { z } from 'zod';

export interface FormFieldProps {
  name: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox';
  required?: boolean;
  error?: string;
  value?: any;
  onChange?: (value: any) => void;
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
  helperText?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  multiline?: boolean;
}

export interface FormSectionProps {
  title?: string;
  children: React.ReactNode;
}

export interface FormProps {
  title: string;
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  isLoading?: boolean;
}

export type ValidationSchema = z.ZodType<any, any>;

export interface UseFormConfig<T> {
  validationSchema: ValidationSchema;
  defaultValues: Partial<T>;
  onSubmit: (data: T) => void;
  onError?: (errors: any) => void;
}
