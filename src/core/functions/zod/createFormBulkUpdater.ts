import { applyFormBulkChange } from './applyFormBulkChange'

/**
 * Curried bulk updater for React `setState` callbacks.
 *
 * @example
 * setFormState(createFormBulkUpdater((prev) => ({ name: prev.name.trim() })))
 *
 * @param updater - Function returning a partial patch from the previous state.
 * @returns State updater function `(prev) => next`.
 */
const createFormBulkUpdater = <T extends Record<string, unknown>>(
  updater: (prev: T) => Partial<T>
) => (prev: T) => applyFormBulkChange(prev, updater)

export {
  createFormBulkUpdater
}
