import type { Meta, StoryObj } from '@storybook/react-vite'
import { TreeViewComponent } from '@webui/components/components/editors/TreeViewComponent'

const sampleTree = [
  {
    id: 'org',
    name: 'Organization',
    defaultCollapsed: false,
    content: 'Root organization settings',
    children: [
      {
        id: 'vault',
        name: 'Vault',
        content: 'Secrets and policies',
      },
      {
        id: 'certs',
        name: 'Certificates',
        defaultCollapsed: true,
        children: [
          { id: 'ca', name: 'Certificate authorities' },
          { id: 'issued', name: 'Issued certificates' },
        ],
      },
    ],
  },
]

const meta = {
  title: 'components/editors/TreeView',
  component: TreeViewComponent,
  tags: ['autodocs'],
} satisfies Meta<typeof TreeViewComponent>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: 'Navigation tree',
    data: sampleTree,
  },
}

export const WithoutLabel: Story = {
  args: {
    data: sampleTree,
  },
}
