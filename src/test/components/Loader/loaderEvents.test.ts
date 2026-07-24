import {
  disableLoader,
  enableLoader,
  hideLoader,
  loaderEventNames,
  showLoader,
} from '@webui/components/components/Loader/loaderEvents'

describe('loaderEvents', () => {
  it('dispatches named custom events', () => {
    const show = jest.fn()
    const hide = jest.fn()
    const enable = jest.fn()
    const disable = jest.fn()

    window.addEventListener(loaderEventNames.show, show)
    window.addEventListener(loaderEventNames.hide, hide)
    window.addEventListener(loaderEventNames.enable, enable)
    window.addEventListener(loaderEventNames.disable, disable)

    showLoader()
    hideLoader()
    enableLoader()
    disableLoader()

    expect(show).toHaveBeenCalledTimes(1)
    expect(hide).toHaveBeenCalledTimes(1)
    expect(enable).toHaveBeenCalledTimes(1)
    expect(disable).toHaveBeenCalledTimes(1)

    window.removeEventListener(loaderEventNames.show, show)
    window.removeEventListener(loaderEventNames.hide, hide)
    window.removeEventListener(loaderEventNames.enable, enable)
    window.removeEventListener(loaderEventNames.disable, disable)
  })
})
