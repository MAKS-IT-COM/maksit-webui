import type { Meta, StoryObj } from '@storybook/react-vite'
import { Footer } from '@webui/components/components/Layout/SideMenu/Footer'

const meta = {
  component: Footer,
  tags: ['ai-generated'],
} satisfies Meta<typeof Footer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Signed in as admin@example.com',
  },
}

export const Compact: Story = {
  args: {
    children: 'v2.4.0',
  },
}
