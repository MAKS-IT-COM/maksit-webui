import {
  type ComponentType,
  type FC,
  type ReactNode,
} from 'react'

export interface BreadcrumbItem {
  label: ReactNode
  /** Used by default `<a>` and as fallback for router links. */
  href?: string
  /** Preferred when injecting react-router `Link`. */
  to?: string
  /** Extra props passed to the injected link component. */
  linkProps?: Record<string, unknown>
}

type BreadcrumbLinkComponent = ComponentType<{
  href?: string
  to?: string
  className?: string
  children?: ReactNode
  [key: string]: unknown
}>

export interface BreadcrumbProps {
  items: BreadcrumbItem[]
  /** Defaults to `"/"`. */
  separator?: ReactNode
  className?: string
  linkClassName?: string
  currentClassName?: string
  separatorClassName?: string
  /** Host injects `Link` from react-router (or any anchor-like component). Defaults to `<a>`. */
  linkComponent?: BreadcrumbLinkComponent
  /** Accessible name for the nav landmark. Defaults to `"Breadcrumb"`. */
  label?: string
}

const DefaultLink: BreadcrumbLinkComponent = ({
  href,
  to,
  children,
  ...rest
}) => (
  <a href={href ?? to} {...rest}>
    {children}
  </a>
)

/**
 * Presentational page trail. Use links/`span` only — never headings.
 * Keep a single page `h1` on `FormHeader` or the page title.
 */
const Breadcrumb: FC<BreadcrumbProps> = ({
  items,
  separator = '/',
  className = '',
  linkClassName = 'text-sky-700 hover:text-sky-900 hover:underline',
  currentClassName = 'text-gray-700',
  separatorClassName = 'text-gray-400',
  linkComponent: LinkComponent = DefaultLink,
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
          const target = item.to ?? item.href
          const isLink = !isLast && Boolean(target)

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

              {isLink ? (
                <LinkComponent
                  href={item.href ?? (typeof item.to === 'string' ? item.to : undefined)}
                  to={item.to ?? item.href}
                  className={linkClassName}
                  {...(item.linkProps ?? {})}
                >
                  {item.label}
                </LinkComponent>
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
