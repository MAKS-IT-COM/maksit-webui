import type { Meta, StoryObj } from '@storybook/react-vite'
import { DataTableLabel } from '@webui/components/components/DataTable'

const meta = {
  title: 'components/DataTable/DataTableLabel',
  component: DataTableLabel,
  tags: ['autodocs'],
} satisfies Meta<typeof DataTableLabel>

export default meta
type Story = StoryObj<typeof meta>

export const String: Story = {
  args: {
    type: 'normal',
    value: 'Active certificate',
  },
}

export const Date: Story = {
  args: {
    type: 'normal',
    dataType: 'date',
    value: '2026-05-25T14:30:00Z',
  },
}

export const Empty: Story = {
  args: {
    type: 'normal',
    value: '',
  },
}

const mockRemoteLabelDataSource = async () => {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return { id: '42', displayName: 'Vault production' }
}

export const Remote: Story = {
  args: {
    type: 'remote',
    accessorKey: 'displayName',
    dataSource: mockRemoteLabelDataSource,
  },
}
