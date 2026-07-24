import { act, renderHook } from '@testing-library/react'
import { useSessionStorage } from '@webui/core/hooks/useSessionStorage'

describe('useSessionStorage', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('reads and writes JSON values', () => {
    const { result } = renderHook(() => useSessionStorage('demo', 'a'))

    expect(result.current[0]).toBe('a')

    act(() => {
      result.current[1]('b')
    })

    expect(result.current[0]).toBe('b')
    expect(JSON.parse(sessionStorage.getItem('demo')!)).toBe('b')
  })
})
