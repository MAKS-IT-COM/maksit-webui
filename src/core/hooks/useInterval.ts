import { useEffect, useRef } from 'react'

/**
 * Declarative `setInterval`. Pass `delay: null` to pause.
 */
const useInterval = (callback: () => void, delay: number | null): void => {
  const savedCallback = useRef(callback)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (delay === null)
      return

    const id = window.setInterval(() => {
      savedCallback.current()
    }, delay)

    return () => window.clearInterval(id)
  }, [delay])
}

export { useInterval }
