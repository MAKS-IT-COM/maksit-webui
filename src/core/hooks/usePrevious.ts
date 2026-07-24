import { useEffect, useRef } from 'react'

/**
 * Returns the value from the previous render (undefined on first render).
 */
const usePrevious = <T>(value: T): T | undefined => {
  const ref = useRef<T | undefined>(undefined)

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref.current
}

export { usePrevious }
