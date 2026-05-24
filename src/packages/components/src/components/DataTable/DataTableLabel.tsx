import { useEffect, useMemo, useState } from 'react'
import { formatISODateString } from '@maksit/webui-core'

interface NormalLabelProps {
  type: 'normal'
  value?: string
  dataType?: 'string' | 'date'
}

export type DataTableRemoteLabelDataSource<T extends Record<string, unknown>> = () => Promise<T | undefined>

interface RemoteLabelProps<T extends Record<string, unknown>> {
  type: 'remote'
  accessorKey: keyof T & string
  dataSource: DataTableRemoteLabelDataSource<T>
}

type LabelProps<T extends Record<string, unknown>> = NormalLabelProps | RemoteLabelProps<T>

const DataTableLabel = <T extends Record<string, unknown>>(props: LabelProps<T>) => {
  const [remoteLabel, setRemoteLabel] = useState<string>('')

  const label = useMemo(() => {
    if (props.type !== 'normal')
      return remoteLabel

    const { value = '', dataType = 'string' } = props

    switch (dataType) {
    case 'date':
      return formatISODateString(value)
    case 'string':
    default:
      return value
    }
  }, [props, remoteLabel])

  useEffect(() => {
    if (props.type !== 'remote')
      return

    const { dataSource, accessorKey } = props

    void dataSource().then((payload) => {
      if (!payload)
        return

      const value = payload[accessorKey]
      setRemoteLabel(value != null ? String(value) : '')
    })
  }, [props])

  return <p>{label}</p>
}

export { DataTableLabel }
export type { LabelProps as DataTableLabelProps }
