import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { CookieConsent } from '@webui/components/components/CookieConsent'

const COOKIE_NAME = 'StorybookCookieConsent'

const meta = {
  title: 'components/CookieConsent',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Bottom consent bar. Inject `linkComponent` (e.g. react-router `Link`) for policy links. Clear the consent cookie to re-show.',
      },
    },
  },
  loaders: [
    async () => {
      document.cookie = `${COOKIE_NAME}=; max-age=0; path=/`
      return {}
    },
  ],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="min-h-[240px] bg-gray-50 p-6">
      <p className="text-gray-600">Page content</p>
      <CookieConsent
        cookieName={COOKIE_NAME}
        message="We use cookies to improve your experience."
        links={[
          { href: '/privacy', label: 'Privacy policy' },
          { to: '/cookies', label: 'Cookie policy' },
        ]}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body)
    const dialog = await canvas.findByRole('dialog', { name: /cookie consent/i })
    await expect(dialog).toBeVisible()
    await userEvent.click(canvas.getByRole('button', { name: /accept/i }))
    await expect(canvas.queryByRole('dialog', { name: /cookie consent/i })).not.toBeInTheDocument()
  },
}
