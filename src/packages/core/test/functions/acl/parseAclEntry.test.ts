import { ScopePermission } from '../../../src/types/ScopePermissions'
import { parseAclEntry, parseAclEntries } from '../../../src/functions/acl/parseAclEntry'

const entityTypeMap = { O: 1, V: 2 } as const

describe('parseAclEntry', () => {
  it('parses a valid ACL entry', () => {
    expect(parseAclEntry('O:entity-123:3', entityTypeMap)).toEqual({
      entityType: 1,
      entityId: 'entity-123',
      scope: ScopePermission.Read | ScopePermission.Write,
    })
  })

  it('returns null for malformed entries', () => {
    expect(parseAclEntry('invalid', entityTypeMap)).toBeNull()
    expect(parseAclEntry('X:entity:1', entityTypeMap)).toBeNull()
    expect(parseAclEntry(null as unknown as string, entityTypeMap)).toBeNull()
  })
})

describe('parseAclEntries', () => {
  it('keeps only valid entries in order', () => {
    expect(
      parseAclEntries(['O:a:1', 'bad', 'V:b:2'], entityTypeMap)
    ).toEqual([
      { entityType: 1, entityId: 'a', scope: ScopePermission.Read },
      { entityType: 2, entityId: 'b', scope: ScopePermission.Write },
    ])
  })
})
