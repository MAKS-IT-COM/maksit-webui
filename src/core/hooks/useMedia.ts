import { useEffect, useRef, useState } from 'react'

/**
 * Returns the value for the first matching media query.
 * `queries` and `values` are paired by index; `defaultValue` is used when none match.
 */
const useMedia = <T>(
  queries: string[],
  values: T[],
  defaultValue: T,
): T => {
  const valuesRef = useRef(values)
  valuesRef.current = values

  const defaultRef = useRef(defaultValue)
  defaultRef.current = defaultValue

  const queryKey = queries.join('|')

  const resolve = () => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
      return defaultRef.current

    const list = queryKey === '' ? [] : queryKey.split('|')
    const index = list.findIndex((query) => window.matchMedia(query).matches)
    if (index === -1)
      return defaultRef.current

    return valuesRef.current[index] ?? defaultRef.current
  }

  const [value, setValue] = useState<T>(resolve)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
      return

    const list = queryKey === '' ? [] : queryKey.split('|')
    const mediaQueryLists = list.map((query) => window.matchMedia(query))

    const onChange = () => {
      setValue(resolve())
    }

    onChange()

    for (const mql of mediaQueryLists) {
      if (typeof mql.addEventListener === 'function')
        mql.addEventListener('change', onChange)
      else
        mql.addListener(onChange)
    }

    return () => {
      for (const mql of mediaQueryLists) {
        if (typeof mql.removeEventListener === 'function')
          mql.removeEventListener('change', onChange)
        else
          mql.removeListener(onChange)
      }
    }
  }, [queryKey])

  return value
}

export { useMedia }
