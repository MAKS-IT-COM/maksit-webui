/**
 * Checks whether `obj` is a structural subset of `pattern` (same keys, compatible types).
 *
 * `obj` may have fewer keys than `pattern`, but must not introduce extra keys or
 * mismatch value types for keys present in both. Useful for partial object matching
 * in guards and filters.
 *
 * @param pattern - Expected shape (keys and value types).
 * @param obj - Candidate object to test.
 * @returns `true` when `obj` matches the pattern shape.
 */
const deepPatternMatch = <T extends object>(pattern: T, obj: unknown): boolean => {
  if (typeof obj !== 'object' || obj === null)
    return false

  const objKeys = Object.keys(obj as object)
  const patternKeys = Object.keys(pattern)

  // obj must not have more keys than pattern
  if (objKeys.length > patternKeys.length)
    return false

  for (const key of objKeys) {
    if (!(key in pattern))
      return false

    if (typeof (obj as T)[key as keyof T] !== typeof pattern[key as keyof T])
      return false
  }
  return true
}

export { deepPatternMatch }
