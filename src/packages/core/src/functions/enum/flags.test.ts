import { hasAnyFlag } from './hasAnyFlag'
import { hasFlag } from './hasFlag'
import { toggleFlag } from './toggleFlag'

describe('hasFlag', () => {
  it('returns true when all flag bits are set', () => {
    expect(hasFlag(0b101, 0b001)).toBe(true)
    expect(hasFlag(0b111, 0b101)).toBe(true)
  })

  it('returns false when any flag bit is missing', () => {
    expect(hasFlag(0b100, 0b101)).toBe(false)
    expect(hasFlag(0, 0b001)).toBe(false)
  })
})

describe('hasAnyFlag', () => {
  it('returns true when any overlapping bit is set', () => {
    expect(hasAnyFlag(0b100, 0b101)).toBe(true)
    expect(hasAnyFlag(0b010, 0b001)).toBe(false)
  })
})

describe('toggleFlag', () => {
  it('adds the flag when not fully set', () => {
    expect(toggleFlag(0b100, 0b001)).toBe(0b101)
  })

  it('removes the flag when fully set', () => {
    expect(toggleFlag(0b101, 0b001)).toBe(0b100)
  })
})
