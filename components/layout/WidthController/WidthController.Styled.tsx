import styled from 'styled-components'

type StyledProps = {
  customWidth?: string
  mobilePadding?: string
  $center?: boolean
}

const StyledWidthController = styled.div<StyledProps>`
  max-width: ${({ customWidth }) => customWidth ?? 'var(--mainMaxWidth)'};
  width: 100%;
  box-sizing: border-box;
  padding: var(--space-page-y) var(--page-gutter);
  margin: 0 auto;
  min-height: 100%;
  ${({ $center }) =>
    $center
      ? `
    display: flex;
    flex-direction: column;
    justify-content: safe center;
    align-items: stretch;
  `
      : ''}

  @media (max-width: 1024px) {
    padding: ${({ mobilePadding }) => {
      if (mobilePadding === '0px') {
        return '0 var(--page-gutter)'
      }
      if (mobilePadding != null && mobilePadding !== '') {
        return mobilePadding
      }
      return 'var(--space-page-y-mobile) var(--page-gutter)'
    }};
  }
`

export default StyledWidthController
