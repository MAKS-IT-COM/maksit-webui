import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormContainer } from '@webui/components/components/FormLayout/FormContainer'
import { FormContent } from '@webui/components/components/FormLayout/FormContent'
import { FormFooter } from '@webui/components/components/FormLayout/FormFooter'
import { FormHeader } from '@webui/components/components/FormLayout/FormHeader'
import {
  sampleFooterActions,
  sampleFooterCustom,
  sampleFormFields,
} from './shared'

const formShellDecorator = (Story: () => React.JSX.Element) => (
  <div className="h-[560px] w-full max-w-5xl border border-gray-300 bg-white">
    <Story />
  </div>
)

const meta = {
  title: 'components/FormLayout/FormContainer',
  component: FormContainer,
  tags: ['autodocs'],
  decorators: [formShellDecorator],
} satisfies Meta<typeof FormContainer>

export default meta
type Story = StoryObj<typeof meta>

/** Typical edit form: header, scrollable fields, action footer. */
export const Default: Story = {
  render: () => (
    <FormContainer>
      <FormHeader>Edit user</FormHeader>
      <FormContent>{sampleFormFields}</FormContent>
      <FormFooter {...sampleFooterActions} />
    </FormContainer>
  ),
}

export const CustomFooter: Story = {
  render: () => (
    <FormContainer>
      <FormHeader>Create certificate</FormHeader>
      <FormContent>
        <p className="text-gray-600 mb-4">Form body with a centered footer action bar.</p>
        {sampleFormFields}
      </FormContent>
      <FormFooter>{sampleFooterCustom}</FormFooter>
    </FormContainer>
  ),
}

export const ContentOnly: Story = {
  render: () => (
    <FormContainer>
      <FormContent>{sampleFormFields}</FormContent>
    </FormContainer>
  ),
}
