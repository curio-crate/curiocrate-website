import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import PageTransition from '../components/PageTransition'
import Vial from '../components/luminol/Vial'
import { DILUTIONS, GLOW, GLOW_RUSHED, LIMIT_DENOMS } from '../components/luminol/glow'
import CopyEmail from '../components/luminol/CopyEmail'
import DilutionLabel from '../components/luminol/DilutionLabel'
import { useLanguage } from '../i18n/useLanguage'
import '../components/luminol/luminol.css'

/*
 * /demo — a ~3 minute playable teaser of the Luminol kit (Case LMN-2026).
 * Simulation of OBSERVING results only: no amounts, no mixing steps, no real procedure.
 * No spoilers: never shows suspect names, alibis, timeline or the culprit — only three
 * anonymous silhouettes. No accounts, no storage, no data collected; reload resets it.
 */

const SCENES = 5
const COUNTDOWN = 8
const fill = (s, map) => Object.entries(map).reduce((acc, [k, v]) => acc.replace(`{${k}}`, v), s)

/* ── Tiny synthesized sound (off by default) ─────────────────────────── */
function useSound(enabled) {
  const ctxRef = useRef(null)
  const humRef = useRef(null)
  const ctx = useCallback(() => {
    if (!enabled) return null
    if (!ctxRef.current) {
      const AC = window.AudioContext || window.webkitAudioContext
      if (!AC) return null
      ctxRef.current = new AC()
    }
    return ctxRef.current
  }, [enabled])

  const drip = useCallback(() => {
    const c = ctx(); if (!c) return
    const o = c.createOscillator(), g = c.createGain()
    o.type = 'sine'
    o.frequency.setValueAtTime(1100, c.currentTime)
    o.frequency.exponentialRampToValueAtTime(260, c.currentTime + 0.16)
    g.gain.setValueAtTime(0.0001, c.currentTime)
    g.gain.exponentialRampToValueAtTime(0.25, c.currentTime + 0.01)
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.22)
    o.connect(g).connect(c.destination); o.start(); o.stop(c.currentTime + 0.25)
  }, [ctx])

  const stopHum = useCallback(() => {
    const h = humRef.current; if (!h) return
    try { h.g.gain.exponentialRampToValueAtTime(0.0001, h.c.currentTime + 0.4); h.o.stop(h.c.currentTime + 0.45) } catch { /* already stopped */ }
    humRef.current = null
  }, [])

  const startHum = useCallback(() => {
    const c = ctx(); if (!c || humRef.current) return
    const o = c.createOscillator(), g = c.createGain()
    o.type = 'triangle'; o.frequency.value = 58
    g.gain.setValueAtTime(0.0001, c.currentTime)
    g.gain.exponentialRampToValueAtTime(0.05, c.currentTime + 0.6)
    o.connect(g).connect(c.destination); o.start()
    humRef.current = { o, g, c }
  }, [ctx])

  useEffect(() => { if (!enabled) stopHum() }, [enabled, stopHum])
  useEffect(() => () => { stopHum(); ctxRef.current?.close?.() }, [stopHum])
  return { drip, startHum, stopHum }
}

/* ── Scene 0 art: Gallery 3 at night ─────────────────────────────────── */
function GalleryScene({ label }) {
  return (
    <svg viewBox="0 0 800 420" role="img" aria-label={label} style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 12 }}>
      <defs>
        <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#06181b" /><stop offset="1" stopColor="#0b2427" />
        </linearGradient>
        <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0d2a2d" /><stop offset="1" stopColor="#041012" />
        </linearGradient>
        <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#bff" stopOpacity="0" />
          <stop offset=".5" stopColor="#bff" stopOpacity=".22" />
          <stop offset="1" stopColor="#bff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="beam" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#fff9e0" stopOpacity=".55" />
          <stop offset=".55" stopColor="#fff2c0" stopOpacity=".12" />
          <stop offset="1" stopColor="#fff2c0" stopOpacity="0" />
        </radialGradient>
        <clipPath id="floorClip"><polygon points="0,280 800,280 800,420 0,420" /></clipPath>
      </defs>

      <rect width="800" height="280" fill="url(#wall)" />
      <polygon points="0,280 800,280 800,420 0,420" fill="url(#floor)" />
      {/* floor tiles */}
      <g stroke="rgba(150,220,215,0.08)" strokeWidth="1">
        {[300, 325, 355, 390].map(y => <line key={y} x1="0" y1={y} x2="800" y2={y} />)}
        {[-200, -60, 80, 220, 360, 500, 640, 780, 920].map(x => <line key={x} x1={400 + (x - 400) * 0.45} y1="280" x2={x} y2="420" />)}
      </g>
      {/* wet sheen sweeping across the mopped floor */}
      <g clipPath="url(#floorClip)">
        <rect className="demo-sheen" x="-300" y="280" width="300" height="140" fill="url(#sheen)" />
        {/* mop streaks */}
        <path d="M60 330 q120 -14 240 0 t240 0 t220 0" stroke="rgba(190,255,250,0.10)" strokeWidth="10" fill="none" strokeLinecap="round" />
        <path d="M30 372 q140 -16 260 0 t260 0 t250 0" stroke="rgba(190,255,250,0.08)" strokeWidth="12" fill="none" strokeLinecap="round" />
      </g>

      {/* gallery sign */}
      <rect x="40" y="40" width="120" height="44" fill="#e8d8b0" />
      <text x="52" y="62" fontFamily="'Barlow Condensed', sans-serif" fontWeight="700" fontSize="18" fill="#2b2416">GALLERY 3</text>
      <text x="52" y="77" fontFamily="'JetBrains Mono', monospace" fontSize="8" fill="#2b2416" opacity=".7">MINERALOGY</text>

      {/* smashed display case */}
      <rect x="330" y="200" width="140" height="80" fill="#0f2f33" stroke="rgba(214,238,233,0.35)" />
      <rect x="320" y="110" width="160" height="92" fill="rgba(180,240,235,0.05)" stroke="rgba(214,238,233,0.5)" strokeWidth="2" />
      <g stroke="rgba(214,238,233,0.7)" strokeWidth="1.4" fill="none">
        <path d="M400 150 l-34 -30 M400 150 l40 -26 M400 150 l-46 30 M400 150 l52 28 M400 150 l6 46 M400 150 l-8 -40" />
        <path d="M380 136 l28 -6 l16 18 l-12 24 l-30 -4 z" />
      </g>
      {/* empty plinth where the meteorite was */}
      <rect x="384" y="186" width="32" height="12" fill="#163a3d" />
      {/* shards on floor */}
      <g fill="rgba(214,238,233,0.55)">
        <polygon points="300,300 310,296 306,306" /><polygon points="470,310 482,304 478,316" />
        <polygon points="350,338 358,330 362,340" /><polygon points="520,296 528,300 520,304" />
        <polygon points="420,322 432,318 428,328" />
      </g>

      {/* staff door */}
      <rect x="640" y="120" width="100" height="160" fill="#0a2124" stroke="rgba(214,238,233,0.35)" />
      <rect x="660" y="134" width="60" height="18" fill="#e8d8b0" />
      <text x="690" y="147" textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize="10" fontWeight="700" fill="#2b2416">STAFF</text>
      <circle cx="726" cy="206" r="4" fill="rgba(214,238,233,0.6)" />

      {/* mop + bucket */}
      <line x1="140" y1="170" x2="190" y2="330" stroke="#9fb7b4" strokeWidth="4" />
      <path d="M176 322 l30 10 l-8 14 l-34 -8 z" fill="#c9d7d4" />
      <path d="M84 300 h64 l-8 50 h-48 z" fill="#1d4a4f" stroke="rgba(214,238,233,0.45)" />
      <path d="M90 300 q26 -24 52 0" fill="none" stroke="rgba(214,238,233,0.5)" strokeWidth="2" />

      {/* flashlight beam */}
      <ellipse className="demo-beam" cx="0" cy="300" rx="150" ry="70" fill="url(#beam)" style={{ mixBlendMode: 'screen' }} />
    </svg>
  )
}

/* ── Anonymous silhouettes for the teaser ────────────────────────────── */
function Silhouettes({ label }) {
  return (
    <svg viewBox="0 0 300 120" role="img" aria-label={label} style={{ width: 'min(320px, 100%)', height: 'auto' }}>
      {[50, 150, 250].map((x, i) => (
        <g key={x} fill="#0b2528" stroke="rgba(70,227,211,0.45)" strokeWidth="1.5">
          <circle cx={x} cy={38} r={18} />
          <path d={`M${x - 36} 120 q0 -52 36 -56 q36 4 36 56 z`} />
          <text x={x} y={45} textAnchor="middle" fontFamily="'Barlow Condensed', sans-serif" fontWeight="700" fontSize="20" fill="rgba(70,227,211,0.85)" stroke="none">?</text>
          <title>{`#${i + 1}`}</title>
        </g>
      ))}
    </svg>
  )
}

/* ── Main ────────────────────────────────────────────────────────────── */
export default function Demo() {
  const { t, lang } = useLanguage()
  const reduce = useReducedMotion()
  const locale = lang === 'es' ? 'es-ES' : 'en-US'

  const [scene, setScene] = useState(0)
  const [prediction, setPrediction] = useState(null)
  const [rushed, setRushed] = useState(null)
  const [count, setCount] = useState(COUNTDOWN)
  const [tested, setTested] = useState(0)
  const [ratings, setRatings] = useState(() => Array(6).fill(null))
  const [limit, setLimit] = useState(null)
  const [blankPicked, setBlankPicked] = useState(false)
  const [bloom, setBloom] = useState(null)
  const [sound, setSound] = useState(false)
  const [shared, setShared] = useState(false)
  const [drag, setDrag] = useState(null) // { x, y } pointer offset while dragging the pipette
  const dragStart = useRef(null)
  const stageRef = useRef(null)
  const { drip, startHum, stopHum } = useSound(sound)

  const glow = rushed ? GLOW_RUSHED : GLOW
  const needRate = tested > 0 && ratings[tested - 1] == null
  const allTested = tested === 6 && !needRate
  const goodLimit = limit != null && limit >= 3

  const canNext = [true, prediction != null, rushed != null, limit != null, false][scene]

  const next = useCallback(() => { if (canNext && scene < SCENES - 1) setScene(s => s + 1) }, [canNext, scene])
  const back = useCallback(() => { if (scene > 0) setScene(s => s - 1) }, [scene])

  // Move focus to the new scene's heading for keyboard/screen-reader users.
  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return }
    // Wait for AnimatePresence's exit animation so we focus the NEW scene's heading.
    const id = setTimeout(() => {
      const stage = stageRef.current
      if (!stage) return
      // A tall scene can leave the page scrolled down — bring the new scene's top back into view.
      const top = stage.getBoundingClientRect().top
      if (top < 0) window.scrollTo({ top: window.scrollY + top - 110, behavior: reduce ? 'auto' : 'smooth' })
      stage.querySelector('h1, h2')?.focus({ preventScroll: true })
    }, 550)
    return () => clearTimeout(id)
  }, [scene, reduce])

  // Scene 2: eyes-adjust countdown.
  useEffect(() => {
    if (scene !== 2 || rushed != null) return
    startHum()
    let remaining = COUNTDOWN
    const id = setInterval(() => {
      remaining -= 1
      setCount(remaining)
      if (remaining <= 0) { clearInterval(id); setRushed(false) }
    }, 1000)
    return () => { clearInterval(id); stopHum() }
  }, [scene, rushed, startHum, stopHum])

  const addDrop = useCallback(() => {
    if (scene !== 3 || needRate || tested >= 6) return
    setBloom(`${tested}-${Date.now()}`)
    setTested(n => n + 1)
    drip()
  }, [scene, needRate, tested, drip])

  const rate = v => setRatings(r => { const c = [...r]; c[tested - 1] = v; return c })

  const pickLimit = n => {
    if (n === 6) { setBlankPicked(true); setLimit(null); return }
    setBlankPicked(false); setLimit(n)
  }

  // Global keyboard: ←/→ to move between scenes; number keys as shortcuts per scene.
  useEffect(() => {
    const onKey = e => {
      if (e.target.closest?.('input, textarea')) return
      if (e.key === 'ArrowRight') { e.preventDefault(); next() }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); back() }
      else if (/^[0-9]$/.test(e.key)) {
        const d = Number(e.key)
        if (scene === 1 && d >= 1 && d <= 6) setPrediction(d)
        else if (scene === 3 && needRate && d <= 5) rate(d)
        else if (scene === 3 && allTested && d >= 1 && d <= 6) pickLimit(d)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const replay = () => {
    setScene(0); setPrediction(null); setRushed(null); setCount(COUNTDOWN); setTested(0)
    setRatings(Array(6).fill(null)); setLimit(null); setBlankPicked(false); setBloom(null)
  }

  const share = async () => {
    const url = `${window.location.origin}/demo`
    try {
      if (navigator.share) await navigator.share({ title: 'CurioCrate · Case LMN-2026', url })
      else await navigator.clipboard.writeText(url)
      if (!navigator.share) { setShared(true); setTimeout(() => setShared(false), 2200) }
    } catch { /* share sheet dismissed */ }
  }

  /* Pipette drag (pointer) with tap fallback. */
  const onPipetteDown = e => {
    if (needRate || tested >= 6) return
    e.currentTarget.setPointerCapture(e.pointerId)
    dragStart.current = { x: e.clientX, y: e.clientY, moved: false }
    setDrag({ x: 0, y: 0 })
  }
  const onPipetteMove = e => {
    if (!dragStart.current) return
    const dx = e.clientX - dragStart.current.x, dy = e.clientY - dragStart.current.y
    if (Math.abs(dx) + Math.abs(dy) > 6) dragStart.current.moved = true
    setDrag({ x: dx, y: dy })
  }
  const onPipetteUp = e => {
    const st = dragStart.current
    dragStart.current = null
    setDrag(null)
    if (!st) return
    if (!st.moved) { addDrop(); return }
    const el = document.elementsFromPoint(e.clientX, e.clientY).find(n => n.dataset?.vial)
    if (el && Number(el.dataset.vial) === tested) addDrop()
  }

  const vialName = n => (DILUTIONS[n - 1]
    ? fill(t('demo.s3.vialLabel'), { n, d: DILUTIONS[n - 1] })
    : t('demo.s3.vialBlank'))

  const dark = scene >= 2
  const motionProps = reduce
    ? { initial: false, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -12 }, transition: { duration: 0.45, ease: [0.2, 0.7, 0.2, 1] } }

  return (
    <PageTransition>
      <main className="lum demo" style={{
        minHeight: '100svh', padding: 'clamp(84px, 12vw, 104px) 0 32px',
        background: dark ? '#010708' : 'var(--lum-bg)', transition: 'background 1.2s ease',
      }}>
        <div style={{ maxWidth: 980, margin: '0 auto', padding: '0 16px' }}>
          {/* top bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
            <span className="lum-tag" style={{ textTransform: 'none', letterSpacing: 0.5, fontSize: 11 }}>{t('demo.badge')}</span>
            <button
              type="button" onClick={() => setSound(s => !s)} aria-pressed={sound}
              className="lum-btn lum-btn--ghost" style={{ padding: '8px 14px', minHeight: 36, fontSize: 10 }}
            >{sound ? '🔊 ' + t('demo.soundOn') : '🔇 ' + t('demo.soundOff')}</button>
          </div>

          {/* stage */}
          <div
            ref={stageRef}
            className={scene === 4 && goodLimit && !reduce ? 'demo-shake' : ''}
            style={{
              position: 'relative', minHeight: 'min(68svh, 640px)', borderRadius: 16, overflow: 'hidden',
              background: dark ? '#000304' : 'var(--lum-bg2)', border: '1px solid var(--lum-line)',
              padding: 'clamp(18px, 4vw, 36px)', transition: 'background 1.2s ease',
            }}
          >
            <AnimatePresence mode="wait">
              <motion.section key={scene} {...motionProps} aria-label={fill(t('demo.sceneOf'), { n: scene + 1 })}>
                {scene === 0 && (
                  <div>
                    <div className="lum-eyebrow">{t('demo.s0.file')} · {t('demo.s0.where')}</div>
                    <h1 tabIndex={-1} className="demo-in" style={{ fontSize: 'clamp(30px, 6vw, 56px)', margin: '10px 0 18px', outline: 'none', animationDelay: '.3s' }}>
                      {t('demo.s0.line')}
                    </h1>
                    <GalleryScene label={t('demo.s0.sceneAlt')} />
                    <p className="demo-in" style={{ marginTop: 16, color: 'var(--lum-muted)', fontSize: 15, lineHeight: 1.5, animationDelay: '1.2s' }}>
                      {t('demo.s0.facts')} <strong style={{ color: 'var(--lum-text)' }}>{t('demo.s0.noBlood')}</strong>
                    </p>
                    <div className="demo-in" style={{ marginTop: 18, display: 'flex', gap: 14, alignItems: 'flex-start', animationDelay: '2.4s' }}>
                      <img src="/kits/luminol/char-okonkwo.webp" alt="" width={64} height={68}
                        style={{ width: 64, height: 'auto', borderRadius: 8, border: '2px solid var(--lum-paper)', flexShrink: 0 }} />
                      <div style={{ position: 'relative', background: 'var(--lum-paper)', color: 'var(--lum-paper-ink)', borderRadius: 12, padding: '12px 16px', flex: 1 }}>
                        <span aria-hidden style={{ position: 'absolute', left: -8, top: 18, borderWidth: '8px 8px 8px 0', borderStyle: 'solid', borderColor: 'transparent var(--lum-paper) transparent transparent' }} />
                        <div style={{ fontFamily: 'var(--lum-mono)', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: '#0f6f68' }}>{t('demo.s0.who')}</div>
                        <p style={{ fontFamily: 'var(--lum-display)', fontWeight: 600, fontSize: 'clamp(19px, 3vw, 24px)', lineHeight: 1.15, marginTop: 4 }}>“{t('demo.s0.quote')}”</p>
                      </div>
                    </div>
                  </div>
                )}

                {scene === 1 && (
                  <div>
                    <div className="lum-eyebrow">{t('demo.s1.title')}</div>
                    <h2 tabIndex={-1} style={{ fontSize: 'clamp(28px, 5.4vw, 48px)', margin: '10px 0 8px', outline: 'none' }}>{t('demo.s1.q')}</h2>
                    <p style={{ color: 'var(--lum-muted)', fontSize: 15 }}>{t('demo.s1.hint')}</p>
                    <div role="radiogroup" aria-label={t('demo.s1.q')} style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 'clamp(4px, 2vw, 14px)', marginTop: 28 }}>
                      {DILUTIONS.map((d, i) => (
                        <button
                          key={i} type="button" role="radio" aria-checked={prediction === i + 1}
                          aria-label={vialName(i + 1)}
                          onClick={() => setPrediction(i + 1)}
                          style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '10px 2px',
                            borderRadius: 10, cursor: 'pointer', color: 'var(--lum-text)', fontFamily: 'inherit',
                            background: prediction === i + 1 ? 'rgba(70,227,211,0.12)' : 'transparent',
                            border: `1px solid ${prediction === i + 1 ? 'var(--lum-glow)' : 'transparent'}`,
                            transform: prediction === i + 1 ? 'translateY(-4px)' : 'none', transition: 'all .2s',
                          }}
                        >
                          <div style={{ width: 'clamp(30px, 8vw, 58px)' }}><Vial n={i + 1} width="100%" selected={prediction === i + 1} /></div>
                          <span style={{ fontFamily: 'var(--lum-mono)', fontSize: 'clamp(8px, 2.2vw, 11px)', color: 'var(--lum-muted)', whiteSpace: 'nowrap' }}><DilutionLabel i={i} blank={t('demo.s1.blank')} /></span>
                        </button>
                      ))}
                    </div>
                    <p aria-live="polite" style={{ marginTop: 22, minHeight: 24, fontFamily: 'var(--lum-display)', fontWeight: 600, fontSize: 22, color: 'var(--lum-glow)', textAlign: 'center' }}>
                      {prediction ? fill(t('demo.s1.picked'), { n: prediction }) : ''}
                    </p>
                  </div>
                )}

                {scene === 2 && (
                  <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'min(56svh, 520px)', gap: 18 }}>
                    <div className="lum-eyebrow" style={{ color: 'rgba(70,227,211,0.6)' }}>{t('demo.s2.title')}</div>
                    {rushed == null ? (
                      <>
                        <h2 tabIndex={-1} style={{ fontSize: 'clamp(26px, 5vw, 44px)', color: 'rgba(214,238,233,0.5)', outline: 'none' }}>{t('demo.s2.adjust')}</h2>
                        <div aria-live="off" style={{ fontFamily: 'var(--lum-display)', fontWeight: 700, fontSize: 'clamp(90px, 22vw, 180px)', lineHeight: 1, color: 'rgba(70,227,211,0.22)' }}>{Math.max(0, count)}</div>
                        <span className="lum-sr" aria-live="polite">{count === COUNTDOWN ? `${COUNTDOWN}` : ''}</span>
                        <button type="button" className="lum-btn lum-btn--ghost" onClick={() => setRushed(true)} style={{ opacity: 0.7 }}>{t('demo.s2.skip')} ⏭</button>
                      </>
                    ) : (
                      <>
                        <h2 tabIndex={-1} style={{ fontSize: 'clamp(26px, 5vw, 44px)', outline: 'none', color: rushed ? '#f0c070' : 'var(--lum-glow)' }}>
                          {rushed ? '⚠' : t('demo.s2.ready')}
                        </h2>
                        <p aria-live="polite" style={{ maxWidth: 520, fontSize: 17, lineHeight: 1.5, color: 'var(--lum-text)' }}>
                          {rushed ? t('demo.s2.rushed') : t('demo.s2.patient')}
                        </p>
                      </>
                    )}
                  </div>
                )}

                {scene === 3 && (
                  <div>
                    <div className="lum-eyebrow">{t('demo.s3.title')}</div>
                    <h2 tabIndex={-1} aria-live="polite" style={{ fontSize: 'clamp(24px, 4.6vw, 40px)', margin: '10px 0 6px', outline: 'none', minHeight: '2.1em' }}>
                      {!allTested && !needRate && fill(t('demo.s3.drag'), { n: tested + 1 })}
                      {needRate && fill(t('demo.s3.rate'), { n: tested })}
                      {allTested && t('demo.s3.pick')}
                    </h2>
                    <p style={{ fontSize: 13, color: rushed ? '#f0c070' : 'var(--lum-muted)' }}>{rushed ? t('demo.s2.rushed') : t('demo.s2.patient')}</p>

                    {/* vial rack */}
                    <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 'clamp(2px, 1.5vw, 12px)', marginTop: 26, paddingTop: 22 }}>
                      {DILUTIONS.map((d, i) => {
                        const n = i + 1
                        const isTarget = !allTested && !needRate && i === tested
                        const vial = (
                          <div
                            data-vial={i}
                            style={{
                              width: 'clamp(32px, 8.5vw, 62px)', margin: '0 auto', borderRadius: 10,
                              outline: isTarget ? '2px dashed rgba(70,227,211,0.6)' : 'none', outlineOffset: 6,
                            }}
                          >
                            <Vial n={n} width="100%" lit={i < tested} glow={glow[i]} bloomKey={i === tested - 1 ? bloom : null}
                              selected={limit === n} label={vialName(n)} />
                          </div>
                        )
                        return (
                          <div key={i} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                            {allTested ? (
                              <button type="button" onClick={() => pickLimit(n)} aria-pressed={limit === n} aria-label={vialName(n)}
                                style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', borderRadius: 10 }}>{vial}</button>
                            ) : vial}
                            <span style={{ fontFamily: 'var(--lum-mono)', fontSize: 'clamp(8px, 2.2vw, 11px)', color: 'var(--lum-muted)', whiteSpace: 'nowrap' }}><DilutionLabel i={i} blank={t('demo.s1.blank')} /></span>
                            <span style={{ fontFamily: 'var(--lum-mono)', fontSize: 11, color: 'var(--lum-glow)', minHeight: 14 }}>
                              {ratings[i] != null ? `${ratings[i]}/5` : ''}
                            </span>
                            {limit === n && (
                              <motion.div
                                aria-hidden className="lum-pulse"
                                initial={reduce ? false : { scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 0.5 }}
                                style={{ position: 'absolute', top: -22, bottom: 0, right: 'calc(-1 * clamp(1px, 0.75vw, 6px))', borderRight: '2px dashed var(--lum-glow)', transformOrigin: 'top' }}
                              >
                                <span style={{ position: 'absolute', top: -2, left: 6, whiteSpace: 'nowrap', fontFamily: 'var(--lum-mono)', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--lum-glow)' }}>
                                  {t('demo.s3.limit')}
                                </span>
                              </motion.div>
                            )}
                          </div>
                        )
                      })}
                    </div>

                    {/* controls */}
                    <div style={{ marginTop: 22, minHeight: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
                      {!allTested && !needRate && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
                          <button
                            type="button"
                            aria-label={fill(t('demo.s3.tap'), { n: tested + 1 })}
                            onPointerDown={onPipetteDown} onPointerMove={onPipetteMove} onPointerUp={onPipetteUp}
                            onPointerCancel={() => { dragStart.current = null; setDrag(null) }}
                            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); addDrop() } }}
                            style={{
                              touchAction: 'none', cursor: drag ? 'grabbing' : 'grab', background: 'none', border: 'none', padding: 6,
                              transform: drag ? `translate(${drag.x}px, ${drag.y}px) rotate(-20deg)` : 'none',
                              transition: drag ? 'none' : 'transform .3s ease', position: 'relative', zIndex: 5,
                              pointerEvents: 'auto',
                            }}
                          >
                            <svg width="34" height="96" viewBox="0 0 34 96" aria-hidden style={{ pointerEvents: 'none' }}>
                              <rect x="7" y="2" width="20" height="26" rx="9" fill="#e8d8b0" />
                              <path d="M11 28 h12 l-3 56 l-3 10 l-3 -10 z" fill="rgba(220,245,240,0.25)" stroke="rgba(214,238,233,0.7)" strokeWidth="1.4" />
                              <circle cx="17" cy="92" r="2.4" fill="#46e3d3" />
                            </svg>
                          </button>
                          <button type="button" className="lum-btn lum-btn--ghost" onClick={addDrop}>💧 {fill(t('demo.s3.tap'), { n: tested + 1 })}</button>
                        </div>
                      )}

                      {needRate && (
                        <div role="group" aria-label={fill(t('demo.s3.rate'), { n: tested })} style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6, width: '100%', maxWidth: 620 }}>
                          {[0, 1, 2, 3, 4, 5].map(v => (
                            <button key={v} type="button" onClick={() => rate(v)}
                              style={{
                                padding: '10px 2px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', color: 'var(--lum-text)',
                                background: `rgba(70,227,211,${0.04 + v * 0.07})`, border: '1px solid var(--lum-line)',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minHeight: 56,
                              }}>
                              <strong style={{ fontFamily: 'var(--lum-display)', fontSize: 22, lineHeight: 1 }}>{v}</strong>
                              <span style={{ fontSize: 'clamp(9px, 2.4vw, 12px)', color: 'var(--lum-muted)' }}>{t(`demo.s3.scale.${v}`)}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {allTested && (
                        <p aria-live="polite" style={{ textAlign: 'center', fontSize: 17, lineHeight: 1.5, maxWidth: 560 }}>
                          {blankPicked && <span style={{ color: '#f0c070', display: 'block' }}>{t('demo.s3.blankWarning')}</span>}
                          {limit != null && (
                            <span style={{ fontFamily: 'var(--lum-display)', fontWeight: 600, fontSize: 22, color: 'var(--lum-glow)' }}>
                              {fill(t('demo.s3.compare'), { p: prediction ?? '—', l: limit })}
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {scene === 4 && limit != null && (
                  <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                    <h2 tabIndex={-1} style={{ fontSize: 'clamp(30px, 6vw, 56px)', outline: 'none' }}>
                      {fill(t('demo.s4.reach'), { n: LIMIT_DENOMS[limit - 1].toLocaleString(locale) })}
                    </h2>

                    {/* case file card with stamp */}
                    <div style={{
                      position: 'relative', width: 'min(440px, 100%)', padding: '18px 20px 22px', borderRadius: 8, textAlign: 'left',
                      background: 'var(--lum-paper)', color: 'var(--lum-paper-ink)', transform: 'rotate(-1deg)',
                      boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
                    }}>
                      <div style={{ fontFamily: 'var(--lum-mono)', fontSize: 10, letterSpacing: 2, opacity: 0.7 }}>CASE LMN-2026</div>
                      <div style={{ fontFamily: 'var(--lum-display)', fontWeight: 700, fontSize: 22, marginTop: 4 }}>{t('demo.s4.swab')}</div>
                      <motion.div
                        initial={reduce ? false : { scale: 2.2, opacity: 0, rotate: -14 }}
                        animate={{ scale: 1, opacity: 1, rotate: -8 }}
                        transition={{ delay: 0.5, duration: 0.28, ease: 'easeIn' }}
                        style={{
                          display: 'inline-block', marginTop: 14, padding: '6px 14px', borderRadius: 6,
                          border: `3px solid ${goodLimit ? '#0f8a80' : '#b5462f'}`, color: goodLimit ? '#0f8a80' : '#b5462f',
                          fontFamily: 'var(--lum-display)', fontWeight: 700, fontSize: 26, textTransform: 'uppercase', letterSpacing: 1,
                        }}
                      >{goodLimit ? t('demo.s4.stampGood') : t('demo.s4.stampBad')}</motion.div>
                    </div>

                    <p style={{ fontSize: 'clamp(17px, 2.6vw, 21px)', lineHeight: 1.45, maxWidth: 560 }}>
                      {goodLimit ? t('demo.s4.good') : t('demo.s4.bad')}
                    </p>

                    <Silhouettes label={t('demo.s4.silhouetteAlt')} />
                    <div className="lum-eyebrow" style={{ marginTop: -6 }}>{t('demo.s4.keys')}</div>

                    <p style={{ fontFamily: 'var(--lum-display)', fontWeight: 700, fontSize: 'clamp(24px, 4.4vw, 36px)', textTransform: 'uppercase', color: 'var(--lum-glow)', textShadow: '0 0 20px rgba(70,227,211,0.45)', marginTop: 8 }}>
                      {t('demo.s4.cta')}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
                      <Link to="/kits/luminol#sponsor" className="lum-btn lum-btn--primary">{t('demo.s4.sponsor')}</Link>
                      <button type="button" className="lum-btn lum-btn--ghost" onClick={replay}>↺ {t('demo.s4.replay')}</button>
                      <button type="button" className="lum-btn lum-btn--ghost" onClick={share}>{shared ? t('demo.s4.shared') : `🔗 ${t('demo.s4.share')}`}</button>
                    </div>
                    <div style={{ width: 'min(520px, 100%)', marginTop: 10, textAlign: 'left' }}>
                      <p style={{ fontSize: 14, color: 'var(--lum-muted)', marginBottom: 8 }}>{t('demo.s4.contact')}</p>
                      <CopyEmail compact />
                    </div>
                  </div>
                )}
              </motion.section>
            </AnimatePresence>
          </div>

          {/* bottom nav */}
          <nav aria-label="Demo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 18 }}>
            <button type="button" className="lum-btn lum-btn--ghost" onClick={back} disabled={scene === 0} style={{ padding: '12px 18px' }}>← {t('demo.back')}</button>
            <ol style={{ listStyle: 'none', display: 'flex', gap: 8 }} aria-label={fill(t('demo.sceneOf'), { n: scene + 1 })}>
              {Array.from({ length: SCENES }, (_, i) => (
                <li key={i} aria-current={i === scene ? 'step' : undefined} style={{
                  width: i === scene ? 26 : 9, height: 9, borderRadius: 5, transition: 'all .3s',
                  background: i <= scene ? 'var(--lum-glow)' : 'rgba(214,238,233,0.2)',
                  boxShadow: i === scene ? '0 0 10px rgba(70,227,211,0.7)' : 'none',
                }} />
              ))}
            </ol>
            {scene < SCENES - 1 ? (
              <button type="button" className="lum-btn lum-btn--primary" onClick={next} disabled={!canNext} style={{ padding: '12px 22px' }}>{t('demo.next')} →</button>
            ) : <span style={{ width: 96 }} />}
          </nav>
        </div>
      </main>
      <style>{`
        @keyframes demo-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        .demo-in { animation: demo-in .7s ease both; }
        @keyframes demo-beam { 0% { transform: translate(80px, -10px); } 50% { transform: translate(560px, 20px); } 100% { transform: translate(80px, -10px); } }
        .demo-beam { animation: demo-beam 7s ease-in-out infinite; }
        @keyframes demo-sheen { 0% { transform: translateX(0); } 100% { transform: translateX(1400px); } }
        .demo-sheen { animation: demo-sheen 5.5s linear infinite; }
        @keyframes demo-shake {
          0%, 100% { transform: none; }
          20% { transform: translate(-4px, 2px); } 40% { transform: translate(4px, -2px); }
          60% { transform: translate(-3px, 1px); } 80% { transform: translate(2px, -1px); }
        }
        .demo-shake { animation: demo-shake .35s ease .78s 1; }
      `}</style>
    </PageTransition>
  )
}
