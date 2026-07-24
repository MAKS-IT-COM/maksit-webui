import { buildWhatsAppHref } from '@webui/components/components/social/WhatsAppButton'
import { buildMessengerHref } from '@webui/components/components/social/FacebookMessengerButton'

describe('social href builders', () => {
  it('builds WhatsApp links with and without a number', () => {
    expect(buildWhatsAppHref(undefined, 'Hi there')).toBe(
      `https://wa.me/?text=${encodeURIComponent('Hi there')}`,
    )
    expect(buildWhatsAppHref('15551234567', 'Hello')).toBe(
      `https://wa.me/15551234567?text=${encodeURIComponent('Hello')}`,
    )
  })

  it('builds Messenger links and strips leading @', () => {
    expect(buildMessengerHref('Meta')).toBe('https://m.me/Meta')
    expect(buildMessengerHref('@Meta')).toBe('https://m.me/Meta')
  })
})
