import type { ResponseModelBase } from './ResponseModelBase'

/** Matches server <see cref="MaksIT.Core.Webapi.Models.PagedResponse{T}" /> (camelCase JSON). */
export interface PagedResponse<T> extends ResponseModelBase {
  items: T[]
  pageNumber: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}
