import { useMemo, useState } from 'react'
import debounce from 'lodash/debounce'

interface FilterPropsBase {
  filterId?: string
  columnId: string
  accessorKey: string
  value?: FilterState
  disabled?: boolean
  onFilterChange?: (filterId: string, columnId: string, filters: string) => void
}

interface NormalFilterProps extends FilterPropsBase {
  type: 'normal'
}

export type DataTableRemoteFilterDataSource<T extends { id: string }> = (
  filters: string
) => Promise<T[] | undefined>

interface RemoteFilterProps<T extends { id: string }> extends FilterPropsBase {
  type: 'remote'
  dataSource: DataTableRemoteFilterDataSource<T>
}

type FilterProps<T extends { id: string }> = NormalFilterProps | RemoteFilterProps<T>

interface FilterState {
  value: string
  operator: string
}

function toPascalCase(s: string): string {
  return s.length === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1)
}

const DataTableFilter = <T extends { id: string }>(props: FilterProps<T>) => {
  const {
    type,
    filterId = 'filters',
    columnId,
    accessorKey,
    value = { value: '', operator: 'contains' },
    disabled = false,
    onFilterChange,
  } = props

  const [filterState, setFilterState] = useState<FilterState>(value)

  const debounceOnFilterChange = useMemo(() => {
    if (!onFilterChange || type !== 'remote')
      return

    const { dataSource } = props as RemoteFilterProps<T>

    return debounce((filters: string) => {
      void dataSource(filters).then((rows) => {
        if (!rows)
          return

        const linqQuery = rows.map((item) => `${columnId} == "${item.id}"`).join(' || ')
        onFilterChange(filterId, columnId, linqQuery)
      })
    }, 500)
  }, [filterId, columnId, onFilterChange, props, type])

  const handleFilterChange = (nextValue: string, operator: string) => {
    setFilterState({ value: nextValue, operator })

    if (nextValue === '') {
      onFilterChange?.(filterId, columnId, '')
      return
    }

    const propName = toPascalCase(accessorKey)
    let linqQuery = ''

    switch (operator) {
    case 'contains':
      linqQuery = `${propName}.Contains("${nextValue}")`
      break
    case 'startsWith':
      linqQuery = `${propName}.StartsWith("${nextValue}")`
      break
    case 'endsWith':
      linqQuery = `${propName}.EndsWith("${nextValue}")`
      break
    case '=':
      linqQuery = `${propName} == "${nextValue}"`
      break
    case '!=':
      linqQuery = `${propName} != "${nextValue}"`
      break
    case '>':
      linqQuery = `${propName} > "${nextValue}"`
      break
    case '<':
      linqQuery = `${propName} < "${nextValue}"`
      break
    case '>=':
      linqQuery = `${propName} >= "${nextValue}"`
      break
    case '<=':
      linqQuery = `${propName} <= "${nextValue}"`
      break
    default:
      linqQuery = `${propName}.Contains("${nextValue}")`
      break
    }

    if (type === 'normal') {
      onFilterChange?.(filterId, columnId, linqQuery)
    }

    if (type === 'remote' && debounceOnFilterChange) {
      debounceOnFilterChange(linqQuery)
    }
  }

  return (
    <div className={'flex w-full min-w-0 flex-col gap-1 overflow-hidden justify-center h-full'}>
      <input
        type={'text'}
        placeholder={'Filter...'}
        className={'block w-full min-w-0 max-w-full border rounded h-8 py-1 px-2 text-sm text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500/30 border-gray-300 bg-white disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-default'}
        value={filterState.value}
        onChange={(e) => handleFilterChange(e.target.value, filterState.operator)}
        disabled={disabled}
      />
      <select
        value={filterState.operator}
        onChange={(e) => handleFilterChange(filterState.value, e.target.value)}
        disabled={disabled}
        className={'block w-full min-w-0 max-w-full border rounded h-8 py-1 px-2 text-sm text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500/30 border-gray-300 bg-white disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-default'}
      >
        <option value={'contains'}>Contains</option>
        <option value={'startsWith'}>Starts With</option>
        <option value={'endsWith'}>Ends With</option>
        <option value={'='}>=</option>
        <option value={'!='}>!=</option>
        <option value={'>'}>{'>'}</option>
        <option value={'<'}>{'<'}</option>
        <option value={'>='}>{'>='}</option>
        <option value={'<='}>{'<='}</option>
      </select>
    </div>
  )
}

export { DataTableFilter }
export type { FilterProps as DataTableFilterProps, FilterState as DataTableFilterState }
