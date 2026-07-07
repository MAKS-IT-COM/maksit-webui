const removeParamFromUrl = (param: string) => {
  const url = new URL(window.location.href)
  url.searchParams.delete(param)
  window.history.replaceState({}, document.title, url.toString())
}

const removeParamsFromUrl = (params: string[]) => {
  const url = new URL(window.location.href)
  for (const param of params)
    url.searchParams.delete(param)

  window.history.replaceState({}, document.title, url.toString())
}

export {
  removeParamFromUrl,
  removeParamsFromUrl,
}
