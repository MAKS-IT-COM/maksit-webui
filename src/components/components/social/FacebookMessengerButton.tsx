import { type FC, type ReactNode } from 'react'

export interface FacebookMessengerButtonProps {
  /** Facebook Page username or page id for `https://m.me/{page}`. */
  page: string
  title?: ReactNode
  className?: string
  floating?: boolean
}

const MessengerIcon: FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox={'0 0 24 24'}
    fill={'currentColor'}
    aria-hidden={true}
  >
    <path d={'M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.19 5.44 3.14 7.17V22l2.87-1.57c1.18.33 2.43.5 3.99.5 5.64 0 10-4.13 10-9.7S17.64 2 12 2zm1.01 12.93l-2.54-2.7-4.96 2.7 5.45-5.78 2.6 2.7 4.9-2.7-5.45 5.78z'} />
  </svg>
)

const buildMessengerHref = (page: string): string =>
  `https://m.me/${encodeURIComponent(page.replace(/^@/, ''))}`

const FacebookMessengerButton: FC<FacebookMessengerButtonProps> = ({
  page,
  title = 'Messenger',
  className = '',
  floating = true,
}) => (
  <a
    href={buildMessengerHref(page)}
    rel={'nofollow noopener noreferrer'}
    target={'_blank'}
    className={[
      'inline-flex items-center gap-2 rounded-full bg-[#0084FF] px-4 py-3 font-medium text-white shadow-md hover:bg-[#0073e0]',
      floating ? 'fixed bottom-6 right-6 z-40' : '',
      className,
    ].filter(Boolean).join(' ')}
  >
    <MessengerIcon className={'h-5 w-5 shrink-0'} />
    <span>{title}</span>
  </a>
)

export { FacebookMessengerButton, buildMessengerHref }
