/**
 * Shallow-merges partial updates from an updater into the previous form state.
 *
 * The updater receives the full previous state and returns only the fields to change.
 *
 * @param prev - Current form values.
 * @param updater - Function returning a partial patch.
 * @returns New state with the patch applied.
 */
const applyFormBulkChange = <T extends Record<string, unknown>>(
  prev: T,
  updater: (prev: T) => Partial<T>
): T => ({ ...prev, ...updater(prev) })

export {
  applyFormBulkChange
}
