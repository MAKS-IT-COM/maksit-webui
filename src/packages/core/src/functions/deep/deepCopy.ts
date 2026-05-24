/**
 * Creates a deep clone of a value, preserving structure for objects and arrays.
 *
 * Primitives, `Date`, `RegExp`, and functions are returned as-is. Circular references
 * are handled via a `WeakMap` so the same object graph is not copied infinitely.
 *
 * @param obj - Value to clone.
 * @param seen - Internal map of already-cloned objects (used for cycle detection).
 * @returns A deep copy of `obj`.
 */
const deepCopy = <T>(obj: T, seen = new WeakMap<object, unknown>()): T =>{
  if (
    obj === null ||
    typeof obj !== 'object' ||
    obj instanceof Date ||
    obj instanceof RegExp ||
    obj instanceof Function
  ) {
    return obj
  }

  if (seen.has(obj as object)) {
    return seen.get(obj as object) as T
  }

  if (Array.isArray(obj)) {
    const arrCopy: unknown[] = []
    seen.set(obj, arrCopy)
    for (const item of obj) {
      arrCopy.push(deepCopy(item, seen))
    }
    return arrCopy as T
  }

  const objCopy = {} as { [K in keyof T]: T[K] }
  seen.set(obj, objCopy)

  for (const key of Object.keys(obj) as Array<keyof T>) {
    objCopy[key] = deepCopy(obj[key], seen)
  }

  return objCopy
}

export { deepCopy }
