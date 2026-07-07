import { ScopePermission } from '../../types/ScopePermissions'

export interface AclEntry<TEntityType extends number = number> {
  /** Numeric entity type resolved from the type-code prefix. */
  entityType: TEntityType
  /** Opaque entity identifier from the middle segment. */
  entityId: string
  /** Permission bitmask parsed from the trailing hex segment. */
  scope: ScopePermission
}

/**
 * Parses a single ACL entry string into a typed {@link AclEntry}.
 *
 * Expected format: `{entityTypeCode}:{entityId}:{scopeHex}` where `entityTypeCode`
 * is resolved via `entityTypeMap` and `scopeHex` is a hexadecimal {@link ScopePermission} value.
 *
 * @param aclEntry - Raw ACL string from the API or storage.
 * @param entityTypeMap - Maps single-character (or short) type codes to numeric entity types.
 * @returns Parsed entry, or `null` when the string is malformed or the type code is unknown.
 */
const parseAclEntry = <TEntityType extends number>(
  aclEntry: string,
  entityTypeMap: Record<string, TEntityType>
): AclEntry<TEntityType> | null => {
  if (typeof aclEntry !== 'string')
    return null

  const parts = aclEntry.split(':')
  if (parts.length !== 3)
    return null

  const entityType = entityTypeMap[parts[0]]
  if (entityType === undefined)
    return null

  const entityId = parts[1]
  const scopePermission = parseInt(parts[2], 16) as ScopePermission

  return {
    entityType,
    entityId,
    scope: scopePermission,
  }
}

/**
 * Parses an array of ACL entry strings, dropping entries that fail {@link parseAclEntry}.
 *
 * @param aclEntries - List of raw ACL strings.
 * @param entityTypeMap - Maps type codes to numeric entity types (same as {@link parseAclEntry}).
 * @returns Only successfully parsed {@link AclEntry} items, in original order.
 */
const parseAclEntries = <TEntityType extends number>(
  aclEntries: string[],
  entityTypeMap: Record<string, TEntityType>
): AclEntry<TEntityType>[] => {
  return aclEntries
    .map((entry) => parseAclEntry(entry, entityTypeMap))
    .filter((entry): entry is AclEntry<TEntityType> => entry !== null)
}

export { parseAclEntry, parseAclEntries }
