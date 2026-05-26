import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormHeader } from '@webui/components/components/FormLayout/FormHeader'

const meta = {
  title: 'components/FormLayout/FormHeader',
  component: FormHeader,
  tags: ['autodocs'],
} satisfies Meta<typeof FormHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Edit user',
  },
}

export const LongTitle: Story = {
  args: {
    children: 'Certificate authority configuration',
  },
}
