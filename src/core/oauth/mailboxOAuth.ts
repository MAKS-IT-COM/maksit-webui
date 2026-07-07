import {
  EmailProtocol,
  MAILBOX_OAUTH_QUERY_FLAG,
  MAILBOX_OAUTH_STORAGE_KEY,
  ServerAuthenticationMethod,
  type MailboxOAuthPending,
} from '@webui/contracts'

export interface MailboxOAuthEntity {
  popAuthenticationMethod?: ServerAuthenticationMethod | null
  smtpAuthenticationMethod?: ServerAuthenticationMethod | null
  imapAuthenticationMethod?: ServerAuthenticationMethod | null
}

const mailboxOAuthRedirectHost = () =>
  `${window.location.origin}${window.location.pathname}?${MAILBOX_OAUTH_QUERY_FLAG}=1`

const collectMailboxOAuthProtocols = (data: MailboxOAuthEntity): EmailProtocol[] => {
  const protocols: EmailProtocol[] = []

  if (data.popAuthenticationMethod === ServerAuthenticationMethod.OAuth2)
    protocols.push(EmailProtocol.Pop3)

  if (data.smtpAuthenticationMethod === ServerAuthenticationMethod.OAuth2)
    protocols.push(EmailProtocol.Smtp)

  if (data.imapAuthenticationMethod === ServerAuthenticationMethod.OAuth2)
    protocols.push(EmailProtocol.Imap)

  return protocols
}

const saveMailboxOAuthPending = (pending: MailboxOAuthPending) => {
  try {
    sessionStorage.setItem(MAILBOX_OAUTH_STORAGE_KEY, JSON.stringify(pending))
  }
  catch {
    /* ignore */
  }
}

const readMailboxOAuthPending = (): MailboxOAuthPending | undefined => {
  const raw = sessionStorage.getItem(MAILBOX_OAUTH_STORAGE_KEY)
  if (!raw)
    return undefined

  try {
    return JSON.parse(raw) as MailboxOAuthPending
  }
  catch {
    return undefined
  }
}

const clearMailboxOAuthPending = () => {
  try {
    sessionStorage.removeItem(MAILBOX_OAUTH_STORAGE_KEY)
  }
  catch {
    /* ignore */
  }
}

const getHashReturnPath = () => window.location.hash.replace(/^#/, '') || '/'

export interface StartMailboxOAuthRedirectOptions {
  mailboxId: number
  protocols: EmailProtocol[]
  /** Resolves the provider login URL for the given mailbox and redirect host. */
  getOAuth2LoginUrl: (mailboxId: number, redirectHost: string) => Promise<string>
  returnPath?: string
}

const startMailboxOAuthRedirect = async (options: StartMailboxOAuthRedirectOptions) => {
  const pending: MailboxOAuthPending = {
    mailboxId: options.mailboxId,
    protocols: options.protocols,
    returnPath: options.returnPath ?? getHashReturnPath(),
  }

  saveMailboxOAuthPending(pending)

  const loginUrl = await options.getOAuth2LoginUrl(
    options.mailboxId,
    mailboxOAuthRedirectHost(),
  )

  window.location.href = loginUrl
}

export {
  mailboxOAuthRedirectHost,
  collectMailboxOAuthProtocols,
  saveMailboxOAuthPending,
  readMailboxOAuthPending,
  clearMailboxOAuthPending,
  startMailboxOAuthRedirect,
}
