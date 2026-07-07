export {
  removeParamFromUrl,
  removeParamsFromUrl,
} from './urlUtils'

export {
  startIdpRedirect,
  isMailboxOAuthReturn,
  shouldSkipIdpLoginCallback,
  type StartIdpRedirectOptions,
} from './idpOAuth'

export {
  mailboxOAuthRedirectHost,
  collectMailboxOAuthProtocols,
  saveMailboxOAuthPending,
  readMailboxOAuthPending,
  clearMailboxOAuthPending,
  startMailboxOAuthRedirect,
  type MailboxOAuthEntity,
  type StartMailboxOAuthRedirectOptions,
} from './mailboxOAuth'

export {
  useIdpLoginCallback,
  type UseIdpLoginCallbackOptions,
} from './useIdpLoginCallback'

export {
  useMailboxOAuthReturn,
  type MailboxOAuthApi,
  type UseMailboxOAuthReturnOptions,
} from './useMailboxOAuthReturn'
