import { useCallback, useMemo, useState } from 'react'
import { extractPropFilter } from '@webui/core'
import { DataTable } from '@webui/components/components/DataTable'
import {
  buildPagedView,
  createSampleColumns,
  sampleRows,
  type SampleRow,
} from './shared'

function rowMatchesQuery (row: SampleRow, query: string): boolean {
  const name = extractPropFilter(query, 'Name')
  const email = extractPropFilter(query, 'Email')
  const role = extractPropFilter(query, 'Role')
  const createdAt = extractPropFilter(query, 'CreatedAt')

  if (name && !row.name.toLowerCase().includes(name.toLowerCase()))
    return false
  if (email && !row.email.toLowerCase().includes(email.toLowerCase()))
    return false
  if (role && !row.role.toLowerCase().includes(role.toLowerCase()))
    return false
  if (createdAt && !row.createdAt.includes(createdAt))
    return false

  return true
}

/**
 * Storybook-only wrapper: filters and pagination update `rawd` client-side.
 * In product apps, callbacks usually trigger API refetches instead.
 */
export function DataTableClientSide () {
  const [filterQuery, setFilterQuery] = useState('')
  const [pageNumber, setPageNumber] = useState(1)

  const filteredRows = useMemo(
    () => sampleRows.filter((row) => rowMatchesQuery(row, filterQuery)),
    [filterQuery],
  )

  const rawd = useMemo(
    () => buildPagedView(filteredRows, pageNumber),
    [filteredRows, pageNumber],
  )

  const handleFilterChange = useCallback((filters: Record<string, string>) => {
    setFilterQuery(filters.filters ?? '')
    setPageNumber(1)
  }, [])

  const handlePreviousPage = useCallback((page: number) => {
    setPageNumber(page)
  }, [])

  const handleNextPage = useCallback((page: number) => {
    setPageNumber(page)
  }, [])

  return (
    <DataTable<SampleRow>
      rawd={rawd}
      columns={createSampleColumns()}
      onFilterChange={handleFilterChange}
      onPreviousPage={handlePreviousPage}
      onNextPage={handleNextPage}
    />
  )
}
