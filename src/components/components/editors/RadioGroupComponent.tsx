import React, { useEffect, useRef, useState } from 'react'
import type { GridColSpan } from '../../functions'
import { FieldContainer } from './FieldContainer'
import { getInactiveControlClasses } from './editorStyles'

interface RadioOption {
  value: string
  label: string
}

interface RadioGroupComponentProps {
  options: RadioOption[]
  label?: string
  colspan?: GridColSpan
  value?: string
  onChange?: (value: string) => void
  errorText?: string
  readOnly?: boolean
  disabled?: boolean
}

const RadioGroupComponent: React.FC<RadioGroupComponentProps> = (props) => {
  const {
    options,
    label,
    colspan = 6,
    value = '',
    onChange,
    errorText,
    readOnly = false,
    disabled = false
  } = props

  const prevValue = useRef<string>(value)
  const [selectedValue, setSelectedValue] = useState<string>(value)

  useEffect(() => {
    prevValue.current = value
    setSelectedValue(value)
  }, [value])

  const handleOptionChange = (val: string) => {
    if (readOnly || disabled) return
    if (prevValue.current === val) return
    prevValue.current = val
    setSelectedValue(val)
    onChange?.(val)
  }

  return (
    <FieldContainer colspan={colspan} label={label} errorText={errorText} disabled={disabled} readOnly={readOnly}>
      <div className={'flex flex-col'}>
        {options.map(option => {
          return (
            <label
              key={option.value}
              className={`flex items-center mb-2 ${getInactiveControlClasses({ disabled, readOnly })}`}
            >
              <input
                type={'radio'}
                value={option.value}
                checked={selectedValue === option.value}
                onChange={() => handleOptionChange(option.value)}
                className={'mr-2'}
                disabled={disabled}
                readOnly={readOnly}
              />
              {option.label}
            </label>
          )
        })}
      </div>
    </FieldContainer>
  )
}

export { RadioGroupComponent }
