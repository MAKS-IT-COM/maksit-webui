import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn } from 'storybook/test'
import { ButtonComponent } from '@webui/components/components/editors/ButtonComponent'

const meta = {
  title: 'components/editors/Button',
  component: ButtonComponent,
  tags: ['autodocs'],
  args: {
    onClick: fn(),
  },
  argTypes: {
    buttonHierarchy: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'warning', 'error'],
    },
    colspan: {
      control: { type: 'number', min: 1, max: 12 },
    },
  },
} satisfies Meta<typeof ButtonComponent>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    label: 'Save changes',
    buttonHierarchy: 'primary',
  },
}

export const Secondary: Story = {
  args: {
    label: 'Cancel',
    buttonHierarchy: 'secondary',
  },
}

export const Disabled: Story = {
  args: {
    label: 'Unavailable',
    buttonHierarchy: 'primary',
    disabled: true,
  },
  play: async ({ args, canvas, userEvent }) => {
    const button = canvas.getByRole('button', { name: /unavailable/i })
    await userEvent.click(button)
    await expect(button).toBeDisabled()
    await expect(args.onClick).not.toHaveBeenCalled()
  },
}

export const DisabledLink: Story = {
  args: {
    label: 'Open dashboard',
    route: '/dashboard',
    buttonHierarchy: 'primary',
    disabled: true,
  },
  play: async ({ args, canvas }) => {
    const link = canvas.getByRole('link', { name: /open dashboard/i })
    await expect(link).toHaveAttribute('aria-disabled', 'true')
    await expect(link).toHaveStyle({ pointerEvents: 'none' })
    await expect(args.onClick).not.toHaveBeenCalled()
  },
}

export const WithRoute: Story = {
  args: {
    label: 'Open dashboard',
    route: '/dashboard',
    buttonHierarchy: 'success',
  },
}

export const ClicksFireHandler: Story = {
  args: {
    label: 'Click me',
    buttonHierarchy: 'primary',
  },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: /click me/i }))
    await expect(args.onClick).toHaveBeenCalledOnce()
  },
}
