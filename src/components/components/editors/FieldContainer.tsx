import { FC, ReactNode } from 'react'
import { colSpanClass, type GridColSpan } from '../../functions'

interface FieldContainerProps {
    colspan?: GridColSpan;
    label?: string;
    errorText?: string;
    disabled?: boolean;
    readOnly?: boolean;
    children: ReactNode
}

const FieldContainer: FC<FieldContainerProps> = (props) => {
  const {
    colspan,
    label,
    errorText,
    disabled = false,
    readOnly = false,
    children
  } = props

  const isInactive = disabled || readOnly

  return <div className={colSpanClass(colspan)}>
    <label className={`block text-sm font-bold mb-2 ${isInactive ? 'text-gray-500' : 'text-gray-700'} ${!label ? 'invisible' : ''}`}>{label || '\u00A0'}</label>
    {children}
    <p className={`text-red-500 text-xs italic mt-2 ${!errorText ? 'invisible' : ''}`}>{errorText || '\u00A0'}</p>
  </div>
}


export {
  FieldContainer
}