import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { MeshReflectorMaterial, Html, Sparkles } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'

/*
 * 3D stage for /demo. Two sets, one at a time:
 *   - scene 0: Gallery 3 at night — wet reflective floor, smashed case, sweeping flashlight,
 *     and the mop swirls lighting up blue-green once the glow chemical is introduced.
 *   - scenes 1–4: a lab bench with six glass tubes, a pipette, and luminol glow with bloom.
 * Purely visual + click targets; every interaction also exists as an HTML button in Demo.jsx.
 */

const GLOW_COLOR = new THREE.Color('#46e3d3')
const damp = THREE.MathUtils.damp

function makeTexture(w, h, draw) {
  const c = document.createElement('canvas')
  c.width = w; c.height = h
  draw(c.getContext('2d'), w, h)
  const tx = new THREE.CanvasTexture(c)
  tx.colorSpace = THREE.SRGBColorSpace
  tx.anisotropy = 4
  return tx
}

// Deterministic pseudo-random so the shards land in the same place every render.
function rng(seed) {
  let s = seed
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646 }
}

/* ── Camera rig: eases toward a target position / look-at each frame ──── */
function CameraRig({ pos, look, reduce, wobble = 0 }) {
  const lookNow = useRef(new THREE.Vector3(...look))
  const first = useRef(true)
  useFrame((state, dt) => {
    const { camera } = state
    const t = state.clock.elapsedTime
    const tx = pos[0] + (reduce ? 0 : Math.sin(t * 0.25) * wobble)
    const ty = pos[1] + (reduce ? 0 : Math.sin(t * 0.18) * wobble * 0.25)
    if (first.current || reduce) {
      camera.position.set(tx, ty, pos[2]); lookNow.current.set(...look); first.current = false
    } else {
      camera.position.x = damp(camera.position.x, tx, 2.2, dt)
      camera.position.y = damp(camera.position.y, ty, 2.2, dt)
      camera.position.z = damp(camera.position.z, pos[2], 2.2, dt)
      lookNow.current.x = damp(lookNow.current.x, look[0], 2.6, dt)
      lookNow.current.y = damp(lookNow.current.y, look[1], 2.6, dt)
      lookNow.current.z = damp(lookNow.current.z, look[2], 2.6, dt)
    }
    camera.lookAt(lookNow.current)
  })
  return null
}

/* ── Scene 0: the museum ─────────────────────────────────────────────── */
function Museum({ beat, reduce, mobile }) {
  const spot = useRef()
  // The spotlight's aim point; a plain object passed as the light's target and moved each frame.
  const [aim] = useState(() => new THREE.Object3D())
  const target = useRef(aim)
  const smear = useRef()
  const ambient = useRef()

  const smearTex = useMemo(() => makeTexture(1024, 640, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h)
    ctx.lineCap = 'round'
    ctx.shadowColor = 'white'
    const r = rng(7)
    // wide figure-eight mop strokes, spread thin
    for (let i = 0; i < 16; i++) {
      const y = 70 + i * 34 + r() * 20
      ctx.lineWidth = 26 + r() * 40
      ctx.shadowBlur = 40
      ctx.strokeStyle = `rgba(255,255,255,${0.10 + r() * 0.16})`
      ctx.beginPath()
      ctx.moveTo(40 + r() * 80, y)
      ctx.bezierCurveTo(260, y - 90 + r() * 40, 420, y + 90 - r() * 40, 600, y)
      ctx.bezierCurveTo(760, y - 80, 880, y + 70, 990 - r() * 60, y + (r() - 0.5) * 30)
      ctx.stroke()
    }
    // a denser patch by the staff door side (right)
    for (let i = 0; i < 26; i++) {
      ctx.fillStyle = `rgba(255,255,255,${0.12 + r() * 0.2})`
      ctx.shadowBlur = 18
      ctx.beginPath()
      ctx.arc(820 + r() * 180, 120 + r() * 220, 4 + r() * 14, 0, Math.PI * 2)
      ctx.fill()
    }
  }), [])

  const doorSign = useMemo(() => makeTexture(256, 96, (ctx, w, h) => {
    ctx.fillStyle = '#e8d8b0'; ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#2b2416'; ctx.font = 'bold 54px "Barlow Condensed", Arial Narrow, sans-serif'
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('STAFF', w / 2, h / 2 + 2)
  }), [])
  const gallerySign = useMemo(() => makeTexture(512, 192, (ctx, w, h) => {
    ctx.fillStyle = '#e8d8b0'; ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#2b2416'; ctx.font = 'bold 92px "Barlow Condensed", Arial Narrow, sans-serif'
    ctx.textBaseline = 'middle'; ctx.fillText('GALLERY 3', 28, h / 2 - 14)
    ctx.font = '28px "JetBrains Mono", monospace'; ctx.globalAlpha = 0.7; ctx.fillText('MINERALOGY', 32, h - 34)
  }), [])

  const shards = useMemo(() => {
    const r = rng(42)
    return Array.from({ length: 34 }, () => ({
      pos: [(r() - 0.5) * 4.6, 0.02, -1.4 + (r() - 0.3) * 3.4],
      rot: [-Math.PI / 2 + (r() - 0.5) * 0.3, 0, r() * Math.PI * 2],
      s: 0.06 + r() * 0.16,
    }))
  }, [])

  const reveal = beat >= 2

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    if (target.current) {
      target.current.position.x = reduce ? 0.6 : Math.sin(t * 0.55) * 3.4
      target.current.position.z = reduce ? -1 : -1 + Math.cos(t * 0.35) * 1.4
    }
    if (spot.current) spot.current.intensity = damp(spot.current.intensity, reveal ? 18 : 60, 2, dt)
    if (ambient.current) ambient.current.intensity = damp(ambient.current.intensity, reveal ? 0.04 : 0.16, 2, dt)
    if (smear.current) smear.current.opacity = damp(smear.current.opacity, reveal ? 0.75 : 0, reduce ? 50 : 0.9, dt)
  })

  return (
    <group>
      <ambientLight ref={ambient} intensity={0.16} color="#9fd8d2" />
      <primitive object={aim} position={[0, 0, -1]} />
      <spotLight
        ref={spot} position={[-1.5, 5.5, 4.5]} angle={0.32} penumbra={0.7} intensity={60}
        color="#fff4d6" distance={18} decay={1.6} target={aim}
      />
      <pointLight position={[4.6, 2.6, -4.4]} intensity={2} color="#46e3d3" distance={6} />

      {/* wet floor */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]}>
        <planeGeometry args={[30, 30]} />
        <MeshReflectorMaterial
          blur={[300, 80]} resolution={mobile ? 256 : 768} mixBlur={1} mixStrength={18}
          roughness={0.9} depthScale={1.1} minDepthThreshold={0.4} maxDepthThreshold={1.3}
          color="#0a1f22" metalness={0.55} mirror={0.6}
        />
      </mesh>
      {/* glowing mop swirls (the hidden blood, revealed) */}
      <mesh rotation-x={-Math.PI / 2} position={[0.4, 0.012, -0.6]}>
        <planeGeometry args={[11, 6.8]} />
        <meshBasicMaterial
          ref={smear} map={smearTex} color={GLOW_COLOR} transparent opacity={0}
          blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false}
        />
      </mesh>

      {/* walls */}
      <mesh position={[0, 4, -6]}><planeGeometry args={[30, 8]} /><meshStandardMaterial color="#0b2326" roughness={0.95} /></mesh>
      <mesh position={[-7, 4, 0]} rotation-y={Math.PI / 2}><planeGeometry args={[30, 8]} /><meshStandardMaterial color="#09201f" roughness={0.95} /></mesh>
      <mesh position={[-3.4, 3.1, -5.98]}><planeGeometry args={[2.2, 0.82]} /><meshStandardMaterial map={gallerySign} roughness={0.8} /></mesh>

      {/* pedestal + smashed case */}
      <mesh position={[0, 0.55, -2]}><boxGeometry args={[1.4, 1.1, 1.4]} /><meshStandardMaterial color="#123234" roughness={0.6} /></mesh>
      <mesh position={[0, 1.13, -2]}><cylinderGeometry args={[0.18, 0.22, 0.06, 24]} /><meshStandardMaterial color="#26494c" /></mesh>
      <lineSegments position={[0, 1.66, -2]}>
        <edgesGeometry args={[new THREE.BoxGeometry(1.5, 1.05, 1.5)]} />
        <lineBasicMaterial color="#cfeeea" transparent opacity={0.55} />
      </lineSegments>
      {[[-0.75, 0], [0, -0.75], [0.75, 0]].map(([x, z], i) => (
        <mesh key={i} position={[x, 1.66, -2 + z]} rotation-y={x ? Math.PI / 2 : 0}>
          <planeGeometry args={[1.5, 1.05]} />
          <meshPhysicalMaterial color="#cfeeea" transparent opacity={0.1} roughness={0.05} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      ))}
      {shards.map((s, i) => (
        <mesh key={i} position={s.pos} rotation={s.rot} scale={s.s}>
          <circleGeometry args={[1, 3]} />
          <meshStandardMaterial color="#e6fffb" metalness={0.9} roughness={0.08} transparent opacity={0.8} side={THREE.DoubleSide} />
        </mesh>
      ))}

      {/* staff door */}
      <group position={[4.6, 0, -5.9]}>
        <mesh position={[0, 1.5, 0]}><boxGeometry args={[1.5, 3, 0.12]} /><meshStandardMaterial color="#0f2b2e" roughness={0.7} /></mesh>
        <mesh position={[0, 1.5, 0.04]}><boxGeometry args={[1.66, 3.12, 0.08]} /><meshStandardMaterial color="#1c3d40" roughness={0.6} /></mesh>
        <mesh position={[0, 2.55, 0.1]}><planeGeometry args={[0.8, 0.3]} /><meshStandardMaterial map={doorSign} /></mesh>
        <mesh position={[0.55, 1.4, 0.12]}><sphereGeometry args={[0.05, 12, 12]} /><meshStandardMaterial color="#c8d6d3" metalness={0.9} roughness={0.2} /></mesh>
      </group>

      {/* mop + bucket */}
      <group position={[-2.9, 0, 0.4]}>
        <mesh position={[0, 0.32, 0]}><cylinderGeometry args={[0.38, 0.3, 0.64, 24, 1, true]} /><meshStandardMaterial color="#1f5257" side={THREE.DoubleSide} roughness={0.5} /></mesh>
        <mesh position={[0.45, 1.05, 0.3]} rotation={[0.25, 0, -0.42]}><cylinderGeometry args={[0.025, 0.025, 2.3, 8]} /><meshStandardMaterial color="#a9bfbc" /></mesh>
        <mesh position={[0.95, 0.05, 0.55]} rotation={[0, 0.4, 0]}><boxGeometry args={[0.55, 0.08, 0.22]} /><meshStandardMaterial color="#d6e2df" roughness={1} /></mesh>
      </group>

      {!reduce && <Sparkles count={mobile ? 30 : 70} scale={[9, 4, 7]} position={[0, 2, -1]} size={2.2} speed={0.25} opacity={0.35} color="#e8fffb" />}
    </group>
  )
}

/* ── Scenes 1–4: the lab bench ───────────────────────────────────────── */
const TUBE_R = 0.24
const TUBE_H = 2.3
const LIQUID_H = 1.05

function tubeProfile(r, h, segments = 10) {
  const pts = []
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * (Math.PI / 2)
    pts.push(new THREE.Vector2(Math.sin(a) * r, r - Math.cos(a) * r))
  }
  pts.push(new THREE.Vector2(r, h))
  return pts
}

function tubeLayout(aspect) {
  // Portrait phones: two rows of three so the tubes stay big. Otherwise one row of six.
  if (aspect < 0.9) {
    return Array.from({ length: 6 }, (_, i) => {
      const row = i < 3 ? 0 : 1
      const col = i % 3
      return [(col - 1) * 1.3 + (row === 0 ? -0.33 : 0.33), 0, row === 0 ? 1.0 : -1.0]
    })
  }
  return Array.from({ length: 6 }, (_, i) => [(i - 2.5) * 1.1, 0, 0])
}

function NumberTag({ n, position }) {
  const tex = useMemo(() => makeTexture(128, 128, (ctx, w, h) => {
    ctx.fillStyle = '#e8d8b0'; ctx.fillRect(10, 10, w - 20, h - 20)
    ctx.fillStyle = '#2b2416'; ctx.font = 'bold 84px "Barlow Condensed", Arial Narrow, sans-serif'
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(n), w / 2, h / 2 + 4)
  }), [n])
  return (
    <mesh position={position}>
      <planeGeometry args={[0.3, 0.3]} />
      <meshBasicMaterial map={tex} toneMapped={false} />
    </mesh>
  )
}

function Tube({ i, position, glow, lit, marker, interactive, onTube, hovered, setHovered }) {
  const liquidMat = useRef()
  const light = useRef()
  const group = useRef()
  const glassGeo = useMemo(() => new THREE.LatheGeometry(tubeProfile(TUBE_R, TUBE_H), 40), [])
  const liquidGeo = useMemo(() => {
    const g = new THREE.LatheGeometry(tubeProfile(TUBE_R - 0.035, LIQUID_H), 40)
    return g
  }, [])
  const isHover = hovered === i && interactive
  const litAt = useRef(null)
  useEffect(() => { if (!lit) litAt.current = null }, [lit])

  useFrame((state, dt) => {
    const now = state.clock.elapsedTime
    if (lit && litAt.current == null) litAt.current = now + 0.45 // glow starts when the drop lands
    const target = lit && now >= litAt.current ? glow : 0
    if (liquidMat.current) {
      liquidMat.current.emissiveIntensity = damp(liquidMat.current.emissiveIntensity, target * 5.5, 3, dt)
    }
    if (light.current) light.current.intensity = damp(light.current.intensity, target * 9, 3, dt)
    if (group.current) group.current.position.y = damp(group.current.position.y, isHover ? 0.12 : 0, 8, dt)
  })

  return (
    <group position={position}>
      <group ref={group}>
        {/* liquid */}
        <mesh geometry={liquidGeo} position={[0, 0.05, 0]}>
          <meshStandardMaterial ref={liquidMat} color="#173f3d" emissive={GLOW_COLOR} emissiveIntensity={0} roughness={0.25} toneMapped={false} />
        </mesh>
        {/* liquid top */}
        <mesh position={[0, 0.05 + LIQUID_H, 0]} rotation-x={-Math.PI / 2}>
          <circleGeometry args={[TUBE_R - 0.035, 32]} />
          <meshStandardMaterial color="#2a5754" transparent opacity={0.7} />
        </mesh>
        {/* glass */}
        <mesh geometry={glassGeo} position={[0, 0.05, 0]}>
          <meshPhysicalMaterial
            color="#d9f5f1" transparent opacity={isHover ? 0.32 : 0.2} roughness={0.04} metalness={0}
            clearcoat={1} clearcoatRoughness={0.05} side={THREE.DoubleSide} depthWrite={false}
            emissive={GLOW_COLOR} emissiveIntensity={isHover ? 0.25 : 0}
          />
        </mesh>
        {/* rim */}
        <mesh position={[0, 0.05 + TUBE_H, 0]} rotation-x={Math.PI / 2}>
          <torusGeometry args={[TUBE_R, 0.022, 8, 40]} />
          <meshStandardMaterial color="#e6fbf8" roughness={0.1} />
        </mesh>
        <NumberTag n={i + 1} position={[0, 1.62, TUBE_R + 0.03]} />
        <pointLight ref={light} position={[0, 0.6, 0.15]} color="#46e3d3" intensity={0} distance={3.2} decay={2} />
      </group>

      {/* marker ring on the bench (prediction / limit) */}
      {marker && (
        <mesh position={[0, 0.012, 0]} rotation-x={-Math.PI / 2}>
          <ringGeometry args={[0.36, 0.42, 48]} />
          <meshBasicMaterial color={marker === 'limit' ? '#46e3d3' : '#f0c070'} toneMapped={false} transparent opacity={0.95} />
        </mesh>
      )}

      {/* generous invisible hit area */}
      <mesh
        position={[0, TUBE_H / 2, 0]}
        onClick={e => { e.stopPropagation(); if (interactive) onTube(i + 1) }}
        onPointerOver={e => { e.stopPropagation(); setHovered(i) }}
        onPointerOut={() => setHovered(h => (h === i ? null : h))}
      >
        <cylinderGeometry args={[0.5, 0.5, TUBE_H + 0.6, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  )
}

function Pipette({ positions, activeTube, dropKey, visible, reduce }) {
  const group = useRef()
  const drop = useRef()
  const ripple = useRef()
  const dropStart = useRef(-10)
  const dropAt = useRef([0, 0, 0])
  const { clock } = useThree()

  useEffect(() => {
    if (dropKey == null) return
    dropStart.current = clock.elapsedTime
    const p = positions[dropKey.tube] || positions[0]
    dropAt.current = p
  }, [dropKey, clock, positions])

  useFrame((state, dt) => {
    const g = group.current
    if (!g) return
    const now = state.clock.elapsedTime
    const target = positions[Math.min(5, Math.max(0, activeTube))] || positions[0]
    const since = now - dropStart.current
    const dip = since < 0.5 ? Math.sin((since / 0.5) * Math.PI) * 0.35 : 0
    const k = reduce ? 50 : 5
    g.position.x = damp(g.position.x, target[0], k, dt)
    g.position.z = damp(g.position.z, target[2], k, dt)
    g.position.y = damp(g.position.y, (visible ? 3.05 : 5.5) - dip, k, dt)

    // falling drop (0.1s → 0.45s), then ripple
    if (drop.current) {
      const f = (since - 0.1) / 0.35
      drop.current.visible = f > 0 && f < 1
      drop.current.position.set(dropAt.current[0], 2.55 - f * (2.55 - (0.05 + LIQUID_H)), dropAt.current[2])
    }
    if (ripple.current) {
      const r = (since - 0.45) / 0.6
      ripple.current.visible = r > 0 && r < 1
      ripple.current.scale.setScalar(0.3 + r * 0.9)
      ripple.current.material.opacity = 1 - r
      ripple.current.position.set(dropAt.current[0], 0.06 + LIQUID_H + 0.01, dropAt.current[2])
    }
  })

  return (
    <>
      <group ref={group} position={[positions[0][0], 5.5, positions[0][2]]}>
        <mesh position={[0, 0.85, 0]}><sphereGeometry args={[0.2, 24, 24]} /><meshStandardMaterial color="#e8d8b0" roughness={0.5} /></mesh>
        <mesh position={[0, 0.62, 0]}><cylinderGeometry args={[0.14, 0.2, 0.22, 24]} /><meshStandardMaterial color="#e8d8b0" roughness={0.5} /></mesh>
        <mesh position={[0, 0, 0]}><cylinderGeometry args={[0.07, 0.025, 1.1, 20]} /><meshPhysicalMaterial color="#e6fffb" transparent opacity={0.45} roughness={0.05} clearcoat={1} /></mesh>
        <mesh position={[0, -0.56, 0]}><sphereGeometry args={[0.03, 12, 12]} /><meshBasicMaterial color="#bffaf2" toneMapped={false} /></mesh>
      </group>
      <mesh ref={drop} visible={false}><sphereGeometry args={[0.055, 16, 16]} /><meshBasicMaterial color="#d9fff9" toneMapped={false} /></mesh>
      <mesh ref={ripple} visible={false} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[0.12, 0.16, 40]} />
        <meshBasicMaterial color="#bffaf2" transparent opacity={0} toneMapped={false} depthWrite={false} />
      </mesh>
    </>
  )
}

function LimitLine({ positions, limit, label }) {
  if (limit == null) return null
  const a = positions[limit - 1]
  const b = positions[Math.min(5, limit)]
  // between this tube and the next (same row), or just to the right of it at a row end
  const sameRow = limit < 6 && Math.abs(a[2] - b[2]) < 0.01
  const x = sameRow ? (a[0] + b[0]) / 2 : a[0] + 0.62
  const dashes = Array.from({ length: 9 }, (_, i) => i)
  return (
    <group position={[x, 0, a[2]]}>
      {dashes.map(i => (
        <mesh key={i} position={[0, 0.15 + i * 0.3, 0]}>
          <boxGeometry args={[0.03, 0.18, 0.03]} />
          <meshBasicMaterial color="#46e3d3" toneMapped={false} />
        </mesh>
      ))}
      <Html position={[0, 2.85, 0]} center zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
        <div style={{
          whiteSpace: 'nowrap', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 18,
          textTransform: 'uppercase', color: '#46e3d3', textShadow: '0 0 12px rgba(70,227,211,0.8)',
        }}>{label}</div>
      </Html>
    </group>
  )
}

function Lab({ scene, glows, tested, limit, prediction, interactive, onTube, activeTube, dropKey, lightsOff, labels, reduce, mobile }) {
  const { size } = useThree()
  const aspect = size.width / size.height
  const positions = useMemo(() => tubeLayout(aspect), [aspect])
  const [hovered, setHovered] = useState(null)
  const ambient = useRef()
  const key = useRef()
  const rim = useRef()

  useEffect(() => { document.body.style.cursor = hovered != null && interactive(hovered + 1) ? 'pointer' : '' }, [hovered, interactive])
  useEffect(() => () => { document.body.style.cursor = '' }, [])

  useFrame((_, dt) => {
    const k = reduce ? 50 : 1.4
    if (ambient.current) ambient.current.intensity = damp(ambient.current.intensity, lightsOff ? 0.012 : 0.55, k, dt)
    if (key.current) key.current.intensity = damp(key.current.intensity, lightsOff ? 0.02 : 2.2, k, dt)
    if (rim.current) rim.current.intensity = damp(rim.current.intensity, lightsOff ? 0.15 : 1.2, k, dt)
  })

  const benchW = aspect < 0.9 ? 6 : 9
  return (
    <group>
      <ambientLight ref={ambient} intensity={0.55} color="#cfe9e5" />
      <directionalLight ref={key} position={[2, 6, 5]} intensity={2.2} color="#fff6e8" />
      <pointLight ref={rim} position={[0, 3, -3]} intensity={1.2} color="#46e3d3" distance={9} />

      {/* bench top: reflective, so the glow pools on it */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]}>
        <planeGeometry args={[benchW + 6, 10]} />
        <MeshReflectorMaterial
          blur={[200, 60]} resolution={mobile ? 256 : 768} mixBlur={1} mixStrength={6}
          roughness={0.75} depthScale={0.6} minDepthThreshold={0.5} maxDepthThreshold={1.2}
          color="#0b1d1f" metalness={0.4} mirror={0.5}
        />
      </mesh>
      <mesh position={[0, 3, -5]}><planeGeometry args={[30, 10]} /><meshStandardMaterial color="#071416" roughness={1} /></mesh>

      {/* racks */}
      {(aspect < 0.9 ? [[-0.33, 1.0], [0.33, -1.0]] : [[0, 0]]).map(([x, z]) => (
        <group key={z} position={[x, 0, z]}>
          <mesh position={[0, 0.42, 0]}><boxGeometry args={[aspect < 0.9 ? 3.5 : 6.9, 0.07, 0.62]} /><meshStandardMaterial color="#1a3a3c" roughness={0.5} metalness={0.3} /></mesh>
          {[-1, 1].map(s => (
            <mesh key={s} position={[s * (aspect < 0.9 ? 1.7 : 3.4), 0.21, 0]}><boxGeometry args={[0.08, 0.42, 0.62]} /><meshStandardMaterial color="#1a3a3c" /></mesh>
          ))}
        </group>
      ))}

      {positions.map((p, i) => (
        <Tube
          key={i} i={i} position={p}
          glow={glows[i]} lit={i < tested}
          marker={limit === i + 1 ? 'limit' : (scene === 1 && prediction === i + 1 ? 'guess' : null)}
          interactive={interactive(i + 1)} onTube={onTube}
          hovered={hovered} setHovered={setHovered}
        />
      ))}

      <Pipette positions={positions} activeTube={activeTube} dropKey={dropKey} visible={scene === 3 && tested < 6} reduce={reduce} />
      {scene === 3 && <LimitLine positions={positions} limit={limit} label={labels.limit} />}
    </group>
  )
}

function Rig({ scene, activeTube, reduce }) {
  const { size } = useThree()
  const aspect = size.width / size.height
  if (scene === 0) {
    return <CameraRig pos={aspect < 0.9 ? [0.6, 3.4, 10.5] : [0.8, 2.3, 7.4]} look={[0.4, 0.9, -1.8]} reduce={reduce} wobble={0.6} />
  }
  const portrait = aspect < 0.9
  const fitW = portrait ? 4.8 : 8.6
  const dist = Math.max(portrait ? 10 : 8, (fitW / 2) / (Math.tan((38 / 2) * Math.PI / 180) * aspect))
  const shift = scene === 3 && !portrait ? (activeTube - 2.5) * 0.3 : 0
  const pull = scene === 4 ? 1.15 : 1
  const y = portrait ? 6.6 : 3.6
  return <CameraRig pos={[shift, y * pull, dist * pull]} look={[shift * 0.6, portrait ? 2.6 : 2.3, 0]} reduce={reduce} wobble={scene === 4 ? 0.8 : 0.15} />
}

export default function DemoScene3D(props) {
  const { scene, reduce, mobile } = props
  return (
    <Canvas
      dpr={mobile ? [1, 1.5] : [1, 2]}
      camera={{ fov: 38, position: [0, 3, 9], near: 0.1, far: 80 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <color attach="background" args={['#020809']} />
      <fog attach="fog" args={['#020809', 10, 26]} />
      <Rig scene={scene} activeTube={props.activeTube} reduce={reduce} />
      {scene === 0 ? <Museum beat={props.beat} reduce={reduce} mobile={mobile} /> : <Lab {...props} />}
      <EffectComposer multisampling={0}>
        <Bloom mipmapBlur luminanceThreshold={0.22} luminanceSmoothing={0.25} intensity={1.35} radius={0.75} />
        <Vignette eskil={false} offset={0.25} darkness={0.75} />
      </EffectComposer>
    </Canvas>
  )
}
