import type { Meta, StoryObj } from '@storybook/react-vite'
import { userEvent, within } from 'storybook/test'
import { ButtonComponent } from '@webui/components/components/editors/ButtonComponent'
import { addToast } from '@webui/components/components/Toast/addToast'
import { Toast } from '@webui/components/components/Toast'

const meta = {
  title: 'components/Toast',
  component: Toast,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Toast>

export default meta
type Story = StoryObj<typeof meta>

function ToastDemo () {
  return (
    <>
      <Toast />
      <div className="flex flex-wrap gap-2 p-6">
        <ButtonComponent
          label="Info"
          buttonHierarchy="primary"
          onClick={() => addToast('Saved successfully', 'info', 4000)}
        />
        <ButtonComponent
          label="Success"
          buttonHierarchy="success"
          onClick={() => addToast('Record created', 'success')}
        />
        <ButtonComponent
          label="Warning"
          buttonHierarchy="warning"
          onClick={() => addToast('Session expiring soon', 'warning')}
        />
        <ButtonComponent
          label="Error"
          buttonHierarchy="error"
          onClick={() => addToast('Something went wrong', 'error')}
        />
      </div>
    </>
  )
}

export const Interactive: Story = {
  render: () => <ToastDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Success' }))
  },
}
