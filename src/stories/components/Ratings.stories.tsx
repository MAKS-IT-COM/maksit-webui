import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { Ratings } from '@webui/components/components/Ratings'

const meta = {
  title: 'components/Ratings',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const ReadOnly: Story = {
  render: () => <Ratings value={3.5} label="Product rating" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('img', { name: /product rating/i })).toBeVisible()
  },
}

export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState(4)
    return (
      <div className="space-y-2">
        <Ratings value={value} onChange={setValue} />
        <p className="text-sm text-gray-600">Selected: {value}</p>
      </div>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('radio', { name: /2 stars/i }))
    await expect(canvas.getByText(/selected: 2/i)).toBeVisible()
  },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Ratings value={4} size="sm" label="Small rating" />
      <Ratings value={4} size="md" label="Medium rating" />
      <Ratings value={4} size="lg" label="Large rating" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('img', { name: /small rating/i })).toBeVisible()
    await expect(canvas.getByRole('img', { name: /medium rating/i })).toBeVisible()
    await expect(canvas.getByRole('img', { name: /large rating/i })).toBeVisible()
  },
}
