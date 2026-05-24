import { boolean, number, object, record, string, type ZodType } from 'zod'
import type { RequestModelBase } from './RequestModelBase'
import { RequestModelBaseSchema } from './RequestModelBase'

export interface PagedRequest extends RequestModelBase {
  pageSize?: number
  pageNumber?: number
  filters?: string
  collectionFilters?: Record<string, string>
  sortBy?: string
  isAscending?: boolean
}

export const PagedRequestSchema: ZodType<PagedRequest> = RequestModelBaseSchema.and(
  object({
    pageSize: number().optional(),
    pageNumber: number().optional(),
    filters: string().optional(),
    collectionFilters: record(string(), string()).optional(),
    sortBy: string().optional(),
    isAscending: boolean().optional(),
  })
)
