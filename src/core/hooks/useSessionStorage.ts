import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

const readStorage = <T>(key: string, fallback: T): T => {
  if (typeof window === 'undefined')
    return fallback

  try {
    const item = window.sessionStorage.getItem(key)
    if (item === null)
      return fallback

    return JSON.parse(item) as T
  }
  catch {
    return fallback
  }
}

const writeStorage = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined')
    return

  try {
    window.sessionStorage.setItem(key, JSON.stringify(value))
  }
  catch {
    // Ignore quota / private mode.
  }
}

/**
 * `useState` synced to `sessionStorage`. Listens for same-origin `storage` events
 * (e.g. iframes sharing the tab session).
 */
const useSessionStorage = <T>(
  key: string,
  initialValue: T,
): [T, Dispatch<SetStateAction<T>>] => {
  const initialRef = useRef(initialValue)
  initialRef.current = initialValue

  const [storedValue, setStoredValue] = useState<T>(() =>
    readStorage(key, initialValue),
  )

  const setValue: Dispatch<SetStateAction<T>> = useCallback((value) => {
    setStoredValue((prev) => {
      const next = value instanceof Function ? value(prev) : value
      writeStorage(key, next)
      return next
    })
  }, [key])

  useEffect(() => {
    setStoredValue(readStorage(key, initialRef.current))
  }, [key])

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.storageArea !== window.sessionStorage || event.key !== key)
        return

      if (event.newValue === null) {
        setStoredValue(initialRef.current)
        return
      }

      try {
        setStoredValue(JSON.parse(event.newValue) as T)
      }
      catch {
        setStoredValue(initialRef.current)
      }
    }

    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [key])

  return [storedValue, setValue]
}

export { useSessionStorage }
