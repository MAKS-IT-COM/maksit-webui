/**
 * Toggles a single flag bit in a bitmask on or off.
 *
 * If `flag` is already fully set, it is cleared; otherwise it is OR'd in.
 *
 * @param current - Current bitmask (defaults to `0`).
 * @param flag - Bit(s) to toggle.
 * @returns Updated bitmask with `flag` toggled.
 */
const toggleFlag = <T extends number>(current: T = 0 as T, flag: T): T => {
  return ((current & flag) === flag ? (current & ~flag) : (current | flag)) as T
}

export { toggleFlag }