import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageTransition from '../components/PageTransition'
import { useMobile } from '../hooks/useMobile'
import { useLanguage } from '../i18n/useLanguage'

// Founder card hidden again at the site owner's request (2026-10-01).
const SHOW_FOUNDER_CARD = false

// ─── DATA ─────────────────────────────────────────────────────────────────────

const cabinet = [
  {
    id: 'president',
    name: 'Daniel Son',
    role: 'President',
    bio: 'Leads CurioCrate with a clear vision: every child, regardless of zip code, deserves access to the wonder of science.',
    photo: '/boardmembers/danielsonpresident.png',
    photoHeight: 230, photoExpandedHeight: 430,
    emoji: '🔬',
    color: '#fbbf24',
    glow: 'rgba(251,191,36,0.5)',
    dark: '#0d0900',
    number: '01',
  },
  {
    id: 'treasurer',
    name: 'Rebecca Ho',
    role: 'Treasurer',
    bio: 'Stewards the organization\'s finances with precision, ensuring every dollar goes toward putting science in students\' hands.',
    photo: '/boardmembers/rebeccahotres.png',
    photoHeight: 230, photoExpandedHeight: 430,
    color: '#6ee7b7',
    glow: 'rgba(110,231,183,0.5)',
    dark: '#00100a',
    number: '02',
  },
  {
    id: 'secretary',
    name: 'Sienna Lee',
    role: 'Secretary',
    bio: 'Keeps the organization running with clarity and care, documenting decisions, coordinating communications, leading chapter development, and holding everything together.',
    photo: '/boardmembers/siennaleesecretary.png',
    photoHeight: 230, photoExpandedHeight: 430,
    color: '#c084fc',
    glow: 'rgba(192,132,252,0.5)',
    dark: '#0a0018',
    number: '03',
  },
].map(m => ({ ...m, ns: 'cabinet' }))

const directors = [
  {
    id: 'publicity',
    name: 'Daniel Kim',
    role: 'Director of Operations',
    bio: 'Keeps logistics, partnerships, and kit delivery running smoothly, turning plans into on-the-ground impact.',
    photo: '/boardmembers/danielkimDirectorofpublicity.png',
    photoHeight: 270, photoExpandedHeight: 450,
    color: '#fb923c',
    glow: 'rgba(251,146,60,0.5)',
    dark: '#170900',
    number: '01',
  },
  {
    id: 'ops1',
    name: 'Jamie Song',
    role: 'Director of Operations',
    bio: 'The engine behind every event, orchestrating logistics, partnerships, and kit delivery with precision and care.',
    photo: '/boardmembers/jamiesongdirectorofoperations.png',
    photoHeight: 230, photoExpandedHeight: 410,
    color: '#fb923c',
    glow: 'rgba(251,146,60,0.5)',
    dark: '#170900',
    number: '02',
  },
  {
    id: 'pub-abigail',
    name: 'Abigail Son',
    role: 'Director of Publicity',
    bio: 'Spreads the CurioCrate story through engaging outreach and media, growing awareness one community at a time.',
    photo: '/boardmembers/abigailsondirectorofpublicity.png',
    photoHeight: 270, photoExpandedHeight: 450,
    color: '#a855f7',
    glow: 'rgba(168,85,247,0.5)',
    dark: '#0d0018',
    number: '03',
  },
  {
    id: 'pub-katelyn',
    name: 'Katelyn Jun',
    role: 'Director of Publicity',
    bio: 'Builds creative campaigns and community partnerships that carry the CurioCrate story further.',
    photo: '/boardmembers/katelynjundop.png',
    photoHeight: 270, photoExpandedHeight: 450,
    color: '#a855f7',
    glow: 'rgba(168,85,247,0.5)',
    dark: '#0d0018',
    number: '04',
  },
  {
    id: 'curriculum2',
    name: 'Yashitha Teekaraman',
    role: 'Director of Curriculum',
    bio: 'Crafts engaging, standards-aligned curriculum that turns everyday materials into extraordinary learning experiences.',
    photo: '/boardmembers/yashithateekaramandirectorofcurriculum.png',
    photoHeight: 395, photoExpandedHeight: 560,
    photoOffsetY: -37,
    color: '#2dd4bf',
    glow: 'rgba(45,212,191,0.5)',
    dark: '#00120f',
    number: '05',
  },
  {
    id: 'curriculum3',
    name: 'Kayla Oh',
    role: 'Director of Curriculum',
    bio: 'Designs hands-on curriculum that turns big scientific ideas into lessons kids can touch, test, and explore.',
    photo: '/boardmembers/kaylaohdoc.png',
    photoHeight: 270, photoExpandedHeight: 450,
    color: '#2dd4bf',
    glow: 'rgba(45,212,191,0.5)',
    dark: '#00120f',
    number: '06',
  },
  {
    id: 'fundraising',
    name: 'Yash Grover',
    role: 'Director of Fundraising',
    bio: 'Drives the strategy and partnerships behind CurioCrate\'s fundraising, turning generosity into more kits in more hands.',
    photo: '/boardmembers/yashgroverdof.png',
    photoHeight: 270, photoExpandedHeight: 450,
    emoji: '💰',
    color: '#facc15',
    glow: 'rgba(250,204,21,0.5)',
    dark: '#170f00',
    number: '07',
  },
].map(m => ({ ...m, ns: 'directors' }))

const productOfficers = [
  {
    id: 'po2',
    name: 'Timothy Cho',
    role: 'Product Officer',
    bio: 'Partners with directors and the executive cabinet to prioritize features and keep every kit release on track.',
    photo: '/boardmembers/timothychoPO.png',
    photoHeight: 270, photoExpandedHeight: 450,
    emoji: '🧩',
    color: '#fda4af',
    glow: 'rgba(253,164,175,0.5)',
    dark: '#160006',
    number: '08',
  },
  {
    id: 'po3',
    name: 'Amine Abadli',
    role: 'Product Officer',
    bio: 'Partners with directors and the executive cabinet to prioritize features and keep every kit release on track.',
    photo: '/boardmembers/amineabadlipo.png',
    photoHeight: 270, photoExpandedHeight: 450,
    emoji: '🧩',
    color: '#fda4af',
    glow: 'rgba(253,164,175,0.5)',
    dark: '#160006',
    number: '09',
  },
].map(m => ({ ...m, ns: 'productOfficers' }))

const departmentHeads = [
  {
    id: 'head-curriculum',
    name: 'Sourish Mehta',
    shortName: 'Curriculum',
    role: 'Head of Curriculum',
    bio: 'Sets the vision for CurioCrate\'s curriculum department, guiding a rigorous yet joyful approach that makes complex science concepts feel natural and exciting.',
    photo: '/boardmembers/sourishmehtadirectorofcurriculum.png',
    photoHeight: 250, photoExpandedHeight: 430,
    color: '#2dd4bf',
    glow: 'rgba(45,212,191,0.5)',
    dark: '#00120f',
    number: '01',
  },
  {
    id: 'head-marketing',
    name: 'Chloe Koo & Keily Huang',
    shortName: 'Marketing',
    role: 'Co-Heads of Marketing',
    bio: 'Co-lead CurioCrate\'s marketing department, shaping the campaigns and storytelling that connect the mission to communities far and wide.',
    coHeads: [
      { name: 'Chloe Koo', photo: '/boardmembers/chloekoodirectorofcurriculum.png' },
      { name: 'Keily Huang', photo: '/boardmembers/keilybyunmarketinghead.png' },
    ],
    photoHeight: 330, photoExpandedHeight: 520,
    photoOffsetY: -44,
    color: '#e879f9',
    glow: 'rgba(232,121,249,0.5)',
    dark: '#170018',
    number: '02',
  },
  {
    id: 'head-chapter-development',
    name: 'Ella Park',
    shortName: 'Chapter Development',
    role: 'Head of Chapter Development',
    bio: 'Leads CurioCrate\'s chapter development, supporting student leaders as they launch and grow chapters in their communities.',
    photo: '/boardmembers/ellaparkchapterdevofficer.png',
    photoHeight: 270, photoExpandedHeight: 450,
    color: '#60a5fa',
    glow: 'rgba(96,165,250,0.5)',
    dark: '#000f1a',
    number: '03',
  },
  {
    id: 'head-operations',
    name: 'Pragya Jain',
    shortName: 'Operations',
    role: 'Head of Operations',
    bio: 'Leads CurioCrate\'s operations department, keeping every program moving smoothly from planning through execution.',
    photo: '/boardmembers/pragyajaindirectorofoperations.png',
    photoHeight: 250, photoExpandedHeight: 430,
    color: '#fb923c',
    glow: 'rgba(251,146,60,0.5)',
    dark: '#170900',
    number: '04',
  },
  {
    id: 'head-product',
    name: 'Cristobal Sanchez',
    shortName: 'Product',
    role: 'Head of Product Development',
    bio: 'Shapes the roadmap for CurioCrate\'s kits and tools, working closely with the team to turn ideas into products students love.',
    photo: '/boardmembers/cristobalsanchezPO.png',
    photoHeight: 270, photoExpandedHeight: 450,
    color: '#fda4af',
    glow: 'rgba(253,164,175,0.5)',
    dark: '#160006',
    number: '05',
  },
].map(m => ({ ...m, ns: 'departmentHeads' }))

// ─── MOBILE MEMBER CARD (lightweight — no filters/animations, safe for mobile) ─
function MobileMemberCard({ photo, coHeads, glow, dark, color, emoji, role, name, bio }) {
  return (
    <div style={{
      borderRadius: 16, overflow: 'hidden',
      background: dark,
      border: `1px solid ${color}22`,
      padding: '20px 20px',
      display: 'flex', alignItems: 'center', gap: 20,
      boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${color}0a`,
    }}>
      {coHeads ? (
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          {coHeads.map((c) => (
            <img key={c.name} src={c.photo} alt={c.name} style={{
              height: 104, width: 60, objectFit: 'contain', objectPosition: 'top',
              filter: `drop-shadow(0 0 12px ${glow.replace('0.5','0.4')})`,
            }} />
          ))}
        </div>
      ) : photo ? (
        <img src={photo} alt={name} style={{
          height: 104, width: 84, objectFit: 'contain', objectPosition: 'top',
          flexShrink: 0,
          filter: `drop-shadow(0 0 12px ${glow.replace('0.5','0.4')})`,
        }} />
      ) : (
        <div style={{
          width: 72, height: 72, borderRadius: '50%', flexShrink: 0,
          background: `radial-gradient(circle, ${glow.replace('0.5','0.3')} 0%, ${dark} 70%)`,
          border: `1px solid ${color}33`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
        }}>{emoji}</div>
      )}
      <div>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 8,
          letterSpacing: '2px', textTransform: 'uppercase', color, marginBottom: 6,
        }}>{role}</div>
        <div style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 22, fontWeight: 300, color: 'var(--cream)', lineHeight: 1.1, marginBottom: 7,
        }}>{name}</div>
        <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.65 }}>{bio}</p>
      </div>
    </div>
  )
}

// ─── PANEL STAGE (reusable for Cabinet + Directors) ───────────────────────────
function PanelStage({ members, height = 580, expandFlex = 3.5, groupBreakAfter = null }) {
  const [active, setActive] = useState(null)
  const [hovered, setHovered] = useState(null)
  const focus = hovered ?? active
  const isMobile = useMobile()
  const { t } = useLanguage()

  if (isMobile) {
    return (
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {members.map((m) => (
          <MobileMemberCard
            key={m.id}
            photo={m.photo} coHeads={m.coHeads} glow={m.glow} dark={m.dark} color={m.color} emoji={m.emoji}
            role={t(`team.${m.ns}.${m.id}.role`, m.role)}
            name={m.name}
            bio={t(`team.${m.ns}.${m.id}.bio`, m.bio)}
          />
        ))}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity:0, y:40 }}
      whileInView={{ opacity:1, y:0 }}
      viewport={{ once:true }}
      transition={{ duration:0.9, ease:[0.4,0,0.2,1] }}
      style={{
        display:'flex',
        height,
        margin:'0 40px',
        borderRadius:20,
        overflow:'hidden',
        border:'1px solid rgba(168,212,240,0.07)',
        boxShadow:'0 40px 120px rgba(0,0,0,0.6)',
      }}
    >
      {members.map((m, i) => {
        const isActive = focus === i
        return (
          <motion.div
            key={m.id}
            animate={{ flex: isActive ? expandFlex : 1 }}
            transition={{ duration:0.55, ease:[0.4,0,0.2,1] }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => setActive(active === i ? null : i)}
            style={{
              position:'relative', overflow:'hidden', cursor:'pointer',
              background: m.dark,
              flexShrink:0,
              borderRight: i < members.length-1 ? '1px solid rgba(168,212,240,0.06)' : 'none',
              marginRight: i === groupBreakAfter ? 20 : 0,
            }}
          >
            {/* Grid texture */}
            <div style={{
              position:'absolute', inset:0, zIndex:0,
              backgroundImage:`linear-gradient(${m.color}07 1px, transparent 1px), linear-gradient(90deg, ${m.color}07 1px, transparent 1px)`,
              backgroundSize:'32px 32px',
              opacity: isActive ? 1 : 0.4, transition:'opacity 0.5s',
            }}/>

            {/* Bottom glow */}
            <motion.div
              animate={{ opacity: isActive ? 1 : 0.3, scale: isActive ? 1.3 : 1 }}
              transition={{ duration:0.5 }}
              style={{
                position:'absolute', bottom:-60, left:'50%', transform:'translateX(-50%)',
                width:280, height:280, borderRadius:'50%',
                background:`radial-gradient(circle, ${m.glow.replace('0.5','0.22')} 0%, transparent 70%)`,
                pointerEvents:'none', zIndex:0,
              }}
            />

            {/* Number watermark */}
            <div style={{
              position:'absolute', top:16, right:16,
              fontFamily:"'Cormorant Garamond', serif",
              fontSize:100, fontWeight:300, lineHeight:1,
              color:m.color, opacity: isActive ? 0.09 : 0.04,
              transition:'opacity 0.5s', userSelect:'none', zIndex:0,
            }}>
              {m.number}
            </div>

            {/* Photo / emoji */}
            <div style={{
              position:'absolute', top:'50%', left:'50%',
              transform:`translate(-50%, ${m.photoOffsetY ?? -58}%) translateY(35px)`, zIndex:1,
            }}>
              {m.coHeads ? (
                <div style={{ display:'flex', gap:10, alignItems:'flex-end', justifyContent:'center' }}>
                  {m.coHeads.map((c) => (
                    <motion.img
                      key={c.name}
                      src={c.photo} alt={c.name}
                      animate={{ scale: isActive ? 1.04 : 1 }}
                      transition={{ duration:0.5 }}
                      style={{
                        height: isActive ? (c.photoExpandedHeight ?? m.photoExpandedHeight ?? 430) : (c.photoHeight ?? m.photoHeight ?? 230),
                        transition:'height 0.55s cubic-bezier(0.4,0,0.2,1)',
                        objectFit:'contain', objectPosition:'top center',
                        filter:`drop-shadow(0 0 28px ${m.glow})`,
                        display:'block',
                      }}
                    />
                  ))}
                </div>
              ) : m.photo ? (
                <motion.img
                  src={m.photo} alt={m.name}
                  animate={{ scale: isActive ? 1.04 : 1 }}
                  transition={{ duration:0.5 }}
                  style={{
                    height: isActive ? (m.photoExpandedHeight ?? 430) : (m.photoHeight ?? 230),
                    transition:'height 0.55s cubic-bezier(0.4,0,0.2,1)',
                    objectFit:'contain', objectPosition:'top center',
                    filter:`drop-shadow(0 0 28px ${m.glow})`,
                    display:'block',
                  }}
                />
              ) : (
                <motion.div
                  animate={{ scale: isActive ? 1.1 : 1 }}
                  transition={{ duration:0.5 }}
                  style={{
                    width: isActive ? 160 : 90,
                    height: isActive ? 160 : 90,
                    transition:'width 0.55s cubic-bezier(0.4,0,0.2,1), height 0.55s cubic-bezier(0.4,0,0.2,1)',
                    borderRadius:'50%',
                    background:`radial-gradient(circle, ${m.glow.replace('0.5','0.35')} 0%, ${m.dark} 70%)`,
                    border:`1px solid ${m.color}33`,
                    boxShadow:`0 0 60px ${m.glow}, 0 0 100px ${m.glow.replace('0.5','0.15')}`,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize: isActive ? 64 : 36,
                  }}
                >
                  {m.emoji}
                </motion.div>
              )}
            </div>

            {/* Bottom overlay */}
            <div style={{
              position:'absolute', bottom:0, left:0, right:0, zIndex:3,
              background:`linear-gradient(to top, ${m.dark}f8 0%, ${m.dark}90 50%, transparent 100%)`,
              padding:'56px 24px 24px',
            }}>
              <AnimatePresence mode="wait">
                {!isActive ? (
                  <motion.div key="collapsed"
                    initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                    transition={{ duration:0.22 }}
                    style={{ textAlign:'center' }}
                  >
                    <div className="label" style={{ color:m.color, fontSize:8, marginBottom:6, opacity:0.6 }}>
                      {m.number}
                    </div>
                    <div style={{
                      fontFamily:"'Cormorant Garamond', serif",
                      fontSize:14, fontWeight:300, color:'var(--cream)', opacity:0.65,
                      writingMode:'vertical-rl', textOrientation:'mixed',
                      transform:'rotate(180deg)', margin:'0 auto', letterSpacing:'0.05em',
                    }}>
                      {m.shortName ? t(`team.${m.ns}.${m.id}.shortName`, m.shortName) : m.name}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="expanded"
                    initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:8 }}
                    transition={{ duration:0.32, delay:0.08 }}
                  >
                    <div className="label" style={{ color:m.color, fontSize:10, marginBottom:8, display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:18, height:1, background:m.color }}/>
                      {t(`team.${m.ns}.${m.id}.role`, m.role)}
                    </div>
                    <h2 style={{
                      fontFamily:"'Cormorant Garamond', serif",
                      fontSize:'clamp(22px, 2.2vw, 36px)',
                      fontWeight:300, color:'var(--cream)',
                      lineHeight:1.05, marginBottom:10,
                      textShadow:`0 0 30px ${m.glow}`,
                    }}>
                      {m.name}
                    </h2>
                    <p style={{
                      fontSize:13, color:'var(--muted)', lineHeight:1.7,
                      marginBottom:18, maxWidth:340,
                    }}>
                      {t(`team.${m.ns}.${m.id}.bio`, m.bio)}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Top accent line */}
            <motion.div
              animate={{ scaleX: isActive ? 1 : 0, opacity: isActive ? 1 : 0 }}
              transition={{ duration:0.38 }}
              style={{
                position:'absolute', top:0, left:0, right:0, height:2,
                background:`linear-gradient(to right, transparent, ${m.color}, transparent)`,
                transformOrigin:'center', zIndex:4,
              }}
            />
          </motion.div>
        )
      })}
    </motion.div>
  )
}

// ─── SECTION HEADING ─────────────────────────────────────────────────────────
function SectionHeading({ label, title, italic, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity:0, y:20 }}
      whileInView={{ opacity:1, y:0 }}
      viewport={{ once:true }}
      transition={{ duration:0.8, delay, ease:[0.4,0,0.2,1] }}
      style={{ textAlign:'center', marginBottom:36 }}
    >
      <div className="label" style={{ marginBottom:12 }}>{label}</div>
      <h2 style={{
        fontFamily:"'Cormorant Garamond', serif",
        fontSize:'clamp(30px,4vw,50px)',
        fontWeight:300, color:'var(--cream)', lineHeight:1.1,
      }}>
        {title}<br/>
        <em style={{ color:'var(--pastel1)', fontStyle:'italic' }}>{italic}</em>
      </h2>
    </motion.div>
  )
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function Team() {
  const { t } = useLanguage()
  const isMobile = useMobile()
  return (
    <PageTransition>
      <div style={{ minHeight:'100vh', position:'relative', zIndex:1 }}>

        {/* ── PAGE HEADER ── */}
        <div className="team-header" style={{ padding:'120px 56px 64px', textAlign:'center' }}>
          <motion.div
            initial={{ opacity:0, y:24 }}
            animate={{ opacity:1, y:0 }}
            transition={{ duration:0.8 }}
          >
            <div className="label" style={{ marginBottom:14 }}>{t('team.header.eyebrow')}</div>
            <h1 style={{
              fontFamily:"'Cormorant Garamond', serif",
              fontSize:'clamp(44px, 6vw, 80px)',
              fontWeight:300, color:'var(--cream)',
              lineHeight:1.05, letterSpacing:'-0.02em', marginBottom:14,
            }}>
              {t('team.header.title')}<br/>
              <em style={{ color:'var(--pastel1)', fontStyle:'italic' }}>{t('team.header.titleItalic')}</em>
            </h1>
            <p style={{
              fontFamily:"'Cormorant Garamond', serif",
              fontStyle:'italic', fontSize:18,
              color:'var(--pastel1)', opacity:0.7,
            }}>
              {t('team.header.quote')}
            </p>
          </motion.div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            DIRECTORS
        ══════════════════════════════════════════════════════════════════════ */}
        <div style={{ padding:'72px 0 20px' }}>
          <SectionHeading
            label={t('team.sections.directors.label')}
            title={t('team.sections.directors.title')}
            italic={t('team.sections.directors.italic')}
          />
          <div className="team-directors-row" style={{ display:'flex', margin:'0 40px 12px' }}>
            <div style={{ flex: directors.length }} />
            <div style={{ flex: productOfficers.length, textAlign:'center' }}>
              <span className="label" style={{ fontSize:9, opacity:0.5 }}>{t('team.sections.directors.productLeadership')}</span>
            </div>
          </div>
          <PanelStage members={[...directors, ...productOfficers]} height={620} expandFlex={2.8} groupBreakAfter={directors.length - 1} />
          <div style={{ textAlign:'center', marginTop:18, marginBottom:0 }}>
            <span className="label" style={{ fontSize:9, opacity:0.3 }}>
              {t('team.hoverHint')}
            </span>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            DEPARTMENT HEADS
        ══════════════════════════════════════════════════════════════════════ */}
        <div style={{ padding:'72px 0 20px' }}>
          <SectionHeading
            label={t('team.sections.departmentHeads.label')}
            title={t('team.sections.departmentHeads.title')}
            italic={t('team.sections.departmentHeads.italic')}
          />
          <PanelStage members={departmentHeads} height={640} expandFlex={2.6} />
          <div style={{ textAlign:'center', marginTop:18, marginBottom:0 }}>
            <span className="label" style={{ fontSize:9, opacity:0.3 }}>
              {t('team.hoverHint')}
            </span>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            EXECUTIVE CABINET
        ══════════════════════════════════════════════════════════════════════ */}
        <div style={{ padding:'72px 0 20px' }}>
          <SectionHeading
            label={t('team.sections.cabinet.label')}
            title={t('team.sections.cabinet.title')}
            italic={t('team.sections.cabinet.italic')}
          />
          <PanelStage members={cabinet} height={660} expandFlex={3.5} />
          <div style={{ textAlign:'center', marginTop:18, marginBottom:0 }}>
            <span className="label" style={{ fontSize:9, opacity:0.3 }}>
              {t('team.hoverHint')}
            </span>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            FOUNDER SPOTLIGHT: Chief Executive Founder
            Mobile gets the same lightweight card format as the other panels —
            the full cinematic version's stacked filters/infinite animations
            were heavy enough to freeze/crash mobile browsers on scroll.

            Visibility is gated on SHOW_FOUNDER_CARD (top of file) so it can be
            hidden/shown with a one-line flip.
        ══════════════════════════════════════════════════════════════════════ */}
        {SHOW_FOUNDER_CARD && (isMobile ? (
          <div style={{ padding: '40px 20px 20px' }}>
            <MobileMemberCard
              photo="/boardmembers/jeongseopyoonchiefexecutivefounder.png"
              glow="rgba(103,232,249,0.5)"
              dark="#00080e"
              color="#67e8f9"
              role={t('team.founder.roleLabel')}
              name="Jeongseop Yoon"
              bio={t('team.founder.bio')}
            />
          </div>
        ) : (
        <motion.div
          initial={{ opacity:0 }}
          whileInView={{ opacity:1 }}
          viewport={{ once:true }}
          transition={{ duration:1.2, ease:[0.4,0,0.2,1] }}
          className="team-founder"
          style={{
            position:'relative',
            margin:'72px 40px 20px',
            borderRadius:24,
            overflow:'hidden',
            border:'1px solid rgba(103,232,249,0.18)',
            boxShadow:'0 0 80px rgba(103,232,249,0.08), 0 60px 160px rgba(0,0,0,0.7)',
            minHeight:'88vh',
            display:'flex',
            flexDirection:'column',
            justifyContent:'flex-end',
            background:'#00080e',
          }}
        >
          {/* ── Atmosphere ── */}
          <div style={{
            position:'absolute', inset:0,
            background:'radial-gradient(ellipse 65% 90% at 50% 30%, rgba(103,232,249,0.1) 0%, rgba(0,8,14,0.6) 55%, #00080e 100%)',
          }}/>
          <div style={{
            position:'absolute', inset:0,
            backgroundImage:'linear-gradient(rgba(103,232,249,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(103,232,249,0.05) 1px, transparent 1px)',
            backgroundSize:'44px 44px',
          }}/>

          {/* Scanline */}
          <div style={{ position:'absolute', inset:0, zIndex:1, pointerEvents:'none', overflow:'hidden' }}>
            <div style={{
              position:'absolute', left:0, right:0, height:'1px',
              background:'linear-gradient(90deg, transparent, rgba(103,232,249,0.07), transparent)',
              animation:'scanline 10s linear infinite',
            }}/>
          </div>

          {/* "00" giant watermark */}
          <div style={{
            position:'absolute', bottom:-80, right:-20,
            fontFamily:"'Cormorant Garamond', serif",
            fontSize:'clamp(280px, 35vw, 480px)',
            fontWeight:300, lineHeight:1,
            color:'#67e8f9', opacity:0.028,
            userSelect:'none', pointerEvents:'none', zIndex:0,
          }}>
            00
          </div>

          {/* ── Eyebrow ── */}
          <motion.div
            initial={{ opacity:0, y:-10 }}
            whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true }}
            transition={{ delay:0.3, duration:1 }}
            style={{
              position:'absolute', top:44, left:0, right:0,
              textAlign:'center', zIndex:4,
            }}
          >
            <div className="label" style={{
              fontSize:10, letterSpacing:'8px',
              color:'#67e8f9', opacity:0.65,
            }}>
              ◈ &nbsp; {t('team.founder.eyebrow')} &nbsp; ◈
            </div>
          </motion.div>

          {/* ── Portrait ── */}
          <motion.div
            initial={{ opacity:0, scale:0.88, filter:'blur(20px)' }}
            whileInView={{ opacity:1, scale:1, filter:'blur(0px)' }}
            viewport={{ once:true }}
            transition={{ duration:1.4, ease:[0.4,0,0.2,1], delay:0.1 }}
            style={{
              position:'absolute',
              bottom:0, left:'50%', transform:'translateX(-50%)',
              zIndex:2, pointerEvents:'none',
              display:'flex', alignItems:'flex-end', justifyContent:'center',
            }}
          >
            <div style={{
              position:'absolute', bottom:0, left:'50%', transform:'translateX(-50%)',
              width:'clamp(300px, 40vw, 560px)', height:'clamp(300px, 40vw, 560px)',
              borderRadius:'50%',
              background:'radial-gradient(circle, rgba(103,232,249,0.18) 0%, transparent 65%)',
              animation:'breathe 5s ease-in-out infinite',
              filter:'blur(20px)',
            }}/>
            <img
              src="/boardmembers/jeongseopyoonchiefexecutivefounder.png"
              alt="Jeongseop Yoon"
              style={{
                height:'clamp(460px, 66vh, 740px)',
                objectFit:'contain', objectPosition:'bottom',
                filter:'drop-shadow(0 0 50px rgba(103,232,249,0.65)) drop-shadow(0 0 120px rgba(103,232,249,0.3)) drop-shadow(0 0 200px rgba(103,232,249,0.12))',
                display:'block',
                animation:'drift 7s ease-in-out infinite',
              }}
            />
          </motion.div>

          {/* ── Bottom text overlay ── */}
          <div style={{
            position:'relative', zIndex:5,
            padding:'120px 64px 56px',
            background:'linear-gradient(to top, #00080e 0%, rgba(0,8,14,0.92) 35%, rgba(0,8,14,0.5) 65%, transparent 100%)',
          }}>
            <div style={{
              display:'flex', alignItems:'flex-end',
              justifyContent:'space-between', flexWrap:'wrap', gap:40,
            }}>
              <motion.div
                initial={{ opacity:0, x:-24 }}
                whileInView={{ opacity:1, x:0 }}
                viewport={{ once:true }}
                transition={{ delay:0.5, duration:0.9, ease:[0.4,0,0.2,1] }}
              >
                <h2 style={{
                  fontFamily:"'Cormorant Garamond', serif",
                  fontSize:'clamp(56px, 9vw, 116px)',
                  fontWeight:300, color:'var(--cream)',
                  lineHeight:0.92, letterSpacing:'-0.03em',
                  marginBottom:20,
                  textShadow:'0 0 80px rgba(103,232,249,0.5), 0 0 160px rgba(103,232,249,0.2)',
                }}>
                  Jeongseop<br/>Yoon
                </h2>
                <div style={{ display:'flex', alignItems:'center', gap:16 }}>
                  <div style={{ width:32, height:1, background:'linear-gradient(to right, #67e8f9, transparent)' }}/>
                  <div className="label" style={{ color:'#67e8f9', fontSize:11, letterSpacing:'4px' }}>
                    {t('team.founder.roleLabel')}
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity:0, x:24 }}
                whileInView={{ opacity:1, x:0 }}
                viewport={{ once:true }}
                transition={{ delay:0.65, duration:0.9, ease:[0.4,0,0.2,1] }}
                style={{ maxWidth:400 }}
              >
                <p style={{
                  fontFamily:"'Cormorant Garamond', serif",
                  fontStyle:'italic',
                  fontSize:'clamp(16px, 1.6vw, 20px)',
                  color:'var(--muted)', lineHeight:1.8,
                  marginBottom:32, opacity:0.85,
                }}>
                  {t('team.founder.bio')}
                </p>
                <a
                  href="mailto:josephyoon25@curiocrate.org"
                  style={{
                    fontFamily:"'JetBrains Mono', monospace",
                    fontSize:11, letterSpacing:'3px', textTransform:'uppercase',
                    textDecoration:'none', padding:'13px 28px',
                    border:'1px solid rgba(103,232,249,0.4)', borderRadius:4,
                    color:'#67e8f9', background:'rgba(103,232,249,0.06)',
                    display:'inline-block', transition:'all 0.35s ease',
                  }}
                  onMouseEnter={e=>{ e.currentTarget.style.background='rgba(103,232,249,0.14)'; e.currentTarget.style.boxShadow='0 0 36px rgba(103,232,249,0.25)'; e.currentTarget.style.borderColor='rgba(103,232,249,0.7)' }}
                  onMouseLeave={e=>{ e.currentTarget.style.background='rgba(103,232,249,0.06)'; e.currentTarget.style.boxShadow='none'; e.currentTarget.style.borderColor='rgba(103,232,249,0.4)' }}
                >
                  ✉ &nbsp; {t('team.founder.cta')}
                </a>
              </motion.div>
            </div>
          </div>

          <motion.div
            initial={{ scaleX:0 }}
            whileInView={{ scaleX:1 }}
            viewport={{ once:true }}
            transition={{ delay:0.2, duration:1.2, ease:[0.4,0,0.2,1] }}
            style={{
              position:'absolute', top:0, left:0, right:0, height:2,
              background:'linear-gradient(to right, transparent, rgba(103,232,249,0.6), rgba(103,232,249,0.9), rgba(103,232,249,0.6), transparent)',
              transformOrigin:'center', zIndex:6,
            }}
          />
        </motion.div>
        ))}

        {/* ══════════════════════════════════════════════════════════════════════
            JOIN CTA
        ══════════════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity:0, y:30 }}
          whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true }}
          transition={{ duration:0.9 }}
          className="team-join-cta"
          style={{
            margin:'72px 40px 100px', textAlign:'center',
            padding:'64px 40px',
            border:'1px solid rgba(168,212,240,0.09)',
            borderRadius:20,
            background:'rgba(8,16,40,0.5)', backdropFilter:'blur(20px)',
          }}
        >
          <img src="/images/mascot1.png" alt=""
            style={{ height:72, marginBottom:24, filter:'drop-shadow(0 0 20px rgba(168,212,240,0.4))', animation:'drift 5s ease-in-out infinite' }}
          />
          <h3 style={{
            fontFamily:"'Cormorant Garamond', serif", fontSize:36,
            fontWeight:300, color:'var(--cream)', marginBottom:12,
          }}>
            {t('team.join.title')}
          </h3>
          <p style={{
            color:'var(--muted)', fontSize:15,
            maxWidth:400, margin:'0 auto 32px', lineHeight:1.7,
          }}>
            {t('team.join.description')}
          </p>
          <a href="mailto:josephyoon25@curiocrate.org" style={{
            fontFamily:"'JetBrains Mono', monospace",
            fontSize:11, letterSpacing:'3px', textTransform:'uppercase',
            textDecoration:'none', padding:'14px 34px',
            border:'1px solid rgba(168,212,240,0.28)', borderRadius:4,
            color:'var(--pastel1)', transition:'all 0.3s',
          }}
          onMouseEnter={e=>{ e.currentTarget.style.background='rgba(168,212,240,0.07)'; e.currentTarget.style.boxShadow='0 0 28px rgba(168,212,240,0.12)' }}
          onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.boxShadow='none' }}
          >
            {t('team.join.cta')} →
          </a>
        </motion.div>

      </div>

      <style>{`
        @media(max-width:768px){
          .team-header  { padding: 96px 20px 48px !important; }
          .team-join-cta { margin: 40px 20px 72px !important; padding: 40px 24px !important; }
          .team-directors-row { flex-direction: column !important; margin-left: 0 !important; margin-right: 0 !important; }
        }
      `}</style>

    </PageTransition>
  )
}
