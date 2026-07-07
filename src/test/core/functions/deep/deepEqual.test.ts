import { deepEqual, deepEqualArrays } from '@webui/core/functions/deep/deepEqual'

describe('deepEqual', () => {
  it('returns true for identical primitives', () => {
    expect(deepEqual(1, 1)).toBe(true)
    expect(deepEqual('a', 'a')).toBe(true)
    expect(deepEqual(null, null)).toBe(true)
  })

  it('returns false for different primitives', () => {
    expect(deepEqual(1, 2)).toBe(false)
    expect(deepEqual('a', 'b')).toBe(false)
    expect(deepEqual(null, undefined)).toBe(false)
  })

  it('compares nested objects by value', () => {
    expect(deepEqual({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 2 } })).toBe(true)
    expect(deepEqual({ a: 1 }, { a: 2 })).toBe(false)
    expect(deepEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false)
  })

  it('compares arrays regardless of element order', () => {
    expect(deepEqual([1, 2, 3], [3, 2, 1])).toBe(true)
    expect(deepEqual([{ id: 1 }, { id: 2 }], [{ id: 2 }, { id: 1 }])).toBe(true)
    expect(deepEqual([1, 2], [1, 2, 3])).toBe(false)
  })
})

describe('deepEqualArrays', () => {
  it('returns true for empty arrays', () => {
    expect(deepEqualArrays([], [])).toBe(true)
  })

  it('matches multiset equality', () => {
    expect(deepEqualArrays(['a', 'b'], ['b', 'a'])).toBe(true)
    expect(deepEqualArrays([1, 1, 2], [2, 1, 1])).toBe(true)
    expect(deepEqualArrays([1, 2], [1, 3])).toBe(false)
  })
})
