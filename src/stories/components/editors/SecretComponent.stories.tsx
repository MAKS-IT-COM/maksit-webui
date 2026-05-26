import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { SecretComponent } from '@webui/components/components/editors/SecretComponent'
import { withControlledValue } from '../../helpers/controlledField'

const ControlledSecret = withControlledValue<ComponentProps<typeof SecretComponent>>(
  SecretComponent,
  '',
)

const mockSecretGenerator = async () =>
  `sk-${Math.random().toString(36).slice(2, 10)}`

const meta = {
  title: 'components/editors/Secret',
  component: ControlledSecret,
  tags: ['autodocs'],
} satisfies Meta<typeof ControlledSecret>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {
  args: {
    label: 'API key',
    placeholder: 'Enter or generate a secret',
    value: '',
  },
}

export const WithValue: Story = {
  args: {
    label: 'API key',
    value: 'super-secret-token',
    enableCopy: true,
  },
}

export const WithGenerate: Story = {
  args: {
    label: 'API key',
    value: '',
    enableGenerate: true,
    dataSource: mockSecretGenerator,
  },
}

export const WithError: Story = {
  args: {
    label: 'API key',
    value: '',
    errorText: 'Secret is required',
  },
}

export const ReadOnly: Story = {
  args: {
    label: 'API key',
    value: 'cannot-edit-me',
    readOnly: true,
    enableCopy: true,
  },
}
