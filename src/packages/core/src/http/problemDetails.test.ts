import { formatProblemDetailsMessage } from './problemDetails'

describe('formatProblemDetailsMessage', () => {
  it('combines detail and field errors', () => {
    const message = formatProblemDetailsMessage({
      title: 'Validation failed',
      detail: 'One or more fields are invalid.',
      errors: {
        name: ['Name is required'],
        email: ['Invalid email', 'Email is too long'],
      },
    })

    expect(message).toBe(
      'One or more fields are invalid. name: Name is required; email: Invalid email; email: Email is too long'
    )
  })

  it('falls back to title when detail and errors are empty', () => {
    expect(formatProblemDetailsMessage({ title: 'Bad Request' })).toBe('Bad Request')
  })

  it('uses a generic message when nothing else is available', () => {
    expect(formatProblemDetailsMessage({})).toBe('Request failed')
  })
})
