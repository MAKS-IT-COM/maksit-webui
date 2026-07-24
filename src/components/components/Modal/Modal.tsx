import {
  type FC,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
} from 'react'

export type ModalSize = 'sm' | 'md' | 'lg'

export interface ModalProps {
  isOpen?: boolean
  title?: ReactNode
  children?: ReactNode
  footer?: ReactNode
  onClose?: () => void
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
  size?: ModalSize
  className?: string
}

const sizeClass: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}

const Modal: FC<ModalProps> = ({
  isOpen = false,
  title,
  children,
  footer,
  onClose,
  closeOnBackdrop = true,
  closeOnEscape = true,
  size = 'md',
  className = '',
}) => {
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)

  const handleClose = useCallback(() => {
    onClose?.()
  }, [onClose])

  useEffect(() => {
    if (!isOpen || !closeOnEscape)
      return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape')
        handleClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, closeOnEscape, handleClose])

  useEffect(() => {
    if (!isOpen)
      return

    const previous = document.activeElement as HTMLElement | null
    panelRef.current?.focus()

    return () => {
      previous?.focus?.()
    }
  }, [isOpen])

  if (!isOpen)
    return null

  return (
    <div
      className={'fixed inset-0 z-50 flex items-center justify-center p-4'}
      role={'presentation'}
    >
      <div
        className={'absolute inset-0 bg-black/40 backdrop-blur-sm'}
        aria-hidden={true}
        onClick={closeOnBackdrop ? handleClose : undefined}
      />
      <div
        ref={panelRef}
        role={'dialog'}
        aria-modal={true}
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        className={[
          'relative z-10 w-full rounded-lg bg-white shadow-xl outline-none',
          sizeClass[size],
          className,
        ].filter(Boolean).join(' ')}
      >
        {(title !== undefined && title !== null && title !== '') || onClose ? (
          <div className={'flex items-start justify-between gap-4 border-b border-gray-200 px-5 py-4'}>
            <h2 id={titleId} className={'text-lg font-semibold text-gray-900'}>
              {title}
            </h2>
            {onClose ? (
              <button
                type={'button'}
                className={'text-2xl leading-none text-gray-500 hover:text-gray-800'}
                aria-label={'Close'}
                onClick={handleClose}
              >
                &times;
              </button>
            ) : null}
          </div>
        ) : null}

        <div className={'px-5 py-4 text-gray-700'}>
          {children}
        </div>

        {footer ? (
          <div className={'flex flex-wrap items-center justify-end gap-2 border-t border-gray-200 px-5 py-4'}>
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export { Modal }
