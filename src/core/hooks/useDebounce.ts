import { useEffect, useState } from 'react'

/**
 * Debounces `value` by `delayMs`. Useful for search inputs and remote filters.
 */
const useDebounce = <T>(value: T, delayMs: number): T => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const id = window.setTimeout(() => {
      setDebouncedValue(value)
    }, delayMs)

    return () => window.clearTimeout(id)
  }, [value, delayMs])

  return debouncedValue
}

export { useDebounce }
