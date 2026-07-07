import { object, string, type ZodType } from 'zod'
import type { RequestModelBase } from '../RequestModelBase'
import { RequestModelBaseSchema } from '../RequestModelBase'

/**
 * Body for Identity Hub `POST login-external/refresh-mailbox`.
 * Align with `MaksIT.IdentityHub.Contracts.RefreshMailboxAccessTokenRequest`.
 */
export interface RefreshMailboxAccessTokenRequest extends RequestModelBase {
  provider: string
  refreshToken: string
}

export const RefreshMailboxAccessTokenRequestSchema: ZodType<RefreshMailboxAccessTokenRequest> =
  RequestModelBaseSchema.and(
    object({
      provider: string().min(1),
      refreshToken: string().min(1),
    }),
  )
