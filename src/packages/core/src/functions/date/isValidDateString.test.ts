import { isValidISODateString } from './isValidDateString'

describe('isValidISODateString', () => {
  it('accepts valid ISO date strings', () => {
    expect(isValidISODateString('2024-01-15')).toBe(true)
    expect(isValidISODateString('2024-01-15T10:30:00Z')).toBe(true)
  })

  it('rejects empty or invalid strings', () => {
    expect(isValidISODateString('')).toBe(false)
    expect(isValidISODateString('not-a-date')).toBe(false)
    expect(isValidISODateString('2024-13-40')).toBe(false)
  })
})
