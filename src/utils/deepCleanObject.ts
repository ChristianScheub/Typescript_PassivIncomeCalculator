// Recursively remove undefined, null, and extraneous fields from an object
// Optionally, restrict to allowed keys (schemaKeys)
function cleanArray(arr: unknown[], schemaKeys?: string[]): unknown[] {
  return arr
    .map((item) => (typeof item === 'object' && item !== null ? deepCleanObject(item as Record<string, unknown>, schemaKeys) : item))
    .filter((v) => v != null && (typeof v !== 'object' || Array.isArray(v) || Object.keys(v).length > 0));
}

function cleanObject(obj: Record<string, unknown>, schemaKeys?: string[]): Record<string, unknown> {
  const cleaned: Record<string, unknown> = {};
  const keys = schemaKeys || Object.keys(obj);
  for (const key of keys) {
    if (!(key in obj)) continue;
    const value = obj[key];
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      const arr = cleanArray(value);
      // Arrays should always be preserved, even if empty
      cleaned[key] = arr;
    } else if (typeof value === 'object') {
      const nested = deepCleanObject(value as Record<string, unknown>);
      if (nested && Object.keys(nested).length > 0) cleaned[key] = nested;
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

export function deepCleanObject<T extends object>(obj: T, schemaKeys?: string[]): T {
  if (Array.isArray(obj)) {
    return cleanArray(obj, schemaKeys) as T;
  }
  if (typeof obj !== 'object' || obj === null) return obj;
  return cleanObject(obj as Record<string, unknown>, schemaKeys) as T;
}
