import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { FileBrowser } from '@webui/components/components/FileBrowser'
import type { FileBrowserItem, FileBrowserRoot } from '@webui/components/components/FileBrowser'

const roots: FileBrowserRoot[] = [
  { id: 'docs', label: 'docs', iconClassName: 'text-sky-600' },
]

const items: FileBrowserItem[] = [
  {
    key: 'docs/reports/',
    name: 'reports',
    isFolder: true,
  },
  {
    key: 'docs/readme.md',
    name: 'readme.md',
    isFolder: false,
    size: 1280,
    contentType: 'text/markdown',
    lastModified: '2026-07-20T10:00:00Z',
  },
]

const meta = {
  component: FileBrowser,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Generic storage browser. Optional `onCreateFolder`, `onUpload`, and `onDownload` show matching toolbar actions; hosts own storage keys and HTTP.',
      },
    },
  },
  args: {
    roots,
    activeRootId: 'docs',
    pathSegments: [],
    items,
    rootsTitle: 'Buckets',
    description: 'Generic storage browser — folders, files, preview, and cleanup actions.',
    onNavigateRoot: fn(),
    onNavigatePath: fn(),
    onRefresh: fn(),
    onDelete: fn(),
  },
  decorators: [
    (Story) => (
      <div className="flex h-[480px] w-full flex-col">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FileBrowser>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText('reports/')).toBeVisible()
    await expect(canvas.getByText('readme.md')).toBeVisible()
    await expect(canvas.getByText('Buckets')).toBeVisible()
    await expect(canvas.queryByRole('button', { name: /new folder/i })).not.toBeInTheDocument()
    await expect(canvas.queryByRole('button', { name: /^upload$/i })).not.toBeInTheDocument()
  },
}

export const WithActions: Story = {
  args: {
    onCreateFolder: fn(),
    onUpload: fn(),
    onDownload: fn(),
    onFetchTextPreview: fn(async () => '# Hello\n'),
  },
  play: async ({ canvas, args, canvasElement }) => {
    await expect(canvas.getByRole('button', { name: /new folder/i })).toBeVisible()
    await expect(canvas.getByRole('button', { name: /^upload$/i })).toBeVisible()

    await userEvent.click(canvas.getByRole('button', { name: /new folder/i }))
    const body = within(canvasElement.ownerDocument.body)
    const dialog = await body.findByRole('dialog', { name: /new folder/i })
    await expect(dialog).toBeVisible()
    const nameInput = within(dialog).getByRole('textbox', { name: /folder name/i })
    await userEvent.clear(nameInput)
    await userEvent.type(nameInput, 'archives')
    await userEvent.click(within(dialog).getByRole('button', { name: /^create$/i }))
    await expect(args.onCreateFolder).toHaveBeenCalledWith('archives')

    await userEvent.click(canvas.getByText('readme.md'))
    const download = canvas.getByRole('button', { name: /^download$/i })
    await expect(download).toBeVisible()
    await userEvent.click(download)
    await expect(args.onDownload).toHaveBeenCalled()
  },
}

export const Loading: Story = {
  args: {
    loading: true,
    items: [],
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/loading/i)).toBeVisible()
  },
}

export const Empty: Story = {
  args: {
    items: [],
    emptyHint: 'This bucket is empty.',
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('This bucket is empty.')).toBeVisible()
  },
}
