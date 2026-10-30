import { useId } from 'react'

/**
 * A single sample vial drawn in SVG. `glow` (0–1) controls the luminol light; `lit` false
 * shows the liquid untested and dark.
 */
export default function Vial({ n, glow = 0, lit = false, width = 56, selected = false, dim = false, bloomKey, label }) {
  const uid = useId().replace(/:/g, '')
  const g = lit ? glow : 0
  const h = typeof width === 'number' ? width * 2.6 : undefined
  return (
    <svg
      viewBox="0 0 60 156"
      width={width}
      height={h}
      role="img"
      aria-label={label}
      style={{ overflow: 'visible', display: 'block', height: h ?? 'auto', opacity: dim ? 0.45 : 1, transition: 'opacity .4s' }}
    >
      <defs>
        <radialGradient id={`lg-${uid}`} cx="50%" cy="62%" r="70%">
          <stop offset="0%"  stopColor="#c8fff7" stopOpacity="1" />
          <stop offset="35%" stopColor="#46e3d3" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#0f6f68" stopOpacity="0.6" />
        </radialGradient>
        <filter id={`bl-${uid}`} x="-150%" y="-80%" width="400%" height="260%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
        <clipPath id={`cl-${uid}`}>
          <path d="M14 22 H46 V132 a16 16 0 0 1 -32 0 Z" />
        </clipPath>
      </defs>

      {/* outer halo */}
      <ellipse
        className="lum-vial-glow"
        cx="30" cy="112" rx="30" ry="40"
        fill="#46e3d3" filter={`url(#bl-${uid})`}
        opacity={g * 0.85}
      />

      {/* glass */}
      <path d="M14 22 H46 V132 a16 16 0 0 1 -32 0 Z" fill="rgba(220,245,240,0.05)" />

      <g clipPath={`url(#cl-${uid})`}>
        {/* liquid (always visible, faint teal tint) */}
        <rect x="10" y="74" width="40" height="80" fill="rgba(170,215,210,0.16)" />
        {/* lit liquid */}
        <rect
          className="lum-vial-glow"
          x="10" y="74" width="40" height="80"
          fill={`url(#lg-${uid})`}
          opacity={g}
        />
        {/* meniscus */}
        <ellipse cx="30" cy="74" rx="16" ry="2.6" fill="rgba(230,255,250,0.35)" />
        {/* drop bloom */}
        {bloomKey != null && g > 0 && (
          <circle key={bloomKey} className="lum-bloom" cx="30" cy="96" r="12" fill="#bffaf2" opacity={Math.min(1, g + 0.2)} />
        )}
        {/* glass sheen */}
        <rect x="18" y="26" width="4" height="100" rx="2" fill="rgba(255,255,255,0.16)" />
      </g>

      <path
        d="M14 22 H46 V132 a16 16 0 0 1 -32 0 Z"
        fill="none"
        stroke={selected ? '#46e3d3' : 'rgba(214,238,233,0.55)'}
        strokeWidth={selected ? 2.4 : 1.6}
      />
      {/* cap */}
      <rect x="11" y="8" width="38" height="16" rx="3" fill="#163a3d" stroke="rgba(214,238,233,0.45)" strokeWidth="1.2" />
      {/* number label */}
      <rect x="20" y="40" width="20" height="18" rx="2" fill="#e8d8b0" />
      <text x="30" y="53.5" textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize="12" fontWeight="700" fill="#2b2416">{n}</text>
    </svg>
  )
}
