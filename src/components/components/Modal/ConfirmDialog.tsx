import { type FC, type ReactNode } from 'react'
import { ButtonComponent } from '../editors/ButtonComponent'
import { Modal, type ModalSize } from './Modal'

export interface ConfirmDialogProps {
  isOpen?: boolean
  title?: ReactNode
  message?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  confirmHierarchy?: 'primary' | 'secondary' | 'success' | 'error' | 'warning'
  onConfirm?: () => void
  onCancel?: () => void
  size?: ModalSize
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
}

const ConfirmDialog: FC<ConfirmDialogProps> = ({
  isOpen = false,
  title = 'Confirm',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmHierarchy = 'primary',
  onConfirm,
  onCancel,
  size = 'sm',
  closeOnBackdrop = true,
  closeOnEscape = true,
}) => (
  <Modal
    isOpen={isOpen}
    title={title}
    size={size}
    onClose={onCancel}
    closeOnBackdrop={closeOnBackdrop}
    closeOnEscape={closeOnEscape}
    footer={(
      <>
        <ButtonComponent
          label={cancelLabel}
          buttonHierarchy={'secondary'}
          onClick={onCancel}
        />
        <ButtonComponent
          label={confirmLabel}
          buttonHierarchy={confirmHierarchy}
          onClick={onConfirm}
        />
      </>
    )}
  >
    {message}
  </Modal>
)

export { ConfirmDialog }
