import { type FC, useState } from 'react'
import { Star } from 'lucide-react'

export type RatingsSize = 'sm' | 'md' | 'lg'

export interface RatingsProps {
  /** Current rating (supports fractions for partial fill, e.g. `3.5`). */
  value: number
  max?: number
  /** When set, stars are interactive. */
  onChange?: (value: number) => void
  size?: RatingsSize
  readOnly?: boolean
  className?: string
  /** Accessible name; defaults to `"Rating"`. */
  label?: string
  emptyClassName?: string
  filledClassName?: string
  hoverClassName?: string
}

const sizeClass: Record<RatingsSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

const Ratings: FC<RatingsProps> = ({
  value,
  max = 5,
  onChange,
  size = 'md',
  readOnly,
  className = '',
  label = 'Rating',
  emptyClassName = 'text-gray-300',
  filledClassName = 'text-amber-400',
  hoverClassName = 'text-amber-500',
}) => {
  const interactive = Boolean(onChange) && !readOnly
  const [hovered, setHovered] = useState<number | null>(null)
  const displayValue = hovered ?? value
  const starSize = sizeClass[size]

  return (
    <div
      className={['inline-flex items-center gap-0.5', className].filter(Boolean).join(' ')}
      role={interactive ? 'radiogroup' : 'img'}
      aria-label={label}
      aria-valuetext={`${clamp(value, 0, max)} out of ${max}`}
      onMouseLeave={() => {
        if (interactive)
          setHovered(null)
      }}
    >
      {Array.from({ length: max }, (_, index) => {
        const starValue = index + 1
        const fillRatio = clamp(displayValue - index, 0, 1)
        const isHoveredStar = hovered !== null && starValue <= hovered

        const icon = (
          <>
            <Star
              className={[starSize, emptyClassName].join(' ')}
              strokeWidth={1.5}
              aria-hidden={true}
            />
            {fillRatio > 0 ? (
              <span
                className={'pointer-events-none absolute left-0.5 top-0.5 overflow-hidden'}
                style={{ width: `calc(${fillRatio} * (100% - 0.25rem))` }}
              >
                <Star
                  className={[
                    starSize,
                    'fill-current',
                    isHoveredStar ? hoverClassName : filledClassName,
                  ].join(' ')}
                  strokeWidth={1.5}
                  aria-hidden={true}
                />
              </span>
            ) : null}
          </>
        )

        if (!interactive) {
          return (
            <span key={starValue} className={'relative inline-flex p-0.5'}>
              {icon}
            </span>
          )
        }

        return (
          <button
            key={starValue}
            type={'button'}
            role={'radio'}
            aria-checked={Math.round(value) === starValue}
            aria-label={`${starValue} ${starValue === 1 ? 'star' : 'stars'}`}
            className={'relative inline-flex cursor-pointer p-0.5'}
            onMouseEnter={() => setHovered(starValue)}
            onFocus={() => setHovered(starValue)}
            onBlur={() => setHovered(null)}
            onClick={() => onChange?.(starValue)}
          >
            {icon}
          </button>
        )
      })}
    </div>
  )
}

export { Ratings }
