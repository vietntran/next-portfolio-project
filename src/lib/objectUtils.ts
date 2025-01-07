// src/lib/objectUtils.ts

/**
 * Creates a new object excluding specified fields
 * @param obj The input object
 * @param fieldsToExclude Array of field names to exclude
 * @returns A new object without the specified fields
 */
export function excludeFields<T extends Record<string, unknown>>(
  obj: T,
  fieldsToExclude: Array<keyof T>
): Partial<T> {
  const result = { ...obj };

  fieldsToExclude.forEach((field) => {
    delete result[field];
  });

  return result;
}
