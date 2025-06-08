import React from 'react';
import { UseFormRegister, FieldValues, Path } from 'react-hook-form';

interface FormFieldProps<T extends FieldValues> {
  readonly label: string;
  readonly name: Path<T>;
  readonly register: UseFormRegister<T>;
  readonly type?: 'text' | 'number' | 'date' | 'select' | 'textarea';
  readonly error?: string;
  readonly options?: ReadonlyArray<{ readonly value: string; readonly label: string }>;
  readonly placeholder?: string;
  readonly className?: string;
  readonly required?: boolean;
  readonly min?: number;
  readonly max?: number;
  readonly step?: number;
  readonly rows?: number;
}

export function FormField<T extends FieldValues>({
  label,
  name,
  register,
  type = 'text',
  error,
  options,
  placeholder,
  className = '',
  required,
  min,
  max,
  step,
  rows,
}: FormFieldProps<T>) {
  const baseClassName = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500";
  
  const renderField = () => {
    if (type === 'select' && options) {
      return (
        <select {...register(name)} className={baseClassName}>
          {options.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      );
    }
    
    if (type === 'textarea') {
      return (
        <textarea
          {...register(name)}
          className={baseClassName}
          placeholder={placeholder}
          rows={rows || 3}
        />
      );
    }

    return (
      <input
        type={type}
        {...register(name)}
        className={baseClassName}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
      />
    );
  };
  
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {renderField()}
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}