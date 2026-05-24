import type { PagedResponse } from '@maks-it.com/webui-contracts'
import { mapPagedToDataTable } from './dataTablePaged'

describe('mapPagedToDataTable', () => {
  it('returns an empty page for missing responses', () => {
    expect(mapPagedToDataTable(undefined)).toEqual({
      items: [],
      pageNumber: 1,
      pageSize: 0,
      totalCount: 0,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    })
  })

  it('maps paged response fields with defaults', () => {
    expect(
      mapPagedToDataTable({
        items: [{ id: '1' }],
        pageNumber: 2,
        pageSize: 25,
        totalCount: 100,
        totalPages: 4,
        hasPreviousPage: true,
        hasNextPage: true,
      })
    ).toEqual({
      items: [{ id: '1' }],
      pageNumber: 2,
      pageSize: 25,
      totalCount: 100,
      totalPages: 4,
      hasPreviousPage: true,
      hasNextPage: true,
    })
  })

  it('fills in defaults for partial responses', () => {
    const partial = { items: [] } as PagedResponse<never>
    expect(mapPagedToDataTable(partial)).toEqual({
      items: [],
      pageNumber: 1,
      pageSize: 0,
      totalCount: 0,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    })
  })
})
