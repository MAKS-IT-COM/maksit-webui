import {
  type MouseEvent,
  type TouchEvent,
  useCallback,
  useEffect,
  useRef,
} from 'react'

export interface UseLongPressOptions {
  onLongPress: (event: MouseEvent | TouchEvent) => void
  onClick?: (event: MouseEvent | TouchEvent) => void
  delayMs?: number
  shouldPreventDefault?: boolean
}

export interface UseLongPressHandlers {
  onMouseDown: (event: MouseEvent) => void
  onTouchStart: (event: TouchEvent) => void
  onMouseUp: (event: MouseEvent) => void
  onMouseLeave: (event: MouseEvent) => void
  onTouchEnd: (event: TouchEvent) => void
}

const isTouchEvent = (event: Event): event is globalThis.TouchEvent =>
  'touches' in event

const preventTouchDefault = (event: Event) => {
  if (!isTouchEvent(event))
    return

  if (event.touches.length < 2 && event.cancelable)
    event.preventDefault()
}

/**
 * Returns pointer handlers that fire `onLongPress` after `delayMs`,
 * or `onClick` on a short press.
 */
const useLongPress = ({
  onLongPress,
  onClick,
  delayMs = 300,
  shouldPreventDefault = true,
}: UseLongPressOptions): UseLongPressHandlers => {
  const timeoutRef = useRef<number | undefined>(undefined)
  const targetRef = useRef<EventTarget | null>(null)
  const longPressTriggeredRef = useRef(false)

  const onLongPressRef = useRef(onLongPress)
  const onClickRef = useRef(onClick)

  useEffect(() => {
    onLongPressRef.current = onLongPress
  }, [onLongPress])

  useEffect(() => {
    onClickRef.current = onClick
  }, [onClick])

  useEffect(() => () => {
    if (timeoutRef.current !== undefined)
      window.clearTimeout(timeoutRef.current)

    if (targetRef.current)
      targetRef.current.removeEventListener('touchend', preventTouchDefault)
  }, [])

  const start = useCallback((event: MouseEvent | TouchEvent) => {
    longPressTriggeredRef.current = false

    if (shouldPreventDefault && event.target) {
      event.target.addEventListener('touchend', preventTouchDefault, { passive: false })
      targetRef.current = event.target
    }

    timeoutRef.current = window.setTimeout(() => {
      onLongPressRef.current(event)
      longPressTriggeredRef.current = true
    }, delayMs)
  }, [delayMs, shouldPreventDefault])

  const clear = useCallback((event: MouseEvent | TouchEvent, shouldTriggerClick = true) => {
    if (timeoutRef.current !== undefined) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = undefined
    }

    if (shouldTriggerClick && !longPressTriggeredRef.current)
      onClickRef.current?.(event)

    longPressTriggeredRef.current = false

    if (shouldPreventDefault && targetRef.current) {
      targetRef.current.removeEventListener('touchend', preventTouchDefault)
      targetRef.current = null
    }
  }, [shouldPreventDefault])

  return {
    onMouseDown: (event) => start(event),
    onTouchStart: (event) => start(event),
    onMouseUp: (event) => clear(event),
    onMouseLeave: (event) => clear(event, false),
    onTouchEnd: (event) => clear(event),
  }
}

export { useLongPress }
