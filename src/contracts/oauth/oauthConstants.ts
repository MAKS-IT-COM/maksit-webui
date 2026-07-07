/** sessionStorage key while a multi-protocol mailbox OAuth flow is in progress. */
export const MAILBOX_OAUTH_STORAGE_KEY = 'mailboxOAuth_pending'

/** Query flag on the OAuth redirect landing URL (`?mailboxOAuth=1`). */
export const MAILBOX_OAUTH_QUERY_FLAG = 'mailboxOAuth'

/** sessionStorage prefix to dedupe concurrent code redemption for the same authorization code. */
export const MAILBOX_OAUTH_PROCESSING_KEY_PREFIX = 'mailboxOAuth_processing_'

/** sessionStorage key for the last external login provider (optional diagnostics). */
export const IDP_PROVIDER_STORAGE_KEY = 'ext_provider'

/** Identity Hub route segments (append to hub base URL). */
export const IDENTITY_HUB_ROUTE_CHALLENGE = 'login-external/challenge'
export const IDENTITY_HUB_ROUTE_REDEEM = 'login-external/redeem'
export const IDENTITY_HUB_ROUTE_REFRESH_MAILBOX = 'login-external/refresh-mailbox'

/** Query value for mailbox OAuth challenge (`?purpose=mailbox`). Matches `HttpExternalLoginSessionContext`. */
export const IDENTITY_HUB_MAILBOX_PURPOSE = 'mailbox'
