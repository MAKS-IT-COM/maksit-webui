import { boolean, object, string, type ZodType } from 'zod'

export interface RefreshTokenRequest {
  refreshToken: string
  force?: boolean
}

export const RefreshTokenRequestSchema: ZodType<RefreshTokenRequest> = object({
  refreshToken: string().min(1),
  force: boolean().optional(),
})
