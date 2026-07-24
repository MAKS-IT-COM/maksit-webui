import { type FC, useEffect, useState } from 'react'
import { loaderEventNames } from './loaderEvents'
import { Spinner, type SpinnerSize } from './Spinner'

export interface LoaderProps {
  /** When set, overrides the event-driven ref-count and forces visibility. */
  visible?: boolean
  label?: string
  size?: SpinnerSize
  className?: string
}

interface LoaderState {
  counter: number
  disabled: boolean
}

const Loader: FC<LoaderProps> = ({
  visible,
  label,
  size = 'lg',
  className = '',
}) => {
  const [state, setState] = useState<LoaderState>({
    counter: 0,
    disabled: false,
  })

  useEffect(() => {
    if (visible !== undefined)
      return

    const onShow = () => {
      setState((prev) => {
        if (prev.disabled)
          return { counter: 0, disabled: true }

        return {
          ...prev,
          counter: prev.counter + 1,
        }
      })
    }

    const onHide = () => {
      setState((prev) => {
        if (prev.disabled || prev.counter === 0)
          return prev

        const counter = prev.counter - 1
        return {
          ...prev,
          counter,
        }
      })
    }

    const onEnable = () => {
      setState((prev) => ({
        ...prev,
        disabled: false,
      }))
    }

    const onDisable = () => {
      setState({
        counter: 0,
        disabled: true,
      })
    }

    window.addEventListener(loaderEventNames.show, onShow)
    window.addEventListener(loaderEventNames.hide, onHide)
    window.addEventListener(loaderEventNames.enable, onEnable)
    window.addEventListener(loaderEventNames.disable, onDisable)

    return () => {
      window.removeEventListener(loaderEventNames.show, onShow)
      window.removeEventListener(loaderEventNames.hide, onHide)
      window.removeEventListener(loaderEventNames.enable, onEnable)
      window.removeEventListener(loaderEventNames.disable, onDisable)
    }
  }, [visible])

  const loading = visible !== undefined
    ? visible
    : !state.disabled && state.counter > 0

  if (!loading)
    return null

  return (
    <div
      className={[
        'fixed inset-0 flex items-center justify-center bg-gray-800/75 z-50',
        className,
      ].filter(Boolean).join(' ')}
      aria-busy={true}
    >
      <Spinner size={size} label={label} className={'text-gray-100'} />
    </div>
  )
}

export { Loader }
