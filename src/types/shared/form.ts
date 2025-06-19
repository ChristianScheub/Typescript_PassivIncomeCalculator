import { z } from 'zod';
import { FieldErrors, FieldValues } from 'react-hook-form';

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

export type ValidationSchema<T = unknown> = z.ZodType<T>;

export interface UseFormConfig<T extends FieldValues> {
  validationSchema: ValidationSchema<T>;
  defaultValues: Partial<T>;
  onSubmit: (data: T) => void | Promise<void>;
  onError?: (errors: FieldErrors<T>) => void;
}
