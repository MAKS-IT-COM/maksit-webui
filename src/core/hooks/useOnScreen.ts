import {
  type RefObject,
  useEffect,
  useState,
} from 'react'

export interface UseOnScreenOptions extends IntersectionObserverInit {
  /** When true, stay `true` after the first intersection and disconnect. */
  once?: boolean
}

/**
 * Tracks whether `ref`'s element intersects the viewport (or `root`).
 */
const useOnScreen = <T extends Element>(
  ref: RefObject<T | null>,
  options: UseOnScreenOptions = {},
): boolean => {
  const {
    once = false,
    root = null,
    rootMargin = '0px',
    threshold = 0,
  } = options

  const [isIntersecting, setIsIntersecting] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element || typeof IntersectionObserver === 'undefined')
      return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry)
          return

        setIsIntersecting(entry.isIntersecting)

        if (once && entry.isIntersecting)
          observer.disconnect()
      },
      {
        root,
        rootMargin,
        threshold,
      },
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [ref, once, root, rootMargin, threshold])

  return isIntersecting
}

export { useOnScreen }
