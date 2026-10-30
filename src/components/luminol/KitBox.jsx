/**
 * Illustrated concept render of the Luminol kit box (no real product photo exists yet —
 * always shown with a "Concept render" tag by the caller). Pure CSS so the lid can hinge
 * open in 3D; `open` drives the lid and the glow spilling out.
 */
export default function KitBox({ open = false, width = 360, label }) {
  const h = width * 0.62
  return (
    <div
      role="img"
      aria-label={label}
      style={{ width: '100%', maxWidth: width, aspectRatio: `${width} / ${h + width * 0.2}`, position: 'relative', perspective: 900 }}
    >
      {/* floor glow */}
      <div aria-hidden style={{
        position: 'absolute', left: '-15%', right: '-15%', bottom: '-6%', height: '45%',
        background: 'radial-gradient(ellipse at center, rgba(70,227,211,0.32) 0%, rgba(70,227,211,0) 70%)',
        filter: 'blur(8px)', opacity: open ? 1 : 0.55, transition: 'opacity 1.2s ease',
      }} />
      {/* light spilling up out of the box */}
      <div aria-hidden style={{
        position: 'absolute', left: '8%', right: '8%', top: '-20%', height: '70%',
        background: 'radial-gradient(ellipse at 50% 100%, rgba(140,255,240,0.55) 0%, rgba(70,227,211,0.18) 40%, rgba(70,227,211,0) 72%)',
        filter: 'blur(6px)', opacity: open ? 1 : 0, transition: 'opacity 1.1s ease .35s',
      }} />

      {/* body */}
      <div aria-hidden style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, height: `${(h / (h + width * 0.2)) * 100}%`,
        borderRadius: 10,
        background: 'linear-gradient(180deg, #0f3134 0%, #0a2427 60%, #071a1c 100%)',
        border: '1px solid rgba(70,227,211,0.35)',
        boxShadow: '0 30px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {/* manila case-file label */}
        <div style={{
          width: '68%', padding: '5% 6%', borderRadius: 4,
          background: 'var(--lum-paper)', color: 'var(--lum-paper-ink)',
          boxShadow: '0 4px 14px rgba(0,0,0,0.35)', transform: 'rotate(-1.5deg)',
        }}>
          <div style={{ fontFamily: 'var(--lum-mono)', fontSize: 'clamp(7px, 1.9vw, 9px)', letterSpacing: 2, opacity: 0.7 }}>CURIOCRATE · C-CRATE STEM KIT</div>
          <div style={{ fontFamily: 'var(--lum-display)', fontWeight: 700, fontSize: 'clamp(18px, 6vw, 30px)', lineHeight: 1, margin: '6px 0 4px', letterSpacing: 0.5 }}>LUMINOL</div>
          <div style={{ fontFamily: 'var(--lum-display)', fontWeight: 600, fontSize: 'clamp(10px, 3vw, 14px)', letterSpacing: 1 }}>FORENSIC CHEMISTRY · CASE LMN-2026</div>
        </div>
      </div>

      {/* lid — hinged at its back edge */}
      <div aria-hidden style={{
        position: 'absolute', left: '-1%', right: '-1%',
        bottom: `${(h / (h + width * 0.2)) * 100 - 2}%`,
        height: '15%',
        transformOrigin: '0% 100%',
        transform: open ? 'translateY(-12%) rotate(-13deg)' : 'none',
        transition: 'transform 1.1s cubic-bezier(.3,.7,.2,1)',
        borderRadius: 8,
        background: 'linear-gradient(180deg, #164246 0%, #0e3033 100%)',
        border: '1px solid rgba(70,227,211,0.4)',
        boxShadow: '0 6px 18px rgba(0,0,0,0.45)',
      }} />
    </div>
  )
}
