import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  FormContent,
  type FormContentProps,
} from '@webui/components/components/FormLayout/FormContent'
import { sampleFormFields } from './shared'

const meta = {
  title: 'components/FormLayout/FormContent',
  component: FormContent,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="flex h-[480px] w-full max-w-5xl flex-col border border-gray-300 bg-white">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<FormContentProps>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: sampleFormFields,
  },
}

export const WithFlexColumn: Story = {
  args: {
    className: 'flex min-h-0 flex-1 flex-col overflow-hidden',
    children: (
      <div className="min-h-0 flex-1 overflow-y-auto">
        {sampleFormFields}
        <p className="text-sm text-gray-500 mt-4">
          Use <code>className=&quot;flex flex-col overflow-hidden&quot;</code> when a child should fill height (e.g. iframe).
        </p>
      </div>
    ),
  },
}
