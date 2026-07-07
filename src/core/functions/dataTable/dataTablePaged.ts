import type { PagedResponse } from '@webui/contracts'

/**
 * Virtualized DataTable view model used by client paging and search helpers.
 *
 * Mirrors {@link PagedResponse} fields with UI-friendly defaults so table
 * components can bind directly without adapter logic.
 */
export interface DataTablePageView<T> {
  items: T[]
  pageNumber: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

/**
 * Maps a contract {@link PagedResponse} into a {@link DataTablePageView} for UI tables.
 *
 * Returns a safe empty page when `raw` is missing or has no `items` array, so
 * DataTable consumers never need null checks on the response envelope.
 *
 * @param raw - Paged API payload, or `undefined` when the request has not completed.
 * @returns Normalized page view with defaults for optional paging metadata.
 */
export function mapPagedToDataTable<T>(raw: PagedResponse<T> | undefined): DataTablePageView<T> {
  if (raw == null || !Array.isArray(raw.items)) {
    return {
      items: [],
      pageNumber: 1,
      pageSize: 0,
      totalCount: 0,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    }
  }
  return {
    items: raw.items,
    pageNumber: raw.pageNumber ?? 1,
    pageSize: raw.pageSize ?? 0,
    totalCount: raw.totalCount ?? 0,
    totalPages: raw.totalPages ?? 1,
    hasPreviousPage: raw.hasPreviousPage ?? false,
    hasNextPage: raw.hasNextPage ?? false,
  }
}
