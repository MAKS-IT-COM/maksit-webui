import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn, expect } from 'storybook/test'
import { LazyLoadTable } from '@webui/components/components/LazyLoadTable'

const sampleData = [
  { id: '1', name: 'Row one' },
  { id: '2', name: 'Row two' },
  { id: '3', name: 'Row three' },
]

const meta = {
  component: LazyLoadTable,
  tags: ['ai-generated'],
  args: {
    loadMore: fn(),
  },
} satisfies Meta<typeof LazyLoadTable>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    data: sampleData,
    columns: [
      { key: 'name', title: 'Name', dataIndex: 'name' },
    ],
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Row one')).toBeVisible()
    await expect(canvas.getByText('Loading more...')).toBeVisible()
  },
}

export const WithCustomCell: Story = {
  args: {
    data: sampleData,
    columns: [
      {
        key: 'name',
        title: 'Name',
        dataIndex: 'name',
        renderColumn: (value) => <strong>{String(value)}</strong>,
      },
    ],
  },
}

export const WideGrid: Story = {
  args: {
    data: sampleData,
    colspan: 12,
    columns: [
      { key: 'name', title: 'Name', dataIndex: 'name' },
    ],
  },
}
