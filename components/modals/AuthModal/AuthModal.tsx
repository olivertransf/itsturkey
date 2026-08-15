import Link from 'next/link'
import { FC } from 'react'
import { Button, Modal } from '@components/system'
import { XIcon } from '@heroicons/react/outline'
import { StyledAuthModal } from './'

type Props = {
  isOpen: boolean
  closeModal: () => void
}

const AuthModal: FC<Props> = ({ isOpen, closeModal }) => {
  return (
    <Modal isOpen={isOpen} onClose={closeModal} maxWidth="400px">
      <StyledAuthModal>
        <div className="header">
          <h1 className="modal-title">Log in</h1>
          <button className="close-button" onClick={closeModal}>
            <XIcon />
          </button>
        </div>

        <div className="mainContent">
          <div className="buttonsWrapper">
            <Link href="/login">
              <Button variant="secondary" width="100%">
                Login
              </Button>
            </Link>

            <Link href="/register">
              <Button width="100%">Sign Up</Button>
            </Link>
          </div>
        </div>
      </StyledAuthModal>
    </Modal>
  )
}

export default AuthModal
