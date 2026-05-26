import type { Meta, StoryObj } from '@storybook/react-vite'
import { Content } from '@webui/components/components/Layout/Content'
import { MainContainer } from '@webui/components/components/Layout/MainContainer'
import { SideMenu } from '@webui/components/components/Layout/SideMenu'

const meta = {
  tags: ['ai-generated'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const WithSideMenu: Story = {
  render: () => (
    <MainContainer>
      <SideMenu headerChildren="Menu" footerChildren="Signed in">
        <nav className="space-y-2 text-sm">
          <a href="/vault" className="block text-blue-700">Vault</a>
          <a href="/certs" className="block text-blue-700">Certificates</a>
        </nav>
      </SideMenu>
      <Content>Application content</Content>
    </MainContainer>
  ),
}

export const ContentOnly: Story = {
  render: () => (
    <MainContainer>
      <aside className="bg-gray-100 p-4">Sidebar placeholder</aside>
      <Content>Two-column shell without SideMenu.</Content>
    </MainContainer>
  ),
}
