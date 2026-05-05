import { FC, ReactNode } from 'react'
import { Button, Modal, Spinner } from '@components/system'
import { XIcon } from '@heroicons/react/outline'
import { StyledMainModal } from './'

type Props = {
  title: string
  actionButtonText?: string
  cancelButtonText?: string
  children: ReactNode
  /** Rendered between title and close control (e.g. country tips). */
  headerAccessory?: ReactNode
  /** Rendered below Cancel / primary actions (e.g. reference content after Start). */
  belowFooter?: ReactNode
  isOpen: boolean
  onClose: () => void
  onAction: () => void
  onCancel?: () => void
  isSubmitting?: boolean
  maxWidth?: string
}

const MainModal: FC<Props> = ({
  title,
  actionButtonText,
  cancelButtonText,
  children,
  headerAccessory,
  belowFooter,
  isOpen,
  onClose,
  onAction,
  onCancel,
  isSubmitting,
  maxWidth,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth={maxWidth ?? '650px'}>
      <StyledMainModal>
        <div className="modal-header">
          <h1 className="modal-title">{title}</h1>
          <div className="modal-header-trailing">
            {headerAccessory}
            <button type="button" className="close-button" onClick={onClose} aria-label="Close">
              <XIcon />
            </button>
          </div>
        </div>
        <div className="modal-body">{children}</div>

        <div className="modal-footer">
          <Button variant="solidGray" onClick={onCancel ?? onClose} size="md">
            {cancelButtonText || 'Cancel'}
          </Button>

          <Button onClick={onAction} isLoading={isSubmitting} size="md">
            {actionButtonText || 'Confirm'}
          </Button>
        </div>

        {belowFooter ? <div className="modal-below-footer">{belowFooter}</div> : null}
      </StyledMainModal>
    </Modal>
  )
}

export default MainModal
