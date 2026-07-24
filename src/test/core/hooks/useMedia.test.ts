import { act, renderHook } from '@testing-library/react'
import { useMedia } from '@webui/core/hooks/useMedia'

type Listener = (event: MediaQueryListEvent) => void

const createMatchMedia = (matchesByQuery: Record<string, boolean>) => {
  const listeners = new Map<string, Set<Listener>>()

  return (query: string): MediaQueryList => {
    const matches = matchesByQuery[query] ?? false
    return {
      matches,
      media: query,
      onchange: null,
      addEventListener: (_type: string, listener: EventListenerOrEventListenerObject) => {
        const set = listeners.get(query) ?? new Set()
        set.add(listener as Listener)
        listeners.set(query, set)
      },
      removeEventListener: (_type: string, listener: EventListenerOrEventListenerObject) => {
        listeners.get(query)?.delete(listener as Listener)
      },
      addListener: (listener: Listener) => {
        const set = listeners.get(query) ?? new Set()
        set.add(listener)
        listeners.set(query, set)
      },
      removeListener: (listener: Listener) => {
        listeners.get(query)?.delete(listener)
      },
      dispatchEvent: () => false,
    }
  }
}

describe('useMedia', () => {
  afterEach(() => {
    // @ts-expect-error restore
    delete window.matchMedia
  })

  it('returns the value for the first matching query', () => {
    window.matchMedia = createMatchMedia({
      '(min-width: 800px)': false,
      '(min-width: 500px)': true,
    }) as typeof window.matchMedia

    const { result } = renderHook(() =>
      useMedia(
        ['(min-width: 800px)', '(min-width: 500px)'],
        ['lg', 'md'],
        'sm',
      ),
    )

    expect(result.current).toBe('md')
  })

  it('returns the default when nothing matches', () => {
    window.matchMedia = createMatchMedia({}) as typeof window.matchMedia

    const { result } = renderHook(() =>
      useMedia(['(min-width: 1200px)'], ['xl'], 'base'),
    )

    expect(result.current).toBe('base')
  })

  it('updates when a media query change fires', () => {
    let matches = false
    const changeListeners: Listener[] = []

    window.matchMedia = ((query: string): MediaQueryList => ({
      get matches() {
        return matches
      },
      media: query,
      onchange: null,
      addEventListener: (_type: string, listener: EventListenerOrEventListenerObject) => {
        changeListeners.push(listener as Listener)
      },
      removeEventListener: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      dispatchEvent: () => false,
    })) as typeof window.matchMedia

    const { result } = renderHook(() =>
      useMedia(['(min-width: 600px)'], ['wide'], 'narrow'),
    )

    expect(result.current).toBe('narrow')

    act(() => {
      matches = true
      for (const listener of changeListeners)
        listener({ matches: true } as MediaQueryListEvent)
    })

    expect(result.current).toBe('wide')
  })
})
