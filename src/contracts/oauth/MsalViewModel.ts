import type { EmailProtocol } from './EmailProtocol'

/** FiPlan/legacy mailbox redeem payload — not Identity Hub `LoginExternalExchangeResponse`. */
export interface MsalViewModel {
  code: string
  emailProtocol: EmailProtocol
}
