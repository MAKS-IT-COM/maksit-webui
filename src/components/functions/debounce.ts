/** Trailing-edge debounce; lodash/debounce was only used for this pattern. */
export const debounce = <Args extends unknown[]>(
  fn: (...args: Args) => void,
  waitMs: number
): ((...args: Args) => void) => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined

  return (...args: Args) => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => {
      timeoutId = undefined
      fn(...args)
    }, waitMs)
  }
}
