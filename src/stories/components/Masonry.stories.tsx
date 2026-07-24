import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import { Masonry } from '@webui/components/components/Masonry'

const colors = ['bg-sky-200 h-24', 'bg-emerald-200 h-40', 'bg-amber-200 h-28', 'bg-rose-200 h-36', 'bg-violet-200 h-20', 'bg-cyan-200 h-44']

const meta = {
  title: 'components/Masonry',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {
  render: () => (
    <Masonry breakpoints={[400, 700]}>
      {colors.map((className, index) => (
        <div key={index} data-testid={`tile-${index}`} className={`w-full rounded ${className}`} />
      ))}
    </Masonry>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByTestId('tile-0')).toBeVisible()
    await expect(canvas.getByTestId('tile-5')).toBeVisible()
  },
}
