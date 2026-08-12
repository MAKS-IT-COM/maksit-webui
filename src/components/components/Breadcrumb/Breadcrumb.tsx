import { type FC, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

export interface BreadcrumbItem {
  label: ReactNode
  /** Omit on the current page (last item). */
  to?: string
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[]
  /** Defaults to `"/"`. */
  separator?: ReactNode
  className?: string
  linkClassName?: string
  currentClassName?: string
  separatorClassName?: string
  /** Accessible name for the nav landmark. Defaults to `"Breadcrumb"`. */
  label?: string
}

/**
 * Page trail (`nav` + `ol`). Links use react-router `Link`.
 * Never uses headings — keep a single page `h1` on `FormHeader` or the page title.
 */
const Breadcrumb: FC<BreadcrumbProps> = ({
  items,
  separator = '/',
  className = '',
  linkClassName = 'text-slate-500 hover:text-slate-800 hover:underline',
  currentClassName = 'text-slate-700',
  separatorClassName = 'text-slate-400',
  label = 'Breadcrumb',
}) => {
  if (items.length === 0)
    return null

  return (
    <nav
      aria-label={label}
      className={['text-sm', className].filter(Boolean).join(' ')}
    >
      <ol className={'flex flex-wrap items-center gap-x-2 gap-y-1'}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          const isLink = !isLast && Boolean(item.to)

          return (
            <li
              key={index}
              className={'inline-flex items-center gap-x-2'}
            >
              {index > 0 ? (
                <span
                  className={separatorClassName}
                  aria-hidden={'true'}
                >
                  {separator}
                </span>
              ) : null}

              {isLink && item.to ? (
                <Link
                  to={item.to}
                  className={linkClassName}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={currentClassName}
                  {...(isLast ? { 'aria-current': 'page' as const } : {})}
                >
                  {item.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export {
  Breadcrumb
}
