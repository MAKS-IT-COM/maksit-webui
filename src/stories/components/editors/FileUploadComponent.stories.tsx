import type { Meta, StoryObj } from '@storybook/react-vite'
import { FileUploadComponent } from '@webui/components/components/editors/FileUploadComponent'
import { withControlledFiles } from '../../helpers/controlledEditors'

const ControlledFileUpload = withControlledFiles(FileUploadComponent)

const meta = {
  title: 'components/editors/FileUpload',
  component: ControlledFileUpload,
  tags: ['autodocs'],
} satisfies Meta<typeof ControlledFileUpload>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: 'Upload documents',
    multiple: true,
    files: [],
  },
}

export const SingleFile: Story = {
  args: {
    label: 'Upload certificate',
    multiple: false,
    files: [],
  },
}

export const Disabled: Story = {
  args: {
    label: 'Upload documents',
    files: [],
    disabled: true,
  },
}
