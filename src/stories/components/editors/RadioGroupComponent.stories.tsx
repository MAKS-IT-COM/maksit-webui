import type { Meta, StoryObj } from '@storybook/react-vite'
import { userEvent, within, expect } from 'storybook/test'
import { RadioGroupComponent } from '@webui/components/components/editors/RadioGroupComponent'
import { withControlledRadioValue } from '../../helpers/controlledEditors'

const ControlledRadioGroup = withControlledRadioValue(RadioGroupComponent)

const roleOptions = [
  { value: 'viewer', label: 'Viewer' },
  { value: 'editor', label: 'Editor' },
  { value: 'admin', label: 'Administrator' },
]

const meta = {
  title: 'components/editors/RadioGroup',
  component: ControlledRadioGroup,
  tags: ['autodocs'],
} satisfies Meta<typeof ControlledRadioGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: 'Role',
    options: roleOptions,
    value: 'viewer',
  },
}

export const WithError: Story = {
  args: {
    label: 'Role',
    options: roleOptions,
    value: '',
    errorText: 'Select a role',
  },
}

export const ReadOnly: Story = {
  args: {
    label: 'Role',
    options: roleOptions,
    value: 'admin',
    readOnly: true,
  },
}

export const SelectsOption: Story = {
  args: {
    label: 'Role',
    options: roleOptions,
    value: 'viewer',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByLabelText('Editor'))
    await expect(canvas.getByLabelText('Editor')).toBeChecked()
  },
}
