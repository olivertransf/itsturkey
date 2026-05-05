import React, { Fragment, ReactNode } from 'react'

function renderBoldChunks(text: string, keyPrefix: string): ReactNode {
  const segments = text.split(/(\*\*[^*]+\*\*)/g)
  return (
    <>
      {segments.map((seg, i) => {
        const m = /^\*\*([^*]+)\*\*$/.exec(seg)
        if (m) {
          return (
            <strong key={`${keyPrefix}-b-${i}`}>
              {m[1]}
            </strong>
          )
        }
        return (
          <Fragment key={`${keyPrefix}-t-${i}`}>
            {seg}
          </Fragment>
        )
      })}
    </>
  )
}

/** Renders inline `**bold**` and markdown links `[label](url)` (best-effort). */
export function renderRichLine(text: string, keyPrefix: string): ReactNode {
  const parts: ReactNode[] = []
  const re = /\[([^\]]+)\]\(([^)]+)\)/g
  let last = 0
  let m: RegExpExecArray | null
  let pi = 0
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      parts.push(
        <Fragment key={`${keyPrefix}-pre-${pi}`}>
          {renderBoldChunks(text.slice(last, m.index), `${keyPrefix}-pre-${pi}`)}
        </Fragment>
      )
    }
    parts.push(
      <a key={`${keyPrefix}-a-${pi}`} href={m[2]} target="_blank" rel="noopener noreferrer">
        {renderBoldChunks(m[1], `${keyPrefix}-al-${pi}`)}
      </a>
    )
    last = m.index + m[0].length
    pi += 1
  }
  if (last < text.length) {
    parts.push(
      <Fragment key={`${keyPrefix}-tail`}>
        {renderBoldChunks(text.slice(last), `${keyPrefix}-tail`)}
      </Fragment>
    )
  }
  if (parts.length === 0) {
    return renderBoldChunks(text, keyPrefix)
  }
  return <>{parts}</>
}
