import { applyFormFieldChange } from './applyFormFieldChange'
import type { FormPath } from './formPath'

/**
 * Curried updater for React `setState` callbacks.
 *
 * @example
 * setFormState(createFormFieldUpdater('address.city', value))
 *
 * @param key - Dot-notation path to the field.
 * @param value - New value for the target field.
 * @returns State updater function `(prev) => next`.
 */
const createFormFieldUpdater = <T extends Record<string, unknown>>(
  key: FormPath<T, 10>,
  value: unknown
) => (prev: T) => applyFormFieldChange(prev, key, value)

export {
  createFormFieldUpdater
}
