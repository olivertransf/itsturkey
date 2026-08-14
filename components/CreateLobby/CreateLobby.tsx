import { FC, ReactNode, useState } from 'react'
import styled from 'styled-components'
import { PageBackLink } from '@components/PageBackLink'
import { GamifiedCenterStage, GamifiedFormCard } from '@styles/GamifiedHubShell.Styled'

export const CreateLobbyCard = styled(GamifiedFormCard)`
  max-width: min(640px, 100%);
  padding: 18px 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`

export const CreateLobbyHero = styled.header`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-width: 0;

  .glyph {
    width: 42px;
    height: 42px;
    flex-shrink: 0;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(47, 127, 255, 0.12);
    border: 1px solid rgba(47, 127, 255, 0.32);
    color: var(--accent-primary);

    svg {
      width: 22px;
      height: 22px;
    }
  }

  h1 {
    margin: 0;
    font-size: clamp(1.25rem, 3vw, 1.5rem);
    font-weight: 800;
    letter-spacing: -0.03em;
    line-height: 1.15;
    color: var(--text-primary);
  }

  .tag {
    margin: 4px 0 0;
    font-size: 13px;
    line-height: 1.4;
    color: var(--text-muted);
  }
`

export const CreateSection = styled.section`
  border: 1px solid var(--border-subtle);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.03);
  overflow: hidden;
`

export const CreateSectionHead = styled.button<{ $open?: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border: 0;
  background: transparent;
  color: var(--text-primary);
  cursor: pointer;
  text-align: left;

  .sec-title {
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--text-muted);
  }

  .sec-summary {
    margin-top: 3px;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
    line-height: 1.3;
  }

  .chev {
    flex-shrink: 0;
    font-size: 12px;
    color: var(--text-muted);
    transform: rotate(${({ $open }) => ($open ? '180deg' : '0deg')});
    transition: transform 0.15s ease;
  }
`

export const CreateSectionBody = styled.div<{ $maxHeight?: number }>`
  padding: 0 14px 14px;
  border-top: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;

  ${({ $maxHeight }) =>
    $maxHeight
      ? `
    max-height: ${$maxHeight}px;
    overflow: auto;
  `
      : ''}
`

export const CreateSectionStatic = styled.div`
  padding: 12px 14px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
`

export const CreateFieldLabel = styled.label`
  display: block;
  margin: 0 0 6px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-muted);
`

export const CreateFieldInput = styled.input`
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(0, 0, 0, 0.32);
  color: #f4f4f5;
  font-size: 14px;
  box-sizing: border-box;

  &:focus {
    border-color: rgba(147, 197, 253, 0.55);
    outline: none;
  }
`

export const CreateRow = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: flex-end;
`

export const CreateFieldGrow = styled.div`
  flex: 1;
  min-width: 120px;
`

export const CreateModeStrip = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border-subtle);

  .mode-copy {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    font-size: 13px;
    font-weight: 600;
    line-height: 1.35;
    color: var(--text-primary);

    svg {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
      margin-top: 2px;
      opacity: 0.9;
    }
  }
`

export const CreateStickyActions = styled.div`
  position: sticky;
  bottom: 0;
  z-index: 2;
  margin: 4px -18px -20px;
  padding: 14px 18px calc(14px + env(safe-area-inset-bottom, 0px));
  background: linear-gradient(180deg, transparent, var(--bg-elevated) 28%);
  border-top: 1px solid var(--border-subtle);
`

export const CreateChipRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`

export const CreateChoiceChip = styled.button<{ $active?: boolean }>`
  flex: 1;
  min-width: 64px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid
    ${({ $active }) => ($active ? 'rgba(47, 127, 255, 0.55)' : 'rgba(255, 255, 255, 0.12)')};
  background: ${({ $active }) => ($active ? 'rgba(47, 127, 255, 0.16)' : 'rgba(255, 255, 255, 0.04)')};
  color: ${({ $active }) => ($active ? 'var(--text-primary)' : 'var(--text-muted)')};
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
`

type AccordionProps = {
  title: string
  summary: string
  defaultOpen?: boolean
  maxBodyHeight?: number
  children: ReactNode
}

export const CreateAccordion: FC<AccordionProps> = ({
  title,
  summary,
  defaultOpen = false,
  maxBodyHeight,
  children,
}) => {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <CreateSection>
      <CreateSectionHead type="button" $open={open} onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span>
          <div className="sec-title">{title}</div>
          <div className="sec-summary">{summary}</div>
        </span>
        <span className="chev" aria-hidden>
          ▾
        </span>
      </CreateSectionHead>
      {open ? <CreateSectionBody $maxHeight={maxBodyHeight}>{children}</CreateSectionBody> : null}
    </CreateSection>
  )
}

type ShellProps = {
  title: string
  tag?: string
  glyph: ReactNode
  children: ReactNode
  metaTitle?: string
}

/** Shared create-lobby chrome: narrow card, back link, hero. */
export const CreateLobbyShell: FC<ShellProps> = ({ title, tag, glyph, children }) => {
  return (
    <GamifiedCenterStage style={{ justifyContent: 'flex-start' }}>
      <CreateLobbyCard>
        <div>
          <PageBackLink href="/" label="Home" />
        </div>
        <CreateLobbyHero>
          <div className="glyph">{glyph}</div>
          <div>
            <h1>{title}</h1>
            {tag ? <p className="tag">{tag}</p> : null}
          </div>
        </CreateLobbyHero>
        {children}
      </CreateLobbyCard>
    </GamifiedCenterStage>
  )
}
