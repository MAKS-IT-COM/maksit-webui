import { object, string, type ZodType } from 'zod'
import type { RequestModelBase } from '../RequestModelBase'
import { RequestModelBaseSchema } from '../RequestModelBase'

/**
 * Body for Identity Hub `POST login-external/redeem`.
 * Align with `MaksIT.IdentityHub.Contracts.RedeemLoginExternalRequest`.
 */
export interface RedeemLoginExternalRequest extends RequestModelBase {
  code: string
}

export const RedeemLoginExternalRequestSchema: ZodType<RedeemLoginExternalRequest> =
  RequestModelBaseSchema.and(
    object({
      code: string().min(1),
    }),
  )
