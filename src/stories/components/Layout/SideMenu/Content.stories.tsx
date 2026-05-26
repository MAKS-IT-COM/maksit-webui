import type { Meta, StoryObj } from '@storybook/react-vite'
import { Content } from '@webui/components/components/Layout/SideMenu/Content'

const meta = {
  component: Content,
  tags: ['ai-generated'],
} satisfies Meta<typeof Content>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: (
      <ul className="space-y-2 text-sm">
        <li>Dashboard</li>
        <li>Settings</li>
      </ul>
    ),
  },
}

export const ScrollableList: Story = {
  args: {
    children: (
      <ul className="space-y-1 text-sm">
        {Array.from({ length: 20 }, (_, i) => (
          <li key={i}>Item {i + 1}</li>
        ))}
      </ul>
    ),
  },
}
