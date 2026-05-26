import type { Meta, StoryObj } from '@storybook/react-vite'
import { Container } from '@webui/components/components/Layout/Container'
import { Content } from '@webui/components/components/Layout/Content'
import { Footer } from '@webui/components/components/Layout/Footer'
import { Header } from '@webui/components/components/Layout/Header'

const meta = {
  tags: ['ai-generated'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Shell: Story = {
  render: () => (
    <Container>
      <Header>Top bar</Header>
      <Content>Scrollable main area</Content>
      <Footer>Status footer</Footer>
    </Container>
  ),
}

export const ContentOnly: Story = {
  render: () => (
    <Container>
      <Content>Single content region inside the grid shell.</Content>
    </Container>
  ),
}
