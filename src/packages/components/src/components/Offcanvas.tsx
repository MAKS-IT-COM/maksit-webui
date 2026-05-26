import { FC, ReactNode, useCallback, useEffect } from 'react'
import { colSpanClass, type GridColSpan } from '../functions/tailwind'

export interface OffcanvasProps {
  children: ReactNode
  isOpen?: boolean
  onOpen?: () => void
  onClose?: () => void
  colspan?: GridColSpan
}

const Offcanvas: FC<OffcanvasProps> = (props) => {
  const {
    children,
    isOpen = false,
    onOpen,
    onClose,
    colspan = 6
  } = props

  const handleOnOpen = useCallback(() => {
    onOpen?.()
  }, [onOpen])

  const handleOnClose = useCallback(() => {
    onClose?.()
  }, [onClose])

  useEffect(() => {
    if (isOpen) handleOnOpen()
    else handleOnClose()
  }, [isOpen, handleOnOpen, handleOnClose])

  const leftSpan = (12 - colspan) as GridColSpan

  return (
    <div
      className={[
        'fixed inset-0 h-screen w-screen',
        'bg-black/20 backdrop-blur-md',
        'z-40 transition-opacity duration-300 ease-in-out',
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
      ].join(' ')}
    >
      <div className={'grid grid-cols-12 h-full w-full'}>
        <div className={colSpanClass(leftSpan)} aria-hidden={true} />
        <div className={`${colSpanClass(colspan)} min-h-0 bg-white shadow-xl`}>
          {children}
        </div>
      </div>
    </div>
  )
}

export { Offcanvas }
