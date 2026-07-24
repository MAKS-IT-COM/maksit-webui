import { useState, type JSX } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { ButtonComponent } from '@webui/components/components/editors/ButtonComponent'
import { Modal, ConfirmDialog } from '@webui/components/components/Modal'

const pageDecorator = (Story: () => JSX.Element) => (
  <div className="relative min-h-[320px] w-full rounded border border-gray-300 bg-gray-50 p-6">
    <Story />
  </div>
)

function ModalDemo({ startOpen = false }: { startOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(startOpen)

  return (
    <>
      <button
        type="button"
        className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        onClick={() => setIsOpen(true)}
      >
        Open modal
      </button>
      <Modal
        isOpen={isOpen}
        title="Edit item"
        onClose={() => setIsOpen(false)}
        footer={(
          <>
            <ButtonComponent label="Cancel" buttonHierarchy="secondary" onClick={() => setIsOpen(false)} />
            <ButtonComponent label="Save" buttonHierarchy="primary" onClick={() => setIsOpen(false)} />
          </>
        )}
      >
        <p>Centered dialog with title, body, and footer actions.</p>
      </Modal>
    </>
  )
}

function ConfirmDemo({ startOpen = false }: { startOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(startOpen)

  return (
    <>
      <button
        type="button"
        className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
        onClick={() => setIsOpen(true)}
      >
        Delete
      </button>
      <ConfirmDialog
        isOpen={isOpen}
        title="Delete item?"
        message="This action cannot be undone."
        confirmLabel="Delete"
        confirmHierarchy="error"
        onCancel={() => setIsOpen(false)}
        onConfirm={() => {
          fn()
          setIsOpen(false)
        }}
      />
    </>
  )
}

const meta = {
  title: 'components/Modal',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Centered dialog shell (`Modal`) and confirm variant (`ConfirmDialog`). Escape and backdrop close are enabled by default.',
      },
    },
  },
  decorators: [pageDecorator],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Interactive: Story = {
  render: () => <ModalDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: /open modal/i }))
    await expect(canvas.getByRole('dialog', { name: /edit item/i })).toBeVisible()
  },
}

export const Open: Story = {
  render: () => <ModalDemo startOpen />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('dialog', { name: /edit item/i })).toBeVisible()
    await userEvent.click(canvas.getByRole('button', { name: /close/i }))
    await expect(canvas.queryByRole('dialog')).not.toBeInTheDocument()
  },
}

export const Confirm: Story = {
  render: () => <ConfirmDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: /^delete$/i }))
    const body = within(canvasElement.ownerDocument.body)
    await expect(body.getByRole('dialog', { name: /delete item/i })).toBeVisible()
  },
}

export const ConfirmOpen: Story = {
  render: () => <ConfirmDemo startOpen />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body)
    const dialog = body.getByRole('dialog', { name: /delete item/i })
    await expect(dialog).toBeVisible()
    await userEvent.click(within(dialog).getByRole('button', { name: /^delete$/i }))
    await expect(body.queryByRole('dialog')).not.toBeInTheDocument()
  },
}
