import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { Header } from '@webui/components/components/Layout/SideMenu/Header'

const meta = {
  component: Header,
  tags: ['ai-generated'],
} satisfies Meta<typeof Header>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Navigation',
  },
}

export const WithActions: Story = {
  args: {
    children: (
      <>
        <span>MaksIT Admin</span>
        <span className="text-sm opacity-90">Help</span>
      </>
    ),
  },
}

/** Proves Tailwind loaded — SideMenu header bar uses bg-blue-500. */
export const CssCheck: Story = {
  args: {
    children: 'Navigation',
  },
  play: async ({ canvas }) => {
    const bar = canvas.getByRole('banner').firstElementChild
    await expect(getComputedStyle(bar!).backgroundColor).toBe('oklch(0.623 0.214 259.815)')
  },
}
