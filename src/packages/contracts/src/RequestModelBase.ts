import { object, type ZodType } from 'zod'

export interface RequestModelBase {
  [key: string]: unknown
}

export const RequestModelBaseSchema: ZodType<RequestModelBase> = object({})
