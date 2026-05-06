import type { NextPage } from 'next'
import { WidthController } from '@components/layout'
import { Meta } from '@components/Meta'
import { UserSettingsPanel } from '@components/UserSettingsPanel'
import StyledSettingsPage from '@styles/SettingsPage.Styled'

const SettingsPage: NextPage = () => {
  return (
    <StyledSettingsPage>
      <WidthController customWidth="650px">
        <Meta title="Account Settings" />
        <UserSettingsPanel />
      </WidthController>
    </StyledSettingsPage>
  )
}

export default SettingsPage
