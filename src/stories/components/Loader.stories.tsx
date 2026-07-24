import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import {
  Loader,
  Spinner,
  showLoader,
  hideLoader,
  enableLoader,
  disableLoader,
} from '@webui/components/components/Loader'

const meta = {
  title: 'components/Loader',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Full-screen overlay loader. Use controlled `visible`, or mount once and drive via `showLoader` / `hideLoader` (ref-counted, matching host HTTP interceptors).',
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Visible: Story = {
  render: () => (
    <div className="relative h-[400px] w-full bg-gray-100">
      <p className="p-6 text-gray-700">Page content behind the overlay.</p>
      <Loader visible label="Loading…" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('Loading…')).toBeVisible()
  },
}

export const InlineSpinner: Story = {
  render: () => (
    <div className="flex items-center gap-6 p-8">
      <Spinner size="sm" />
      <Spinner size="md" label="Working…" />
      <Spinner size="lg" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('Working…')).toBeVisible()
  },
}

export const EventDriven: Story = {
  render: () => (
    <div className="relative h-[400px] w-full space-y-3 bg-gray-100 p-6">
      <div className="flex flex-wrap gap-2">
        <button type="button" className="rounded bg-blue-500 px-3 py-2 text-white" onClick={() => showLoader()}>
          showLoader
        </button>
        <button type="button" className="rounded bg-gray-600 px-3 py-2 text-white" onClick={() => hideLoader()}>
          hideLoader
        </button>
        <button type="button" className="rounded bg-yellow-600 px-3 py-2 text-white" onClick={() => disableLoader()}>
          disableLoader
        </button>
        <button type="button" className="rounded bg-green-600 px-3 py-2 text-white" onClick={() => enableLoader()}>
          enableLoader
        </button>
      </div>
      <p className="text-sm text-gray-600">Ref-counted overlay — call show twice, then hide twice.</p>
      <Loader label="Please wait…" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: /showloader/i }))
    await expect(canvas.getByText('Please wait…')).toBeVisible()
    await userEvent.click(canvas.getByRole('button', { name: /hideloader/i }))
    await expect(canvas.queryByText('Please wait…')).not.toBeInTheDocument()
  },
}
