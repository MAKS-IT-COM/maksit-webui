import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { ListboxComponent } from '@webui/components/components/editors/ListBoxComponent'

const sampleItems = ['Read', 'Write', 'Delete', 'Administer']

const meta = {
  title: 'components/editors/ListBox',
  component: ListboxComponent,
  tags: ['autodocs'],
  args: {
    onChange: fn(),
  },
} satisfies Meta<typeof ListboxComponent>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: 'Permissions',
    itemsLabel: 'Available permissions',
    items: sampleItems,
  },
}

export const WithError: Story = {
  args: {
    label: 'Permissions',
    items: sampleItems,
    errorText: 'Select at least one permission',
  },
}
