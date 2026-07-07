import {
  IDP_PROVIDER_STORAGE_KEY,
  LoginProviderExternal,
  MAILBOX_OAUTH_QUERY_FLAG,
  toAuthProviderName,
} from '@webui/contracts'

export interface StartIdpRedirectOptions {
  /** Absolute redirect route, e.g. `https://api.example.com/Account/Idp/Redirect`. */
  redirectRoute: string
  /** Post-login landing URL; defaults to `${window.location.origin}/`. */
  postLoginUrl?: string
}

const startIdpRedirect = (provider: LoginProviderExternal, options: StartIdpRedirectOptions) => {
  const providerName = toAuthProviderName(provider)

  try {
    sessionStorage.setItem(IDP_PROVIDER_STORAGE_KEY, providerName)
  }
  catch {
    /* ignore */
  }

  const url = new URL(options.redirectRoute)
  url.searchParams.set('provider', providerName)
  url.searchParams.set('postLogin', options.postLoginUrl ?? `${window.location.origin}/`)

  window.location.href = url.toString()
}

const isMailboxOAuthReturn = (params: URLSearchParams = new URLSearchParams(window.location.search)) =>
  params.get(MAILBOX_OAUTH_QUERY_FLAG) === '1'

/**
 * Returns true when a `?code=` on the current URL must not be consumed as app login OAuth
 * (mailbox OAuth popup or embedded opener).
 */
const shouldSkipIdpLoginCallback = (params: URLSearchParams = new URLSearchParams(window.location.search)) =>
  Boolean(window.opener) || isMailboxOAuthReturn(params)

export {
  startIdpRedirect,
  isMailboxOAuthReturn,
  shouldSkipIdpLoginCallback,
}
