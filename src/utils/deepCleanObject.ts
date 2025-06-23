// Recursively remove undefined, null, and extraneous fields from an object
// Optionally, restrict to allowed keys (schemaKeys)
function cleanArray(arr: any[], schemaKeys?: string[]): any[] {
  return arr
    .map((item) => deepCleanObject(item, schemaKeys))
    .filter((v) => v != null && (typeof v !== 'object' || Object.keys(v).length > 0));
}

function cleanObject(obj: any, schemaKeys?: string[]): any {
  const cleaned: any = {};
  const keys = schemaKeys || Object.keys(obj);
  for (const key of keys) {
    if (!(key in obj)) continue;
    const value = obj[key];
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      const arr = cleanArray(value);
      if (arr.length > 0) cleaned[key] = arr;
    } else if (typeof value === 'object') {
      const nested = deepCleanObject(value);
      if (nested && Object.keys(nested).length > 0) cleaned[key] = nested;
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

export function deepCleanObject<T extends object>(obj: T, schemaKeys?: string[]): T {
  if (Array.isArray(obj)) {
    // @ts-ignore
    return cleanArray(obj, schemaKeys) as any;
  }
  if (typeof obj !== 'object' || obj === null) return obj;
  // @ts-ignore
  return cleanObject(obj, schemaKeys);
}
