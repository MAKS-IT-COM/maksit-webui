import type { Meta, StoryObj } from '@storybook/react-vite'
import { Content } from '@webui/components/components/Layout/Content'
import { sampleMainContent } from './shared'

const meta = {
  title: 'components/Layout/Content',
  component: Content,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="h-64 w-full max-w-3xl border border-gray-300">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Content>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: sampleMainContent,
  },
}
