import { Copy, Dices, Eye, EyeOff } from 'lucide-react'
import { ChangeEvent, FC, useRef, useState } from 'react'
import type { GridColSpan } from '../../functions/tailwind'
import { FieldContainer } from './FieldContainer'
import { getInputClasses } from './editorStyles'

export type SecretDataSource = () => Promise<string | undefined>

export interface SecretComponentProps {
  label: string
  colspan?: GridColSpan
  errorText?: string
  value?: string
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  readOnly?: boolean
  enableCopy?: boolean
  enableGenerate?: boolean
  /** Fetches a new secret value when the generate button is used. */
  dataSource?: SecretDataSource
}

const SecretComponent: FC<SecretComponentProps> = ({
  label,
  colspan = 12,
  errorText,
  value = '',
  onChange,
  placeholder,
  readOnly = false,
  enableCopy = false,
  enableGenerate = false,
  dataSource,
}) => {
  const prevValue = useRef<string>(value)
  const [showPassword, setShowPassword] = useState(false)

  const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (prevValue.current === e.target.value)
      return

    prevValue.current = e.target.value
    onChange?.(e)
  }

  const handleGenerateSecret = () => {
    if (!dataSource)
      return

    void dataSource().then((secret) => {
      if (!secret)
        return

      handleOnChange({
        target: { value: secret },
      } as ChangeEvent<HTMLInputElement>)
    })
  }

  const handleCopy = async () => {
    if (value)
      await navigator.clipboard.writeText(value)
  }

  const hasContent = String(value).length > 0
  const actionButtonClass = 'p-1 text-gray-600 hover:text-gray-800 bg-white'

  return (
    <FieldContainer colspan={colspan} label={label} errorText={errorText}>
      <div className={'relative'}>
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={handleOnChange}
          placeholder={placeholder}
          className={getInputClasses({ errorText, readOnly, extra: 'pr-20' })}
          readOnly={readOnly}
        />
        <div className={'absolute top-0 bottom-0 right-2 flex items-center gap-1 pointer-events-auto'}>
          {hasContent && (
            <button
              type={'button'}
              onClick={() => setShowPassword((prev) => !prev)}
              className={actionButtonClass}
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          )}
          {enableGenerate && !readOnly && dataSource && (
            <button type={'button'} onClick={handleGenerateSecret} className={actionButtonClass} tabIndex={-1} aria-label={'Generate secret'}>
              <Dices />
            </button>
          )}
          {enableCopy && hasContent && (
            <button type={'button'} onClick={handleCopy} className={actionButtonClass} tabIndex={-1} aria-label={'Copy secret'}>
              <Copy />
            </button>
          )}
        </div>
      </div>
    </FieldContainer>
  )
}

export { SecretComponent }
