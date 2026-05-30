import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { userEvent, within, expect } from 'storybook/test'
import { CheckBoxComponent } from '@webui/components/components/editors/CheckBoxComponent'
import { withControlledValue } from '../../helpers/controlledField'

const ControlledCheckBox = withControlledValue<ComponentProps<typeof CheckBoxComponent>>(
  CheckBoxComponent,
  false,
)

const meta = {
  title: 'components/editors/CheckBox',
  component: ControlledCheckBox,
  tags: ['autodocs'],
} satisfies Meta<typeof ControlledCheckBox>

export default meta
type Story = StoryObj<typeof meta>

export const Unchecked: Story = {
  args: {
    label: 'Send notifications',
    value: false,
  },
}

export const Checked: Story = {
  args: {
    label: 'I agree to the terms',
    value: true,
  },
}

export const WithError: Story = {
  args: {
    label: 'Required consent',
    value: false,
    errorText: 'You must accept to continue',
  },
}

export const Disabled: Story = {
  args: {
    label: 'Send notifications',
    value: true,
    disabled: true,
  },
}

export const TogglesOnClick: Story = {
  args: {
    label: 'Enable feature',
    value: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const checkbox = canvas.getByRole('checkbox')
    await expect(checkbox).not.toBeChecked()
    await userEvent.click(checkbox)
    await expect(checkbox).toBeChecked()
  },
}
