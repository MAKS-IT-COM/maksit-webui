import type { EmailProtocol } from './EmailProtocol'

/** sessionStorage payload during multi-protocol mailbox OAuth (FE-only). */
export interface MailboxOAuthPending {
  mailboxId: number
  protocols: EmailProtocol[]
  returnPath: string
}
