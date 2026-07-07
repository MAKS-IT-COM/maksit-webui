/**
 * One entity scope line in search results (entity + CRUD permission flags).
 * Align with product `Models/Shared/Search/SearchEntityScopeEntry.cs` (certs-ui, vault).
 */
export interface SearchEntityScopeEntry<TScopeEntityType = number> {
  scopeEntityType: TScopeEntityType
  entityId: string
  entityName?: string
  read: boolean
  write: boolean
  delete: boolean
  create: boolean
}
