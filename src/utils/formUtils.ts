import { z } from 'zod';

// Basic field types
const baseFields = {
  name: z.string().min(1, 'Name is required'),
  notes: z.string().optional(),
  // Common fields for dates
  startDate: z.string(),
  endDate: z.string().optional(),
};

// Payment schedule validation
export const paymentScheduleSchema = z.object({
  frequency: z.enum(['monthly', 'quarterly', 'annually', 'custom', 'none']),
  amount: z.number().min(0, 'Payment amount must be positive'),
  months: z.array(z.number().min(1).max(12)).optional(),
  customAmounts: z.record(z.number()).optional(),
});

// Form validation utilities
export type ValidationSchema = z.ZodType<any, any>;

export interface ValidationOptions {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  customValidation?: (value: any) => boolean;
}

export const createFieldValidation = (
  type: 'string' | 'number' | 'boolean' | 'date',
  options: ValidationOptions = {}
) => {
  let schema: z.ZodTypeAny;

  switch (type) {
    case 'string': {
      let stringSchema = z.string();
      if (options.pattern) {
        stringSchema = stringSchema.regex(options.pattern);
      }
      schema = options.required
        ? stringSchema.min(1, 'Field is required')
        : stringSchema.optional();
      break;
    }

    case 'number':
      let numberSchema = z.number();
      if (options.min !== undefined) {
        numberSchema = numberSchema.min(options.min);
      }
      if (options.max !== undefined) {
        numberSchema = numberSchema.max(options.max);
      }
      schema = !options.required ? numberSchema.optional() : numberSchema;
      break;

    case 'boolean':
      schema = z.boolean();
      if (!options.required) {
        schema = schema.optional();
      }
      break;

    case 'date':
      let dateSchema = z.string();
      schema = options.required
        ? dateSchema.min(1, 'Date is required')
        : dateSchema.optional();
      break;

    default:
      throw new Error(`Unsupported field type: ${type}`);
  }

  if (options.customValidation) {
    schema = schema.refine(options.customValidation);
  }

  return schema;
};

export function createValidationSchema<T extends Record<string, any>>(
  fields: T
): z.ZodObject<any> {
  const shape: Record<string, z.ZodType<any>> = {};

  for (const [key, config] of Object.entries(fields)) {
    if (typeof config === 'string') {
      // Simple field type
      shape[key] = createFieldValidation(config as any);
    } else if (typeof config === 'object') {
      // Complex field configuration
      const { type, ...options } = config;
      shape[key] = createFieldValidation(type, options);
    }
  }

  return z.object(shape);
}

export const getDefaultValues = <T extends Record<string, any>>(
  initialData: Partial<T> | undefined,
  defaultValues: Partial<T>
): Partial<T> => {
  if (initialData) {
    return { ...defaultValues, ...initialData };
  }
  return defaultValues;
};

// Helper functions for form arrays
export const addArrayItem = <T>(array: T[] = [], item: T): T[] => {
  return [...array, item];
};

export const removeArrayItem = <T>(array: T[] = [], index: number): T[] => {
  return array.filter((_, i) => i !== index);
};

export const updateArrayItem = <T>(array: T[] = [], index: number, item: T): T[] => {
  return array.map((current, i) => (i === index ? item : current));
};

// Re-export base fields for use in form schemas
export { baseFields };
