import type { PagedResponse } from '@webui/contracts/PagedResponse'
import {
  createColumn,
  createColumns,
  DataTable,
  DataTableFilter,
  DataTableLabel,
  type DataTableColumn,
  type DataTableProps,
} from '@webui/components/components/DataTable'

export type SampleRow = {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
}

export const sampleRows: SampleRow[] = [
  {
    id: '1',
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    role: 'Admin',
    createdAt: '2026-01-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'Grace Hopper',
    email: 'grace@example.com',
    role: 'Editor',
    createdAt: '2026-02-20T14:30:00Z',
  },
  {
    id: '3',
    name: 'Alan Turing',
    email: 'alan@example.com',
    role: 'Viewer',
    createdAt: '2026-03-10T09:15:00Z',
  },
  {
    id: '4',
    name: 'Katherine Johnson',
    email: 'katherine@example.com',
    role: 'Editor',
    createdAt: '2026-04-05T16:45:00Z',
  },
  {
    id: '5',
    name: 'Tim Berners-Lee',
    email: 'tim@example.com',
    role: 'Admin',
    createdAt: '2026-05-01T08:00:00Z',
  },
  {
    id: '6',
    name: 'Linus Torvalds',
    email: 'linus@example.com',
    role: 'Editor',
    createdAt: '2026-05-10T11:00:00Z',
  },
  {
    id: '7',
    name: 'Margaret Hamilton',
    email: 'margaret@example.com',
    role: 'Admin',
    createdAt: '2026-05-12T13:20:00Z',
  },
  {
    id: '8',
    name: 'Dennis Ritchie',
    email: 'dennis@example.com',
    role: 'Viewer',
    createdAt: '2026-05-18T09:45:00Z',
  },
]

/** Page size used in Storybook pagination demos */
export const STORYBOOK_PAGE_SIZE = 2

export function buildPagedView (
  rows: SampleRow[],
  pageNumber: number,
  pageSize: number = STORYBOOK_PAGE_SIZE,
): PagedResponse<SampleRow> {
  const totalCount = rows.length
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const page = Math.min(Math.max(1, pageNumber), totalPages)
  const start = (page - 1) * pageSize

  return {
    items: rows.slice(start, start + pageSize),
    pageNumber: page,
    pageSize,
    totalCount,
    totalPages,
    hasPreviousPage: page > 1,
    hasNextPage: page < totalPages,
  }
}

export function createSamplePagedResponse (
  overrides?: Partial<PagedResponse<SampleRow>>,
): PagedResponse<SampleRow> {
  return {
    items: sampleRows,
    pageNumber: 1,
    pageSize: 10,
    totalCount: sampleRows.length,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
    ...overrides,
  }
}

export function createSampleColumns (): DataTableColumn<SampleRow>[] {
  return createColumns([
    createColumn({
      id: 'name',
      accessorKey: 'name',
      header: 'Name',
      filter: ({ columnId }, onFilterChange) => (
        <DataTableFilter
          type="normal"
          columnId={columnId}
          accessorKey="name"
          onFilterChange={onFilterChange}
        />
      ),
      cell: ({ value }) => <span>{String(value ?? '')}</span>,
    }),
    createColumn({
      id: 'email',
      accessorKey: 'email',
      header: 'Email',
      filter: ({ columnId }, onFilterChange) => (
        <DataTableFilter
          type="normal"
          columnId={columnId}
          accessorKey="email"
          onFilterChange={onFilterChange}
        />
      ),
      cell: ({ value }) => <span>{String(value ?? '')}</span>,
    }),
    createColumn({
      id: 'role',
      accessorKey: 'role',
      header: 'Role',
      filter: ({ columnId }, onFilterChange) => (
        <DataTableFilter
          type="normal"
          columnId={columnId}
          accessorKey="role"
          onFilterChange={onFilterChange}
        />
      ),
      cell: ({ value }) => (
        <DataTableLabel type="normal" value={String(value ?? '')} />
      ),
    }),
    createColumn({
      id: 'createdAt',
      accessorKey: 'createdAt',
      header: 'Created',
      filter: ({ columnId }, onFilterChange) => (
        <DataTableFilter
          type="normal"
          columnId={columnId}
          accessorKey="createdAt"
          onFilterChange={onFilterChange}
        />
      ),
      cell: ({ value }) => (
        <DataTableLabel type="normal" dataType="date" value={String(value ?? '')} />
      ),
    }),
  ])
}

/** Typed DataTable for Storybook — fixes generic inference vs `Meta<typeof DataTable>`. */
export function SampleDataTable (props: DataTableProps<SampleRow>) {
  return <DataTable<SampleRow> {...props} />
}
