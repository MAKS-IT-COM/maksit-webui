import { FC, ReactNode } from 'react'
import { colSpanClass, type GridColSpan } from '../../functions'

interface FieldContainerProps {
    colspan?: GridColSpan;
    label?: string;
    errorText?: string;
    children: ReactNode
}

const FieldContainer: FC<FieldContainerProps> = (props) => {
  const {
    colspan,
    label,
    errorText,
    children
  } = props

  return <div className={colSpanClass(colspan)}>
    <label className={`block text-gray-700 text-sm font-bold mb-2  ${!label ? 'invisible' : ''}`}>{label || '\u00A0'}</label>
    {children}
    <p className={`text-red-500 text-xs italic mt-2 ${!errorText ? 'invisible' : ''}`}>{errorText || '\u00A0'}</p>
  </div>
}


export {
  FieldContainer
}