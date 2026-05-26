import type { Meta, StoryObj } from '@storybook/react-vite'
import { Footer } from '@webui/components/components/Layout/Footer'
import { sampleFooter } from './shared'

const meta = {
  title: 'components/Layout/Footer',
  component: Footer,
  tags: ['autodocs'],
} satisfies Meta<typeof Footer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: sampleFooter,
}
