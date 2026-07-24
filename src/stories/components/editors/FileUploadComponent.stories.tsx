import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import { FileUploadComponent } from '@webui/components/components/editors/FileUploadComponent'
import { withControlledFiles } from '../../helpers/controlledEditors'

const ControlledFileUpload = withControlledFiles(FileUploadComponent)

const meta = {
  title: 'components/editors/FileUpload',
  component: ControlledFileUpload,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'File picker with optional drag-and-drop (`droppable`, default true). Drop replaces the current selection.',
      },
    },
  },
} satisfies Meta<typeof ControlledFileUpload>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: 'Upload documents',
    multiple: true,
    files: [],
    accept: 'image/*,.pdf',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText(/upload documents/i)).toBeVisible()
  },
}

export const SingleFile: Story = {
  args: {
    label: 'Upload certificate',
    multiple: false,
    files: [],
  },
}

export const DropDisabled: Story = {
  args: {
    label: 'Click only',
    files: [],
    droppable: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText(/click only/i)).toBeVisible()
  },
}

export const Disabled: Story = {
  args: {
    label: 'Upload documents',
    files: [],
    disabled: true,
  },
}
