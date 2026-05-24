import { extractPropFilter } from './dataTableFilters'

describe('extractPropFilter', () => {
  it('extracts Contains filter values', () => {
    expect(extractPropFilter('CommonName.Contains("example")', 'CommonName')).toBe('example')
  })

  it('extracts StartsWith and EndsWith filter values', () => {
    expect(extractPropFilter('Host.StartsWith("api")', 'Host')).toBe('api')
    expect(extractPropFilter('Host.EndsWith(".com")', 'Host')).toBe('.com')
  })

  it('is case-insensitive for property and operator names', () => {
    expect(extractPropFilter('commonname.contains("test")', 'CommonName')).toBe('test')
  })

  it('returns undefined for empty or non-matching filters', () => {
    expect(extractPropFilter(undefined, 'CommonName')).toBeUndefined()
    expect(extractPropFilter('   ', 'CommonName')).toBeUndefined()
    expect(extractPropFilter('OtherField.Contains("x")', 'CommonName')).toBeUndefined()
  })
})
