import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import PageTransition from '../components/PageTransition'
import Reveal from '../components/luminol/Reveal'
import KitBox from '../components/luminol/KitBox'
import Vial from '../components/luminol/Vial'
import { DILUTIONS, GLOW } from '../components/luminol/glow'
import CopyEmail from '../components/luminol/CopyEmail'
import DilutionLabel from '../components/luminol/DilutionLabel'
import { useLanguage } from '../i18n/useLanguage'
import '../components/luminol/luminol.css'

const IMG = '/kits/luminol'

const INSIDE_ITEMS = ['reagents', 'vials', 'beakers', 'pipette', 'gloves', 'sleeve', 'manual', 'teacher', 'assessment']
const STEPS = ['s1', 's2', 's3', 's4', 's5']
const MANUAL_PAGES = [
  { key: 'cover',     src: `${IMG}/manual-cover.webp`,        page: 1 },
  { key: 'scene',     src: `${IMG}/manual-scene.webp`,        page: 6 },
  { key: 'equipment', src: `${IMG}/manual-equipment.webp`,    page: 13 },
  { key: 'log',       src: `${IMG}/manual-evidence-log.webp`, page: 37 },
  { key: 'cracked',   src: `${IMG}/manual-case-cracked.webp`, page: 51 },
  { key: 'makers',    src: `${IMG}/manual-makers.webp`,       page: 59 },
]
const TOPICS = ['redox', 'catalysts', 'ph', 'dilution', 'controls', 'lod', 'reasoning']
const COMPARE_ROWS = [
  { key: 'real',       us: 'yes', sim: 'no',     bare: 'yes' },
  { key: 'story',      us: 'yes', sim: 'varies', bare: 'no'  },
  { key: 'curriculum', us: 'yes', sim: 'varies', bare: 'no'  },
  { key: 'noprep',     us: 'yes', sim: 'no',     bare: 'no'  },
]
const PROGRESS = [
  { key: 'manual',    status: 'done' },
  { key: 'teacher',   status: 'done' },
  { key: 'prototype', status: 'done' },
  { key: 'safety',    status: 'next' },
  { key: 'first500',  status: 'funding' },
  { key: 'pilot',     status: 'planned' },
]
const TIERS = [
  { key: 'bronze',   price: '$1,000',  kits: '100+',   color: '#c98b5a' },
  { key: 'silver',   price: '$2,500',  kits: '250+',   color: '#b9c6cc' },
  { key: 'gold',     price: '$5,000',  kits: '500+',   color: '#e5c06a' },
  { key: 'platinum', price: '$10,000', kits: '1,000+', color: '#dfe9ee' },
]

const wrap = { maxWidth: 1120, margin: '0 auto', padding: '0 clamp(16px, 4vw, 32px)' }
const section = { padding: 'clamp(72px, 11vw, 128px) 0' }
const h2 = { fontSize: 'clamp(36px, 6.4vw, 64px)', margin: '12px 0 0' }

function SectionHead({ eyebrow, title, sub, center }) {
  return (
    <Reveal style={{ marginBottom: 'clamp(28px, 5vw, 48px)', textAlign: center ? 'center' : 'left' }}>
      <div className="lum-eyebrow">{eyebrow}</div>
      <h2 style={h2}>{title}</h2>
      {sub && <p style={{ color: 'var(--lum-muted)', marginTop: 12, fontSize: 16 }}>{sub}</p>}
    </Reveal>
  )
}

/* ── 1. Hero ─────────────────────────────────────────────────────────── */
function Hero() {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  // Plain mount effect (not useInView) — see CLAUDE.md's Kits-page invisible-content incident.
  useEffect(() => { const id = setTimeout(() => setOpen(true), 700); return () => clearTimeout(id) }, [])
  const go = id => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <section style={{
      position: 'relative', minHeight: '100svh', display: 'flex', alignItems: 'center',
      padding: '120px 0 64px',
      background: 'radial-gradient(ellipse 70% 55% at 72% 55%, rgba(70,227,211,0.12) 0%, rgba(4,19,21,0) 70%), var(--lum-bg)',
    }}>
      <div className="lk-hero" style={{ ...wrap, width: '100%', display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 48, alignItems: 'center' }}>
        <div>
          <div className="lum-eyebrow">{t('luminol.hero.eyebrow')}</div>
          <h1 style={{ fontSize: 'clamp(46px, 8.4vw, 92px)', margin: '16px 0 20px' }}>
            {t('luminol.hero.title')}
          </h1>
          <p style={{ fontSize: 'clamp(16px, 2vw, 19px)', lineHeight: 1.6, color: 'var(--lum-muted)', maxWidth: 540 }}>
            {t('luminol.hero.subtitle')}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 32 }}>
            <button type="button" className="lum-btn lum-btn--ghost" onClick={() => go('inside')}>{t('luminol.hero.seeInside')} ↓</button>
            <button type="button" className="lum-btn lum-btn--primary" onClick={() => go('sponsor')}>{t('luminol.hero.sponsor')}</button>
          </div>
          <Link to="/demo" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 20,
            fontFamily: 'var(--lum-mono)', fontSize: 12, letterSpacing: 2, textTransform: 'uppercase',
            color: 'var(--lum-glow)', textDecoration: 'none', borderBottom: '1px solid rgba(70,227,211,0.4)', paddingBottom: 3,
          }}>▶ {t('luminol.hero.tryDemo')}</Link>
          <p style={{
            marginTop: 28, display: 'flex', gap: 10, alignItems: 'flex-start',
            fontSize: 13, lineHeight: 1.5, color: 'var(--lum-paper)', maxWidth: 480,
          }}>
            <span aria-hidden style={{ width: 8, height: 8, borderRadius: '50%', background: '#f0c070', marginTop: 5, flexShrink: 0, boxShadow: '0 0 10px rgba(240,192,112,0.7)' }} />
            {t('luminol.hero.status')}
          </p>
        </div>
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', minWidth: 0 }}>
          <KitBox open={open} width={400} label={t('luminol.hero.boxAlt')} />
          <span className="lum-tag" style={{ position: 'absolute', top: -8, left: 0 }}>{t('luminol.common.conceptRender')}</span>
        </div>
      </div>
    </section>
  )
}

/* ── 2. What's inside ────────────────────────────────────────────────── */
const ITEM_GLYPHS = {
  reagents: 'M9 3h6M10 3v5l-5 9a3 3 0 0 0 2.6 4.5h8.8A3 3 0 0 0 19 17l-5-9V3',
  vials: 'M5 3h4M7 3v14a2 2 0 0 0 4 0V3M13 3h4M15 3v14a2 2 0 0 0 4 0V3',
  beakers: 'M5 4h14M6 4v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4M6 12h12',
  pipette: 'M14 4l6 6M17 7l-9 9-3 1 1-3 9-9M5 19l-1 2',
  gloves: 'M7 21v-8l-2-3V6a1 1 0 0 1 2 0v4M7 10V4a1 1 0 0 1 2 0v6M9 10V3a1 1 0 0 1 2 0v7M11 10V4a1 1 0 0 1 2 0v8l2-2a1.5 1.5 0 0 1 2 2l-4 5v4',
  sleeve: 'M4 6h16v12H4zM4 10h16',
  manual: 'M4 4h7a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4zM20 4h-5a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h5z',
  teacher: 'M12 3l9 5-9 5-9-5zM7 10.5V16c0 1.5 2.2 3 5 3s5-1.5 5-3v-5.5',
  assessment: 'M9 4h6v3H9zM6 5h-1v16h14V5h-1M9 13l2 2 4-4',
}

function Glyph({ d, size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  )
}

function Inside() {
  const { t } = useLanguage()
  const [active, setActive] = useState(null)
  const [manualOpen, setManualOpen] = useState(null)

  return (
    <section id="inside" style={{ ...section, background: 'linear-gradient(180deg, var(--lum-bg) 0%, var(--lum-bg2) 100%)', scrollMarginTop: 60 }}>
      <div style={wrap}>
        <SectionHead eyebrow={t('luminol.inside.eyebrow')} title={t('luminol.inside.title')} />
        <Reveal>
          {revealed => {
            const open = manualOpen ?? revealed
            return (
              <div className="lk-inside" style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: 'clamp(28px, 5vw, 56px)', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
                  <div style={{ position: 'relative' }}>
                    <KitBox open={open} width={320} label={t('luminol.hero.boxAlt')} />
                    <span className="lum-tag" style={{ position: 'absolute', top: -8, left: 0 }}>{t('luminol.common.prototype')}</span>
                  </div>
                  <button type="button" className="lum-btn lum-btn--ghost" onClick={() => setManualOpen(!open)} aria-pressed={open}>
                    {open ? t('luminol.inside.close') : t('luminol.inside.open')}
                  </button>
                </div>

                <div>
                  <ul style={{ listStyle: 'none', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
                    {INSIDE_ITEMS.map((key, i) => (
                      <li key={key} style={{
                        opacity: open ? 1 : 0,
                        transform: open ? 'none' : 'translateY(14px) scale(.96)',
                        transition: `opacity .5s ease ${open ? 250 + i * 70 : 0}ms, transform .5s ease ${open ? 250 + i * 70 : 0}ms`,
                      }}>
                        <button
                          type="button"
                          onMouseEnter={() => setActive(key)}
                          onFocus={() => setActive(key)}
                          onClick={() => setActive(key)}
                          aria-describedby="lk-inside-detail"
                          tabIndex={open ? 0 : -1}
                          style={{
                            width: '100%', minHeight: 64, textAlign: 'left', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 8,
                            background: active === key ? 'rgba(70,227,211,0.12)' : 'var(--lum-panel)',
                            border: `1px solid ${active === key ? 'rgba(70,227,211,0.6)' : 'var(--lum-line)'}`,
                            color: 'var(--lum-text)', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, lineHeight: 1.25,
                            transition: 'background .2s, border-color .2s',
                          }}
                        >
                          <span style={{ color: 'var(--lum-glow)', flexShrink: 0 }}><Glyph d={ITEM_GLYPHS[key]} /></span>
                          {t(`luminol.inside.items.${key}.label`)}
                        </button>
                      </li>
                    ))}
                  </ul>
                  <p id="lk-inside-detail" aria-live="polite" style={{
                    marginTop: 16, minHeight: 52, padding: '14px 16px', borderRadius: 8,
                    background: 'var(--lum-paper)', color: 'var(--lum-paper-ink)', fontSize: 15, lineHeight: 1.45,
                  }}>
                    {active ? t(`luminol.inside.items.${active}.detail`) : t('luminol.inside.hint')}
                  </p>
                  <p style={{ marginTop: 10, fontSize: 12, color: 'var(--lum-muted)' }}>{t('luminol.inside.prototypeNote')}</p>
                </div>
              </div>
            )
          }}
        </Reveal>
      </div>
    </section>
  )
}

/* ── 3. How the case works + vial slider ─────────────────────────────── */
function VialSlider() {
  const { t } = useLanguage()
  const [tested, setTested] = useState(4)
  // Limit = last tested vial whose glow is still realistically visible.
  let limit = 0
  const vialName = n => DILUTIONS[n - 1]
    ? t('demo.s3.vialLabel').replace('{n}', n).replace('{d}', DILUTIONS[n - 1])
    : t('demo.s3.vialBlank')
  for (let i = 0; i < tested; i++) if (GLOW[i] >= 0.1) limit = i + 1

  return (
    <div style={{ marginTop: 40, padding: 'clamp(18px, 4vw, 32px)', borderRadius: 14, background: '#020b0c', border: '1px solid var(--lum-line)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
        <h3 style={{ fontSize: 'clamp(22px, 3.4vw, 30px)' }}>{t('luminol.how.sim.title')}</h3>
        <span style={{ fontFamily: 'var(--lum-mono)', fontSize: 12, color: 'var(--lum-glow)', alignSelf: 'center' }} aria-live="polite">
          {`${vialName(tested)} · ${t(`luminol.how.sim.levels.${tested - 1}`)}`}
        </span>
      </div>

      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', justifyItems: 'center', padding: '12px 0 8px' }}>
        {GLOW.map((g, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, position: 'relative', width: '100%' }}>
            <div style={{ width: 'clamp(30px, 8vw, 56px)' }}>
              <Vial
                n={i + 1} glow={g} lit={i < tested} width="100%"
                selected={i === tested - 1}
                label={vialName(i + 1)}
              />
            </div>
            <span style={{ fontFamily: 'var(--lum-mono)', fontSize: 'clamp(8px, 2vw, 11px)', color: 'var(--lum-muted)', whiteSpace: 'nowrap' }}>
              <DilutionLabel i={i} blank="H₂O" />
            </span>
            {limit === i + 1 && (
              <div aria-hidden className="lum-pulse" style={{
                position: 'absolute', top: -6, bottom: -6, right: 0, borderRight: '2px dashed var(--lum-glow)',
              }}>
                <span style={{
                  position: 'absolute', top: -18, right: -6, transform: 'translateX(50%)', whiteSpace: 'nowrap',
                  fontFamily: 'var(--lum-mono)', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--lum-glow)',
                }}>{t('luminol.how.sim.limit')}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <label style={{ display: 'block', marginTop: 22 }}>
        <span className="lum-sr">{t('luminol.how.sim.slider')}</span>
        <input
          type="range" min={1} max={6} step={1} value={tested}
          onChange={e => setTested(Number(e.target.value))}
          aria-valuetext={`${vialName(tested)}, ${t(`luminol.how.sim.levels.${tested - 1}`)}`}
          style={{ width: '100%', accentColor: '#46e3d3', height: 28, cursor: 'pointer' }}
        />
      </label>
      <p style={{ marginTop: 8, fontSize: 12, color: 'var(--lum-muted)' }}>{t('luminol.how.sim.caption')}</p>
    </div>
  )
}

function HowItWorks() {
  const { t } = useLanguage()
  return (
    <section style={{ ...section, background: 'var(--lum-bg2)' }}>
      <div style={wrap}>
        <SectionHead eyebrow={t('luminol.how.eyebrow')} title={t('luminol.how.title')} />
        <ol className="lk-steps" style={{ listStyle: 'none', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, counterReset: 'step' }}>
          {STEPS.map((s, i) => (
            <Reveal as="li" key={s} delay={i * 110} style={{
              padding: '20px 18px', borderRadius: 10, background: 'var(--lum-panel)', border: '1px solid var(--lum-line)',
            }}>
              <div style={{ fontFamily: 'var(--lum-display)', fontWeight: 700, fontSize: 40, lineHeight: 1, color: 'var(--lum-glow)', textShadow: '0 0 18px rgba(70,227,211,0.5)' }}>
                {String(i + 1).padStart(2, '0')}
              </div>
              <h3 style={{ fontSize: 22, margin: '10px 0 6px' }}>{t(`luminol.how.steps.${s}.title`)}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--lum-muted)' }}>{t(`luminol.how.steps.${s}.text`)}</p>
            </Reveal>
          ))}
        </ol>
        <Reveal><VialSlider /></Reveal>
      </div>
    </section>
  )
}

/* ── 4. Manual preview ───────────────────────────────────────────────── */
function ManualPeek() {
  const { t } = useLanguage()
  const track = useRef(null)
  const [zoom, setZoom] = useState(null)

  useEffect(() => {
    if (zoom == null) return
    const onKey = e => {
      if (e.key === 'Escape') setZoom(null)
      if (e.key === 'ArrowRight') setZoom(z => Math.min(MANUAL_PAGES.length - 1, z + 1))
      if (e.key === 'ArrowLeft') setZoom(z => Math.max(0, z - 1))
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [zoom])

  const scroll = dir => {
    const el = track.current
    if (el) el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.8, 600), behavior: 'smooth' })
  }

  return (
    <section style={{ ...section, background: 'var(--lum-bg)' }}>
      <div style={wrap}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <SectionHead eyebrow={t('luminol.manual.eyebrow')} title={t('luminol.manual.title')} sub={t('luminol.manual.sub')} />
          <div style={{ display: 'flex', gap: 8, marginBottom: 'clamp(28px, 5vw, 48px)' }}>
            <button type="button" className="lum-btn lum-btn--ghost" onClick={() => scroll(-1)} aria-label={t('luminol.common.prev')} style={{ padding: '12px 18px' }}>←</button>
            <button type="button" className="lum-btn lum-btn--ghost" onClick={() => scroll(1)} aria-label={t('luminol.common.next')} style={{ padding: '12px 18px' }}>→</button>
          </div>
        </div>
      </div>
      <div
        ref={track}
        className="lk-track"
        style={{
          display: 'flex', gap: 'clamp(14px, 3vw, 24px)', overflowX: 'auto', scrollSnapType: 'x mandatory',
          padding: '8px max(16px, calc((100vw - 1120px) / 2 + 32px)) 24px',
          scrollPaddingLeft: 'max(16px, calc((100vw - 1120px) / 2 + 32px))',
        }}
      >
        {MANUAL_PAGES.map((p, i) => (
          <figure key={p.key} style={{ flex: '0 0 auto', width: 'clamp(220px, 62vw, 290px)', scrollSnapAlign: 'start', margin: 0 }}>
            <button
              type="button"
              onClick={() => setZoom(i)}
              style={{ display: 'block', width: '100%', padding: 0, border: 'none', background: 'none', cursor: 'zoom-in', borderRadius: 6 }}
            >
              <img
                src={p.src} alt={t(`luminol.manual.pages.${p.key}.alt`)} loading="lazy" width={825} height={1275}
                style={{
                  width: '100%', height: 'auto', display: 'block', borderRadius: 6,
                  boxShadow: '0 20px 50px rgba(0,0,0,0.55), 0 0 0 1px rgba(232,216,176,0.25)',
                  transform: `rotate(${i % 2 ? 0.8 : -0.8}deg)`,
                }}
              />
            </button>
            <figcaption style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--lum-mono)', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase' }}>
              <span style={{ color: 'var(--lum-text)' }}>{t(`luminol.manual.pages.${p.key}.caption`)}</span>
              <span style={{ color: 'var(--lum-muted)' }}>p. {p.page} / 60</span>
            </figcaption>
          </figure>
        ))}
      </div>

      {zoom != null && (
        <div
          role="dialog" aria-modal="true" aria-label={t(`luminol.manual.pages.${MANUAL_PAGES[zoom].key}.caption`)}
          onClick={() => setZoom(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(1,8,9,0.92)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, cursor: 'zoom-out',
          }}
        >
          <img
            src={MANUAL_PAGES[zoom].src} alt={t(`luminol.manual.pages.${MANUAL_PAGES[zoom].key}.alt`)}
            style={{ maxHeight: '92vh', maxWidth: '100%', borderRadius: 6, boxShadow: '0 30px 80px rgba(0,0,0,0.7)' }}
          />
          <button type="button" className="lum-btn lum-btn--ghost" autoFocus onClick={() => setZoom(null)}
            style={{ position: 'absolute', top: 16, right: 16, padding: '10px 16px', background: 'rgba(4,19,21,0.8)' }}>✕</button>
        </div>
      )}
    </section>
  )
}

/* ── 5. What students learn ──────────────────────────────────────────── */
const TOPIC_ICONS = {
  redox: <><circle cx="7" cy="12" r="3.5" /><circle cx="17" cy="12" r="3.5" /><path d="M10.5 9.5c1-1.2 2-1.2 3 0M13 8.5l.5 1-1 .3" /></>,
  catalysts: <path d="M13 2L5 13h6l-1 9 8-11h-6z" />,
  ph: <><rect x="3" y="5" width="18" height="14" rx="3" /><text x="12" y="15.5" textAnchor="middle" fontSize="8" fontFamily="JetBrains Mono" fill="currentColor" stroke="none">pH</text></>,
  dilution: <><path d="M5 4c-2 3-2 5 0 6 2-1 2-3 0-6z" /><path d="M12 9c-1.5 2.2-1.5 3.7 0 4.5 1.5-.8 1.5-2.3 0-4.5z" opacity=".75" /><path d="M19 14c-1 1.5-1 2.5 0 3 1-.5 1-1.5 0-3z" opacity=".5" /><path d="M3 21h18" /></>,
  controls: <><path d="M6 3v13a2 2 0 0 0 4 0V3M14 3v13a2 2 0 0 0 4 0V3M5 3h6M13 3h6" /><path d="M7 11h2" /></>,
  lod: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" /><circle cx="12" cy="12" r="2.5" /><path d="M2 21h20" strokeDasharray="2 2" /></>,
  reasoning: <><circle cx="10.5" cy="10.5" r="6" /><path d="M15 15l6 6M8 10.5l2 2 3-4" /></>,
}

function Learn() {
  const { t } = useLanguage()
  return (
    <section style={{ ...section, background: 'var(--lum-bg2)' }}>
      <div style={wrap}>
        <SectionHead eyebrow={t('luminol.learn.eyebrow')} title={t('luminol.learn.title')} />
        <ul style={{ listStyle: 'none', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12 }}>
          {TOPICS.map((k, i) => (
            <Reveal as="li" key={k} delay={i * 60} style={{
              padding: '22px 16px', borderRadius: 10, background: 'var(--lum-panel)', border: '1px solid var(--lum-line)',
              display: 'flex', flexDirection: 'column', gap: 14,
            }}>
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#46e3d3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden
                style={{ filter: 'drop-shadow(0 0 6px rgba(70,227,211,0.55))' }}>
                {TOPIC_ICONS[k]}
              </svg>
              <span style={{ fontWeight: 600, fontSize: 15, lineHeight: 1.3 }}>{t(`luminol.learn.topics.${k}`)}</span>
            </Reveal>
          ))}
        </ul>
        <Reveal style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span className="lum-tag lum-tag--paper" style={{ alignSelf: 'flex-start', fontSize: 11, letterSpacing: 1.2, textTransform: 'none' }}>{t('luminol.learn.grade')}</span>
          <p style={{ fontSize: 16, color: 'var(--lum-muted)' }}>{t('luminol.learn.careers')}</p>
        </Reveal>
      </div>
    </section>
  )
}

/* ── 6. Honest comparison ────────────────────────────────────────────── */
function Mark({ v }) {
  const { t } = useLanguage()
  if (v === 'yes') return <span style={{ color: 'var(--lum-glow)', fontSize: 20, fontWeight: 700 }} aria-label={t('luminol.compare.yes')}>✓</span>
  if (v === 'no') return <span style={{ color: 'rgba(214,238,233,0.35)', fontSize: 20 }} aria-label={t('luminol.compare.no')}>—</span>
  return <span style={{ color: 'var(--lum-muted)', fontSize: 12, fontFamily: 'var(--lum-mono)' }}>{t('luminol.compare.varies')}</span>
}

function Compare() {
  const { t } = useLanguage()
  const cols = ['us', 'sim', 'bare']
  return (
    <section style={{ ...section, background: 'var(--lum-bg)' }}>
      <div style={wrap}>
        <SectionHead eyebrow={t('luminol.compare.eyebrow')} title={t('luminol.compare.title')} />
        <Reveal>
          <table className="lk-compare" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 15 }}>
            <thead>
              <tr>
                <th scope="col"><span className="lum-sr">—</span></th>
                {cols.map(c => (
                  <th key={c} scope="col" style={{
                    padding: '14px 10px', fontFamily: 'var(--lum-mono)', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 400,
                    color: c === 'us' ? '#02201d' : 'var(--lum-muted)',
                    background: c === 'us' ? 'var(--lum-glow)' : 'transparent',
                    borderRadius: c === 'us' ? '8px 8px 0 0' : 0,
                  }}>{t(`luminol.compare.cols.${c}`)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map(r => (
                <tr key={r.key}>
                  <th scope="row" style={{ textAlign: 'left', padding: '16px 10px', fontWeight: 500, borderTop: '1px solid var(--lum-line)' }}>
                    {t(`luminol.compare.rows.${r.key}`)}
                  </th>
                  {cols.map(c => (
                    <td key={c} style={{
                      textAlign: 'center', padding: '16px 10px', borderTop: '1px solid var(--lum-line)',
                      background: c === 'us' ? 'rgba(70,227,211,0.07)' : 'transparent',
                    }}><Mark v={r[c]} /></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ marginTop: 14, fontSize: 12, color: 'var(--lum-muted)' }}>{t('luminol.compare.note')}</p>
        </Reveal>
      </div>
    </section>
  )
}

/* ── 7. Where we are (progress tracker) ──────────────────────────────── */
const STATUS_STYLE = {
  done:    { dot: '#46e3d3', text: '#46e3d3', glyph: '✓' },
  next:    { dot: '#f0c070', text: '#f0c070', glyph: '→' },
  funding: { dot: 'transparent', text: 'var(--lum-paper)', glyph: '$' },
  planned: { dot: 'transparent', text: 'var(--lum-muted)', glyph: '·' },
}

function Progress() {
  const { t } = useLanguage()
  return (
    <section style={{ ...section, background: 'var(--lum-bg2)' }}>
      <div style={wrap}>
        <SectionHead eyebrow={t('luminol.progress.eyebrow')} title={t('luminol.progress.title')} />
        <ol className="lk-progress" style={{ listStyle: 'none', display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', position: 'relative' }}>
          {PROGRESS.map((p, i) => {
            const st = STATUS_STYLE[p.status]
            const done = p.status === 'done'
            return (
              <Reveal as="li" key={p.key} delay={i * 90} className="lk-progress-item" style={{ position: 'relative', padding: '0 8px', textAlign: 'center' }}>
                {i < PROGRESS.length - 1 && (
                  <span aria-hidden className="lk-progress-line" data-done={done} style={{
                    position: 'absolute', top: 19, left: 'calc(50% + 22px)', right: 'calc(-50% + 22px)', height: 2,
                    background: done ? 'var(--lum-glow)' : 'transparent',
                    borderTop: done ? 'none' : '2px dashed rgba(214,238,233,0.25)',
                  }} />
                )}
                <span className="lk-progress-dot" style={{
                  width: 40, height: 40, borderRadius: '50%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: st.dot, color: done ? '#02201d' : st.text, fontWeight: 700,
                  border: done ? 'none' : `2px ${p.status === 'next' ? 'solid' : 'dashed'} ${st.text}`,
                  boxShadow: done ? '0 0 18px rgba(70,227,211,0.5)' : 'none',
                }} aria-hidden>{st.glyph}</span>
                <div className="lk-progress-text">
                  <div style={{ marginTop: 14, fontWeight: 600, fontSize: 15 }}>{t(`luminol.progress.steps.${p.key}`)}</div>
                  <div style={{ marginTop: 4, fontFamily: 'var(--lum-mono)', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: st.text }}>
                    {t(`luminol.progress.status.${p.status}`)}
                  </div>
                </div>
              </Reveal>
            )
          })}
        </ol>
      </div>
    </section>
  )
}

/* ── 8. Built safely ─────────────────────────────────────────────────── */
function Safety() {
  const { t } = useLanguage()
  const items = ['premeasured', 'rules', 'waste']
  return (
    <section style={{ ...section, background: 'var(--lum-bg)' }}>
      <div style={{ ...wrap, maxWidth: 820 }}>
        <SectionHead eyebrow={t('luminol.safety.eyebrow')} title={t('luminol.safety.title')} />
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map((k, i) => (
            <Reveal as="li" key={k} delay={i * 80} style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '16px 18px', borderRadius: 10, background: 'var(--lum-panel)', border: '1px solid var(--lum-line)' }}>
              <span aria-hidden style={{ color: 'var(--lum-glow)', fontSize: 20, fontWeight: 700 }}>✓</span>
              <span style={{ fontSize: 16 }}>{t(`luminol.safety.items.${k}`)}</span>
            </Reveal>
          ))}
          <Reveal as="li" delay={240} style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap', padding: '16px 18px', borderRadius: 10, border: '1px dashed rgba(240,192,112,0.5)' }}>
            <span aria-hidden style={{ color: '#f0c070', fontSize: 18 }}>◔</span>
            <span style={{ fontSize: 16, flex: 1 }}>{t('luminol.safety.items.testing')}</span>
            <span className="lum-tag" style={{ color: '#f0c070', borderColor: 'rgba(240,192,112,0.6)' }}>{t('luminol.safety.inProgress')}</span>
          </Reveal>
        </ul>
      </div>
    </section>
  )
}

/* ── 9. Who we are + plans ───────────────────────────────────────────── */
function Team() {
  const { t } = useLanguage()
  const people = [
    { name: 'Jeongseop Yoon', role: t('luminol.team.jeongseop'), img: `${IMG}/avatar-jeongseop.webp`, bg: '#f4ead6' },
    { name: 'Cristobal Sanchez', role: t('luminol.team.cristobal'), img: `${IMG}/avatar-cristobal.webp`, bg: '#e2f0f3' },
  ]
  return (
    <section style={{ ...section, background: 'var(--lum-bg2)' }}>
      <div style={wrap}>
        <div className="lk-team" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(32px, 6vw, 72px)', alignItems: 'center' }}>
          <div>
            <SectionHead eyebrow={t('luminol.team.eyebrow')} title={t('luminol.team.title')} />
            <Reveal>
              <p style={{ fontSize: 16, color: 'var(--lum-muted)' }}>{t('luminol.team.origin')}</p>
              <blockquote style={{
                marginTop: 24, paddingLeft: 18, borderLeft: '3px solid var(--lum-glow)',
                fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 'clamp(22px, 3vw, 30px)', lineHeight: 1.3,
              }}>
                “{t('luminol.team.mission')}”
              </blockquote>
            </Reveal>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {people.map((p, i) => (
              <Reveal key={p.name} delay={i * 120} style={{ borderRadius: 10, overflow: 'hidden', background: 'var(--lum-paper)', color: 'var(--lum-paper-ink)' }}>
                <img src={p.img} alt={t('luminol.team.avatarAlt').replace('{name}', p.name)} loading="lazy" width={685} height={676}
                  style={{ width: '100%', height: 'auto', display: 'block', background: p.bg }} />
                <div style={{ padding: '12px 14px 14px' }}>
                  <div style={{ fontFamily: 'var(--lum-display)', fontWeight: 700, fontSize: 20, textTransform: 'uppercase', lineHeight: 1.05 }}>{p.name}</div>
                  <div style={{ fontFamily: 'var(--lum-mono)', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', marginTop: 6, color: '#0f6f68' }}>{p.role}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function Plans() {
  const { t } = useLanguage()
  return (
    <section style={{ ...section, paddingTop: 0, background: 'var(--lum-bg2)' }}>
      <div style={wrap}>
        <SectionHead eyebrow={t('luminol.plans.eyebrow')} title={t('luminol.plans.title')} />
        <ul style={{ listStyle: 'none', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
          {['kits', 'pilot'].map((k, i) => (
            <Reveal as="li" key={k} delay={i * 100} style={{ padding: '22px 20px', borderRadius: 10, border: '1px dashed rgba(70,227,211,0.4)', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span className="lum-tag" style={{ alignSelf: 'flex-start' }}>{t('luminol.common.plan')}</span>
              <span style={{ fontSize: 19, fontWeight: 600, lineHeight: 1.35 }}>{t(`luminol.plans.items.${k}`)}</span>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ── 10. Sponsor ─────────────────────────────────────────────────────── */
function Sponsor() {
  const { t } = useLanguage()
  return (
    <section id="sponsor" style={{
      ...section, scrollMarginTop: 40,
      background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(70,227,211,0.14) 0%, rgba(4,19,21,0) 70%), var(--lum-bg)',
    }}>
      <div style={wrap}>
        <SectionHead eyebrow={t('luminol.sponsor.eyebrow')} title={t('luminol.sponsor.title')} sub={t('luminol.sponsor.sub')} center />

        {/* What your sponsorship builds */}
        <Reveal>
          <h3 style={{ fontSize: 22, textAlign: 'center', marginBottom: 16, color: 'var(--lum-muted)' }}>{t('luminol.sponsor.builds.title')}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
            <div style={{ padding: '26px 24px', borderRadius: 12, background: 'var(--lum-panel)', border: '1px solid var(--lum-line)', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--lum-display)', fontWeight: 700, fontSize: 64, lineHeight: 1, color: 'var(--lum-glow)', textShadow: '0 0 24px rgba(70,227,211,0.45)' }}>$15</div>
              <div style={{ marginTop: 8, fontSize: 16 }}>= {t('luminol.sponsor.builds.student')}</div>
            </div>
            <div style={{ padding: '26px 24px', borderRadius: 12, background: 'var(--lum-paper)', color: 'var(--lum-paper-ink)', textAlign: 'center', position: 'relative' }}>
              <span style={{ position: 'absolute', top: 12, right: 12, fontFamily: 'var(--lum-mono)', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase' }}>{t('luminol.sponsor.classCallout.title')}</span>
              <div style={{ fontFamily: 'var(--lum-display)', fontWeight: 700, fontSize: 64, lineHeight: 1 }}>$450</div>
              <div style={{ marginTop: 8, fontSize: 16 }}>= {t('luminol.sponsor.builds.class')}</div>
            </div>
          </div>
        </Reveal>

        {/* Founding sponsor callout */}
        <Reveal style={{
          marginTop: 22, padding: 'clamp(20px, 4vw, 28px)', borderRadius: 12,
          border: '1px solid rgba(240,192,112,0.55)', background: 'linear-gradient(120deg, rgba(240,192,112,0.12), rgba(240,192,112,0.02))',
          display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap',
        }}>
          <span style={{
            fontFamily: 'var(--lum-mono)', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: '#1d1405',
            background: '#f0c070', padding: '6px 10px', borderRadius: 4, fontWeight: 700,
          }}>★ {t('luminol.sponsor.founding.badge')}</span>
          <div style={{ flex: '1 1 260px' }}>
            <div style={{ fontFamily: 'var(--lum-display)', fontWeight: 700, fontSize: 26, textTransform: 'uppercase' }}>{t('luminol.sponsor.founding.title')}</div>
            <div style={{ color: 'var(--lum-muted)', marginTop: 4 }}>{t('luminol.sponsor.founding.text')}</div>
          </div>
        </Reveal>

        {/* Tiers */}
        <h3 style={{ fontSize: 28, margin: '56px 0 18px' }}>{t('luminol.sponsor.tiersTitle')}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 14 }}>
          {TIERS.map((tier, i) => (
            <Reveal key={tier.key} delay={i * 80} style={{
              padding: '22px 20px', borderRadius: 12, background: 'var(--lum-panel)',
              border: '1px solid var(--lum-line)', borderTop: `3px solid ${tier.color}`,
              display: 'flex', flexDirection: 'column', gap: 12,
            }}>
              <div style={{ fontFamily: 'var(--lum-mono)', fontSize: 11, letterSpacing: 2.5, textTransform: 'uppercase', color: tier.color }}>{t(`luminol.sponsor.tiers.${tier.key}.name`)}</div>
              <div style={{ fontFamily: 'var(--lum-display)', fontWeight: 700, fontSize: 44, lineHeight: 1 }}>{tier.price}</div>
              <div style={{ fontSize: 14, color: 'var(--lum-glow)' }}><strong style={{ fontSize: 18 }}>{tier.kits}</strong> {t('luminol.sponsor.kitsFunded')}</div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14, color: 'var(--lum-muted)', lineHeight: 1.4 }}>
                {['p1', 'p2', 'p3'].map(p => (
                  <li key={p} style={{ display: 'flex', gap: 8 }}><span aria-hidden style={{ color: 'var(--lum-glow)' }}>▪</span>{t(`luminol.sponsor.tiers.${tier.key}.${p}`)}</li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
        <Reveal style={{
          marginTop: 14, padding: '20px 22px', borderRadius: 12, border: '1px dashed rgba(70,227,211,0.4)',
          display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap',
        }}>
          <div style={{ flex: '1 1 300px' }}>
            <div style={{ fontWeight: 700, fontSize: 17 }}>{t('luminol.sponsor.custom.title')}</div>
            <div style={{ color: 'var(--lum-muted)', fontSize: 14, marginTop: 4 }}>{t('luminol.sponsor.custom.text')}</div>
          </div>
          <span style={{ fontFamily: 'var(--lum-mono)', fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--lum-glow)' }}>{t('luminol.sponsor.custom.price')}</span>
        </Reveal>
        <p style={{ marginTop: 10, fontSize: 12, color: 'var(--lum-muted)' }}>{t('luminol.sponsor.estimates')}</p>

        {/* Every sponsor gets + contact */}
        <div className="lk-sponsor-foot" style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 20, marginTop: 48 }}>
          <Reveal style={{ padding: '24px 22px', borderRadius: 12, background: 'var(--lum-paper)', color: 'var(--lum-paper-ink)' }}>
            <div style={{ fontFamily: 'var(--lum-display)', fontWeight: 700, fontSize: 24, textTransform: 'uppercase' }}>{t('luminol.sponsor.every.title')}</div>
            <ul style={{ listStyle: 'none', marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 15 }}>
              {['logo', 'website', 'social', 'report'].map(k => (
                <li key={k} style={{ display: 'flex', gap: 10 }}><span aria-hidden style={{ color: '#0f6f68', fontWeight: 700 }}>✓</span>{t(`luminol.sponsor.every.${k}`)}</li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={100} style={{ padding: '24px 22px', borderRadius: 12, background: 'var(--lum-panel)', border: '1px solid rgba(70,227,211,0.35)', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontFamily: 'var(--lum-display)', fontWeight: 700, fontSize: 30, textTransform: 'uppercase' }}>{t('luminol.sponsor.contactTitle')}</div>
            <CopyEmail />
            <p style={{ fontSize: 13, color: 'var(--lum-muted)', lineHeight: 1.5 }}>{t('luminol.sponsor.ckf')}</p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

export default function LuminolKit() {
  const { hash } = useLocation()

  // ScrollToTop fires its hash scroll before this page has mounted (the route transition is
  // AnimatePresence mode="wait"), so arrivals at /kits/luminol#sponsor need a second try here.
  useEffect(() => {
    if (!hash) return
    const id = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 350)
    return () => clearTimeout(id)
  }, [hash])

  return (
    <PageTransition>
      <main className="lum">
        <Hero />
        <Inside />
        <HowItWorks />
        <ManualPeek />
        <Learn />
        <Compare />
        <Progress />
        <Safety />
        <Team />
        <Plans />
        <Sponsor />
      </main>
      <style>{`
        .lk-track { scrollbar-width: none; }
        .lk-hero > * { min-width: 0; }
        @media (max-width: 900px) {
          .lk-hero { grid-template-columns: 1fr !important; gap: 40px !important; }
          .lk-inside, .lk-team, .lk-sponsor-foot { grid-template-columns: 1fr !important; }
          .lk-steps { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 720px) {
          .lk-progress { grid-template-columns: 1fr !important; gap: 0; }
          .lk-progress-item { display: flex !important; align-items: center; gap: 16px; text-align: left !important; padding: 0 0 22px !important; }
          .lk-progress-item .lk-progress-dot { margin: 0 !important; flex-shrink: 0; }
          .lk-progress-item .lk-progress-text > div:first-child { margin-top: 0 !important; }
          .lk-progress-line { top: 44px !important; bottom: 2px; left: 19px !important; right: auto !important; width: 2px; height: auto !important;
            border-top: none !important; border-left: 2px dashed rgba(214,238,233,0.25); }
          .lk-progress-line[data-done="true"] { border-left: none; }
        }
        @media (max-width: 560px) {
          .lk-steps { grid-template-columns: 1fr !important; }
          .lk-compare th, .lk-compare td { padding-left: 4px !important; padding-right: 4px !important; }
          .lk-compare thead th { font-size: 9px !important; letter-spacing: 0.5px !important; }
          .lk-compare tbody th { font-size: 13px; }
        }
      `}</style>
    </PageTransition>
  )
}
