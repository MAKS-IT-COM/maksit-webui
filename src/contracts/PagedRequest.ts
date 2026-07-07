import { boolean, intersection, number, object, string, type ZodType } from 'zod'
import type { RequestModelBase } from './RequestModelBase'
import { RequestModelBaseSchema } from './RequestModelBase'

/** Matches server `MaksIT.Core.Webapi.Models.PagedRequest` (camelCase JSON). */
export interface PagedRequest extends RequestModelBase {
  pageSize?: number
  pageNumber?: number
  filters?: string
  sortBy?: string
  isAscending?: boolean
}

export const PagedRequestSchema: ZodType<PagedRequest> = intersection(
  RequestModelBaseSchema,
  object({
    pageSize: number().optional(),
    pageNumber: number().optional(),
    filters: string().optional(),
    sortBy: string().optional(),
    isAscending: boolean().optional(),
  })
)
