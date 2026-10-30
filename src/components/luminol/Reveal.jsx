import { useEffect, useRef, useState } from 'react'

/**
 * Fade/rise-in on scroll that fails OPEN. State starts as "idle" (fully visible); the element
 * is only hidden after IntersectionObserver has actually reported it off-screen, and shown
 * again once it intersects. If the observer never fires (backgrounded tab, throttled rAF —
 * see the Kits-page useInView incident in CLAUDE.md), content simply stays visible.
 *
 * `children` may be a function receiving `shown` (true once revealed or if never hidden),
 * for things like the kit box that animate open on reveal.
 */
export default function Reveal({ as: Tag = 'div', children, delay = 0, className = '', style, ...rest }) {
  const ref = useRef(null)
  const [state, setState] = useState('idle')

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setState('shown')
        io.disconnect()
      } else {
        setState(s => (s === 'idle' ? 'hidden' : s))
      }
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <Tag
      ref={ref}
      className={`lum-reveal ${className}`}
      data-state={state}
      style={{ transitionDelay: state === 'shown' ? `${delay}ms` : '0ms', ...style }}
      {...rest}
    >
      {typeof children === 'function' ? children(state !== 'hidden') : children}
    </Tag>
  )
}
