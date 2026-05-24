/**
 * Tests whether any bit in `flags` is set in `current`.
 *
 * @param current - Current bitmask (defaults to `0`).
 * @param flags - Flag mask; any overlapping bit satisfies the check.
 * @returns `true` when `(current & flags) !== 0`.
 */
const hasAnyFlag = <T extends number>(current: T = 0 as T, flags: T): boolean => {
  return (current & flags) !== 0
}

export { hasAnyFlag }