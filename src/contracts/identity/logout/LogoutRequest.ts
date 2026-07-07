import { boolean, object, type ZodType } from 'zod'
import type { RequestModelBase } from '../../RequestModelBase'
import { RequestModelBaseSchema } from '../../RequestModelBase'

/** Matches product `Models/Identity/Logout/LogoutRequest` (e.g. MaksIT.CertsUI). */
export interface LogoutRequest extends RequestModelBase {
  logoutFromAllDevices?: boolean
}

export const LogoutRequestSchema: ZodType<LogoutRequest> = RequestModelBaseSchema.and(
  object({
    logoutFromAllDevices: boolean().optional(),
  })
)
