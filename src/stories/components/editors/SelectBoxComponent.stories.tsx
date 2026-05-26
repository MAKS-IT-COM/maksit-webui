import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { SelectBoxComponent } from '@webui/components/components/editors/SelectBoxComponent'
import { withControlledValue } from '../../helpers/controlledField'

const ControlledSelectBox = withControlledValue<ComponentProps<typeof SelectBoxComponent>>(
  SelectBoxComponent,
  '',
)

const sampleOptions = [
  { value: 'vault', label: 'Vault' },
  { value: 'certs', label: 'Certificates' },
  { value: 'admin', label: 'Administration' },
]

const meta = {
  title: 'components/editors/SelectBox',
  component: ControlledSelectBox,
  tags: ['autodocs'],
} satisfies Meta<typeof ControlledSelectBox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: 'Module',
    placeholder: 'Search modules…',
    options: sampleOptions,
    value: '',
  },
}

export const WithSelection: Story = {
  args: {
    label: 'Module',
    options: sampleOptions,
    value: 'vault',
  },
}

export const WithError: Story = {
  args: {
    label: 'Module',
    options: sampleOptions,
    value: '',
    errorText: 'Select a module',
  },
}
