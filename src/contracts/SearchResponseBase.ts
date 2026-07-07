import type { ResponseModelBase } from './ResponseModelBase'

/**
 * Minimal id + display label for remote select / paged search helpers.
 * Not a MaksIT.Core type — product `Search*Response` models add domain fields
 * (e.g. `username` on users, `description` on API keys). Map to `name` in the UI layer.
 */
export interface SearchResponseBase extends ResponseModelBase {
  id: string
  name: string
}