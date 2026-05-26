import type { Meta, StoryObj } from '@storybook/react-vite'
import { DateTimePickerComponent } from '@webui/components/components/editors/DateTimePickerComponent'
import { withControlledIsoDate } from '../../helpers/controlledEditors'

const ControlledDateTimePicker = withControlledIsoDate(DateTimePickerComponent)

const meta = {
  title: 'components/editors/DateTimePicker',
  component: ControlledDateTimePicker,
  tags: ['autodocs'],
} satisfies Meta<typeof ControlledDateTimePicker>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {
  args: {
    label: 'Scheduled at',
    placeholder: 'Pick date and time',
    value: '',
  },
}

export const WithValue: Story = {
  args: {
    label: 'Scheduled at',
    value: '2026-05-25T14:30:00+00:00',
  },
}

export const WithError: Story = {
  args: {
    label: 'Scheduled at',
    value: '',
    errorText: 'Date and time are required',
  },
}

export const Disabled: Story = {
  args: {
    label: 'Scheduled at',
    value: '2026-05-25T09:00:00+00:00',
    disabled: true,
  },
}
