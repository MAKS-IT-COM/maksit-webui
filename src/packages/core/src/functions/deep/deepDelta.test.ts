import { COLLECTION_ITEM_OPERATION, PatchOperation } from '@maks-it.com/webui-contracts'
import { deepDelta, deltaHasOperations } from './deepDelta'

describe('deepDelta', () => {
  it('detects primitive field changes', () => {
    const backup = { name: 'old', count: 1 }
    const form = { name: 'new', count: 1 }

    const delta = deepDelta(form, backup)

    expect(delta.name).toBe('new')
    expect(delta.operations?.name).toBe(PatchOperation.SetField)
    expect(delta.count).toBeUndefined()
  })

  it('marks nullish values as RemoveField', () => {
    const backup = { name: 'value', optional: 'present' }
    const form = { name: 'value', optional: null }

    const delta = deepDelta(form, backup)

    expect(delta.optional).toBeUndefined()
    expect(delta.operations?.optional).toBe(PatchOperation.RemoveField)
  })

  it('replaces primitive arrays when values differ', () => {
    const backup = { tags: ['a', 'b'] }
    const form = { tags: ['a', 'b', 'c'] }

    const delta = deepDelta(form, backup)

    expect(delta.tags).toEqual(['a', 'b', 'c'])
    expect(delta.operations?.tags).toBe(PatchOperation.SetField)
  })

  it('skips unchanged primitive arrays', () => {
    const backup = { tags: ['a', 'b'] }
    const form = { tags: ['b', 'a'] }

    const delta = deepDelta({ tags: ['a', 'b'] }, { tags: ['a', 'b'] })

    expect(delta.tags).toBeUndefined()
    expect(delta.operations?.tags).toBeUndefined()
  })

  it('diffs identifiable object arrays by id', () => {
    const backup = {
      items: [{ id: '1', name: 'first' }, { id: '2', name: 'second' }],
    }
    const form = {
      items: [{ id: '1', name: 'updated' }, { id: '3', name: 'new' }],
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
})

describe('deltaHasOperations', () => {
  it('returns false for empty delta', () => {
    expect(deltaHasOperations({})).toBe(false)
  })

  it('returns true when top-level operations exist', () => {
    expect(deltaHasOperations({ operations: { name: PatchOperation.SetField } })).toBe(true)
  })

  it('returns true for nested object operations', () => {
    expect(
      deltaHasOperations({
        nested: { operations: { field: PatchOperation.SetField } },
      })
    ).toBe(true)
  })

  it('returns true for array item operations', () => {
    expect(
      deltaHasOperations({
        items: [{ operations: { [COLLECTION_ITEM_OPERATION]: PatchOperation.AddToCollection } }],
      })
    ).toBe(true)
  })
})
