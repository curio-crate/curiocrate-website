import { useEffect, useId, useState } from 'react'
import { useLanguage } from '../../i18n/useLanguage'

/*
 * The kit box mockup with its "champions of curiosity" stamp outlined as the sponsor's spot.
 * Visitors can type a name or pick a logo file to see it printed there. The file is shown with
 * a local object URL only; nothing is uploaded or stored.
 *
 * The stamp sits on the box's front face, which is a parallelogram in the photo: its corners
 * were measured on the 1448×1086 source, so the overlay is positioned in % of the image and
 * sheared with skewY to match the face.
 */

const IMG = '/kits/luminol'

export default function SponsorBox() {
  const { t } = useLanguage()
  const [name, setName] = useState('')
  const [logo, setLogo] = useState(null)
  const inputId = useId()

  useEffect(() => () => { if (logo) URL.revokeObjectURL(logo) }, [logo])

  const onFile = e => {
    const f = e.target.files?.[0]
    if (f && f.type.startsWith('image/')) setLogo(URL.createObjectURL(f))
    e.target.value = ''
  }
  const label = name.trim()
  const filled = Boolean(logo || label)
  // Shrink long names so they still fit inside the stamp.
  const nameSize = `${Math.max(9, Math.min(30, 190 / Math.max(5, label.length)))}cqw`

  return (
    <div className="sbox">
      <figure className="sbox-photo">
        <img
          src={`${IMG}/box-mockup.webp`}
          srcSet={`${IMG}/box-mockup-sm.webp 724w, ${IMG}/box-mockup.webp 1448w`}
          sizes="(max-width: 900px) 100vw, 640px"
          width={1448} height={1086} loading="lazy" decoding="async"
          alt={t('luminol.sponsor.box.alt')}
        />
        <span className="lum-tag sbox-tag">{t('luminol.common.conceptRender')}</span>

        <div className="sbox-stamp" data-filled={filled || undefined}>
          {!filled && (
            <svg className="sbox-outline" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
              <rect x="1" y="1" width="98" height="98" rx="3" vectorEffect="non-scaling-stroke" />
            </svg>
          )}
          <div className="sbox-stamp-inner">
            {logo
              ? <img src={logo} alt="" className="sbox-logo" />
              : label
                ? <span className="sbox-name" style={{ fontSize: nameSize }}>{label}</span>
                : <span className="sbox-here">{t('luminol.sponsor.box.here')}</span>}
          </div>
        </div>
        <span className="sbox-callout" aria-hidden>{filled ? t('luminol.sponsor.box.filled') : t('luminol.sponsor.box.callout')}</span>
      </figure>

      <div className="sbox-copy">
        <h3 className="sbox-title">{t('luminol.sponsor.box.title')}</h3>
        <p className="sbox-text">{t('luminol.sponsor.box.text')}</p>
        <p className="sbox-founding">{t('luminol.sponsor.founding.text')}</p>

        <div className="sbox-try">
          <label htmlFor={inputId} className="sbox-label">{t('luminol.sponsor.box.nameLabel')}</label>
          <input
            id={inputId} type="text" value={name} maxLength={40} autoComplete="off"
            onChange={e => { setName(e.target.value); setLogo(null) }}
            placeholder={t('luminol.sponsor.box.namePlaceholder')} className="sbox-input"
          />
          <div className="sbox-actions">
            <label className="lum-btn lum-btn--ghost sbox-file">
              {t('luminol.sponsor.box.tryLogo')}
              <input type="file" accept="image/*" onChange={onFile} className="sr-only" />
            </label>
            {filled && (
              <button type="button" className="sbox-clear" onClick={() => { setName(''); setLogo(null) }}>
                {t('luminol.sponsor.box.clear')}
              </button>
            )}
          </div>
          <p className="sbox-local">{t('luminol.sponsor.box.localOnly')}</p>
        </div>

        <a href="#sponsor-contact" className="lum-btn lum-btn--primary sbox-claim">{t('luminol.sponsor.box.claim')}</a>
      </div>
    </div>
  )
}
