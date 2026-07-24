import { act, renderHook } from '@testing-library/react'
import { createRef } from 'react'
import { useOnClickOutside } from '@webui/core/hooks/useOnClickOutside'

describe('useOnClickOutside', () => {
  it('calls the handler for outside clicks and ignores inside clicks', () => {
    const handler = jest.fn()
    const inside = document.createElement('div')
    const outside = document.createElement('div')
    document.body.append(inside, outside)

    const ref = createRef<HTMLDivElement>()
    // @ts-expect-error assign for test
    ref.current = inside

    renderHook(() => useOnClickOutside(ref, handler))

    act(() => {
      outside.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    })
    expect(handler).toHaveBeenCalledTimes(1)

    act(() => {
      inside.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    })
    expect(handler).toHaveBeenCalledTimes(1)

    inside.remove()
    outside.remove()
  })
})
