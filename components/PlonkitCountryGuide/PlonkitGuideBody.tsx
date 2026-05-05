import React, { FC, ReactNode } from 'react'
import { plonkitAssetUrl } from '@utils/constants/plonkitGuide'
import { renderRichLine } from './richText'

type UnknownRecord = Record<string, unknown>

function isRecord(x: unknown): x is UnknownRecord {
  return typeof x === 'object' && x !== null
}

function strArray(x: unknown): string[] {
  if (!Array.isArray(x)) return []
  return x.filter((t): t is string => typeof t === 'string')
}

const GuideImage: FC<{ src: string; href?: string | null; alt?: string; variant?: 'full' | 'half' }> = ({
  src,
  href,
  alt = '',
  variant = 'half',
}) => {
  /* Remote Plonk It CDN URLs; next/image would require domain allowlist and size hints. */
  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={`plonkit-guide-img plonkit-guide-img-${variant}`}
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
    />
  )
  const inner = href && /^https?:\/\//i.test(href) ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className="plonkit-guide-img-link">
      {img}
    </a>
  ) : (
    img
  )
  return <figure className="plonkit-guide-figure">{inner}</figure>
}

function renderItems(items: unknown, depth: number): ReactNode {
  if (!Array.isArray(items)) return null
  return (
    <>
      {items.map((item, idx) => renderItem(item, depth, idx))}
    </>
  )
}

function renderItem(item: unknown, depth: number, idx: number): ReactNode {
  if (!isRecord(item)) return null
  const kind = item.kind
  const key = `d${depth}-i${idx}`

  if (kind === 'subsection' && typeof item.title === 'string') {
    return (
      <h4 key={key} className="plonkit-guide-subsection">
        {item.title}
      </h4>
    )
  }

  if (kind === 'divider' && typeof item.title === 'string') {
    return (
      <div key={key} className="plonkit-guide-divider">
        <span>{item.title}</span>
      </div>
    )
  }

  if (kind === 'centeredImage' && typeof item.imageUrl === 'string') {
    const url = plonkitAssetUrl(item.imageUrl)
    if (!url) return null
    return <GuideImage key={key} src={url} variant="full" alt="" />
  }

  if (kind === 'centeredText' && typeof item.text === 'string') {
    return (
      <p key={key} className="plonkit-guide-centered">
        {renderRichLine(item.text, key)}
      </p>
    )
  }

  if (kind === 'map') {
    const title = typeof item.title === 'string' ? item.title : ''
    const lines = strArray(item.text)
    return (
      <section key={key} className="plonkit-guide-map-block">
        {title ? <h4 className="plonkit-guide-map-title">{title}</h4> : null}
        {lines.map((line, li) => (
          <p key={`${key}-l${li}`} className="plonkit-guide-text-line">
            {renderRichLine(line, `${key}-l${li}`)}
          </p>
        ))}
      </section>
    )
  }

  if (kind === 'tip') {
    const data = item.data
    if (isRecord(data)) {
      const image = isRecord(data.image) ? data.image : null
      const imageUrl = image && typeof image.imageUrl === 'string' ? plonkitAssetUrl(image.imageUrl) : null
      const imageLink =
        image && typeof image.imageLink === 'string' && /^https?:\/\//i.test(image.imageLink)
          ? image.imageLink
          : null
      const lines = strArray(data.text)
      const width = image && typeof image.width === 'number' ? image.width : 0.5
      const variant = width >= 0.85 ? 'full' : 'half'

      return (
        <div key={key} className="plonkit-guide-tip">
          {imageUrl ? <GuideImage src={imageUrl} href={imageLink} variant={variant} alt="" /> : null}
          {lines.map((line, li) => (
            <p key={`${key}-t${li}`} className="plonkit-guide-text-line">
              {renderRichLine(line, `${key}-t${li}`)}
            </p>
          ))}
        </div>
      )
    }

    const nested = item.items
    if (Array.isArray(nested)) {
      return <div key={key}>{renderItems(nested, depth + 1)}</div>
    }
    return null
  }

  return null
}

function renderStep(step: unknown, idx: number): ReactNode {
  if (!isRecord(step)) return null
  if (step.kind !== 'tip') return null
  const title = typeof step.title === 'string' ? step.title : ''
  const items = step.items
  return (
    <section key={`step-${idx}`} className="plonkit-guide-step">
      {title ? <h3 className="plonkit-guide-step-title">{title}</h3> : null}
      {renderItems(items, 0)}
    </section>
  )
}

type Props = {
  guide: unknown
}

const PlonkitGuideBody: FC<Props> = ({ guide }) => {
  if (!isRecord(guide)) return null
  const hero = typeof guide.heroImage === 'string' ? plonkitAssetUrl(guide.heroImage) : null
  const steps = guide.steps

  return (
    <div className="plonkit-guide-body">
      {hero ? <GuideImage src={hero} variant="full" alt="" /> : null}
      {Array.isArray(steps) ? steps.map((s, i) => renderStep(s, i)) : null}
    </div>
  )
}

export default PlonkitGuideBody
