import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import { Breadcrumb } from '@webui/components/components/Breadcrumb'
import { FormHeader } from '@webui/components/components/FormLayout/FormHeader'

const meta = {
  title: 'components/Breadcrumb',
  component: Breadcrumb,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Presentational page trail (`nav` + `ol`). Never uses headings — keep a single page `h1` on `FormHeader` or the page title. Inject `linkComponent` (e.g. react-router `Link`) for SPA navigation.',
      },
    },
  },
} satisfies Meta<typeof Breadcrumb>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    items: [
      { label: 'Admin', to: '/admin' },
      { label: 'Shop', to: '/admin/shop' },
      { label: 'Edit item' },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const nav = canvas.getByRole('navigation', { name: /breadcrumb/i })
    await expect(nav).toBeVisible()
    await expect(within(nav).getByRole('link', { name: 'Admin' })).toHaveAttribute('href', '/admin')
    await expect(within(nav).getByRole('link', { name: 'Shop' })).toHaveAttribute('href', '/admin/shop')
    await expect(within(nav).getByText('Edit item')).toHaveAttribute('aria-current', 'page')
  },
}

export const SingleItem: Story = {
  args: {
    items: [{ label: 'Dashboard' }],
  },
}

export const WithFormHeader: Story = {
  render: () => (
    <div className="space-y-0 border border-gray-200 bg-white">
      <div className="bg-gray-50 px-4 py-2">
        <Breadcrumb
          items={[
            { label: 'Admin', to: '/admin' },
            { label: 'Shop', to: '/admin/shop' },
            { label: 'Edit item' },
          ]}
        />
      </div>
      <FormHeader>Edit shop item</FormHeader>
      <div className="p-4 text-sm text-gray-600">Form content</div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('navigation', { name: /breadcrumb/i })).toBeVisible()
    await expect(canvas.getByRole('heading', { level: 1, name: 'Edit shop item' })).toBeVisible()
  },
}

export const CustomSeparator: Story = {
  args: {
    separator: '›',
    items: [
      { label: 'Shop', to: '/shop' },
      { label: 'Parent product', to: '/shop/parent' },
      { label: 'Gallery image' },
    ],
  },
}
