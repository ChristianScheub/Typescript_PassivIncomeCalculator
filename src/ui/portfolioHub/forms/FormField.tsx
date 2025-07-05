import React from 'react';
import { cn } from '@/utils/cn';
import { Input, InputProps } from './Input';
import { Label } from './Label';
import { Select, SelectProps } from './Select';

interface BaseFormFieldProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
}

interface FormFieldInputProps extends BaseFormFieldProps {
  type: 'input';
  inputProps: InputProps;
}

interface FormFieldSelectProps extends BaseFormFieldProps {
  type: 'select';
  selectProps: SelectProps;
}

type FormFieldProps = FormFieldInputProps | FormFieldSelectProps;

export const FormField: React.FC<FormFieldProps> = ({ 
  label, 
  error, 
  hint, 
  required, 
  className,
  type,
  ...typeProps
}) => {
  const hasError = Boolean(error);
  const fieldId = React.useId();

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label 
          htmlFor={fieldId}
          variant={hasError ? "error" : "default"}
          className="block"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      
      {type === 'input' && (
        <Input
          id={fieldId}
          variant={hasError ? "error" : "default"}
          {...(typeProps as FormFieldInputProps).inputProps}
        />
      )}
      
      {type === 'select' && (
        <Select
          id={fieldId}
          variant={hasError ? "error" : "default"}
          {...(typeProps as FormFieldSelectProps).selectProps}
        />
      )}
      
      {hint && !error && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {hint}
        </p>
      )}
      
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;
