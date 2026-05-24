/**
 * Tests whether all bits in `flag` are set in `current` (exact flag match).
 *
 * @param current - Current bitmask (defaults to `0`).
 * @param flag - Flag or combined flags that must all be present.
 * @returns `true` when `(current & flag) === flag`.
 */
const hasFlag = <T extends number>(current: T = 0 as T, flag: T): boolean => {
  return (current & flag) === flag
}

export { hasFlag }
