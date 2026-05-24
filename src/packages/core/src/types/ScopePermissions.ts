/** Shared scope permission flags (numeric JSON). */
export enum ScopePermission {
  None = 0,
  Read = 1 << 0,
  Write = 1 << 1,
  Delete = 1 << 2,
  Create = 1 << 3,
}
