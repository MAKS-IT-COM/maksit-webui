import { boolean, object, string, type ZodType } from 'zod'

export interface LogoutRequest {
  logoutFromAllDevices?: boolean
  /** Optional; some clients send the access token in the body for reference. */
  token?: string
}

export const LogoutRequestSchema: ZodType<LogoutRequest> = object({
  logoutFromAllDevices: boolean().optional(),
  token: string().optional(),
})
