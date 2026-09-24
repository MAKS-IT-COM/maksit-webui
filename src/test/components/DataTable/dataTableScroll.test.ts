import { dataTableScrollEdge, forcedScrollTopFor } from '@webui/components/components/DataTable/dataTableScroll'

const overflowing = {
  scrollTop: 0,
  clientHeight: 200,
  scrollHeight: 800,
  hasNextPage: true,
  hasPreviousPage: true,
  pendingReset: false,
}

describe('dataTableScrollEdge', () => {
  it('loads the next page from the bottom and asks to jump to the top', () => {
    expect(dataTableScrollEdge({ ...overflowing, scrollTop: 600 })).toEqual({
      type: 'next',
      reset: 'top',
    })
  })

  it('loads the previous page from the top and asks to jump to the bottom', () => {
    expect(dataTableScrollEdge({ ...overflowing, scrollTop: 1 })).toEqual({
      type: 'previous',
      reset: 'bottom',
    })
  })

  it('ignores edges while a page reset is in flight', () => {
    expect(dataTableScrollEdge({ ...overflowing, scrollTop: 600, pendingReset: true })).toEqual({
      type: 'none',
    })
  })

  it('ignores edges when the page does not overflow', () => {
    expect(dataTableScrollEdge({
      ...overflowing,
      scrollTop: 0,
      clientHeight: 400,
      scrollHeight: 400,
    })).toEqual({ type: 'none' })
  })

  it('does not request a page that does not exist', () => {
    expect(dataTableScrollEdge({
      ...overflowing,
      scrollTop: 600,
      hasNextPage: false,
    })).toEqual({ type: 'none' })
  })
})

describe('forcedScrollTopFor', () => {
  it('maps a top reset to scrollTop 0', () => {
    expect(forcedScrollTopFor('top')).toBe(0)
  })

  it('maps a bottom reset to a clamped large scrollTop', () => {
    expect(forcedScrollTopFor('bottom')).toBe(Number.MAX_SAFE_INTEGER)
  })
})
