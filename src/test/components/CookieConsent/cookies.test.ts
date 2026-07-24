import { getCookie, setCookie } from '@webui/components/components/CookieConsent/cookies'

describe('cookies', () => {
  beforeEach(() => {
    // Clear cookies by overwriting each known key with an expired max-age.
    for (const part of document.cookie.split(';')) {
      const name = part.split('=')[0]?.trim()
      if (name)
        document.cookie = `${name}=; max-age=0; path=/`
    }
  })

  it('returns empty string when missing', () => {
    expect(getCookie('missing-cookie-xyz')).toBe('')
  })

  it('sets and reads a cookie value', () => {
    setCookie('consent', 'accepted', 7)
    expect(getCookie('consent')).toBe('accepted')
  })

  it('reads an existing cookie from document.cookie', () => {
    document.cookie = 'preset=hello; path=/'
    expect(getCookie('preset')).toBe('hello')
  })
})
