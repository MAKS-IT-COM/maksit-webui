import type { Meta, StoryObj } from '@storybook/react-vite'
import { userEvent, within, expect } from 'storybook/test'
import { TextBoxComponent } from '@webui/components/components/editors/TextBoxComponent'
import { withControlledValue } from '../../helpers/controlledField'

const ControlledTextBox = withControlledValue(TextBoxComponent, '')

const meta = {
  title: 'components/editors/TextBox',
  component: ControlledTextBox,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'password', 'textarea', 'number', 'email', 'time'],
    },
    colspan: {
      control: { type: 'number', min: 1, max: 12 },
    },
  },
} satisfies Meta<typeof ControlledTextBox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: 'Display name',
    placeholder: 'Jane Doe',
    value: '',
  },
}

export const WithError: Story = {
  args: {
    label: 'Email',
    type: 'email',
    value: 'not-an-email',
    errorText: 'Enter a valid email address',
  },
}

export const Password: Story = {
  args: {
    label: 'Password',
    type: 'password',
    value: 'secret-value',
  },
}

export const Textarea: Story = {
  args: {
    label: 'Notes',
    type: 'textarea',
    value: 'Multi-line content',
  },
}

export const Disabled: Story = {
  args: {
    label: 'Read-only field',
    value: 'Cannot edit',
    disabled: true,
  },
}

export const AcceptsTyping: Story = {
  args: {
    label: 'Search',
    placeholder: 'Type here',
    value: '',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByPlaceholderText('Type here')
    await userEvent.type(input, 'hello')
    await expect(input).toHaveValue('hello')
  },
}
