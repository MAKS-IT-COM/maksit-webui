import { type ChangeEvent, type FC, useEffect, useRef } from 'react'
import type { GridColSpan } from '../../functions/tailwind'
import { FieldContainer } from './FieldContainer'

interface CheckBoxComponentProps {
    colspan?: GridColSpan;
    label: string;
    value: boolean;
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
    errorText?: string;
    disabled?: boolean;
}

const CheckBoxComponent: FC<CheckBoxComponentProps> = (props) => {

  const {
    colspan = 6,
    label,
    value,
    onChange,
    errorText,
    disabled = false
  } = props

  const prevValue = useRef<boolean>(value)

  useEffect(() => {
    prevValue.current = value
  }, [value])

  const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (prevValue.current === e.target.checked)
      return

    prevValue.current = e.target.checked

    onChange?.(e)
  }

  return (
    <FieldContainer colspan={colspan} label={label} errorText={errorText}>
      <input
        type={'checkbox'}
        checked={value}
        onChange={handleOnChange}
        className={`mr-2 leading-tight ${errorText ? 'border-red-500' : ''}`}
        disabled={disabled}
      />
    </FieldContainer>
  )
}

export {
  CheckBoxComponent
}