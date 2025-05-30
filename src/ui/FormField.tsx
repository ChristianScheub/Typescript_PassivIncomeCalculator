import { UseFormRegister, FieldValues, Path } from 'react-hook-form';

interface FormFieldProps<T extends FieldValues> {
  label: string;
  name: Path<T>;
  register: UseFormRegister<T>;
  type?: 'text' | 'number' | 'date' | 'select' | 'textarea';
  error?: string;
  options?: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
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
  
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {type === 'select' && options ? (
        <select {...register(name)} className={baseClassName}>
          {options.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          {...register(name)}
          rows={rows || 3}
          placeholder={placeholder}
          className={baseClassName}
        />
      ) : (
        <input
          type={type}
          {...register(name)}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          className={baseClassName}
        />
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}