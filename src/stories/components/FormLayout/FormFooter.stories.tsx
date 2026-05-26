import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormFooter } from '@webui/components/components/FormLayout/FormFooter'
import { sampleFooterActions, sampleFooterCustom } from './shared'

const meta = {
  title: 'components/FormLayout/FormFooter',
  component: FormFooter,
  tags: ['autodocs'],
} satisfies Meta<typeof FormFooter>

export default meta
type Story = StoryObj<typeof meta>

export const LeftAndRight: Story = {
  args: sampleFooterActions,
}

export const CustomChildren: Story = {
  args: {
    children: sampleFooterCustom,
  },
}

export const RightActionsOnly: Story = {
  args: {
    rightChildren: sampleFooterActions.rightChildren,
  },
}
