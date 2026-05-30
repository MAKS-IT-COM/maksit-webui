import { useState, type JSX, type ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { ButtonComponent } from '@webui/components/components/editors/ButtonComponent'
import type { GridColSpan } from '@webui/components/functions'
import { Offcanvas } from '@webui/components/components/Offcanvas'
import { FormContainer } from '@webui/components/components/FormLayout/FormContainer'
import { FormContent } from '@webui/components/components/FormLayout/FormContent'
import { FormFooter } from '@webui/components/components/FormLayout/FormFooter'
import { FormHeader } from '@webui/components/components/FormLayout/FormHeader'
import { sampleFormFields } from './FormLayout/shared'

const pageDecorator = (Story: () => JSX.Element) => (
  <div className="relative h-[600px] w-full overflow-hidden rounded border border-gray-300 bg-gray-50 p-6">
    <h2 className="text-lg font-semibold text-gray-800">Page behind the overlay</h2>
    <p className="mt-2 text-gray-600">Open the panel, then close via Cancel or the header button.</p>
    <Story />
  </div>
)

function OffcanvasDemo ({
  colspan = 6,
  startOpen = false,
  children,
}: {
  colspan?: GridColSpan
  startOpen?: boolean
  children?: ReactNode | ((close: () => void) => ReactNode)
}) {
  const [isOpen, setIsOpen] = useState(startOpen)
  const close = () => setIsOpen(false)

  const panelContent = typeof children === 'function'
    ? children(close)
    : children ?? (
    <FormContainer>
      <FormHeader>
        <div className="flex items-center justify-between gap-4">
          <span>Edit record</span>
          <ButtonComponent label="Close" buttonHierarchy="secondary" onClick={close} />
        </div>
      </FormHeader>
      <FormContent>{sampleFormFields}</FormContent>
      <FormFooter
        leftChildren={
          <ButtonComponent label="Back" buttonHierarchy="secondary" onClick={close} />
        }
        rightChildren={
          <>
            <ButtonComponent label="Cancel" buttonHierarchy="secondary" onClick={close} />
            <ButtonComponent label="Save" buttonHierarchy="primary" />
          </>
        }
      />
    </FormContainer>
  )

  return (
    <>
      <button
        type="button"
        className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        onClick={() => setIsOpen(true)}
      >
        Open offcanvas
      </button>
      <Offcanvas
        isOpen={isOpen}
        colspan={colspan}
        onOpen={fn()}
        onClose={close}
      >
        <div className="h-full">{panelContent}</div>
      </Offcanvas>
    </>
  )
}

const meta = {
  title: 'components/Offcanvas',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Slide-in overlay panel. Stories use an interactive demo that wraps `Offcanvas` with form content.',
      },
    },
  },
  decorators: [pageDecorator],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Interactive: Story = {
  render: () => <OffcanvasDemo />,
}

export const Open: Story = {
  render: () => <OffcanvasDemo startOpen />,
}

export const WidePanel: Story = {
  render: () => <OffcanvasDemo startOpen colspan={8} />,
}

export const NarrowPanel: Story = {
  render: () => <OffcanvasDemo startOpen colspan={4} />,
}

export const SimpleContent: Story = {
  render: () => (
    <OffcanvasDemo startOpen colspan={5}>
      {(close) => (
        <div className="flex h-full flex-col p-6">
          <h3 className="text-xl font-bold">Quick actions</h3>
          <p className="mt-2 flex-1 text-gray-600">
            Lightweight panel without the full form shell.
          </p>
          <ButtonComponent label="Dismiss" buttonHierarchy="secondary" onClick={close} />
        </div>
      )}
    </OffcanvasDemo>
  ),
}
