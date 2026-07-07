import { deepCopy } from '../deep/deepCopy'
import type { FormPath } from './formPath'

/**
 * Returns a new form state with a nested field updated immutably.
 *
 * Deep-copies the current state, walks the dot-separated `key`, and assigns `value`
 * at the leaf. Safe for nested objects; does not mutate the input.
 *
 * @param formState - Current form values.
 * @param key - Dot-notation path to the field (supports up to depth 10).
 * @param value - New value for the target field.
 * @returns Updated form state copy.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const applyFormFieldChange = <T extends Record<string, any>>(
  formState: T,
  key: FormPath<T, 10>,
  value: unknown
): T => {
  const newState = deepCopy(formState)

  const keys = key.split('.')
  const lastKey = keys.pop()!

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nestedState = keys.reduce((acc, k) => acc[k], newState) as Record<string, any>
  nestedState[lastKey] = value

  return newState
}

export {
  applyFormFieldChange
}
