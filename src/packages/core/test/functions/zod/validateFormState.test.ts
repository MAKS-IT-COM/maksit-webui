import { z } from 'zod'
import { validateFormState } from '../../../src/functions/zod/validateFormState'

describe('validateFormState', () => {
  const schema = z.object({
    name: z.string().min(1, 'Name is required'),
    age: z.number().min(0),
  })

  it('returns valid result for passing form state', () => {
    const result = validateFormState({ name: 'Alice', age: 30 }, schema)

    expect(result.formIsValid).toBe(true)
    expect(result.errors).toEqual({ name: '', age: '' })
  })

  it('returns field errors for invalid form state', () => {
    const result = validateFormState({ name: '', age: -1 }, schema)

    expect(result.formIsValid).toBe(false)
    expect(result.errors.name).toBe('Name is required')
    expect(result.errors.age).toBeTruthy()
  })
})
