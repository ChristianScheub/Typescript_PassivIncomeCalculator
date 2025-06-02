import { 
  useForm, 
  UseFormReturn, 
  FieldValues,
  UseFormProps,
  SubmitHandler,
  DefaultValues
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback } from 'react';
import Logger from '../service/Logger/logger';
import { UseFormConfig } from '../types/form';

export interface UseSharedFormReturn<T extends FieldValues> extends Omit<UseFormReturn<T>, 'handleSubmit'> {
  onFormSubmit: (e?: React.FormEvent) => void;
  isLoading: boolean;
}

export function useSharedForm<T extends FieldValues>({
  validationSchema,
  defaultValues,
  onSubmit,
  onError,
}: UseFormConfig<T>): UseSharedFormReturn<T> {
  const formConfig: UseFormProps<T> = {
    resolver: zodResolver(validationSchema),
    defaultValues: defaultValues as DefaultValues<T>,
    mode: 'onChange',
  };

  const form = useForm<T>(formConfig);

  const { handleSubmit, formState: { errors, isSubmitting } } = form;

  // Log validation errors in development
  if (process.env.NODE_ENV === 'development' && Object.keys(errors).length > 0) {
    Logger.error(JSON.stringify(errors));
  }

  const handleFormSubmit = useCallback((e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    const onValidSubmit: SubmitHandler<T> = async (data) => {
      try {
        Logger.info(JSON.stringify(data));
        const result = onSubmit(data);
        // Only handle result if it's a Promise
        if (result instanceof Promise) {
          await result;
        }
      } catch (error) {
        Logger.error(error instanceof Error ? error.message : 'Unknown error');
        if (onError) {
          onError(error);
        }
      }
    };

    const onInvalidSubmit = (errors: typeof form.formState.errors) => {
      Logger.error(JSON.stringify(errors));
      if (onError) {
        onError(errors);
      }
    };

    return handleSubmit(onValidSubmit, onInvalidSubmit)(e);
  }, [handleSubmit, onSubmit, onError]);

  const { handleSubmit: _, ...restForm } = form;

  return {
    ...restForm,
    onFormSubmit: handleFormSubmit,
    isLoading: isSubmitting,
  };
}

// Helper types for form array operations
export type FormArrayOperation<T> = {
  append: (value: T) => void;
  remove: (index: number) => void;
  update: (index: number, value: T) => void;
}

// Form array helper hook
export function useFormArray<T>(form: UseFormReturn<any>, name: string): FormArrayOperation<T> & { fields: T[] } {
  const { getValues, setValue } = form;
  
  return {
    fields: getValues(name) || [],
    append: (value: T) => {
      const current = getValues(name) || [];
      setValue(name, [...current, value], { shouldValidate: true });
    },
    remove: (index: number) => {
      const current = getValues(name) || [];
      setValue(
        name,
        current.filter((_: T, i: number) => i !== index),
        { shouldValidate: true }
      );
    },
    update: (index: number, value: T) => {
      const current = getValues(name) || [];
      setValue(
        name,
        current.map((item: T, i: number) => (i === index ? value : item)),
        { shouldValidate: true }
      );
    },
  };
}

// Re-export form components
export { useForm };
