import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { DataTableFilter } from '@webui/components/components/DataTable'

const meta = {
  title: 'components/DataTable/DataTableFilter',
  component: DataTableFilter,
  tags: ['autodocs'],
  args: {
    columnId: 'name',
    accessorKey: 'name',
    onFilterChange: fn(),
  },
} satisfies Meta<typeof DataTableFilter>

export default meta
type Story = StoryObj<typeof meta>

export const Normal: Story = {
  args: {
    type: 'normal',
  },
}

export const WithValue: Story = {
  args: {
    type: 'normal',
    value: { value: 'vault', operator: 'contains' },
  },
}

export const Disabled: Story = {
  args: {
    type: 'normal',
    disabled: true,
    value: { value: 'read-only filter', operator: '=' },
  },
}

const mockRemoteFilterDataSource = async () => {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return [
    { id: 'admin', name: 'Admin' },
    { id: 'editor', name: 'Editor' },
    { id: 'viewer', name: 'Viewer' },
  ]
}

export const Remote: Story = {
  args: {
    type: 'remote',
    dataSource: mockRemoteFilterDataSource,
  },
}
