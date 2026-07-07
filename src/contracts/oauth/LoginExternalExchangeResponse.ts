import type { ResponseModelBase } from '../ResponseModelBase'

/**
 * Response from Identity Hub `POST login-external/redeem`.
 * Align with `MaksIT.IdentityHub.Contracts.LoginExternalExchangeResponse`.
 */
export interface LoginExternalExchangeResponse extends ResponseModelBase {
  provider: string
  subject: string
  email: string
  idToken: string
  accessToken: string
  refreshToken?: string
  expiresAt?: string
  postLogin?: string
}
