import { z } from 'zod';
// String validation creator
const createStringValidation = (options: ValidationOptions): z.ZodString | z.ZodOptional<z.ZodString> => {
  let schema = z.string();
  if (options.max !== undefined && options.min !== undefined) {
    schema = schema.min(options.min).max(options.max);
  } else if (options.max !== undefined) {
    schema = schema.max(options.max);
  } else if (options.min !== undefined) {
    schema = schema.min(options.min);
  }
  if (options.pattern) {
    schema = schema.regex(options.pattern);
  }
  return options.required ? schema : schema.optional();
};
import { 
  FieldType, 
  FieldValidation, 
  ValidationOptions, 
  FieldConfig 
} from '@/types/shared/utils/form-validation';

const createNumberValidation = (options: ValidationOptions): z.ZodNumber | z.ZodOptional<z.ZodNumber> => {
  const schema = z.number();
  
  let withBounds = schema;
  if (options.max !== undefined && options.min !== undefined) {
    withBounds = schema.min(options.min).max(options.max);
  } else if (options.max !== undefined) {
    withBounds = schema.max(options.max);
  } else if (options.min !== undefined) {
    withBounds = schema.min(options.min);
  }
  
  return options.required ? withBounds : withBounds.optional();
};

const createBooleanValidation = (options: ValidationOptions): z.ZodBoolean | z.ZodOptional<z.ZodBoolean> => {
  const schema = z.boolean();
  return options.required ? schema : schema.optional();
};

const createDateValidation = (options: ValidationOptions): z.ZodString | z.ZodOptional<z.ZodString> => {
  const schema = z.string();
  return options.required ? schema.min(1, 'Date is required') : schema.optional();
};

export const createFieldValidation = (
  type: FieldType,
  options: ValidationOptions = {}
): FieldValidation => {
  let schema: FieldValidation;

  switch (type) {
    case 'string':
      schema = createStringValidation(options);
      break;
    case 'number':
      schema = createNumberValidation(options);
      break;
    case 'boolean':
      schema = createBooleanValidation(options);
      break;
    case 'date':
      schema = createDateValidation(options);
      break;
    default:
      throw new Error(`Unsupported field type: ${type}`);
  }

  return options.customValidation ? schema.refine(options.customValidation) : schema;
};

export function createValidationSchema<T extends Record<string, FieldType | FieldConfig>>(
  fields: T
): z.ZodObject<Record<string, FieldValidation>> {
  const shape: Record<string, FieldValidation> = {};

  for (const [key, config] of Object.entries(fields)) {
    const defaultOptions = {};
    if (typeof config === 'string') {
      // Simple field type
      shape[key] = createFieldValidation(config, defaultOptions);
    } else if (typeof config === 'object') {
      // Complex field configuration
      const { type, ...options } = config;
      shape[key] = createFieldValidation(type, options);
    }
  }

  return z.object(shape);
}

// Helper functions for form arrays
export const addArrayItem = <T>(array: T[] | null | undefined, item: T): T[] => {
  return [...(array || []), item];
};

export const removeArrayItem = <T>(array: T[] | null | undefined, index: number): T[] => {
  return (array || []).filter((_, i) => i !== index);
};

export const updateArrayItem = <T>(array: T[] | null | undefined, index: number, item: T): T[] => {
  return (array || []).map((current, i) => (i === index ? item : current));
};

export const getDefaultValues = <T extends Record<string, unknown>>(initialData: Partial<T> | undefined | null, defaultValues: Partial<T>): Partial<T> => {
  if (initialData) {
    return { ...defaultValues, ...initialData };
  }
  return defaultValues;
};
