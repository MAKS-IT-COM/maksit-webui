import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { LightBox } from '@webui/components/components/LightBox'

const slides = [
  { src: 'https://picsum.photos/id/1015/800/600', alt: 'River valley' },
  { src: 'https://picsum.photos/id/1018/800/900', alt: 'Mountain road' },
  { src: 'https://picsum.photos/id/1025/800/700', alt: 'Dog' },
  { src: 'https://picsum.photos/id/1035/800/500', alt: 'Waterfall' },
  { src: 'https://picsum.photos/id/1043/800/800', alt: 'City lights' },
]

const meta = {
  title: 'components/LightBox',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Masonry thumbnail gallery with fullscreen viewer (keyboard: Escape, arrows).',
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Gallery: Story = {
  render: () => <LightBox slides={slides} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)
    await userEvent.click(canvas.getByRole('button', { name: /river valley/i }))
    await expect(body.getByRole('dialog', { name: /river valley/i })).toBeVisible()
    await userEvent.keyboard('{Escape}')
    await expect(body.queryByRole('dialog')).not.toBeInTheDocument()
  },
}
