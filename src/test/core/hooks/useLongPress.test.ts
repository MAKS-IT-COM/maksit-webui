import { act, renderHook } from '@testing-library/react'
import type { MouseEvent as ReactMouseEvent } from 'react'
import { useLongPress } from '@webui/core/hooks/useLongPress'

const mouseEvent = () =>
  ({
    target: document.createElement('div'),
    preventDefault: jest.fn(),
  }) as unknown as ReactMouseEvent

describe('useLongPress', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('fires onLongPress after the delay', () => {
    const onLongPress = jest.fn()
    const onClick = jest.fn()
    const { result } = renderHook(() =>
      useLongPress({ onLongPress, onClick, delayMs: 300 }),
    )

    act(() => {
      result.current.onMouseDown(mouseEvent())
      jest.advanceTimersByTime(300)
    })

    expect(onLongPress).toHaveBeenCalledTimes(1)

    act(() => {
      result.current.onMouseUp(mouseEvent())
    })
    expect(onClick).not.toHaveBeenCalled()
  })

  it('fires onClick for a short press', () => {
    const onLongPress = jest.fn()
    const onClick = jest.fn()
    const { result } = renderHook(() =>
      useLongPress({ onLongPress, onClick, delayMs: 300 }),
    )

    act(() => {
      result.current.onMouseDown(mouseEvent())
      result.current.onMouseUp(mouseEvent())
    })

    expect(onLongPress).not.toHaveBeenCalled()
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
