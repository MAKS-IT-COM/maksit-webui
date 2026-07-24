import { act, renderHook } from '@testing-library/react'
import { useInterval } from '@webui/core/hooks/useInterval'

describe('useInterval', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('invokes the callback on the interval and pauses when delay is null', () => {
    const callback = jest.fn()
    const { rerender } = renderHook(
      ({ delay }) => useInterval(callback, delay),
      { initialProps: { delay: 100 as number | null } },
    )

    act(() => {
      jest.advanceTimersByTime(300)
    })
    expect(callback).toHaveBeenCalledTimes(3)

    rerender({ delay: null })
    act(() => {
      jest.advanceTimersByTime(300)
    })
    expect(callback).toHaveBeenCalledTimes(3)
  })
})
