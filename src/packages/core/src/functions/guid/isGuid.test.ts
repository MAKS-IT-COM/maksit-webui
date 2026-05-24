import { isGuid } from './isGuid'

describe('isGuid', () => {
  it('accepts valid GUIDs', () => {
    expect(isGuid('550e8400-e29b-41d4-a716-446655440000')).toBe(true)
    expect(isGuid('550E8400-E29B-41D4-A716-446655440000')).toBe(true)
  })

  it('rejects invalid GUIDs', () => {
    expect(isGuid('')).toBe(false)
    expect(isGuid('not-a-guid')).toBe(false)
    expect(isGuid('550e8400-e29b-41d4-a716')).toBe(false)
    expect(isGuid('550e8400e29b41d4a716446655440000')).toBe(false)
  })
})
