import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { EntityScopesSummary } from '@webui/components/components/Scopes/EntityScopesSummary'

const meta = {
  component: EntityScopesSummary,
  tags: ['ai-generated'],
} satisfies Meta<typeof EntityScopesSummary>

export default meta
type Story = StoryObj<typeof meta>

const sampleEntries = [
  {
    scopeEntityType: 1,
    entityId: 'vault-1',
    entityName: 'Production vault',
    read: true,
    write: true,
    delete: false,
    create: false,
  },
  {
    scopeEntityType: 2,
    entityId: 'cert-9',
    entityName: 'Wildcard cert',
    read: true,
    write: false,
    delete: false,
    create: false,
  },
]

export const Empty: Story = {
  args: {
    entries: [],
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('No scopes.')).toBeVisible()
  },
}

export const WithEntries: Story = {
  args: {
    entries: sampleEntries,
    formatScopeEntityType: (type) => (type === 1 ? 'Vault' : 'Certificate'),
  },
}

export const CustomTitle: Story = {
  args: {
    title: 'Effective permissions',
    entries: sampleEntries,
  },
}
