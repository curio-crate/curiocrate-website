// The six sample vials from the manual (Case LMN-2026). Vials 1–5 are a 10× serial dilution;
// Vial 6 is a blank (water only) and must never glow.
export const DILUTIONS = ['1:100', '1:1,000', '1:10,000', '1:100,000', '1:1,000,000', null]
// "1 in N" denominators for vials 1–5, used to report a detection limit.
export const LIMIT_DENOMS = [100, 1000, 10000, 100000, 1000000]

// Relative glow per vial (0–1): vivid, bright, faint, barely visible, essentially nothing, nothing.
export const GLOW = [1, 0.66, 0.34, 0.11, 0.025, 0]
// If the viewer didn't let their eyes adjust, the faint end drops off much harder.
export const GLOW_RUSHED = [0.92, 0.5, 0.12, 0.02, 0, 0]
