import type { JSX } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { DataTableClientSide } from './DataTableClientSide'
import { createSampleColumns, createSamplePagedResponse, SampleDataTable } from './shared'

const tableHeightDecorator = (Story: () => JSX.Element) => (
  <div className="h-[480px] w-full max-w-5xl">
    <Story />
  </div>
)

const meta = {
  title: 'components/DataTable/DataTable',
  component: SampleDataTable,
  tags: ['autodocs'],
  decorators: [tableHeightDecorator],
  args: {
    columns: createSampleColumns(),
    onFilterChange: fn(),
    onPreviousPage: fn(),
    onNextPage: fn(),
  },
} satisfies Meta<typeof SampleDataTable>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    rawd: createSamplePagedResponse(),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Filter and pagination callbacks are spies only — the grid does not update unless the parent refetches `rawd` (see **ClientSideInteractive**).',
      },
    },
  },
}

/**
 * Filters and Previous/Next pagination update the grid (Storybook demo).
 * Apps normally refetch `rawd` from the API in `onFilterChange` / `onPreviousPage` / `onNextPage`.
 */
export const ClientSideInteractive: Story = {
  render: () => <DataTableClientSide />,
}

export const Empty: Story = {
  args: {
    rawd: createSamplePagedResponse({
      items: [],
      totalCount: 0,
      totalPages: 1,
    }),
  },
}

export const WithPagination: Story = {
  render: () => <DataTableClientSide />,
  parameters: {
    docs: {
      description: {
        story:
          'Same as **ClientSideInteractive**: 2 rows per page, 8 total rows — use Previous/Next or scroll the grid to the edges.',
      },
    },
  },
}

export const WithRowActions: Story = {
  args: {
    rawd: createSamplePagedResponse(),
    allowAddRow: () => true,
    onAddRow: fn(),
    allowEditRow: () => true,
    onEditRow: fn(),
    allowDeleteRow: () => true,
    onDeleteRow: fn(),
  },
}
