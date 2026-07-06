import { COLLECTION_ITEM_OPERATION, PatchOperation } from '@maks-it.com/webui-contracts'
import { deepDelta, deltaHasOperations } from '../../../src/functions/deep/deepDelta'
import {
  ENTITY_SCOPES_ARRAY_POLICY,
  HOSTNAMES_ARRAY_POLICY,
  VERSIONS_ARRAY_POLICY,
} from '../../../src/functions/deep/patchCollectionPolicies'

type EntityScopeRow = {
  id?: string
  entityId: string
  entityType: number
  scope: number
}

const orgScope = (overrides: Partial<EntityScopeRow> & Pick<EntityScopeRow, 'entityId' | 'entityType' | 'scope'>): EntityScopeRow => ({
  ...overrides,
})

describe('deepDelta', () => {
  describe('primitive fields', () => {
    /**
     * backup:
     *   { name: 'old', count: 1 }
     * form:
     *   { name: 'new', count: 1 }
     * delta:
     *   {
     *     name: 'new',
     *     operations: { name: PatchOperation.SetField }
     *   }
     * Note: `count` is omitted because it did not change.
     */
    it('detects primitive field changes', () => {
      const backup = { name: 'old', count: 1 }
      const form = { name: 'new', count: 1 }

      const delta = deepDelta(form, backup)

      expect(delta.name).toBe('new')
      expect(delta.operations?.name).toBe(PatchOperation.SetField)
      expect(delta.count).toBeUndefined()
    })

    /**
     * backup:
     *   { name: 'value', optional: 'present' }
     * form:
     *   { name: 'value', optional: null }
     * delta:
     *   {
     *     operations: { optional: PatchOperation.RemoveField }
     *   }
     * Note: removed fields are not present in the delta body — only the RemoveField operation.
     */
    it('marks nullish values as RemoveField', () => {
      const backup = { name: 'value', optional: 'present' }
      const form = { name: 'value', optional: null }

      const delta = deepDelta(form, backup)

      expect(delta.optional).toBeUndefined()
      expect(delta.operations?.optional).toBe(PatchOperation.RemoveField)
    })

    /**
     * backup:
     *   { name: 'same', count: 1 }
     * form:
     *   { name: 'same', count: 1 }
     * delta:
     *   {}
     */
    it('skips unchanged primitives', () => {
      const state = { name: 'same', count: 1 }
      const delta = deepDelta(state, state)

      expect(delta).toEqual({})
      expect(deltaHasOperations(delta)).toBe(false)
    })
  })

  describe('primitive arrays', () => {
    /**
     * backup:
     *   { tags: ['a', 'b'] }
     * form:
     *   { tags: ['a', 'b', 'c'] }
     * delta:
     *   {
     *     tags: ['a', 'b', 'c'],
     *     operations: { tags: PatchOperation.SetField }
     *   }
     * Note: primitive arrays have no per-item identity — the whole array is replaced.
     */
    it('replaces primitive arrays when values differ', () => {
      const backup = { tags: ['a', 'b'] }
      const form = { tags: ['a', 'b', 'c'] }

      const delta = deepDelta(form, backup)

      expect(delta.tags).toEqual(['a', 'b', 'c'])
      expect(delta.operations?.tags).toBe(PatchOperation.SetField)
    })

    /**
     * backup:
     *   { tags: ['a', 'b'] }
     * form:
     *   { tags: ['a', 'b'] }
     * delta:
     *   {}
     */
    it('skips unchanged primitive arrays', () => {
      const delta = deepDelta({ tags: ['a', 'b'] }, { tags: ['a', 'b'] })

      expect(delta.tags).toBeUndefined()
      expect(delta.operations?.tags).toBeUndefined()
    })
  })

  describe('identifiable object arrays (default id policy)', () => {
    /**
     * backup:
     *   {
     *     items: [
     *       { id: '1', name: 'first' },
     *       { id: '2', name: 'second' }
     *     ]
     *   }
     * form:
     *   {
     *     items: [
     *       { id: '1', name: 'updated' },
     *       { id: '3', name: 'new' }
     *     ]
     *   }
     * delta:
     *   {
     *     items: [
     *       { id: '1', name: 'updated', operations: { name: PatchOperation.SetField } },
     *       { id: '3', name: 'new', operations: { collectionItemOperation: PatchOperation.AddToCollection } },
     *       { id: '2', operations: { collectionItemOperation: PatchOperation.RemoveFromCollection } }
     *     ]
     *   }
     */
    it('diffs items by server-assigned id: update, add, remove', () => {
      const backup = {
        items: [
          { id: '1', name: 'first' },
          { id: '2', name: 'second' },
        ],
      }
      const form = {
        items: [
          { id: '1', name: 'updated' },
          { id: '3', name: 'new' },
        ],
      }

      const delta = deepDelta(form, backup)

      expect(delta.items).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: '1', name: 'updated' }),
          expect.objectContaining({
            id: '3',
            name: 'new',
            operations: { [COLLECTION_ITEM_OPERATION]: PatchOperation.AddToCollection },
          }),
          expect.objectContaining({
            id: '2',
            operations: { [COLLECTION_ITEM_OPERATION]: PatchOperation.RemoveFromCollection },
          }),
        ])
      )
    })

    /**
     * backup:
     *   {
     *     entityScopes: [
     *       { id: 'scope-1', entityId: 'org-1', entityType: 0, scope: 3 }
     *     ]
     *   }
     * form:
     *   {
     *     entityScopes: [
     *       { id: 'scope-1', entityId: 'org-1', entityType: 0, scope: 3 }
     *     ]
     *   }
     * delta:
     *   {}
     * Note: unchanged rows with a server id must not appear as `{ id: 'scope-1' }` placeholders.
     */
    it('omits unchanged items that only have a server id', () => {
      const unchanged = { id: 'scope-1', entityId: 'org-1', entityType: 0, scope: 3 }
      const backup = { entityScopes: [unchanged] }
      const form = { entityScopes: [{ ...unchanged }] }

      const delta = deepDelta(form, backup)

      expect(delta.entityScopes).toBeUndefined()
      expect(deltaHasOperations(delta)).toBe(false)
    })

    /**
     * backup:
     *   {
     *     entityScopes: [
     *       { id: 'scope-1', entityId: 'org-1', entityType: 0, scope: 1 }
     *     ]
     *   }
     * form:
     *   {
     *     entityScopes: [
     *       { id: 'scope-1', entityId: 'org-1', entityType: 0, scope: 3 }
     *     ]
     *   }
     * delta:
     *   {
     *     entityScopes: [
     *       { id: 'scope-1', scope: 3, operations: { scope: PatchOperation.SetField } }
     *     ]
     *   }
     * Note: only changed fields are included on the item delta (plus `id` for backend lookup).
     */
    it('emits field-level update for changed properties on an existing id', () => {
      const backup = {
        entityScopes: [{ id: 'scope-1', entityId: 'org-1', entityType: 0, scope: 1 }],
      }
      const form = {
        entityScopes: [{ id: 'scope-1', entityId: 'org-1', entityType: 0, scope: 3 }],
      }

      const delta = deepDelta(form, backup)

      expect(delta.entityScopes).toEqual([
        expect.objectContaining({
          id: 'scope-1',
          scope: 3,
          operations: expect.objectContaining({ scope: PatchOperation.SetField }),
        }),
      ])
    })
  })

  describe('identityKey / idFieldKey policies', () => {
    /**
     * backup:
     *   { hostnames: [{ hostname: 'a.example.com', enabled: true }] }
     * form:
     *   { hostnames: [{ hostname: 'a.example.com', enabled: false }] }
     * options:
     *   { arrays: { hostnames: { identityKey: 'hostname', idFieldKey: 'hostname' } } }
     * delta:
     *   {
     *     hostnames: [
     *       {
     *         hostname: 'a.example.com',
     *         enabled: false,
     *         operations: { enabled: PatchOperation.SetField }
     *       }
     *     ]
     *   }
     * Note: items without `id` are matched by `identityKey` instead.
     */
    it('uses identityKey when items have no id', () => {
      const backup = { hostnames: [{ hostname: 'a.example.com', enabled: true }] }
      const form = { hostnames: [{ hostname: 'a.example.com', enabled: false }] }

      const delta = deepDelta(form, backup, {
        arrays: { hostnames: { identityKey: 'hostname', idFieldKey: 'hostname' } },
      })

      expect(delta.hostnames).toEqual([
        expect.objectContaining({
          hostname: 'a.example.com',
          enabled: false,
          operations: expect.objectContaining({ enabled: PatchOperation.SetField }),
        }),
      ])
    })

    /**
     * backup:
     *   { rows: [{ label: 'a' }] }
     * form:
     *   { rows: [{ label: 'b' }] }
     * delta:
     *   {
     *     rows: [{ label: 'b' }],
     *     operations: { rows: PatchOperation.SetField }
     *   }
     * Note: without `id` or `identityKey` policy the array cannot be itemized — full replace.
     */
    it('replaces object arrays without id or identityKey', () => {
      const backup = { rows: [{ label: 'a' }] }
      const form = { rows: [{ label: 'b' }] }

      const delta = deepDelta(form, backup)

      expect(delta.rows).toEqual([{ label: 'b' }])
      expect(delta.operations?.rows).toBe(PatchOperation.SetField)
    })
  })

  describe('ENTITY_SCOPES_ARRAY_POLICY', () => {
    const policyOptions = { arrays: { entityScopes: ENTITY_SCOPES_ARRAY_POLICY } }

    /**
     * Regression: vault API key edit — add a scope while an existing scope is unchanged.
     *
     * backup:
     *   {
     *     entityScopes: [
     *       { id: '1111...', entityId: 'org-1', entityType: 0, scope: 3 }
     *     ]
     *   }
     * form:
     *   {
     *     entityScopes: [
     *       { id: '1111...', entityId: 'org-1', entityType: 0, scope: 3 },
     *       { entityId: 'app-1', entityType: 1, scope: 1 }
     *     ]
     *   }
     * delta (must NOT include `{ id: '1111...' }` for the unchanged row):
     *   {
     *     entityScopes: [
     *       {
     *         entityId: 'app-1',
     *         entityType: 1,
     *         scope: 1,
     *         operations: { collectionItemOperation: PatchOperation.AddToCollection }
     *       }
     *     ]
     *   }
     */
    it('does not emit id-only placeholders for unchanged scopes with server ids', () => {
      const existing = orgScope({
        id: '11111111-1111-1111-1111-111111111111',
        entityId: 'org-1',
        entityType: 0,
        scope: 3,
      })
      const backup = { entityScopes: [existing] }
      const form = {
        entityScopes: [
          existing,
          orgScope({
            entityId: 'app-1',
            entityType: 1,
            scope: 1,
          }),
        ],
      }

      const delta = deepDelta(form, backup, policyOptions)

      expect(delta.entityScopes).toHaveLength(1)
      expect(delta.entityScopes?.[0]).toEqual(
        expect.objectContaining({
          entityId: 'app-1',
          entityType: 1,
          scope: 1,
          operations: { [COLLECTION_ITEM_OPERATION]: PatchOperation.AddToCollection },
        })
      )
      expect(delta.entityScopes?.[0]).not.toHaveProperty('id')
    })

    /**
     * backup:
     *   { entityScopes: [] }
     * form:
     *   {
     *     entityScopes: [
     *       { entityId: 'org-1', entityType: 0, scope: 3 }
     *     ]
     *   }
     * delta:
     *   {
     *     entityScopes: [
     *       {
     *         entityId: 'org-1',
     *         entityType: 0,
     *         scope: 3,
     *         operations: { collectionItemOperation: PatchOperation.AddToCollection }
     *       }
     *     ]
     *   }
     * Note: new rows must not receive a server `id` Guid in the payload.
     */
    it('adds a new scope with AddToCollection and full scope fields (no server id)', () => {
      const backup = { entityScopes: [] as EntityScopeRow[] }
      const form = {
        entityScopes: [
          orgScope({ entityId: 'org-1', entityType: 0, scope: 3 }),
        ],
      }

      const delta = deepDelta(form, backup, policyOptions)

      expect(delta.entityScopes).toEqual([
        expect.objectContaining({
          entityId: 'org-1',
          entityType: 0,
          scope: 3,
          operations: { [COLLECTION_ITEM_OPERATION]: PatchOperation.AddToCollection },
        }),
      ])
      expect(delta.entityScopes?.[0]).not.toHaveProperty('id')
    })

    /**
     * backup:
     *   { entityScopes: [] }
     * form:
     *   {
     *     entityScopes: [
     *       { entityId: 'org-1', entityType: 0, scope: 3 }
     *     ]
     *   }
     * delta (no ENTITY_SCOPES_ARRAY_POLICY — rows have no server id):
     *   {
     *     entityScopes: [{ entityId: 'org-1', entityType: 0, scope: 3 }],
     *     operations: { entityScopes: PatchOperation.SetField }
     *   }
     */
    it('replaces entityScopes entirely when rows lack server ids and no identityKey policy', () => {
      const backup = { entityScopes: [] as EntityScopeRow[] }
      const form = {
        entityScopes: [
          orgScope({ entityId: 'org-1', entityType: 0, scope: 3 }),
        ],
      }

      const delta = deepDelta(form, backup)

      expect(delta.entityScopes).toEqual([
        { entityId: 'org-1', entityType: 0, scope: 3 },
      ])
      expect(delta.operations?.entityScopes).toBe(PatchOperation.SetField)
    })

    /**
     * backup:
     *   {
     *     entityScopes: [
     *       { id: '2222...', entityId: 'org-1', entityType: 0, scope: 1 }
     *     ]
     *   }
     * form:
     *   {
     *     entityScopes: [
     *       { id: '2222...', entityId: 'org-1', entityType: 0, scope: 3 }
     *     ]
     *   }
     * delta:
     *   {
     *     entityScopes: [
     *       { id: '2222...', scope: 3, operations: { scope: PatchOperation.SetField } }
     *     ]
     *   }
     */
    it('updates permissions on an existing scope by server id', () => {
      const backup = {
        entityScopes: [
          orgScope({
            id: '22222222-2222-2222-2222-222222222222',
            entityId: 'org-1',
            entityType: 0,
            scope: 1,
          }),
        ],
      }
      const form = {
        entityScopes: [
          orgScope({
            id: '22222222-2222-2222-2222-222222222222',
            entityId: 'org-1',
            entityType: 0,
            scope: 3,
          }),
        ],
      }

      const delta = deepDelta(form, backup, policyOptions)

      expect(delta.entityScopes).toEqual([
        expect.objectContaining({
          id: '22222222-2222-2222-2222-222222222222',
          scope: 3,
          operations: expect.objectContaining({ scope: PatchOperation.SetField }),
        }),
      ])
    })

    /**
     * backup:
     *   {
     *     entityScopes: [
     *       { id: '3333...', entityId: 'org-1', entityType: 0, scope: 3 }
     *     ]
     *   }
     * form:
     *   { entityScopes: [] }
     * delta:
     *   {
     *     entityScopes: [
     *       { id: '3333...', operations: { collectionItemOperation: PatchOperation.RemoveFromCollection } }
     *     ]
     *   }
     */
    it('removes a scope by server id', () => {
      const backup = {
        entityScopes: [
          orgScope({
            id: '33333333-3333-3333-3333-333333333333',
            entityId: 'org-1',
            entityType: 0,
            scope: 3,
          }),
        ],
      }
      const form = { entityScopes: [] as EntityScopeRow[] }

      const delta = deepDelta(form, backup, policyOptions)

      expect(delta.entityScopes).toEqual([
        expect.objectContaining({
          id: '33333333-3333-3333-3333-333333333333',
          operations: { [COLLECTION_ITEM_OPERATION]: PatchOperation.RemoveFromCollection },
        }),
      ])
    })

    /**
     * Full vault API key save: toggle isGlobalAdmin + add application scope; vault org scope unchanged.
     *
     * backup:
     *   {
     *     entityScopes: [
     *       { id: 'aaaa...', entityId: 'org-com', entityType: 0, scope: 3 }
     *     ],
     *     isGlobalAdmin: false
     *   }
     * form:
     *   {
     *     entityScopes: [
     *       { id: 'aaaa...', entityId: 'org-com', entityType: 0, scope: 3 },
     *       { entityId: 'app-fixture', entityType: 1, scope: 1 }
     *     ],
     *     isGlobalAdmin: true
     *   }
     * delta:
     *   {
     *     isGlobalAdmin: true,
     *     operations: { isGlobalAdmin: PatchOperation.SetField },
     *     entityScopes: [
     *       {
     *         entityId: 'app-fixture',
     *         entityType: 1,
     *         scope: 1,
     *         operations: { collectionItemOperation: PatchOperation.AddToCollection }
     *       }
     *     ]
     *   }
     */
    it('matches unchanged and changed scopes in a mixed edit (vault API key scenario)', () => {
      const vaultScope = orgScope({
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        entityId: 'org-com',
        entityType: 0,
        scope: 3,
      })
      const backup = { entityScopes: [vaultScope] }
      const form = {
        entityScopes: [
          vaultScope,
          orgScope({
            entityId: 'app-fixture',
            entityType: 1,
            scope: 1,
          }),
        ],
        isGlobalAdmin: true,
      }
      const backupWithAdmin = { ...backup, isGlobalAdmin: false }

      const delta = deepDelta(form, backupWithAdmin, {
        arrays: { entityScopes: ENTITY_SCOPES_ARRAY_POLICY },
      })

      expect(delta.isGlobalAdmin).toBe(true)
      expect(delta.operations?.isGlobalAdmin).toBe(PatchOperation.SetField)
      expect(delta.entityScopes).toHaveLength(1)
      expect(delta.entityScopes?.[0]).toEqual(
        expect.objectContaining({
          entityId: 'app-fixture',
          entityType: 1,
          scope: 1,
          operations: { [COLLECTION_ITEM_OPERATION]: PatchOperation.AddToCollection },
        })
      )
    })
  })

  describe('VERSIONS_ARRAY_POLICY', () => {
    const policyOptions = { arrays: { versions: VERSIONS_ARRAY_POLICY } }

    /**
     * backup:
     *   { versions: [{ id: 'ver-1', version: 1, value: 'secret' }] }
     * form:
     *   { versions: [{ id: 'ver-1', version: 1, value: 'secret' }] }
     * delta:
     *   {}
     */
    it('omits unchanged versions that have server ids', () => {
      const version = { id: 'ver-1', version: 1, value: 'secret' }
      const delta = deepDelta(
        { versions: [version] },
        { versions: [{ ...version }] },
        policyOptions
      )

      expect(delta.versions).toBeUndefined()
    })

    /**
     * backup:
     *   { versions: [{ id: 'ver-1', version: 1, value: 'secret' }] }
     * form:
     *   { versions: [{ version: 2, value: 'next' }] }
     * delta:
     *   {
     *     versions: [
     *       {
     *         version: 2,
     *         value: 'next',
     *         operations: { collectionItemOperation: PatchOperation.AddToCollection }
     *       },
     *       {
     *         id: 'ver-1',
     *         operations: { collectionItemOperation: PatchOperation.RemoveFromCollection }
     *       }
     *     ]
     *   }
     */
    it('adds a new version row without assigning id', () => {
      const delta = deepDelta(
        { versions: [{ version: 2, value: 'next' }] },
        { versions: [{ id: 'ver-1', version: 1, value: 'secret' }] },
        policyOptions
      )

      expect(delta.versions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            version: 2,
            value: 'next',
            operations: { [COLLECTION_ITEM_OPERATION]: PatchOperation.AddToCollection },
          }),
          expect.objectContaining({
            id: 'ver-1',
            operations: { [COLLECTION_ITEM_OPERATION]: PatchOperation.RemoveFromCollection },
          }),
        ])
      )
    })

    /**
     * Vault EditSecret — append v2 while v1 is unchanged.
     *
     * backup:
     *   { name: 'db-password', versions: [{ id: 'ver-1', version: 'v1', value: 'old' }] }
     * form:
     *   {
     *     name: 'db-password',
     *     versions: [
     *       { id: 'ver-1', version: 'v1', value: 'old' },
     *       { version: 'v2', value: 'new' }
     *     ]
     *   }
     * delta:
     *   {
     *     versions: [
     *       {
     *         version: 'v2',
     *         value: 'new',
     *         operations: { collectionItemOperation: PatchOperation.AddToCollection }
     *       }
     *     ]
     *   }
     */
    it('adds a new version while existing server versions stay omitted', () => {
      const delta = deepDelta(
        {
          name: 'db-password',
          versions: [
            { id: 'ver-1', version: 'v1', value: 'old' },
            { version: 'v2', value: 'new' },
          ],
        },
        {
          name: 'db-password',
          versions: [{ id: 'ver-1', version: 'v1', value: 'old' }],
        },
        policyOptions
      )

      expect(delta.name).toBeUndefined()
      expect(delta.versions).toHaveLength(1)
      expect(delta.versions?.[0]).toEqual(
        expect.objectContaining({
          version: 'v2',
          value: 'new',
          operations: { [COLLECTION_ITEM_OPERATION]: PatchOperation.AddToCollection },
        })
      )
      expect(delta.versions?.[0]).not.toHaveProperty('id')
    })

    /**
     * backup:
     *   { versions: [{ id: 'ver-1', version: 'v1', value: 'old', expiresAt: '2026-01-01' }] }
     * form:
     *   { versions: [{ id: 'ver-1', version: 'v1', value: 'rotated', expiresAt: '2026-12-31' }] }
     * delta:
     *   {
     *     versions: [
     *       {
     *         id: 'ver-1',
     *         value: 'rotated',
     *         expiresAt: '2026-12-31',
     *         operations: {
     *           value: PatchOperation.SetField,
     *           expiresAt: PatchOperation.SetField
     *         }
     *       }
     *     ]
     *   }
     */
    it('updates value and expiry on an existing version by server id', () => {
      const delta = deepDelta(
        {
          versions: [{ id: 'ver-1', version: 'v1', value: 'rotated', expiresAt: '2026-12-31' }],
        },
        {
          versions: [{ id: 'ver-1', version: 'v1', value: 'old', expiresAt: '2026-01-01' }],
        },
        policyOptions
      )

      expect(delta.versions).toEqual([
        expect.objectContaining({
          id: 'ver-1',
          value: 'rotated',
          expiresAt: '2026-12-31',
          operations: expect.objectContaining({
            value: PatchOperation.SetField,
            expiresAt: PatchOperation.SetField,
          }),
        }),
      ])
    })

    /**
     * backup:
     *   { name: 'old-name', versions: [{ id: 'ver-1', version: 'v1', value: 'secret' }] }
     * form:
     *   { name: 'new-name', versions: [{ id: 'ver-1', version: 'v1', value: 'secret' }] }
     * delta:
     *   {
     *     name: 'new-name',
     *     operations: { name: PatchOperation.SetField }
     *   }
     */
    it('renames a secret without emitting unchanged version rows', () => {
      const version = { id: 'ver-1', version: 'v1', value: 'secret' }
      const delta = deepDelta(
        { name: 'new-name', versions: [version] },
        { name: 'old-name', versions: [{ ...version }] },
        policyOptions
      )

      expect(delta.name).toBe('new-name')
      expect(delta.operations?.name).toBe(PatchOperation.SetField)
      expect(delta.versions).toBeUndefined()
    })
  })

  describe('HOSTNAMES_ARRAY_POLICY (certs EditAccount)', () => {
    const policyOptions = { arrays: { hostnames: HOSTNAMES_ARRAY_POLICY } }

    type HostnameRow = { hostname: string; isDisabled: boolean }

    const hostname = (overrides: Partial<HostnameRow> & Pick<HostnameRow, 'hostname'>): HostnameRow => ({
      isDisabled: false,
      ...overrides,
    })

    /**
     * backup:
     *   { hostnames: [{ hostname: 'www.example.com', isDisabled: false }] }
     * form:
     *   {
     *     hostnames: [
     *       { hostname: 'www.example.com', isDisabled: false },
     *       { hostname: 'api.example.com', isDisabled: false }
     *     ]
     *   }
     * delta:
     *   {
     *     hostnames: [
     *       {
     *         hostname: 'api.example.com',
     *         isDisabled: false,
     *         operations: { collectionItemOperation: PatchOperation.AddToCollection }
     *       }
     *     ]
     *   }
     */
    it('adds a hostname matched by hostname identity', () => {
      const delta = deepDelta(
        {
          hostnames: [
            hostname({ hostname: 'www.example.com' }),
            hostname({ hostname: 'api.example.com' }),
          ],
        },
        { hostnames: [hostname({ hostname: 'www.example.com' })] },
        policyOptions
      )

      expect(delta.hostnames).toHaveLength(1)
      expect(delta.hostnames?.[0]).toEqual(
        expect.objectContaining({
          hostname: 'api.example.com',
          isDisabled: false,
          operations: { [COLLECTION_ITEM_OPERATION]: PatchOperation.AddToCollection },
        })
      )
    })

    /**
     * backup:
     *   {
     *     hostnames: [
     *       { hostname: 'www.example.com', isDisabled: false },
     *       { hostname: 'legacy.example.com', isDisabled: false }
     *     ]
     *   }
     * form:
     *   { hostnames: [{ hostname: 'www.example.com', isDisabled: false }] }
     * delta:
     *   {
     *     hostnames: [
     *       {
     *         hostname: 'legacy.example.com',
     *         operations: { collectionItemOperation: PatchOperation.RemoveFromCollection }
     *       }
     *     ]
     *   }
     */
    it('removes a hostname by hostname identity', () => {
      const delta = deepDelta(
        { hostnames: [hostname({ hostname: 'www.example.com' })] },
        {
          hostnames: [
            hostname({ hostname: 'www.example.com' }),
            hostname({ hostname: 'legacy.example.com' }),
          ],
        },
        policyOptions
      )

      expect(delta.hostnames).toEqual([
        expect.objectContaining({
          hostname: 'legacy.example.com',
          operations: { [COLLECTION_ITEM_OPERATION]: PatchOperation.RemoveFromCollection },
        }),
      ])
    })

    /**
     * Certs EditAccount mixed save: primitives + contacts + hostnames.
     *
     * backup:
     *   {
     *     isDisabled: false,
     *     description: 'Acme',
     *     contacts: ['ops@acme.com'],
     *     hostnames: [
     *       { hostname: 'www.acme.com', isDisabled: false },
     *       { hostname: 'api.acme.com', isDisabled: false }
     *     ]
     *   }
     * form:
     *   {
     *     isDisabled: true,
     *     description: 'Acme Corp',
     *     contacts: ['ops@acme.com', 'billing@acme.com'],
     *     hostnames: [
     *       { hostname: 'www.acme.com', isDisabled: true },
     *       { hostname: 'portal.acme.com', isDisabled: false }
     *     ]
     *   }
     */
    it('combines primitive, contact, and hostname changes in one delta', () => {
      const delta = deepDelta(
        {
          isDisabled: true,
          description: 'Acme Corp',
          contacts: ['ops@acme.com', 'billing@acme.com'],
          hostnames: [
            hostname({ hostname: 'www.acme.com', isDisabled: true }),
            hostname({ hostname: 'portal.acme.com' }),
          ],
        },
        {
          isDisabled: false,
          description: 'Acme',
          contacts: ['ops@acme.com'],
          hostnames: [
            hostname({ hostname: 'www.acme.com' }),
            hostname({ hostname: 'api.acme.com' }),
          ],
        },
        policyOptions
      )

      expect(delta.isDisabled).toBe(true)
      expect(delta.description).toBe('Acme Corp')
      expect(delta.contacts).toEqual(['ops@acme.com', 'billing@acme.com'])
      expect(delta.operations?.isDisabled).toBe(PatchOperation.SetField)
      expect(delta.operations?.description).toBe(PatchOperation.SetField)
      expect(delta.operations?.contacts).toBe(PatchOperation.SetField)

      expect(delta.hostnames).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            hostname: 'www.acme.com',
            isDisabled: true,
            operations: expect.objectContaining({ isDisabled: PatchOperation.SetField }),
          }),
          expect.objectContaining({
            hostname: 'portal.acme.com',
            operations: { [COLLECTION_ITEM_OPERATION]: PatchOperation.AddToCollection },
          }),
          expect.objectContaining({
            hostname: 'api.acme.com',
            operations: { [COLLECTION_ITEM_OPERATION]: PatchOperation.RemoveFromCollection },
          }),
        ])
      )
    })
  })

  describe('consumer form scenarios (vault / certs)', () => {
    /**
     * Vault EditOrganization — rename only.
     *
     * backup: { name: 'Org A' }
     * form:   { name: 'Org B' }
     */
    it('emits a single SetField for organization rename', () => {
      const delta = deepDelta({ name: 'Org B' }, { name: 'Org A' })

      expect(delta).toEqual({
        name: 'Org B',
        operations: { name: PatchOperation.SetField },
      })
    })

    /**
     * Certs/Vault EditUser — profile fields without scope churn.
     *
     * backup:
     *   {
     *     username: 'alice',
     *     email: 'alice@example.com',
     *     entityScopes: [{ id: 'scope-1', entityId: 'org-1', entityType: 0, scope: 3 }]
     *   }
     * form:
     *   {
     *     username: 'alice',
     *     email: 'alice.new@example.com',
     *     entityScopes: [{ id: 'scope-1', entityId: 'org-1', entityType: 0, scope: 3 }]
     *   }
     */
    it('updates user email without emitting unchanged entityScopes', () => {
      const scope = { id: 'scope-1', entityId: 'org-1', entityType: 0, scope: 3 }
      const delta = deepDelta(
        { username: 'alice', email: 'alice.new@example.com', entityScopes: [scope] },
        { username: 'alice', email: 'alice@example.com', entityScopes: [{ ...scope }] },
        { arrays: { entityScopes: ENTITY_SCOPES_ARRAY_POLICY } }
      )

      expect(delta.email).toBe('alice.new@example.com')
      expect(delta.operations?.email).toBe(PatchOperation.SetField)
      expect(delta.entityScopes).toBeUndefined()
    })
  })

  describe('ENTITY_SCOPES_ARRAY_POLICY edge cases', () => {
    const policyOptions = { arrays: { entityScopes: ENTITY_SCOPES_ARRAY_POLICY } }

    /**
     * Synthetic identity includes `scope`, so changing scope on a row without server `id`
     * is modeled as remove + add (not an in-place update).
     *
     * backup:
     *   { entityScopes: [{ entityId: 'org-1', entityType: 0, scope: 1 }] }
     * form:
     *   { entityScopes: [{ entityId: 'org-1', entityType: 0, scope: 3 }] }
     */
    it('treats scope bitmask change on id-less rows as remove and add', () => {
      const delta = deepDelta(
        { entityScopes: [orgScope({ entityId: 'org-1', entityType: 0, scope: 3 })] },
        { entityScopes: [orgScope({ entityId: 'org-1', entityType: 0, scope: 1 })] },
        policyOptions
      )

      expect(delta.entityScopes).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            entityId: 'org-1',
            entityType: 0,
            scope: 3,
            operations: { [COLLECTION_ITEM_OPERATION]: PatchOperation.AddToCollection },
          }),
          expect.objectContaining({
            _deltaId: 'org-1-0-1',
            operations: { [COLLECTION_ITEM_OPERATION]: PatchOperation.RemoveFromCollection },
          }),
        ])
      )
    })

    /**
     * backup:
     *   {
     *     entityScopes: [
     *       { id: 'scope-a', entityId: 'org-1', entityType: 0, scope: 1 },
     *       { id: 'scope-b', entityId: 'app-1', entityType: 1, scope: 3 }
     *     ]
     *   }
     * form:
     *   {
     *     entityScopes: [
     *       { id: 'scope-a', entityId: 'org-1', entityType: 0, scope: 7 },
     *     ]
     *   }
     */
    it('removes one scope and updates another in the same edit', () => {
      const delta = deepDelta(
        {
          entityScopes: [
            orgScope({
              id: 'scope-a',
              entityId: 'org-1',
              entityType: 0,
              scope: 7,
            }),
          ],
        },
        {
          entityScopes: [
            orgScope({
              id: 'scope-a',
              entityId: 'org-1',
              entityType: 0,
              scope: 1,
            }),
            orgScope({
              id: 'scope-b',
              entityId: 'app-1',
              entityType: 1,
              scope: 3,
            }),
          ],
        },
        policyOptions
      )

      expect(delta.entityScopes).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'scope-a',
            scope: 7,
            operations: expect.objectContaining({ scope: PatchOperation.SetField }),
          }),
          expect.objectContaining({
            id: 'scope-b',
            operations: { [COLLECTION_ITEM_OPERATION]: PatchOperation.RemoveFromCollection },
          }),
        ])
      )
    })
  })

  describe('advanced ArrayPolicy options', () => {
    type RoleAssignment = {
      id?: string
      organizationId: string
      role: string | null
    }

    /**
     * Re-parenting example: when `organizationId` changes, emit remove + add.
     *
     * policy:
     *   { rootKey: 'organizationId' }
     */
    it('re-parents an assignment when rootKey changes', () => {
      const policy = { rootKey: 'organizationId' as const }
      const delta = deepDelta(
        {
          assignments: [
            { id: 'assign-1', organizationId: 'org-b', role: 'Reader' },
          ],
        },
        {
          assignments: [
            { id: 'assign-1', organizationId: 'org-a', role: 'Reader' },
          ],
        },
        { arrays: { assignments: policy } }
      )

      expect(delta.assignments).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'assign-1',
            operations: { [COLLECTION_ITEM_OPERATION]: PatchOperation.RemoveFromCollection },
          }),
          expect.objectContaining({
            id: 'assign-1',
            organizationId: 'org-b',
            role: 'Reader',
            operations: { [COLLECTION_ITEM_OPERATION]: PatchOperation.AddToCollection },
          }),
        ])
      )
    })

    /**
     * policy:
     *   {
     *     rootKey: 'organizationId',
     *     childArrayKeys: ['applicationRoles'],
     *     dropChildrenOnRootChange: true
     *   }
     */
    it('clears child arrays when dropChildrenOnRootChange is true', () => {
      const policy = {
        rootKey: 'organizationId' as const,
        childArrayKeys: ['applicationRoles'] as const,
        dropChildrenOnRootChange: true,
      }

      const delta = deepDelta(
        {
          memberships: [
            {
              id: 'mem-1',
              organizationId: 'org-b',
              applicationRoles: [{ id: 'role-1', role: 'Admin' }],
            },
          ],
        },
        {
          memberships: [
            {
              id: 'mem-1',
              organizationId: 'org-a',
              applicationRoles: [{ id: 'role-1', role: 'Admin' }],
            },
          ],
        },
        { arrays: { memberships: policy } }
      )

      const addItem = delta.memberships?.find(
        item => item.operations?.[COLLECTION_ITEM_OPERATION] === PatchOperation.AddToCollection
      )

      expect(addItem).toEqual(
        expect.objectContaining({
          id: 'mem-1',
          organizationId: 'org-b',
          applicationRoles: [],
        })
      )
    })

    /**
     * policy:
     *   { roleFieldKey: 'role', deleteItemWhenRoleRemoved: true }
     */
    it('removes an item when role becomes null and deleteItemWhenRoleRemoved is enabled', () => {
      const policy = {
        roleFieldKey: 'role' as const,
        deleteItemWhenRoleRemoved: true,
      }

      const delta = deepDelta< { grants: RoleAssignment[] }>(
        { grants: [{ id: 'grant-1', organizationId: 'org-1', role: null }] },
        { grants: [{ id: 'grant-1', organizationId: 'org-1', role: 'Admin' }] },
        { arrays: { grants: policy } }
      )

      expect(delta.grants).toEqual([
        expect.objectContaining({
          id: 'grant-1',
          operations: { [COLLECTION_ITEM_OPERATION]: PatchOperation.RemoveFromCollection },
        }),
      ])
    })

    /**
     * policy:
     *   { roleFieldKey: 'role', deleteItemWhenRoleRemoved: false }
     *
     * Note: role → null still maps to RemoveField on the item field; the row is emitted
     * because `role` is present in backup and cleared in form.
     */
    it('updates role in place when deleteItemWhenRoleRemoved is false', () => {
      const policy = {
        roleFieldKey: 'role' as const,
        deleteItemWhenRoleRemoved: false,
      }

      const delta = deepDelta<{ grants: RoleAssignment[] }>(
        { grants: [{ id: 'grant-1', organizationId: 'org-1', role: 'Reader' }] },
        { grants: [{ id: 'grant-1', organizationId: 'org-1', role: 'Admin' }] },
        { arrays: { grants: policy } }
      )

      expect(delta.grants).toEqual([
        expect.objectContaining({
          id: 'grant-1',
          role: 'Reader',
          operations: expect.objectContaining({ role: PatchOperation.SetField }),
        }),
      ])
    })
  })

  describe('nested objects', () => {
    /**
     * backup:
     *   {
     *     profile: {
     *       displayName: 'old',
     *       settings: { theme: 'light' }
     *     }
     *   }
     * form:
     *   {
     *     profile: {
     *       displayName: 'new',
     *       settings: { theme: 'light' }
     *     }
     *   }
     * delta:
     *   {
     *     profile: {
     *       displayName: 'new',
     *       operations: { displayName: PatchOperation.SetField }
     *     }
     *   }
     * Note: nested `settings` is omitted because it did not change.
     */
    it('diffs nested object fields', () => {
      const backup = { profile: { displayName: 'old', settings: { theme: 'light' } } }
      const form = { profile: { displayName: 'new', settings: { theme: 'light' } } }

      const delta = deepDelta(form, backup)

      expect(delta.profile).toEqual(
        expect.objectContaining({
          displayName: 'new',
          operations: expect.objectContaining({ displayName: PatchOperation.SetField }),
        })
      )
      expect((delta.profile as { settings?: unknown }).settings).toBeUndefined()
    })
  })
})

describe('deltaHasOperations', () => {
  /**
   * delta: {}
   * result: false
   */
  it('returns false for empty delta', () => {
    expect(deltaHasOperations({})).toBe(false)
  })

  /**
   * delta:
   *   { operations: { name: PatchOperation.SetField } }
   * result: true
   */
  it('returns true when top-level operations exist', () => {
    expect(deltaHasOperations({ operations: { name: PatchOperation.SetField } })).toBe(true)
  })

  /**
   * delta:
   *   { nested: { operations: { field: PatchOperation.SetField } } }
   * result: true
   */
  it('returns true for nested object operations', () => {
    expect(
      deltaHasOperations({
        nested: { operations: { field: PatchOperation.SetField } },
      })
    ).toBe(true)
  })

  /**
   * delta:
   *   {
   *     items: [
   *       { operations: { collectionItemOperation: PatchOperation.AddToCollection } }
   *     ]
   *   }
   * result: true
   */
  it('returns true for array item operations', () => {
    expect(
      deltaHasOperations({
        items: [{ operations: { [COLLECTION_ITEM_OPERATION]: PatchOperation.AddToCollection } }],
      })
    ).toBe(true)
  })

  /**
   * backup:
   *   {
   *     entityScopes: [{ id: '1111...', entityId: 'org-1', entityType: 0, scope: 3 }],
   *     description: 'same'
   *   }
   * form:
   *   {
   *     entityScopes: [{ id: '1111...', entityId: 'org-1', entityType: 0, scope: 3 }],
   *     description: 'same'
   *   }
   * delta:
   *   {}
   * result: false (no spurious operations from unchanged scope placeholders)
   */
  it('returns false when entity scope delta would only contain unchanged id placeholders', () => {
    const unchanged = {
      id: '11111111-1111-1111-1111-111111111111',
      entityId: 'org-1',
      entityType: 0,
      scope: 3,
    }
    const delta = deepDelta(
      { entityScopes: [unchanged], description: 'same' },
      { entityScopes: [{ ...unchanged }], description: 'same' },
      { arrays: { entityScopes: ENTITY_SCOPES_ARRAY_POLICY } }
    )

    expect(delta.entityScopes).toBeUndefined()
    expect(deltaHasOperations(delta)).toBe(false)
  })
})
