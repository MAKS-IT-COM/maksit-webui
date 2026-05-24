import type { ArrayPolicy } from './deepDelta'

/**
 * Resolves a stable string identity for collection items during delta computation.
 *
 * Prefers a non-empty server-assigned `id`; otherwise delegates to `fallback`.
 *
 * @param item - Collection item being diffed.
 * @param fallback - Synthetic identity when `id` is absent.
 * @returns String identity used for map lookups.
 */
function preferIdElse(
  item: Record<string, unknown>,
  fallback: (item: Record<string, unknown>) => string
): string {
  const id = item.id

  if (id !== null && id !== undefined && String(id).length > 0)
    return String(id)

  return fallback(item)
}

/**
 * Builds a synthetic identity for entity-scope rows without a server `id`.
 *
 * Combines `entityId`, `entityType`, and `scope` so duplicate scopes on the same
 * entity remain distinguishable during {@link deepDelta} array diffing.
 */
function entityScopeFallback(item: Record<string, unknown>): string {
  const entityId = item.entityId ?? ''
  const entityType = item.entityType ?? ''
  const scope = item.scope ?? ''

  return `${entityId}-${entityType}-${scope}`
}

/**
 * Array policy for user/API key `entityScopes` payloads passed to {@link deepDelta}.
 *
 * Uses `_deltaId` in the delta payload when items lack a server `id`, avoiding
 * invalid Guid values in the `id` field expected by the API.
 */
export const ENTITY_SCOPES_ARRAY_POLICY: ArrayPolicy = {
  identityKey: (item) => preferIdElse(item, entityScopeFallback),
  idFieldKey: '_deltaId',
}

/**
 * Builds a synthetic identity for secret version rows without a server `id`.
 *
 * Falls back to the `version` field, or an empty string when neither is present.
 */
function versionFallback(item: Record<string, unknown>): string {
  const version = item.version

  if (version !== null && version !== undefined && String(version).length > 0)
    return String(version)

  return ''
}

/**
 * Array policy for secret `versions` collections passed to {@link deepDelta}.
 *
 * Mirrors {@link ENTITY_SCOPES_ARRAY_POLICY}: synthetic identities are emitted as
 * `_deltaId` rather than `id` when no server identifier exists.
 */
export const VERSIONS_ARRAY_POLICY: ArrayPolicy = {
  identityKey: (item) => preferIdElse(item, versionFallback),
  idFieldKey: '_deltaId',
}
