import { useState } from 'react'
import { useLanguage } from '../../i18n/useLanguage'

/*
 * NGSS alignment drawn as a well plate: one row per standard, one column per manual section,
 * and a glowing well wherever students do that standard. Picking a section lights its column
 * and fades the standards it doesn't cover. Coverage was mapped from the manual by the team.
 */

const SECTIONS = [
  { id: 'a0', code: 'A.0', pages: '18–19' },
  { id: 'a1', code: 'A.1', pages: '20–26' },
  { id: 'a2', code: 'A.2', pages: '27–33' },
  { id: 'a3', code: 'A.3', pages: '34–39' },
  { id: 'a4', code: 'A.4', pages: '40–44' },
  { id: 'a5', code: 'A.5', pages: '45–52' },
]

const GROUPS = [
  { id: 'pe',  color: 'var(--lum-paper)', rows: [{ id: 'ps12', in: ['a2', 'a3'] }] },
  { id: 'dci', color: 'var(--lum-paper)', rows: [{ id: 'ps1b', in: ['a1'] }] },
  { id: 'sep', color: 'var(--lum-glow)', rows: [
    { id: 'invest',  in: ['a2', 'a3'] },
    { id: 'data',    in: ['a3', 'a4'] },
    { id: 'math',    in: ['a0', 'a3'] },
    { id: 'explain', in: ['a1', 'a2', 'a3', 'a4'] },
    { id: 'argue',   in: ['a4', 'a5'] },
  ] },
  { id: 'ccc', color: '#f0c070', rows: [
    { id: 'pattern', in: ['a3', 'a4'] },
    { id: 'cause',   in: ['a1', 'a2'] },
    { id: 'scale',   in: ['a1', 'a3'] },
  ] },
]
const TOTAL = GROUPS.reduce((n, g) => n + g.rows.length, 0)

export default function NgssPlate() {
  const { t } = useLanguage()
  const [active, setActive] = useState(null)
  const sec = SECTIONS.find(s => s.id === active)
  const covered = active ? GROUPS.flatMap(g => g.rows).filter(r => r.in.includes(active)).length : 0

  return (
    <div className="ngss">
      <div className="ngss-head">
        <div>
          <h3 className="ngss-title">{t('luminol.learn.ngssTitle')}</h3>
          <p className="ngss-sub">{t('luminol.learn.ngssSub')}</p>
        </div>
        <p className="ngss-status" aria-live="polite">
          {sec ? (
            <>
              <strong>{sec.code} {t(`luminol.learn.sections.${sec.id}`)}</strong>
              <span>{t('luminol.learn.pages').replace('{p}', sec.pages)}</span>
              <span>{t('luminol.learn.covers').replace('{n}', covered).replace('{t}', TOTAL)}</span>
            </>
          ) : <span>{t('luminol.learn.pick')}</span>}
        </p>
      </div>

      <table className="ngss-table" data-active={active || undefined}>
        <caption className="sr-only">{t('luminol.learn.ngssTitle')}</caption>
        <thead>
          <tr>
            <th scope="col" className="ngss-corner"><span className="sr-only">{t('luminol.learn.standard')}</span></th>
            {SECTIONS.map(s => (
              <th key={s.id} scope="col" className="ngss-col" data-on={active === s.id || undefined}>
                <button type="button" aria-pressed={active === s.id} onClick={() => setActive(a => (a === s.id ? null : s.id))}>
                  <span className="ngss-col-code">{s.code}</span>
                  <span className="ngss-col-name">{t(`luminol.learn.sections.${s.id}`)}</span>
                </button>
              </th>
            ))}
          </tr>
        </thead>
        {GROUPS.map(g => (
          <tbody key={g.id} style={{ '--dim': g.color }}>
            <tr className="ngss-group">
              <th scope="colgroup" colSpan={SECTIONS.length + 1}>{t(`luminol.learn.groups.${g.id}`)}</th>
            </tr>
            {g.rows.map(r => {
              const faded = active && !r.in.includes(active)
              return (
                <tr key={r.id} className="ngss-row" data-faded={faded || undefined}>
                  <th scope="row">
                    <span className="ngss-code">{t(`luminol.learn.rows.${r.id}.code`)}</span>
                    <span className="ngss-name">{t(`luminol.learn.rows.${r.id}.name`)}</span>
                    <span className="ngss-what">{t(`luminol.learn.rows.${r.id}.what`)}</span>
                  </th>
                  {SECTIONS.map(s => {
                    const on = r.in.includes(s.id)
                    return (
                      <td key={s.id} data-col-on={active === s.id || undefined}>
                        <span className="ngss-well" data-lit={on || undefined} aria-hidden />
                        <span className="ngss-well-label" aria-hidden>{s.code}</span>
                        <span className="sr-only">{on ? `${s.code}: ${t('luminol.learn.yes')}` : ''}</span>
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        ))}
      </table>
      <p className="ngss-note">{t('luminol.learn.ngssNote')}</p>
    </div>
  )
}
