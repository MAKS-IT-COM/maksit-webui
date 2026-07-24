import { act, renderHook } from '@testing-library/react'
import { useDebounce } from '@webui/core/hooks/useDebounce'

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('returns the initial value immediately and updates after delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'a', delay: 200 } },
    )

    expect(result.current).toBe('a')

    rerender({ value: 'b', delay: 200 })
    expect(result.current).toBe('a')

    act(() => {
      jest.advanceTimersByTime(200)
    })

    expect(result.current).toBe('b')
  })
})
