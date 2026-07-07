import type { ResponseModelBase } from './ResponseModelBase'

/** Matches `GET api/secret/generatesecret` anonymous response `{ secret }` (e.g. MaksIT.Vault). */
export interface TrngResponse extends ResponseModelBase {
  secret: string
}