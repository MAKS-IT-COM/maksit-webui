import {
  type RefObject,
  useEffect,
  useRef,
} from 'react'

/**
 * Invokes `handler` when a pointer/touch event occurs outside `ref`.
 */
const useOnClickOutside = <T extends Element>(
  ref: RefObject<T | null>,
  handler: (event: MouseEvent | TouchEvent) => void,
): void => {
  const handlerRef = useRef(handler)

  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const element = ref.current
      if (!element || element.contains(event.target as Node))
        return

      handlerRef.current(event)
    }

    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)

    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [ref])
}

export { useOnClickOutside }
