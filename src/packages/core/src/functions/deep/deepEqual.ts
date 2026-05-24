import { deepCopy } from './deepCopy.js'

/**
 * Recursively compares two values for deep structural equality.
 *
 * Arrays are compared order-independently via {@link deepEqualArrays}. Objects are
 * compared by key set and recursive value equality. Primitives use strict equality
 * after a defensive deep copy.
 *
 * @param objA - First value.
 * @param objB - Second value.
 * @returns `true` when both values are deeply equal.
 */
const deepEqual = (objA: unknown, objB: unknown): boolean => {
  const copyA = deepCopy(objA)
  const copyB = deepCopy(objB)

  if (copyA === copyB) {
    return true
  }

  if (Array.isArray(copyA) && Array.isArray(copyB)) {
    return deepEqualArrays(copyA, copyB)
  }

  if (
    typeof copyA !== 'object' ||
    typeof copyB !== 'object' ||
    copyA === null ||
    copyB === null
  ) {
    return false
  }

  const keysA = Object.keys(copyA)
  const keysB = Object.keys(copyB)

  if (keysA.length !== keysB.length) {
    return false
  }

  for (const key of keysA) {
    if (!keysB.includes(key)) {
      return false
    }

    const valA = (copyA as Record<string, unknown>)[key]
    const valB = (copyB as Record<string, unknown>)[key]

    if (!deepEqual(valA, valB)) {
      return false
    }
  }

  return true
}

/**
 * Compares two arrays for deep equality regardless of element order.
 *
 * Each element in `arrA` must match exactly one unmatched element in `arrB`.
 * Empty arrays are equal. Uses {@link deepEqual} for element comparison.
 *
 * @param arrA - First array.
 * @param arrB - Second array.
 * @returns `true` when both arrays contain the same elements (multiset equality).
 */
const deepEqualArrays = (arrA: unknown[], arrB: unknown[]): boolean => {
  const copyA = deepCopy(arrA)
  const copyB = deepCopy(arrB)

  if (copyA.length !== copyB.length) {
    return false
  }

  if (copyA.length === 0 && copyB.length === 0) {
    return true
  }

  for (const itemA of copyA) {
    const matchIndex = copyB.findIndex((itemB) => deepEqual(itemA, itemB))
    if (matchIndex === -1) {
      return false
    }
    copyB.splice(matchIndex, 1)
  }

  return true
}

export { deepEqual, deepEqualArrays }
