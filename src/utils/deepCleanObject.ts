// Recursively remove undefined, null, and extraneous fields from an object
// Optionally, restrict to allowed keys (schemaKeys)
export function deepCleanObject<T extends object>(obj: T, schemaKeys?: string[]): T {
  if (Array.isArray(obj)) {
    // @ts-ignore
    return obj.map((item) => deepCleanObject(item, schemaKeys)).filter((v) => v != null);
  }
  if (typeof obj !== 'object' || obj === null) return obj;
  const cleaned: any = {};
  const keys = schemaKeys || Object.keys(obj);
  for (const key of keys) {
    if (!(key in obj)) continue;
    const value = (obj as any)[key];
    if (value === undefined || value === null) continue;
    if (typeof value === 'object' && !Array.isArray(value)) {
      const nested = deepCleanObject(value);
      if (Object.keys(nested).length > 0) cleaned[key] = nested;
    } else if (Array.isArray(value)) {
      const arr = value.map((v) => deepCleanObject(v)).filter((v) => v != null);
      if (arr.length > 0) cleaned[key] = arr;
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
}
