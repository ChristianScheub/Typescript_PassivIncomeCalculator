import { UseFormProps, useForm, FieldValues, DefaultValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';

interface UseFormConfigProps<T extends FieldValues> {
  onSubmit: (data: T) => void;
  defaultValues?: DefaultValues<T>;
  validationSchema: z.ZodSchema<T>;
}

export function useFormConfig<T extends FieldValues>({
  onSubmit,
  defaultValues,
  validationSchema,
}: UseFormConfigProps<T>) {
  const { t } = useTranslation();

  const formProps: UseFormProps<T> = {
    resolver: zodResolver(validationSchema),
    defaultValues,
  };

  const methods = useForm<T>(formProps);
  const { handleSubmit, formState: { errors } } = methods;

  const onFormSubmit = async (data: T) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return {
    ...methods,
    onFormSubmit: handleSubmit(onFormSubmit),
    errors,
    t,
  };
}

export type FormConfig<T extends FieldValues> = ReturnType<typeof useFormConfig<T>>;
