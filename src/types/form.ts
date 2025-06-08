import { z } from 'zod';

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
  onSubmit: (data: T) => void | Promise<any>;
  onError?: (errors: any) => void;
}
