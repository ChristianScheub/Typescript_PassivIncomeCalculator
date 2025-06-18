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
import { UseFormConfig } from '../types/shared/';

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
    
    Logger.info('Shared Form submission started');
    
    const onValidSubmit: SubmitHandler<T> = async (data) => {
      try {
        Logger.info('Form validation passed, processing data: ' + JSON.stringify(data));
        await Promise.resolve(onSubmit(data));
        Logger.info('Form submission successful');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        Logger.error('Form submission error: ' + errorMessage);
        if (onError) {
          onError(error);
        }
      }
    };

    const onInvalidSubmit = (errors: typeof form.formState.errors) => {
      Logger.error('Form validation failed with errors: ' + JSON.stringify(errors));
      
      // Log specific field errors for debugging
      Object.entries(errors).forEach(([field, error]) => {
        if (error?.message) {
          Logger.error(`Validation error in field "${field}": ${error.message}`);
        }
      });
      
      // Trigger validation for all fields to show all errors
      form.trigger();
      if (onError) {
        onError(errors);
      }
    };

    return handleSubmit(onValidSubmit, onInvalidSubmit)(e);
  }, [handleSubmit, onSubmit, onError, form]);

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
