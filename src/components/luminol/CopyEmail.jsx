import { useState } from 'react'
import { useLanguage } from '../../i18n/useLanguage'

export const SPONSOR_EMAIL = 'contact@curiocrate.org'

/** The sponsorship email as real, selectable text plus a Copy button (and a mailto fallback). */
export default function CopyEmail({ compact = false }) {
  const { t } = useLanguage()
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(SPONSOR_EMAIL)
    } catch {
      // Clipboard API unavailable (http, old browser) — select the text so Ctrl/Cmd+C works.
      const el = document.getElementById('lum-email-text')
      const range = document.createRange()
      if (el) { range.selectNodeContents(el); const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range) }
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10,
      padding: compact ? '10px 12px' : '14px 16px', borderRadius: 8,
      background: 'rgba(4,19,21,0.6)', border: '1px solid var(--lum-line)',
    }}>
      <span
        id="lum-email-text"
        style={{
          fontFamily: 'var(--lum-mono)', fontSize: compact ? 14 : 16, color: 'var(--lum-text)',
          userSelect: 'all', wordBreak: 'break-all', flex: '1 1 200px',
        }}
      >{SPONSOR_EMAIL}</span>
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" className="lum-btn lum-btn--primary" onClick={copy} style={{ padding: '10px 16px', minHeight: 40 }}>
          {copied ? t('luminol.common.copied') : t('luminol.common.copy')}
        </button>
        <a className="lum-btn lum-btn--ghost" href={`mailto:${SPONSOR_EMAIL}?subject=${encodeURIComponent('Sponsoring the Luminol kit')}`} style={{ padding: '10px 16px', minHeight: 40 }}>
          {t('luminol.common.email')}
        </a>
      </div>
      <span aria-live="polite" className="lum-sr">{copied ? t('luminol.common.copied') : ''}</span>
    </div>
  )
}
