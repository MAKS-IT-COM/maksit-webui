import { act, renderHook } from '@testing-library/react'
import { createRef } from 'react'
import { useOnScreen } from '@webui/core/hooks/useOnScreen'

describe('useOnScreen', () => {
  const observe = jest.fn()
  const disconnect = jest.fn()
  let callback: IntersectionObserverCallback | undefined

  beforeEach(() => {
    observe.mockClear()
    disconnect.mockClear()
    callback = undefined

    class MockIntersectionObserver implements IntersectionObserver {
      readonly root = null
      readonly rootMargin = '0px'
      readonly thresholds = [0]

      constructor(cb: IntersectionObserverCallback) {
        callback = cb
      }

      observe = observe
      unobserve = jest.fn()
      disconnect = disconnect
      takeRecords = () => []
    }

    Object.defineProperty(window, 'IntersectionObserver', {
      configurable: true,
      writable: true,
      value: MockIntersectionObserver,
    })
  })

  it('tracks intersection and disconnects when once is true', () => {
    const element = document.createElement('div')
    document.body.append(element)
    const ref = createRef<HTMLDivElement>()
    // @ts-expect-error assign for test
    ref.current = element

    const { result } = renderHook(() => useOnScreen(ref, { once: true }))
    expect(result.current).toBe(false)
    expect(observe).toHaveBeenCalledWith(element)

    act(() => {
      callback?.(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      )
    })

    expect(result.current).toBe(true)
    expect(disconnect).toHaveBeenCalled()

    element.remove()
  })
})
