import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import {
  WhatsAppButton,
  FacebookMessengerButton,
} from '@webui/components/components/social'

const meta = {
  title: 'components/social',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const WhatsAppInline: Story = {
  render: () => (
    <WhatsAppButton
      floating={false}
      number="15551234567"
      text="Hello from the website"
      title="Chat on WhatsApp"
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const link = canvas.getByRole('link', { name: /chat on whatsapp/i })
    await expect(link).toHaveAttribute(
      'href',
      `https://wa.me/15551234567?text=${encodeURIComponent('Hello from the website')}`,
    )
  },
}

export const MessengerInline: Story = {
  render: () => (
    <FacebookMessengerButton
      floating={false}
      page="Meta"
      title="Chat on Messenger"
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const link = canvas.getByRole('link', { name: /chat on messenger/i })
    await expect(link).toHaveAttribute('href', 'https://m.me/Meta')
  },
}

export const FloatingPair: Story = {
  render: () => (
    <div className="relative h-[280px] rounded border border-gray-200 bg-gray-50">
      <WhatsAppButton
        number="15551234567"
        text="Hi"
        title="WhatsApp"
        className="!bottom-6 !right-6"
      />
      <FacebookMessengerButton
        page="Meta"
        title="Messenger"
        className="!bottom-6 !right-44"
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('link', { name: /^whatsapp$/i })).toHaveAttribute(
      'href',
      `https://wa.me/15551234567?text=${encodeURIComponent('Hi')}`,
    )
    await expect(canvas.getByRole('link', { name: /^messenger$/i })).toHaveAttribute(
      'href',
      'https://m.me/Meta',
    )
  },
}
