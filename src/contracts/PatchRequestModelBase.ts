import z, { intersection, object, record, string, type ZodType } from 'zod'
import { PatchOperation } from './PatchOperation'
import { RequestModelBase, RequestModelBaseSchema } from './RequestModelBase'

export interface PatchRequestModelBase extends RequestModelBase {
  operations?: { [key: string]: PatchOperation }
  /** Required so PATCH payloads are assignable to diff helpers (e.g. deepDelta). */
  [key: string]: unknown
}

export const PatchRequestModelBaseSchema: ZodType<PatchRequestModelBase> = intersection(
  RequestModelBaseSchema,
  object({
    operations: record(string(), z.enum(PatchOperation)).optional(),
  })
)
