import type { ResponseModelBase } from '../ResponseModelBase'

/**
 * Response from Identity Hub `POST login-external/refresh-mailbox`.
 * Align with `MaksIT.IdentityHub.Contracts.RefreshMailboxAccessTokenResponse`.
 */
export interface RefreshMailboxAccessTokenResponse extends ResponseModelBase {
  accessToken: string
}
