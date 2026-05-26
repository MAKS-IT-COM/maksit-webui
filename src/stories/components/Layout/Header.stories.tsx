import type { Meta, StoryObj } from '@storybook/react-vite'
import { Header } from '@webui/components/components/Layout/Header'
import { sampleHeader } from './shared'

const meta = {
  title: 'components/Layout/Header',
  component: Header,
  tags: ['autodocs'],
} satisfies Meta<typeof Header>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: sampleHeader,
}

export const TitleOnly: Story = {
  args: {
    children: <h1 className="text-lg font-semibold">Page title</h1>,
  },
}
