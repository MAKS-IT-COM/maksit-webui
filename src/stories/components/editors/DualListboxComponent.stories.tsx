import type { Meta, StoryObj } from '@storybook/react-vite'
import { DualListboxComponent } from '@webui/components/components/editors/DualListboxComponent'
import { withControlledStringList } from '../../helpers/controlledEditors'

const ControlledDualListbox = withControlledStringList(DualListboxComponent)

const availableItems = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon']

const meta = {
  title: 'components/editors/DualListbox',
  component: ControlledDualListbox,
  tags: ['autodocs'],
} satisfies Meta<typeof ControlledDualListbox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: 'Scopes',
    availableItems,
    selectedItems: ['Alpha', 'Gamma'],
  },
}

export const EmptySelection: Story = {
  args: {
    label: 'Scopes',
    availableItems,
    selectedItems: [],
  },
}

export const WithError: Story = {
  args: {
    label: 'Scopes',
    availableItems,
    selectedItems: [],
    errorText: 'Move at least one item to Selected',
  },
}
