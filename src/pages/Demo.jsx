import { Component, Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import PageTransition from '../components/PageTransition'
import Vial from '../components/luminol/Vial'
import { GLOW, GLOW_RUSHED, LIMIT_DENOMS } from '../components/luminol/glow'
import CopyEmail from '../components/luminol/CopyEmail'
import { useLanguage } from '../i18n/useLanguage'
import '../components/luminol/luminol.css'

// three.js + postprocessing only load on this route.
const DemoScene3D = lazy(() => import('../components/luminol/DemoScene3D'))

/*
 * /demo — a ~3 minute playable teaser of the Luminol kit (Case LMN-2026), in 3D.
 * Owner's rules: plain English, big text, no jargon. Simulates OBSERVING results only — no
 * amounts or mixing steps. No spoilers: no suspect names, alibis, timeline or culprit; only
 * three anonymous silhouettes. No accounts, no storage, no data collected.
 */

const SCENES = 5
const COUNTDOWN = 8
const fill = (s, map) => Object.entries(map).reduce((acc, [k, v]) => acc.replace(`{${k}}`, v), s)

function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch { return false }
}

class SceneBoundary extends Component {
  constructor(props) { super(props); this.state = { failed: false } }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? this.props.fallback : this.props.children }
}

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

function Silhouettes({ label }) {
  return (
    <svg viewBox="0 0 300 120" role="img" aria-label={label} style={{ width: 'min(300px, 80%)', height: 'auto' }}>
      {[50, 150, 250].map(x => (
        <g key={x} fill="#0b2528" stroke="rgba(70,227,211,0.5)" strokeWidth="1.5">
          <circle cx={x} cy={38} r={18} />
          <path d={`M${x - 36} 120 q0 -52 36 -56 q36 4 36 56 z`} />
          <text x={x} y={45} textAnchor="middle" fontFamily="'Barlow Condensed', sans-serif" fontWeight="700" fontSize="20" fill="rgba(70,227,211,0.9)" stroke="none">?</text>
        </g>
      ))}
    </svg>
  )
}

/* Flat fallback when WebGL isn't available. */
function FlatStage({ scene, glows, tested, limit, prediction, onTube, interactive }) {
  if (scene === 0) {
    return <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 80%, rgba(70,227,211,0.12), #020809 70%)' }} />
  }
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#020809' }}>
      <div style={{ display: 'flex', gap: 'clamp(6px, 3vw, 28px)' }}>
        {glows.map((g, i) => (
          <button key={i} type="button" onClick={() => interactive(i + 1) && onTube(i + 1)} tabIndex={-1} aria-hidden
            style={{ background: 'none', border: 'none', padding: 0, cursor: interactive(i + 1) ? 'pointer' : 'default' }}>
            <Vial n={i + 1} width={56} lit={i < tested} glow={g} selected={limit === i + 1 || (scene === 1 && prediction === i + 1)} />
          </button>
        ))}
      </div>
    </div>
  )
}

export default function Demo() {
  const { t, lang } = useLanguage()
  const reduce = useReducedMotion()
  const locale = lang === 'es' ? 'es-ES' : 'en-US'
  const webgl = useMemo(() => hasWebGL(), [])
  const mobile = typeof window !== 'undefined' && window.innerWidth < 768

  const [scene, setScene] = useState(0)
  const [beat, setBeat] = useState(reduce ? 2 : 0)
  const [prediction, setPrediction] = useState(null)
  const [rushed, setRushed] = useState(null)
  const [count, setCount] = useState(COUNTDOWN)
  const [tested, setTested] = useState(0)
  const [ratings, setRatings] = useState(() => Array(6).fill(null))
  const [limit, setLimit] = useState(null)
  const [waterPicked, setWaterPicked] = useState(false)
  const [dropKey, setDropKey] = useState(null)
  const [sound, setSound] = useState(false)
  const [shared, setShared] = useState(false)
  const headRef = useRef(null)
  const { drip, startHum, stopHum } = useSound(sound)

  const glows = rushed ? GLOW_RUSHED : GLOW
  const needRate = tested > 0 && ratings[tested - 1] == null
  const allTested = tested === 6 && !needRate
  const goodLimit = limit != null && limit >= 3

  const canNext = [true, prediction != null, rushed != null, limit != null, false][scene]

  const next = useCallback(() => {
    if (scene === 0 && beat < 2) { setBeat(b => b + 1); return }
    if (canNext && scene < SCENES - 1) setScene(s => s + 1)
  }, [canNext, scene, beat])
  const back = useCallback(() => { if (scene > 0) setScene(s => s - 1) }, [scene])

  // Scene 0 story beats reveal on their own; Next skips ahead.
  useEffect(() => {
    if (scene !== 0 || reduce) return
    const a = setTimeout(() => setBeat(b => Math.max(b, 1)), 2600)
    const b = setTimeout(() => setBeat(x => Math.max(x, 2)), 5600)
    return () => { clearTimeout(a); clearTimeout(b) }
  }, [scene, reduce])

  // Focus the new heading after each scene change (skip the very first render).
  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return }
    const id = setTimeout(() => headRef.current?.focus({ preventScroll: true }), 450)
    return () => clearTimeout(id)
  }, [scene])

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
    setDropKey({ tube: tested, id: Date.now() })
    setTested(n => n + 1)
    drip()
  }, [scene, needRate, tested, drip])

  const rate = v => setRatings(r => { const c = [...r]; c[tested - 1] = v; return c })

  const pickLimit = n => {
    if (n === 6) { setWaterPicked(true); setLimit(null); return }
    setWaterPicked(false); setLimit(n)
  }

  const interactive = useCallback(n => {
    if (scene === 1) return true
    if (scene === 3 && allTested) return true
    if (scene === 3 && !needRate && n === tested + 1) return true
    return false
  }, [scene, allTested, needRate, tested])

  const onTube = useCallback(n => {
    if (scene === 1) setPrediction(n)
    else if (scene === 3 && allTested) pickLimit(n)
    else if (scene === 3 && n === tested + 1) addDrop()
  }, [scene, allTested, tested, addDrop])

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
    setScene(0); setBeat(reduce ? 2 : 0); setPrediction(null); setRushed(null); setCount(COUNTDOWN); setTested(0)
    setRatings(Array(6).fill(null)); setLimit(null); setWaterPicked(false); setDropKey(null)
  }

  const share = async () => {
    const url = `${window.location.origin}/demo`
    try {
      if (navigator.share) await navigator.share({ title: 'CurioCrate · The Luminol Case', url })
      else { await navigator.clipboard.writeText(url); setShared(true); setTimeout(() => setShared(false), 2200) }
    } catch { /* share sheet dismissed */ }
  }

  const tubeName = n => (n === 6 ? t('demo.s3.tubeWater') : fill(t('demo.s3.tube'), { n }))

  /* ── text for the current step ── */
  let big = '', small = '', extra = null
  if (scene === 0) {
    big = t('demo.s0.big'); small = t('demo.s0.small')
  } else if (scene === 1) {
    big = t('demo.s1.big'); small = t('demo.s1.small')
  } else if (scene === 2) {
    if (rushed == null) { big = t('demo.s2.big'); small = t('demo.s2.small') }
    else if (rushed) { big = t('demo.s2.rushed'); small = t('demo.s2.rushedSmall') }
    else { big = t('demo.s2.ready'); small = t('demo.s2.readySmall') }
  } else if (scene === 3) {
    if (!allTested && !needRate) big = fill(t('demo.s3.tap'), { n: tested + 1 })
    else if (needRate) big = fill(t('demo.s3.rate'), { n: tested })
    else if (limit != null) big = fill(t('demo.s3.compare'), { p: prediction ?? '—', l: limit })
    else big = t('demo.s3.pick')
    if (allTested && waterPicked) extra = t('demo.s3.water')
  }

  const motionText = reduce
    ? { initial: false, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : { initial: { opacity: 0, y: 24, filter: 'blur(6px)' }, animate: { opacity: 1, y: 0, filter: 'blur(0px)' }, exit: { opacity: 0, y: -16, filter: 'blur(6px)' }, transition: { duration: 0.5, ease: [0.2, 0.7, 0.2, 1] } }

  const stageProps = {
    scene, beat, glows, tested, limit, prediction, interactive, onTube, dropKey, reduce, mobile,
    activeTube: Math.min(5, tested), lightsOff: scene >= 2,
    labels: { limit: t('demo.s3.limit') },
  }
  const flat = <FlatStage {...stageProps} />

  const tubeChips = (selected, aria) => (
    <div role="radiogroup" aria-label={aria} style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, width: '100%', maxWidth: 560 }}>
      {[1, 2, 3, 4, 5, 6].map(n => (
        <button key={n} type="button" role="radio" aria-checked={selected === n} aria-label={tubeName(n)}
          onClick={() => onTube(n)} className="demo-chip" data-on={selected === n}>
          {n}
        </button>
      ))}
    </div>
  )

  return (
    <PageTransition>
      <main className="lum demo" style={{ background: '#020809' }}>
        <div className="demo-stage" style={{ position: 'relative', height: '100svh', minHeight: 620, overflow: 'hidden' }}>
          {/* 3D (or flat fallback) */}
          <div style={{ position: 'absolute', inset: 0 }} aria-hidden={scene !== 0} role={scene === 0 ? 'img' : undefined} aria-label={scene === 0 ? t('demo.s0.sceneAlt') : undefined}>
            {webgl ? (
              <SceneBoundary fallback={flat}>
                <Suspense fallback={<div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: 'var(--lum-muted)' }}>{t('demo.loading')}</div>}>
                  <DemoScene3D {...stageProps} />
                </Suspense>
              </SceneBoundary>
            ) : flat}
          </div>

          {/* legibility gradients */}
          <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(180deg, rgba(2,8,9,0.92) 0%, rgba(2,8,9,0.55) 24%, rgba(2,8,9,0) 42%, rgba(2,8,9,0) 66%, rgba(2,8,9,0.9) 100%)' }} />

          {/* overlay */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', pointerEvents: 'none', padding: 'clamp(84px, 11vw, 100px) 16px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, maxWidth: 1100, width: '100%', margin: '0 auto' }}>
              <span style={{ fontSize: 12, color: 'var(--lum-muted)' }}>{t('demo.badge')}</span>
              <button type="button" onClick={() => setSound(s => !s)} aria-pressed={sound} className="demo-small-btn" style={{ pointerEvents: 'auto' }}>
                {sound ? '🔊 ' + t('demo.soundOn') : '🔇 ' + t('demo.soundOff')}
              </button>
            </div>

            {scene < 4 && (
              <div style={{ maxWidth: 1000, width: '100%', margin: 'clamp(12px, 3vh, 36px) auto 0', textAlign: 'center' }}>
                <AnimatePresence mode="wait">
                  <motion.div key={`${scene}-${big}`} {...motionText}>
                    <h1 ref={headRef} tabIndex={-1} className="demo-big">{big}</h1>
                    {small && <p className="demo-small">{small}</p>}
                  </motion.div>
                </AnimatePresence>
                {scene === 0 && (
                  <div style={{ marginTop: 18, minHeight: 140 }}>
                    <AnimatePresence>
                      {beat >= 1 && (
                        <motion.figure key="q" {...motionText} style={{ margin: 0 }}>
                          <blockquote className="demo-quote">“{t('demo.s0.quote')}”</blockquote>
                          <figcaption style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 8, fontSize: 15, color: 'var(--lum-muted)' }}>
                            <img src="/kits/luminol/char-okonkwo.webp" alt="" width={36} height={38} style={{ width: 36, height: 'auto', borderRadius: 6 }} />
                            {t('demo.s0.who')}
                          </figcaption>
                        </motion.figure>
                      )}
                      {beat >= 2 && (
                        <motion.p key="job" {...motionText} className="demo-job">{t('demo.s0.job')}</motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                )}
                {extra && <p className="demo-small" style={{ color: '#f0c070', fontWeight: 600 }} aria-live="polite">{extra}</p>}
              </div>
            )}

            {/* center: countdown */}
            {scene === 2 && rushed == null && (
              <div aria-live="off" className="demo-count" style={{ margin: 'auto' }}>{Math.max(0, count)}</div>
            )}

            {/* final panel */}
            {scene === 4 && limit != null && (
              <div className="demo-final" style={{ pointerEvents: 'auto' }}>
                <h1 ref={headRef} tabIndex={-1} className="demo-big" style={{ fontSize: 'clamp(32px, 6vw, 72px)' }}>
                  {fill(t('demo.s4.big'), { n: LIMIT_DENOMS[limit - 1].toLocaleString(locale) })}
                </h1>
                <div style={{
                  position: 'relative', width: 'min(460px, 100%)', margin: '18px auto 0', padding: '16px 20px 20px', borderRadius: 8, textAlign: 'left',
                  background: 'var(--lum-paper)', color: 'var(--lum-paper-ink)', transform: 'rotate(-1deg)', boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
                }} className={goodLimit && !reduce ? 'demo-shake' : ''}>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{t('demo.s4.sample')}</div>
                  <motion.div
                    initial={reduce ? false : { scale: 2.2, opacity: 0, rotate: -14 }}
                    animate={{ scale: 1, opacity: 1, rotate: -6 }}
                    transition={{ delay: 0.5, duration: 0.28, ease: 'easeIn' }}
                    style={{
                      display: 'inline-block', marginTop: 12, padding: '6px 14px', borderRadius: 6,
                      border: `3px solid ${goodLimit ? '#0f8a80' : '#b5462f'}`, color: goodLimit ? '#0f8a80' : '#b5462f',
                      fontFamily: 'var(--lum-display)', fontWeight: 700, fontSize: 'clamp(22px, 5vw, 28px)', textTransform: 'uppercase',
                    }}
                  >{goodLimit ? t('demo.s4.stampGood') : t('demo.s4.stampBad')}</motion.div>
                </div>
                <p className="demo-small" style={{ fontSize: 'clamp(19px, 2.8vw, 26px)', color: 'var(--lum-text)', maxWidth: 640, margin: '22px auto 0' }}>
                  {goodLimit ? t('demo.s4.good') : t('demo.s4.bad')}
                </p>
                <div style={{ marginTop: 18 }}><Silhouettes label={t('demo.s4.silhouetteAlt')} /></div>
                <p style={{ fontSize: 18, fontWeight: 600, marginTop: 4 }}>{t('demo.s4.keys')}</p>
                <p className="demo-big" style={{ fontSize: 'clamp(26px, 4.6vw, 48px)', color: 'var(--lum-glow)', textShadow: '0 0 24px rgba(70,227,211,0.5)', marginTop: 22 }}>
                  {t('demo.s4.cta')}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginTop: 18 }}>
                  <Link to="/kits/luminol#sponsor" className="lum-btn lum-btn--primary">{t('demo.s4.sponsor')}</Link>
                  <button type="button" className="lum-btn lum-btn--ghost" onClick={replay}>↺ {t('demo.s4.replay')}</button>
                  <button type="button" className="lum-btn lum-btn--ghost" onClick={share}>{shared ? t('demo.s4.shared') : t('demo.s4.share')}</button>
                </div>
                <div style={{ width: 'min(520px, 100%)', margin: '22px auto 0', textAlign: 'left' }}>
                  <p style={{ fontSize: 15, color: 'var(--lum-muted)', marginBottom: 8 }}>{t('demo.s4.contact')}</p>
                  <CopyEmail compact />
                </div>
                <button type="button" className="lum-btn lum-btn--ghost" onClick={back} style={{ marginTop: 28 }}>← {t('demo.back')}</button>
              </div>
            )}

            {/* bottom controls */}
            {scene < 4 && <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, pointerEvents: 'auto', maxWidth: 1100, width: '100%', alignSelf: 'center', position: 'relative' }}>
              {scene === 1 && (
                <>
                  {tubeChips(prediction, t('demo.s1.big'))}
                  <p aria-live="polite" className="demo-picked">{prediction ? fill(t('demo.s1.picked'), { n: prediction }) : ''}</p>
                </>
              )}
              {scene === 2 && rushed == null && (
                <button type="button" className="lum-btn lum-btn--ghost" onClick={() => setRushed(true)}>{t('demo.s2.skip')} ⏭</button>
              )}
              {scene === 3 && !allTested && !needRate && (
                <button type="button" className="lum-btn lum-btn--primary demo-cta" onClick={addDrop}>💧 {fill(t('demo.s3.tapButton'), { n: tested + 1 })}</button>
              )}
              {scene === 3 && needRate && (
                <div role="group" aria-label={fill(t('demo.s3.rate'), { n: tested })} style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6, width: '100%', maxWidth: 680 }}>
                  {[0, 1, 2, 3, 4, 5].map(v => (
                    <button key={v} type="button" onClick={() => rate(v)} className="demo-rate" style={{ background: `rgba(70,227,211,${0.05 + v * 0.08})` }}>
                      <strong>{v}</strong>
                      <span>{t(`demo.s3.scale.${v}`)}</span>
                    </button>
                  ))}
                </div>
              )}
              {scene === 3 && allTested && tubeChips(limit, t('demo.s3.pick'))}

              <nav aria-label="Demo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, width: '100%' }}>
                <button type="button" className="lum-btn lum-btn--ghost" onClick={back} disabled={scene === 0} style={{ padding: '12px 18px', visibility: scene === 0 ? 'hidden' : 'visible' }}>← {t('demo.back')}</button>
                <ol style={{ listStyle: 'none', display: 'flex', gap: 8 }} aria-label={fill(t('demo.sceneOf'), { n: scene + 1 })}>
                  {Array.from({ length: SCENES }, (_, i) => (
                    <li key={i} aria-current={i === scene ? 'step' : undefined} style={{
                      width: i === scene ? 26 : 9, height: 9, borderRadius: 5, transition: 'all .3s',
                      background: i <= scene ? 'var(--lum-glow)' : 'rgba(214,238,233,0.25)',
                      boxShadow: i === scene ? '0 0 10px rgba(70,227,211,0.7)' : 'none',
                    }} />
                  ))}
                </ol>
                {scene < SCENES - 1 ? (
                  <button type="button" className="lum-btn lum-btn--primary" onClick={next} disabled={!canNext} style={{ padding: '14px 26px', fontSize: 13 }}>
                    {scene === 0 && beat >= 2 ? t('demo.start') : t('demo.next')} →
                  </button>
                ) : <span style={{ width: 96 }} />}
              </nav>
            </div>}
          </div>
        </div>
      </main>
      <style>{`
        .lum .demo-big {
          font-family: var(--lum-display); font-weight: 700; text-transform: none;
          font-size: clamp(36px, 7vw, 86px); line-height: 1.02; letter-spacing: -0.005em;
          color: #f2fffc; text-shadow: 0 4px 30px rgba(0,0,0,0.8); outline: none;
        }
        .demo-small { margin-top: 14px; font-size: clamp(17px, 2.3vw, 22px); line-height: 1.45; color: rgba(228,243,240,0.85); text-shadow: 0 2px 12px rgba(0,0,0,0.9); }
        .demo-quote { font-family: var(--lum-display); font-weight: 600; font-size: clamp(24px, 3.8vw, 40px); line-height: 1.1; color: var(--lum-paper); margin: 0; }
        .demo-job { margin-top: 16px; font-size: clamp(19px, 2.8vw, 28px); font-weight: 700; color: var(--lum-glow); text-shadow: 0 0 20px rgba(70,227,211,0.45); }
        .demo-count { font-family: var(--lum-display); font-weight: 700; font-size: clamp(120px, 30vw, 260px); line-height: 1; color: rgba(70,227,211,0.28); text-shadow: 0 0 40px rgba(70,227,211,0.25); }
        .demo-picked { min-height: 28px; font-family: var(--lum-display); font-weight: 700; font-size: 26px; color: #f0c070; }
        .demo-chip {
          min-height: 52px; border-radius: 10px; cursor: pointer; font-family: var(--lum-display); font-weight: 700; font-size: 24px;
          color: var(--lum-text); background: rgba(6,25,28,0.85); border: 1px solid rgba(70,227,211,0.3); transition: all .2s;
        }
        .demo-chip:hover { border-color: var(--lum-glow); }
        .demo-chip[data-on="true"] { background: var(--lum-glow); color: #02201d; box-shadow: 0 0 20px rgba(70,227,211,0.5); }
        .demo-rate {
          min-height: 64px; border-radius: 10px; cursor: pointer; color: var(--lum-text); font-family: inherit;
          border: 1px solid rgba(70,227,211,0.3); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px;
        }
        .demo-rate strong { font-family: var(--lum-display); font-size: 26px; line-height: 1; }
        .demo-rate span { font-size: clamp(10px, 2.6vw, 13px); color: rgba(228,243,240,0.8); }
        .demo nav .lum-btn { white-space: nowrap; }
        @media (max-width: 480px) { .demo nav .lum-btn { padding: 12px 14px !important; letter-spacing: 1.5px; } }
        .demo-cta { font-size: 15px !important; padding: 18px 30px !important; }
        .demo-small-btn {
          font-size: 12px; padding: 6px 12px; border-radius: 6px; cursor: pointer; color: var(--lum-muted);
          background: rgba(2,8,9,0.6); border: 1px solid var(--lum-line);
        }
        .demo-final {
          position: absolute; inset: 0; overflow-y: auto; text-align: center;
          padding: 140px 16px 60px; background: rgba(2,8,9,0.78);
        }
        @keyframes demo-shake {
          0%, 100% { transform: rotate(-1deg); }
          20% { transform: rotate(-1deg) translate(-4px, 2px); } 40% { transform: rotate(-1deg) translate(4px, -2px); }
          60% { transform: rotate(-1deg) translate(-3px, 1px); } 80% { transform: rotate(-1deg) translate(2px, -1px); }
        }
        .demo-shake { animation: demo-shake .35s ease .78s 1; }
      `}</style>
    </PageTransition>
  )
}
