const SHOW_EVENT = 'webui-show-loader'
const HIDE_EVENT = 'webui-hide-loader'
const ENABLE_EVENT = 'webui-enable-loader'
const DISABLE_EVENT = 'webui-disable-loader'

export const showLoader = (): void => {
  window.dispatchEvent(new CustomEvent(SHOW_EVENT))
}

export const hideLoader = (): void => {
  window.dispatchEvent(new CustomEvent(HIDE_EVENT))
}

export const enableLoader = (): void => {
  window.dispatchEvent(new CustomEvent(ENABLE_EVENT))
}

export const disableLoader = (): void => {
  window.dispatchEvent(new CustomEvent(DISABLE_EVENT))
}

export const loaderEventNames = {
  show: SHOW_EVENT,
  hide: HIDE_EVENT,
  enable: ENABLE_EVENT,
  disable: DISABLE_EVENT,
} as const
