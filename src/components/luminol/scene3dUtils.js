import * as THREE from 'three'

export const GLOW_COLOR = new THREE.Color('#46e3d3')
export const damp = THREE.MathUtils.damp

export function makeTexture(w, h, draw) {
  const c = document.createElement('canvas')
  c.width = w; c.height = h
  draw(c.getContext('2d'), w, h)
  const tx = new THREE.CanvasTexture(c)
  tx.colorSpace = THREE.SRGBColorSpace
  tx.anisotropy = 4
  return tx
}

// Deterministic pseudo-random so props land in the same place every render.
export function rng(seed) {
  let s = seed
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646 }
}
