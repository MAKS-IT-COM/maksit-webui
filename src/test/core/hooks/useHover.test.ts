import { act, renderHook } from '@testing-library/react'
import { useHover } from '@webui/core/hooks/useHover'

describe('useHover', () => {
  it('tracks hover via the callback ref', () => {
    const { result } = renderHook(() => useHover())
    const node = document.createElement('div')

    act(() => {
      result.current[0](node)
    })
    expect(result.current[1]).toBe(false)

    act(() => {
      node.dispatchEvent(new Event('mouseenter'))
    })
    expect(result.current[1]).toBe(true)

    act(() => {
      node.dispatchEvent(new Event('mouseleave'))
    })
    expect(result.current[1]).toBe(false)
  })
})
