/**
 * Scope permission bit flags (numeric JSON).
 * Must match product `*.Engine.ScopePermission` (e.g. MaksIT.CertsUI.Engine) — not MaksIT.Core.
 */
export enum ScopePermission {
  None = 0,
  Read = 1 << 0,
  Write = 1 << 1,
  Delete = 1 << 2,
  Create = 1 << 3,
}
