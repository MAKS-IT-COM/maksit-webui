export {
  LoginProviderExternal,
  toAuthProviderName,
  tryParseLoginProviderExternal,
} from './LoginProviderExternal'

export { EmailProtocol } from './EmailProtocol'

export { ServerAuthenticationMethod } from './ServerAuthenticationMethod'

export type { MsalViewModel } from './MsalViewModel'

export type { LoginExternalExchangeResponse } from './LoginExternalExchangeResponse'

export type { RedeemLoginExternalRequest } from './RedeemLoginExternalRequest'
export { RedeemLoginExternalRequestSchema } from './RedeemLoginExternalRequest'

export type { RefreshMailboxAccessTokenRequest } from './RefreshMailboxAccessTokenRequest'
export { RefreshMailboxAccessTokenRequestSchema } from './RefreshMailboxAccessTokenRequest'

export type { RefreshMailboxAccessTokenResponse } from './RefreshMailboxAccessTokenResponse'

/** @deprecated Use `LoginExternalExchangeResponse`. */
export type { IdpRedeemLoginResponse } from './IdpRedeemLoginResponse'

export type { MailboxOAuthPending } from './MailboxOAuthPending'

export {
  MAILBOX_OAUTH_STORAGE_KEY,
  MAILBOX_OAUTH_QUERY_FLAG,
  MAILBOX_OAUTH_PROCESSING_KEY_PREFIX,
  IDP_PROVIDER_STORAGE_KEY,
  IDENTITY_HUB_ROUTE_CHALLENGE,
  IDENTITY_HUB_ROUTE_REDEEM,
  IDENTITY_HUB_ROUTE_REFRESH_MAILBOX,
  IDENTITY_HUB_MAILBOX_PURPOSE,
} from './oauthConstants'
