export const SCROLL_EDGE_PX = 2

export type DataTableScrollReset = 'top' | 'bottom'

export type DataTableScrollEdge =
  | { type: 'none' }
  | { type: 'next'; reset: 'top' }
  | { type: 'previous'; reset: 'bottom' }

export const dataTableScrollEdge = ({
  scrollTop,
  clientHeight,
  scrollHeight,
  hasNextPage,
  hasPreviousPage,
  pendingReset,
}: {
  scrollTop: number
  clientHeight: number
  scrollHeight: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  pendingReset: boolean
}): DataTableScrollEdge => {
  if (pendingReset)
    return { type: 'none' }

  const overflows = scrollHeight > clientHeight + SCROLL_EDGE_PX
  if (!overflows)
    return { type: 'none' }

  const atBottom = scrollTop + clientHeight >= scrollHeight - SCROLL_EDGE_PX
  if (atBottom && hasNextPage)
    return { type: 'next', reset: 'top' }

  const atTop = scrollTop <= SCROLL_EDGE_PX
  if (atTop && hasPreviousPage)
    return { type: 'previous', reset: 'bottom' }

  return { type: 'none' }
}

/** Pixel `scrollTop` passed to MultiGrid. `undefined` leaves the grid uncontrolled. */
export const forcedScrollTopFor = (reset: DataTableScrollReset): number => {
  if (reset === 'top')
    return 0

  return Number.MAX_SAFE_INTEGER
}
