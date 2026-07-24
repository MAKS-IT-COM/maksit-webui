import { type FC } from 'react'

export type SpinnerSize = 'sm' | 'md' | 'lg'

export interface SpinnerProps {
  size?: SpinnerSize
  className?: string
  label?: string
}

const sizeClass: Record<SpinnerSize, string> = {
  sm: 'h-6 w-6 border-2',
  md: 'h-12 w-12 border-4',
  lg: 'h-32 w-32 border-8',
}

const Spinner: FC<SpinnerProps> = ({
  size = 'md',
  className = '',
  label,
}) => (
  <div
    className={['inline-flex flex-col items-center gap-2', className].filter(Boolean).join(' ')}
    role={'status'}
    aria-live={'polite'}
    aria-label={label ?? 'Loading'}
  >
    <div
      className={[
        'ease-linear rounded-full border-gray-200 animate-spin',
        'border-t-sky-600',
        sizeClass[size],
      ].join(' ')}
    />
    {label ? <span className={'text-sm text-current opacity-90'}>{label}</span> : null}
  </div>
)

export { Spinner }
