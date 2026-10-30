import { Link } from 'react-router-dom'
import KitBox from './luminol/KitBox'
import Vial from './luminol/Vial'
import { GLOW } from './luminol/glow'
import { useLanguage } from '../i18n/useLanguage'
import './luminol/luminol.css'

/** Homepage call-out for the Luminol kit fundraiser — sits directly under the hero. */
export default function LuminolHomeFeature() {
  const { t } = useLanguage()
  return (
    <section className="lum home-luminol" style={{ padding: 'clamp(56px, 9vw, 96px) 0', background: 'transparent' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 clamp(16px, 4vw, 32px)' }}>
        <div className="hl-card" style={{
          position: 'relative', overflow: 'hidden', borderRadius: 18,
          border: '1px solid rgba(70,227,211,0.35)',
          background: 'radial-gradient(ellipse 60% 80% at 85% 50%, rgba(70,227,211,0.16) 0%, rgba(4,19,21,0) 70%), #041315',
          boxShadow: '0 30px 80px rgba(0,0,0,0.45)',
          padding: 'clamp(26px, 5vw, 52px)',
          display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 36, alignItems: 'center',
        }}>
          <div>
            <div className="lum-eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span aria-hidden style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--lum-glow)', boxShadow: '0 0 10px var(--lum-glow)' }} />
              {t('luminol.home.eyebrow')}
            </div>
            <h2 style={{ fontSize: 'clamp(34px, 5.6vw, 58px)', margin: '14px 0 14px' }}>{t('luminol.home.title')}</h2>
            <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--lum-muted)', maxWidth: 560 }}>{t('luminol.home.text')}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 26 }}>
              <Link to="/kits/luminol#sponsor" className="lum-btn lum-btn--primary">{t('luminol.home.sponsor')}</Link>
              <Link to="/kits/luminol" className="lum-btn lum-btn--ghost">{t('luminol.home.cta')} →</Link>
              <Link to="/demo" className="lum-btn lum-btn--ghost">▶ {t('luminol.home.demo')}</Link>
            </div>
          </div>
          <div className="hl-visual" style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
            <KitBox open width={300} label={t('luminol.home.boxAlt')} />
            <div aria-hidden style={{ display: 'flex', gap: 10 }}>
              {GLOW.map((g, i) => <Vial key={i} n={i + 1} glow={g} lit width={24} />)}
            </div>
            <span className="lum-tag" style={{ position: 'absolute', top: -8, left: 0 }}>{t('luminol.common.conceptRender')}</span>
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 820px) {
          .hl-card { grid-template-columns: 1fr !important; }
          .hl-visual { order: -1; }
        }
      `}</style>
    </section>
  )
}
