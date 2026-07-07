import type { FormPath } from './formPath'

/**
 * Builds an empty error map with one blank string per top-level form key.
 *
 * Used when validation succeeds so UI bindings always receive a stable errors shape.
 *
 * @param formState - Current form values.
 * @returns Map of top-level keys to empty error strings.
 */
const emptyFormErrors = <T extends Record<string, unknown>>(
  formState: T
): Partial<Record<FormPath<T>, string>> =>
  Object.keys(formState).reduce((acc, key) => ({
    ...acc,
    [key]: ''
  }), {} as Partial<Record<FormPath<T>, string>>)

export {
  emptyFormErrors
}
