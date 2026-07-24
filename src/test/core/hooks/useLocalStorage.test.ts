import { act, renderHook } from '@testing-library/react'
import { useLocalStorage } from '@webui/core/hooks/useLocalStorage'

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('reads and writes JSON values', () => {
    const { result } = renderHook(() => useLocalStorage('demo', { n: 1 }))

    expect(result.current[0]).toEqual({ n: 1 })

    act(() => {
      result.current[1]({ n: 2 })
    })

    expect(result.current[0]).toEqual({ n: 2 })
    expect(JSON.parse(localStorage.getItem('demo')!)).toEqual({ n: 2 })
  })

  it('supports functional updates', () => {
    const { result } = renderHook(() => useLocalStorage('count', 0))

    act(() => {
      result.current[1]((prev) => prev + 1)
    })

    expect(result.current[0]).toBe(1)
  })

  it('hydrates from existing storage', () => {
    localStorage.setItem('existing', JSON.stringify('stored'))
    const { result } = renderHook(() => useLocalStorage('existing', 'fallback'))
    expect(result.current[0]).toBe('stored')
  })
})
