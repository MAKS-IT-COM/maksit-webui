import {
  type ComponentType,
  type FC,
  type ReactNode,
  useEffect,
  useState,
} from 'react'
import { getCookie, setCookie } from './cookies'

export interface CookieConsentLink {
  label: ReactNode
  /** Used by default `<a>` and as fallback for router links. */
  href?: string
  /** Preferred when injecting react-router `Link`. */
  to?: string
  /** Extra props passed to the injected link component. */
  linkProps?: Record<string, unknown>
}

type ConsentLinkComponent = ComponentType<{
  href?: string
  to?: string
  className?: string
  children?: ReactNode
  [key: string]: unknown
}>

export interface CookieConsentProps {
  children?: ReactNode
  message?: ReactNode
  links?: CookieConsentLink[]
  acceptLabel?: string
  cookieName?: string
  cookieDays?: number
  /** Host injects `Link` from react-router (or any anchor-like component). Defaults to `<a>`. */
  linkComponent?: ConsentLinkComponent
  onAccept?: () => void
  onDismiss?: () => void
  className?: string
}

const DefaultLink: ConsentLinkComponent = ({
  href,
  to,
  children,
  ...rest
}) => (
  <a href={href ?? to} {...rest}>
    {children}
  </a>
)

const CookieConsent: FC<CookieConsentProps> = ({
  children,
  message,
  links = [],
  acceptLabel = 'Accept',
  cookieName = 'CookieConsent',
  cookieDays = 30,
  linkComponent: LinkComponent = DefaultLink,
  onAccept,
  onDismiss,
  className = '',
}) => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!getCookie(cookieName))
      setVisible(true)
  }, [cookieName])

  if (!visible)
    return null

  const handleAccept = () => {
    setCookie(cookieName, 'true', cookieDays, typeof window !== 'undefined' ? window.location.hostname : undefined)
    setVisible(false)
    onAccept?.()
  }

  const handleDismiss = () => {
    setVisible(false)
    onDismiss?.()
  }

  return (
    <div
      className={[
        'fixed bottom-4 left-4 right-4 z-50 mx-auto flex max-w-3xl flex-wrap items-center gap-3 rounded-lg',
        'border border-gray-200 bg-white px-4 py-3 shadow-lg sm:left-6 sm:right-auto',
        className,
      ].filter(Boolean).join(' ')}
      role={'dialog'}
      aria-live={'polite'}
      aria-label={'Cookie consent'}
    >
      <button
        type={'button'}
        className={'absolute right-2 top-2 text-lg leading-none text-gray-400 hover:text-gray-700'}
        aria-label={'Dismiss'}
        onClick={handleDismiss}
      >
        &times;
      </button>

      <div className={'min-w-0 flex-1 pr-4 text-sm text-gray-700'}>
        {children}
        {message}
        {links.length > 0 ? (
          <ul className={'mt-2 flex flex-wrap gap-x-3 gap-y-1'}>
            {links.map((link, index) => (
              <li key={index}>
                <LinkComponent
                  href={link.href ?? (typeof link.to === 'string' ? link.to : undefined)}
                  to={link.to ?? link.href}
                  className={'text-sky-700 underline hover:text-sky-900'}
                  {...(link.linkProps ?? {})}
                >
                  {link.label}
                </LinkComponent>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <button
        type={'button'}
        className={'rounded bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700'}
        onClick={handleAccept}
      >
        {acceptLabel}
      </button>
    </div>
  )
}

export { CookieConsent }
