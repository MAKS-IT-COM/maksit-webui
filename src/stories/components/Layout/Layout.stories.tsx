import type { Meta, StoryObj } from '@storybook/react-vite'
import { Layout } from '@webui/components/components/Layout'
import {
  minimalSideMenu,
  sampleFooter,
  sampleHeader,
  sampleMainContent,
  sampleSideMenu,
} from './shared'

const meta = {
  title: 'components/Layout/Layout',
  component: Layout,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Layout>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    sideMenu: sampleSideMenu,
    header: sampleHeader,
    footer: sampleFooter,
    children: sampleMainContent,
  },
}

export const Minimal: Story = {
  args: {
    sideMenu: minimalSideMenu,
    header: {
      children: <h1 className="text-lg font-semibold">Settings</h1>,
    },
    footer: {
      children: <span>Footer</span>,
    },
    children: (
      <div className="p-6">
        <p className="text-gray-600">Minimal shell with a short navigation list.</p>
      </div>
    ),
  },
}
