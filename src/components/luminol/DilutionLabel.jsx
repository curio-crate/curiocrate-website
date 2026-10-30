import { DILUTIONS } from './glow'

// Full ratio on wide screens, short form (1:10k) on phones so six labels fit side by side.
const SHORT = ['1:100', '1:1k', '1:10k', '1:100k', '1:1M']

export default function DilutionLabel({ i, blank }) {
  if (!DILUTIONS[i]) return blank
  return <><span className="lum-long">{DILUTIONS[i]}</span><span className="lum-short" aria-hidden>{SHORT[i]}</span></>
}
