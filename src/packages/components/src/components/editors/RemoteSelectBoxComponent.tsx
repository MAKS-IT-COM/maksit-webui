import { useState, useCallback, ChangeEvent, useEffect, useRef } from 'react'
import type { PagedRequest } from '@maks-it.com/webui-contracts'
import type { SearchResponseBase } from '@maks-it.com/webui-contracts'
import { deepEqual } from '@maks-it.com/webui-core'
import { SelectBoxComponent } from './SelectBoxComponent'

export type RemoteSelectSearchDataSource<TRequest extends PagedRequest> = (
  request: TRequest,
  options?: { showLoader?: boolean }
) => Promise<SearchResponseBase[] | undefined>

export interface RemoteSelectBoxProps<TRequest extends PagedRequest> {
  dataSource: RemoteSelectSearchDataSource<TRequest>
  additionalFilters?: TRequest
  label: string
  colspan?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  errorText?: string
  idField?: string
  labelField?: string
  filterFields?: string[]
  value?: string | number
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  readOnly?: boolean
}

const RemoteSelectBoxComponent = <TRequest extends PagedRequest>(props: RemoteSelectBoxProps<TRequest>) => {
  const {
    dataSource,
    additionalFilters,
    label,
    colspan = 12,
    errorText,
    idField = 'id',
    labelField = 'name',
    filterFields = ['name'],
    value = '',
    onChange,
    placeholder,
    readOnly = false,
  } = props

  const [options, setOptions] = useState<SearchResponseBase[]>([])
  const prevPagedRequest = useRef<TRequest | null>(null)
  const dataSourceRef = useRef(dataSource)
  dataSourceRef.current = dataSource

  const handleFilterChange = useCallback((filters?: string, showLoader: boolean = false) => {
    const pagedRequest = {
      pageSize: 10,
      filters,
      ...additionalFilters,
    } as TRequest

    if (deepEqual(pagedRequest, prevPagedRequest.current))
      return

    prevPagedRequest.current = pagedRequest

    void dataSourceRef.current(pagedRequest, { showLoader })
      .then((items) => {
        if (!items)
          return

        setOptions(items)
      })
      .catch((error) => {
        console.error('RemoteSelectBox fetch error:', error)
      })
  }, [additionalFilters])

  useEffect(() => {
    handleFilterChange(undefined, true)
  }, [handleFilterChange])

  return (
    <SelectBoxComponent
      colspan={colspan}
      label={label}
      placeholder={placeholder}
      options={options?.map((item) => {
        const row = item as unknown as Record<string, unknown>
        const labelRaw = row[labelField] ?? row.name ?? row.id
        return {
          value: item.id,
          label: labelRaw != null ? String(labelRaw) : item.id,
        }
      })}
      idField={idField}
      filterFields={filterFields}
      onFilterChange={(text) => handleFilterChange(text, false)}
      value={value}
      onChange={onChange}
      errorText={errorText}
      readOnly={readOnly}
    />
  )
}

export { RemoteSelectBoxComponent }
