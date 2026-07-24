import {
  Children,
  type FC,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

export interface MasonryProps {
  /** Min widths (ascending) that add a column. Example: `[350, 500, 750]` → 1–4 columns. */
  breakpoints?: number[]
  children?: ReactNode
  className?: string
  columnClassName?: string
}

const getColumnCount = (width: number, breakpoints: number[]): number =>
  breakpoints.reduceRight((count, breakpoint, index) => (
    breakpoint < width ? count : index
  ), breakpoints.length) + 1

const Masonry: FC<MasonryProps> = ({
  breakpoints = [350, 500, 750],
  children,
  className = '',
  columnClassName = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [columns, setColumns] = useState(1)

  const updateColumns = useCallback(() => {
    const width = containerRef.current?.offsetWidth
    if (width === undefined)
      return

    const next = getColumnCount(width, breakpoints)
    setColumns((prev) => (prev === next ? prev : next))
  }, [breakpoints])

  useEffect(() => {
    updateColumns()
    window.addEventListener('resize', updateColumns)
    return () => window.removeEventListener('resize', updateColumns)
  }, [updateColumns, children])

  const items = Children.toArray(children)
  const columnItems: ReactNode[][] = Array.from({ length: columns }, () => [])

  items.forEach((child, index) => {
    columnItems[index % columns]?.push(child)
  })

  return (
    <div className={className || undefined} ref={containerRef}>
      <div className={'flex gap-3 items-start'}>
        {columnItems.map((column, columnIndex) => (
          <div
            key={columnIndex}
            className={['flex flex-1 flex-col gap-3', columnClassName].filter(Boolean).join(' ')}
          >
            {column.map((child, index) => (
              <div key={index}>{child}</div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export { Masonry }
