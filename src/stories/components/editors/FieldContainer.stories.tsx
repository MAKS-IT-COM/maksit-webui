import type { Meta, StoryObj } from '@storybook/react-vite'
import { FieldContainer } from '@webui/components/components/editors/FieldContainer'

const meta = {
  title: 'components/editors/FieldContainer',
  component: FieldContainer,
  tags: ['autodocs'],
} satisfies Meta<typeof FieldContainer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: 'Field label',
    children: (
      <input
        className="border rounded w-full py-2 px-3"
        placeholder="Child control"
      />
    ),
  },
}

export const WithError: Story = {
  args: {
    label: 'Required field',
    errorText: 'This field is required',
    children: <input className="border border-red-500 rounded w-full py-2 px-3" />,
  },
}
