import type { Meta, StoryObj } from '@storybook/react-vite'
import { SideMenu } from '@webui/components/components/Layout/SideMenu'
import { minimalSideMenu, sampleSideMenu } from '../shared'

const meta = {
  title: 'components/Layout/SideMenu',
  component: SideMenu,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div className="h-screen w-[250px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SideMenu>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: sampleSideMenu,
}

export const Minimal: Story = {
  args: minimalSideMenu,
}

export const WithoutFooter: Story = {
  args: {
    headerChildren: sampleSideMenu.headerChildren,
    children: sampleSideMenu.children,
  },
}
