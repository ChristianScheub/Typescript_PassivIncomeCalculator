import { UseFormProps, useForm, FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { UseFormConfigProps } from '@/types/shared/hooks/form-config';

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

  const onFormSubmit = (data: T) => {
    try {
      onSubmit(data);
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
