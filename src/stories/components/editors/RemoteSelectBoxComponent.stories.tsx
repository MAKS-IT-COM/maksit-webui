import type { Meta, StoryObj } from '@storybook/react-vite'
import type { PagedRequest } from '@webui/contracts/PagedRequest'
import type { SearchResponseBase } from '@webui/contracts/SearchResponseBase'
import { fn } from 'storybook/test'
import { RemoteSelectBoxComponent } from '@webui/components/components/editors/RemoteSelectBoxComponent'
import { withControlledRemoteSelect } from '../../helpers/controlledEditors'

const mockCatalog: SearchResponseBase[] = [
  { id: 'vault', name: 'Vault' },
  { id: 'certs', name: 'Certificates' },
  { id: 'admin', name: 'Administration' },
  { id: 'reports', name: 'Reports' },
]

const mockDataSource = async (request: PagedRequest) => {
  await new Promise((resolve) => setTimeout(resolve, 200))
  const filter = request.filters?.toLowerCase() ?? ''
  if (!filter) return mockCatalog
  return mockCatalog.filter((item) => item.name.toLowerCase().includes(filter))
}

const ControlledRemoteSelect = withControlledRemoteSelect(RemoteSelectBoxComponent)

const meta = {
  title: 'components/editors/RemoteSelectBox',
  component: ControlledRemoteSelect,
  tags: ['autodocs'],
  args: {
    onChange: fn(),
  },
} satisfies Meta<typeof ControlledRemoteSelect>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: 'Entity',
    placeholder: 'Search entities…',
    dataSource: mockDataSource,
    value: '',
  },
}

export const WithSelection: Story = {
  args: {
    label: 'Entity',
    dataSource: mockDataSource,
    value: 'vault',
  },
}

export const WithError: Story = {
  args: {
    label: 'Entity',
    dataSource: mockDataSource,
    value: '',
    errorText: 'Select an entity',
  },
}

export const ReadOnly: Story = {
  args: {
    label: 'Entity',
    dataSource: mockDataSource,
    value: 'certs',
    readOnly: true,
  },
}
