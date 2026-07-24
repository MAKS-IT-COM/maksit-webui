import {
  type RefCallback,
  useCallback,
  useRef,
  useState,
} from 'react'

/**
 * Hover state via callback ref (safe when the bound element changes).
 * Returns `[callbackRef, isHovered]`.
 */
const useHover = <T extends Element = HTMLElement>(): [
  RefCallback<T>,
  boolean,
] => {
  const [isHovered, setIsHovered] = useState(false)
  const nodeRef = useRef<T | null>(null)

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
  }, [])

  const callbackRef = useCallback((node: T | null) => {
    if (nodeRef.current) {
      nodeRef.current.removeEventListener('mouseenter', handleMouseEnter)
      nodeRef.current.removeEventListener('mouseleave', handleMouseLeave)
    }

    nodeRef.current = node

    if (node) {
      node.addEventListener('mouseenter', handleMouseEnter)
      node.addEventListener('mouseleave', handleMouseLeave)
    }
  }, [handleMouseEnter, handleMouseLeave])

  return [callbackRef, isHovered]
}

export { useHover }
