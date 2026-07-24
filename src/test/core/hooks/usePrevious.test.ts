import { renderHook } from '@testing-library/react'
import { usePrevious } from '@webui/core/hooks/usePrevious'

describe('usePrevious', () => {
  it('returns undefined on first render, then the previous value', () => {
    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: 1 } },
    )

    expect(result.current).toBeUndefined()

    rerender({ value: 2 })
    expect(result.current).toBe(1)

    rerender({ value: 3 })
    expect(result.current).toBe(2)
  })
})
