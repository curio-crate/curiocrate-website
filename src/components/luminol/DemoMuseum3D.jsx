import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshReflectorMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { GLOW_COLOR, damp, makeTexture, rng } from './scene3dUtils'

/*
 * Scene 0 of /demo: Gallery 3 (mineralogy) at night, after the break-in.
 * Dark room lit only by warm track spots (each with a visible beam), cool moonlight from a
 * window, a sweeping flashlight, the red EXIT sign and the light leaking under the staff door.
 * When the story reaches "your job" (beat 2) every light dims and the mop swirls glow.
 *
 * World layout (metres): back wall z = -6, left wall x = -7, pedestal at (0, -1.8),
 * staff door at (3.9, -6). Nothing here may hint at who did it.
 */

const PEDESTAL = [0, 0, -1.8]
const DOOR_X = 3.5
const BRASS = '#c29a4c'

/* ── light beams: a soft additive cone, brightest where you look straight through it ── */
const BEAM_VERT = `
  uniform float uLen;
  varying vec3 vN; varying vec3 vView; varying float vL;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vView = -mv.xyz;
    vN = normalize(normalMatrix * normal);
    vL = position.z / uLen;
    gl_Position = projectionMatrix * mv;
  }`
const BEAM_FRAG = `
  uniform vec3 uColor; uniform float uOpacity;
  varying vec3 vN; varying vec3 vView; varying float vL;
  void main() {
    float facing = pow(abs(dot(normalize(vN), normalize(vView))), 2.2);
    float fade = smoothstep(0.0, 0.12, vL) * (1.0 - smoothstep(0.35, 1.0, vL));
    gl_FragColor = vec4(uColor, facing * fade * uOpacity);
  }`

function Beam({ len, radiusTop, radiusBottom, color, opacity, matRef }) {
  const geo = useMemo(() => {
    const g = new THREE.CylinderGeometry(radiusTop, radiusBottom, len, 40, 1, true)
    g.rotateX(-Math.PI / 2)
    g.translate(0, 0, len / 2) // apex at the origin, pointing down +z (so lookAt aims it)
    return g
  }, [len, radiusTop, radiusBottom])
  const uniforms = useMemo(() => ({
    uColor: { value: new THREE.Color(color) }, uOpacity: { value: opacity }, uLen: { value: len },
  }), [color, opacity, len])
  return (
    <mesh geometry={geo} renderOrder={2}>
      <shaderMaterial
        ref={matRef} uniforms={uniforms} vertexShader={BEAM_VERT} fragmentShader={BEAM_FRAG}
        transparent depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide}
      />
    </mesh>
  )
}

/*
 * A spotlight with its own beam. `level` is a shared ref (0–1) used to dim every light at
 * once; `sweep` makes it a hand-held flashlight that wanders across the floor.
 */
function Spot({ position, target, color, intensity, angle, penumbra = 0.55, beam = 0.2, level, sweep, reduce, castShadow, fixture = true }) {
  const light = useRef()
  const beamGroup = useRef()
  const beamMat = useRef()
  const [aim] = useState(() => { const o = new THREE.Object3D(); o.position.set(...target); return o })
  const aimRef = useRef(aim)
  const len = useMemo(() => new THREE.Vector3(...position).distanceTo(new THREE.Vector3(...target)), [position, target])

  useFrame((state) => {
    const k = level ? level.current : 1
    const a = aimRef.current
    if (sweep && !reduce) {
      const t = state.clock.elapsedTime
      a.position.set(1.6 + Math.sin(t * 0.42) * 2.6, 0, -2.6 + Math.sin(t * 0.27 + 1) * 1.8)
    }
    if (light.current) light.current.intensity = intensity * k
    if (beamMat.current) beamMat.current.uniforms.uOpacity.value = beam * k
    if (beamGroup.current) beamGroup.current.lookAt(a.position)
  })

  return (
    <>
      <primitive object={aim} />
      <spotLight
        ref={light} position={position} target={aim} color={color} intensity={intensity}
        angle={angle} penumbra={penumbra} distance={len * 2.2} decay={2}
        castShadow={castShadow} shadow-mapSize={[1024, 1024]} shadow-bias={-0.0004}
      />
      <group ref={beamGroup} position={position}>
        <Beam len={len * 0.95} radiusTop={0.05} radiusBottom={Math.tan(angle) * len * 0.85} color={color} opacity={beam} matRef={beamMat} />
        {fixture && (
          <group rotation-x={Math.PI / 2}>
            <mesh position={[0, -0.12, 0]}><cylinderGeometry args={[0.09, 0.07, 0.26, 16]} /><meshStandardMaterial color="#1b2024" metalness={0.6} roughness={0.4} /></mesh>
            <mesh position={[0, 0.012, 0]}><circleGeometry args={[0.075, 20]} /><meshBasicMaterial color={color} toneMapped={false} /></mesh>
          </group>
        )}
      </group>
    </>
  )
}

/* ── textures ─────────────────────────────────────────────────────────── */
function useTextures(signs) {
  return useMemo(() => {
    const floor = makeTexture(512, 512, (ctx, w, h) => {
      const r = rng(3)
      ctx.fillStyle = '#5d676b'; ctx.fillRect(0, 0, w, h)
      // faint stone mottling
      for (let i = 0; i < 260; i++) {
        ctx.fillStyle = `rgba(${r() > 0.5 ? '255,255,255' : '0,0,0'},${0.02 + r() * 0.04})`
        ctx.beginPath(); ctx.arc(r() * w, r() * h, 6 + r() * 40, 0, Math.PI * 2); ctx.fill()
      }
      ctx.strokeStyle = '#262c2f'; ctx.lineWidth = 6
      ctx.strokeRect(0, 0, w, h)
    })
    floor.wrapS = floor.wrapT = THREE.RepeatWrapping
    floor.repeat.set(16, 16)

    // Mop swirls, drawn in floor space: canvas x → world x −3…6, canvas y → world z −6…0.75.
    const swirl = makeTexture(1024, 768, (ctx) => {
      const r = rng(11)
      const toPx = (x, z) => [((x + 3) / 9) * 1024, ((z + 6) / 6.75) * 768]
      ctx.lineCap = 'round'; ctx.shadowColor = 'white'
      // figure-eight mop strokes around the pedestal, thickest close to it
      const [px, py] = toPx(PEDESTAL[0], PEDESTAL[2])
      for (let i = 0; i < 22; i++) {
        const a = r() * Math.PI * 2, d = 90 + r() * 170
        const cx = px + Math.cos(a) * d, cy = py + Math.sin(a) * d * 0.7
        const s = 40 + r() * 60
        ctx.lineWidth = 10 + r() * 22; ctx.shadowBlur = 26
        ctx.strokeStyle = `rgba(255,255,255,${0.12 + r() * 0.2})`
        ctx.beginPath()
        for (let k = 0; k <= 48; k++) {
          const t = (k / 48) * Math.PI * 2
          const x = cx + Math.sin(t) * s * 1.4, y = cy + Math.sin(t) * Math.cos(t) * s
          k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)
        }
        ctx.stroke()
      }
      // a fading trail of strokes toward the staff door
      const [dx, dy] = toPx(DOOR_X, -5.6)
      for (let i = 0; i < 18; i++) {
        const f = i / 17
        const x = px + (dx - px) * f + (r() - 0.5) * 60, y = py + (dy - py) * f + (r() - 0.5) * 40
        ctx.lineWidth = 14 - f * 8; ctx.shadowBlur = 18
        ctx.strokeStyle = `rgba(255,255,255,${0.26 - f * 0.18})`
        ctx.beginPath(); ctx.moveTo(x - 40, y + 10); ctx.quadraticCurveTo(x, y - 30, x + 40, y + 6); ctx.stroke()
      }
    })

    const painting = (draw) => makeTexture(256, 256, draw)
    const meteorArt = painting((ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#0d1b3d'); g.addColorStop(0.7, '#3b2a5c'); g.addColorStop(1, '#c4683a')
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
      const r = rng(5)
      for (let i = 0; i < 70; i++) { ctx.fillStyle = `rgba(255,255,240,${0.3 + r() * 0.6})`; ctx.fillRect(r() * w, r() * h * 0.6, 1.6, 1.6) }
      const s = ctx.createLinearGradient(40, 40, 170, 140); s.addColorStop(0, 'rgba(255,240,200,0)'); s.addColorStop(1, 'rgba(255,240,200,1)')
      ctx.strokeStyle = s; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(40, 40); ctx.lineTo(170, 140); ctx.stroke()
      ctx.fillStyle = '#ffe9b0'; ctx.beginPath(); ctx.arc(172, 142, 6, 0, 7); ctx.fill()
      ctx.fillStyle = '#1a1020'; ctx.beginPath(); ctx.moveTo(0, h); ctx.lineTo(0, 205); ctx.lineTo(70, 180); ctx.lineTo(140, 200); ctx.lineTo(210, 172); ctx.lineTo(w, 195); ctx.lineTo(w, h); ctx.fill()
    })
    const geodeArt = painting((ctx, w, h) => {
      ctx.fillStyle = '#e7dcc2'; ctx.fillRect(0, 0, w, h)
      const rings = ['#4a2a6b', '#6b3fa0', '#8d63c9', '#b597e3', '#ddd0f2', '#f7f2ff']
      rings.forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(128, 132, 96 - i * 15, 104 - i * 16, 0.2, 0, 7); ctx.fill() })
    })
    const strataArt = painting((ctx, w, h) => {
      const bands = ['#2c3e50', '#7a5a3a', '#b08a5a', '#5b6b4a', '#8a3b2e', '#d2b48c', '#3d2b1f']
      bands.forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(0, i * 40); ctx.bezierCurveTo(80, i * 40 - 20, 170, i * 40 + 26, w, i * 40 - 6); ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.fill() })
    })

    const label = (w, h, bg, fg, text, font, extra) => makeTexture(w, h, (ctx) => {
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h)
      ctx.fillStyle = fg; ctx.font = font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(text, w / 2, h / 2 + (extra ? -14 : 2))
      if (extra) { ctx.font = '600 26px "Plus Jakarta Sans", Arial, sans-serif'; ctx.globalAlpha = 0.75; ctx.fillText(extra, w / 2, h - 30) }
    })
    const gallery = label(512, 192, '#e8d8b0', '#2b2416', signs.gallery, 'bold 96px "Barlow Condensed", Arial Narrow, sans-serif', signs.mineralogy)
    const staff = label(256, 96, '#d9d4c7', '#1b1b1b', signs.staff, 'bold 50px "Barlow Condensed", Arial Narrow, sans-serif')
    const plaque = label(512, 128, '#b8924a', '#1e160b', signs.plaque, 'bold 58px "Barlow Condensed", Arial Narrow, sans-serif')
    const exit = label(256, 112, '#140404', '#ff4433', 'EXIT', 'bold 86px "Barlow Condensed", Arial Narrow, sans-serif')

    const tape = makeTexture(1024, 64, (ctx, w, h) => {
      ctx.fillStyle = '#f2c230'; ctx.fillRect(0, 0, w, h)
      ctx.fillStyle = '#111'; ctx.font = 'bold 40px "Barlow Condensed", Arial Narrow, sans-serif'; ctx.textBaseline = 'middle'
      for (let x = 10; x < w; x += 512) ctx.fillText(signs.tape, x, h / 2 + 2)
    })
    tape.wrapS = THREE.RepeatWrapping

    const window = makeTexture(256, 512, (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#1d3b7a'); g.addColorStop(1, '#0a1630')
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
      const m = ctx.createRadialGradient(170, 120, 4, 170, 120, 90); m.addColorStop(0, 'rgba(235,242,255,1)'); m.addColorStop(0.25, 'rgba(200,220,255,0.6)'); m.addColorStop(1, 'rgba(120,160,255,0)')
      ctx.fillStyle = m; ctx.fillRect(0, 0, w, h)
      ctx.fillStyle = '#05080f'
      ctx.fillRect(w / 2 - 5, 0, 10, h)
      for (let y = 128; y < h; y += 128) ctx.fillRect(0, y - 5, w, 10)
      ctx.lineWidth = 18; ctx.strokeStyle = '#05080f'; ctx.strokeRect(0, 0, w, h)
    })

    const marker = (n) => label(128, 128, '#f2c230', '#141414', String(n), 'bold 92px "Barlow Condensed", Arial Narrow, sans-serif')
    return { floor, swirl, meteorArt, geodeArt, strataArt, gallery, staff, plaque, exit, tape, window, markers: [marker(1), marker(2), marker(3)] }
  }, [signs])
}

/* ── props ────────────────────────────────────────────────────────────── */
function Painting({ x, y, w, h, map }) {
  return (
    <group position={[x, y, -5.94]}>
      <mesh castShadow><boxGeometry args={[w + 0.16, h + 0.16, 0.08]} /><meshStandardMaterial color="#9c7638" metalness={0.75} roughness={0.35} /></mesh>
      <mesh position={[0, 0, 0.045]}><planeGeometry args={[w, h]} /><meshStandardMaterial map={map} roughness={0.85} /></mesh>
      <mesh position={[0, -h / 2 - 0.3, 0.01]}><planeGeometry args={[0.36, 0.12]} /><meshStandardMaterial color="#d8d0bf" /></mesh>
    </group>
  )
}

function Stanchion({ position, fallen }) {
  return (
    <group position={position} rotation={fallen ? [0, 0.6, Math.PI / 2 - 0.05] : [0, 0, 0]}>
      <group position={fallen ? [0.16, 0, 0] : [0, 0, 0]}>
        <mesh position={[0, 0.02, 0]} castShadow><cylinderGeometry args={[0.16, 0.18, 0.04, 24]} /><meshStandardMaterial color={BRASS} metalness={0.85} roughness={0.3} /></mesh>
        <mesh position={[0, 0.48, 0]} castShadow><cylinderGeometry args={[0.03, 0.035, 0.92, 12]} /><meshStandardMaterial color={BRASS} metalness={0.85} roughness={0.3} /></mesh>
        <mesh position={[0, 0.96, 0]}><sphereGeometry args={[0.055, 16, 16]} /><meshStandardMaterial color={BRASS} metalness={0.85} roughness={0.25} /></mesh>
      </group>
    </group>
  )
}

function Rope({ from, to, sag = 0.28 }) {
  const geo = useMemo(() => {
    const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to)
    const mid = a.clone().lerp(b, 0.5); mid.y = Math.max(0.03, mid.y - sag)
    return new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(a, mid, b), 24, 0.028, 8, false)
  }, [from, to, sag])
  return <mesh geometry={geo} castShadow><meshStandardMaterial color="#8c1c30" roughness={0.85} /></mesh>
}

function EvidenceMarker({ position, map, rot = 0 }) {
  return (
    <group position={position} rotation-y={rot}>
      <mesh position={[0, 0.07, 0.035]} rotation-x={-0.42}><planeGeometry args={[0.17, 0.16]} /><meshStandardMaterial map={map} side={THREE.DoubleSide} roughness={0.6} /></mesh>
      <mesh position={[0, 0.07, -0.035]} rotation-x={0.42}><planeGeometry args={[0.17, 0.16]} /><meshStandardMaterial color="#f2c230" side={THREE.DoubleSide} roughness={0.6} /></mesh>
    </group>
  )
}

function Pedestal({ plaque }) {
  // Jagged stump of the front glass panel that was smashed.
  const stump = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(-0.47, 0); s.lineTo(0.47, 0); s.lineTo(0.47, 0.12); s.lineTo(0.36, 0.3); s.lineTo(0.28, 0.1)
    s.lineTo(0.1, 0.22); s.lineTo(-0.05, 0.06); s.lineTo(-0.22, 0.34); s.lineTo(-0.3, 0.12); s.lineTo(-0.47, 0.42); s.lineTo(-0.47, 0)
    return new THREE.ShapeGeometry(s)
  }, [])
  const glass = <meshPhysicalMaterial color="#cdeef4" transparent opacity={0.16} roughness={0.04} metalness={0.1} side={THREE.DoubleSide} depthWrite={false} emissive="#9fd4e6" emissiveIntensity={0.05} />
  return (
    <group position={PEDESTAL}>
      <mesh position={[0, 0.06, 0]} castShadow receiveShadow><boxGeometry args={[1.3, 0.12, 1.3]} /><meshStandardMaterial color="#25211d" roughness={0.6} /></mesh>
      <mesh position={[0, 0.62, 0]} castShadow receiveShadow><boxGeometry args={[1.05, 1.0, 1.05]} /><meshStandardMaterial color="#d6d0c2" roughness={0.38} /></mesh>
      <mesh position={[0, 1.15, 0]} castShadow receiveShadow><boxGeometry args={[1.16, 0.06, 1.16]} /><meshStandardMaterial color="#e2ddd0" roughness={0.3} /></mesh>
      <mesh position={[0, 0.82, 0.527]}><planeGeometry args={[0.62, 0.155]} /><meshStandardMaterial map={plaque} metalness={0.5} roughness={0.4} /></mesh>
      {/* empty velvet cushion, with the dent where the meteorite sat */}
      <mesh position={[0, 1.22, 0]} castShadow><boxGeometry args={[0.46, 0.08, 0.36]} /><meshStandardMaterial color="#5c0f1f" roughness={0.95} /></mesh>
      <mesh position={[0, 1.262, 0]} rotation-x={-Math.PI / 2}><circleGeometry args={[0.09, 24]} /><meshStandardMaterial color="#3a0812" roughness={1} /></mesh>
      {/* the case: back + side panels survive, front is a jagged stump, lid is gone */}
      <group position={[0, 1.18, 0]}>
        <mesh position={[0, 0.42, -0.47]}><planeGeometry args={[0.94, 0.84]} />{glass}</mesh>
        <mesh position={[-0.47, 0.42, 0]} rotation-y={Math.PI / 2}><planeGeometry args={[0.94, 0.84]} />{glass}</mesh>
        <mesh position={[0.47, 0.42, 0]} rotation-y={Math.PI / 2}><planeGeometry args={[0.94, 0.84]} />{glass}</mesh>
        <mesh geometry={stump} position={[0, 0, 0.47]}>{glass}</mesh>
        {[[-0.47, -0.47], [0.47, -0.47], [-0.47, 0.47], [0.47, 0.47]].map(([x, z]) => (
          <mesh key={`${x}${z}`} position={[x, 0.42, z]}><boxGeometry args={[0.025, 0.84, 0.025]} /><meshStandardMaterial color={BRASS} metalness={0.85} roughness={0.3} /></mesh>
        ))}
        <mesh position={[0, 0.84, -0.47]}><boxGeometry args={[0.96, 0.025, 0.025]} /><meshStandardMaterial color={BRASS} metalness={0.85} roughness={0.3} /></mesh>
      </group>
    </group>
  )
}

function Shards() {
  const shards = useMemo(() => {
    const r = rng(42)
    return Array.from({ length: 30 }, () => {
      const a = -Math.PI * 0.1 + r() * Math.PI * 1.2 // mostly in front of the case
      const d = 0.75 + r() * 1.5
      return {
        pos: [PEDESTAL[0] + Math.cos(a) * d * 1.1, 0.006 + r() * 0.01, PEDESTAL[2] + Math.sin(a) * d],
        rot: [-Math.PI / 2 + (r() - 0.5) * 0.2, (r() - 0.5) * 0.2, r() * Math.PI * 2],
        s: 0.035 + r() * 0.1,
      }
    })
  }, [])
  return shards.map((s, i) => (
    <mesh key={i} position={s.pos} rotation={s.rot} scale={s.s}>
      <circleGeometry args={[1, 3]} />
      <meshStandardMaterial color="#eafcff" roughness={0.05} metalness={0.3} emissive="#bfe9ff" emissiveIntensity={0.12} transparent opacity={0.85} side={THREE.DoubleSide} />
    </mesh>
  ))
}

function MopBucket() {
  return (
    <group position={[-2.7, 0, 0.1]} rotation-y={0.5}>
      <mesh position={[0, 0.32, 0]} castShadow><boxGeometry args={[0.62, 0.46, 0.44]} /><meshStandardMaterial color="#e0ae1c" roughness={0.45} /></mesh>
      <mesh position={[0, 0.555, 0]} rotation-x={-Math.PI / 2}><planeGeometry args={[0.56, 0.38]} /><meshStandardMaterial color="#2c3a38" roughness={0.1} metalness={0.2} /></mesh>
      <mesh position={[0.12, 0.66, 0]} castShadow><boxGeometry args={[0.3, 0.22, 0.4]} /><meshStandardMaterial color="#5e6569" metalness={0.5} roughness={0.4} /></mesh>
      {[[-0.26, -0.18], [0.26, -0.18], [-0.26, 0.18], [0.26, 0.18]].map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, 0.045, z]}><sphereGeometry args={[0.045, 10, 10]} /><meshStandardMaterial color="#111" /></mesh>
      ))}
      {/* mop: handle leaning out of the wringer */}
      <mesh position={[0.32, 1.25, 0.05]} rotation={[0.08, 0, -0.32]} castShadow><cylinderGeometry args={[0.022, 0.022, 1.7, 10]} /><meshStandardMaterial color="#a37c45" roughness={0.6} /></mesh>
    </group>
  )
}

function Vitrine() {
  const crystals = useMemo(() => {
    const r = rng(9)
    const cols = ['#8b5cf6', '#a78bfa', '#f5a524', '#d9ecff', '#5eead4']
    return Array.from({ length: 9 }, (_, i) => ({
      pos: [-0.5 + (i % 5) * 0.25 + (r() - 0.5) * 0.08, 0.98, (i < 5 ? -0.1 : 0.12)],
      rot: [(r() - 0.5) * 0.5, r() * 3, (r() - 0.5) * 0.5],
      s: [0.06, 0.1 + r() * 0.08, 0.06],
      c: cols[i % cols.length],
    }))
  }, [])
  return (
    <group position={[-4.7, 0, -3.5]} rotation-y={0.35}>
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow><boxGeometry args={[1.5, 0.9, 0.72]} /><meshStandardMaterial color="#2b1d14" roughness={0.55} /></mesh>
      <mesh position={[0, 0.915, 0]}><boxGeometry args={[1.42, 0.03, 0.64]} /><meshStandardMaterial color="#141016" roughness={0.9} /></mesh>
      {crystals.map((c, i) => (
        <mesh key={i} position={c.pos} rotation={c.rot} scale={c.s}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={c.c} emissive={c.c} emissiveIntensity={0.55} roughness={0.15} metalness={0.1} flatShading />
        </mesh>
      ))}
      <mesh position={[0, 1.18, 0]}>
        <boxGeometry args={[1.46, 0.5, 0.68]} />
        <meshPhysicalMaterial color="#d8f1f5" transparent opacity={0.1} roughness={0.05} depthWrite={false} />
      </mesh>
      <pointLight position={[0, 1.3, 0.1]} intensity={1.6} distance={2.2} decay={2} color="#d6e4ff" />
    </group>
  )
}

function StaffDoor({ staff, exit, marker }) {
  const led = useRef()
  useFrame((state) => {
    const on = Math.sin(state.clock.elapsedTime * 3) > 0.6
    if (led.current) led.current.color.setRGB(on ? 4 : 0.25, on ? 0.3 : 0.02, on ? 0.25 : 0.02)
  })
  return (
    <>
      <group position={[DOOR_X, 0, -5.96]}>
        <mesh position={[0, 1.55, 0]}><boxGeometry args={[1.62, 3.14, 0.1]} /><meshStandardMaterial color="#2f363a" metalness={0.5} roughness={0.5} /></mesh>
        <mesh position={[0, 1.52, 0.06]}><boxGeometry args={[1.42, 3.0, 0.06]} /><meshStandardMaterial color="#3d2a1e" roughness={0.6} /></mesh>
        <mesh position={[0, 1.15, 0.12]}><boxGeometry args={[1.1, 0.06, 0.06]} /><meshStandardMaterial color="#b9c0c3" metalness={0.9} roughness={0.25} /></mesh>
        <mesh position={[0, 2.35, 0.095]}><planeGeometry args={[0.72, 0.27]} /><meshStandardMaterial map={staff} roughness={0.5} /></mesh>
        {/* light leaking under the door */}
        <mesh position={[0, 0.02, 0.1]}><boxGeometry args={[1.42, 0.03, 0.02]} /><meshBasicMaterial color={[3, 1.9, 0.9]} toneMapped={false} /></mesh>
        <mesh position={[0, 0.004, 0.5]} rotation-x={-Math.PI / 2}>
          <planeGeometry args={[1.6, 0.9]} />
          <meshBasicMaterial color="#ffb060" transparent opacity={0.22} blending={THREE.AdditiveBlending} depthWrite={false} alphaMap={DOOR_SPILL} />
        </mesh>
        <pointLight position={[0, 0.12, 0.35]} intensity={1.4} distance={2.4} decay={2} color="#ffb060" />
        {/* EXIT sign */}
        <mesh position={[0, 3.45, 0.14]}><boxGeometry args={[0.66, 0.3, 0.1]} /><meshStandardMaterial color="#1a1a1a" /></mesh>
        <mesh position={[0, 3.45, 0.195]}><planeGeometry args={[0.6, 0.26]} /><meshBasicMaterial map={exit} color={[2.4, 2.4, 2.4]} toneMapped={false} /></mesh>
        <pointLight position={[0, 3.3, 0.5]} intensity={1.2} distance={2.6} decay={2} color="#ff3a2a" />
      </group>
      {/* security camera in the corner, red light blinking */}
      <group position={[6.2, 4.5, -5.8]} rotation-y={-0.7}>
        <mesh position={[0, 0, 0.18]} rotation-x={0.35}><boxGeometry args={[0.16, 0.14, 0.36]} /><meshStandardMaterial color="#cfd3d5" roughness={0.4} /></mesh>
        <mesh position={[0, 0.1, 0]}><boxGeometry args={[0.04, 0.2, 0.04]} /><meshStandardMaterial color="#888" /></mesh>
        <mesh position={[0.05, -0.02, 0.37]}><sphereGeometry args={[0.018, 8, 8]} /><meshBasicMaterial ref={led} toneMapped={false} /></mesh>
      </group>
      <EvidenceMarker position={[DOOR_X - 0.4, 0, -5.25]} map={marker} rot={-0.3} />
    </>
  )
}

// Soft round dot for dust. (drei's <Sparkles> divides by zero at the centre of each point,
// and Bloom then smears that Infinity across the whole frame as a black flash.)
const DOT = makeTexture(64, 64, (ctx, w, h) => {
  const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2)
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.4, 'rgba(255,255,255,0.35)'); g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
})

function Dust({ count, sx, sy, sz, position, size, opacity, color, reduce }) {
  const pts = useRef()
  const geo = useMemo(() => {
    const r = rng(count * 13 + 5)
    const a = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) { a[i * 3] = (r() - 0.5) * sx; a[i * 3 + 1] = (r() - 0.5) * sy; a[i * 3 + 2] = (r() - 0.5) * sz }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(a, 3))
    return g
  }, [count, sx, sy, sz])
  useFrame((state) => {
    if (!pts.current || reduce) return
    const t = state.clock.elapsedTime
    pts.current.rotation.y = t * 0.035
    pts.current.position.y = position[1] + Math.sin(t * 0.25) * 0.12
  })
  return (
    <points ref={pts} geometry={geo} position={position}>
      <pointsMaterial map={DOT} size={size} sizeAttenuation color={color} transparent opacity={opacity} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  )
}

const DOOR_SPILL = makeTexture(128, 128, (ctx, w, h) => {
  const g = ctx.createRadialGradient(w / 2, 0, 4, w / 2, 0, h)
  g.addColorStop(0, '#fff'); g.addColorStop(1, '#000')
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
})

function Room({ tx }) {
  const wall = '#1d272d'
  const wainscot = '#131b20'
  return (
    <>
      {/* back wall */}
      <mesh position={[0, 4, -6]} receiveShadow><planeGeometry args={[22, 8]} /><meshStandardMaterial color={wall} roughness={0.92} /></mesh>
      <mesh position={[0, 0.55, -5.98]}><boxGeometry args={[22, 1.1, 0.03]} /><meshStandardMaterial color={wainscot} roughness={0.8} /></mesh>
      <mesh position={[0, 1.12, -5.96]}><boxGeometry args={[22, 0.05, 0.07]} /><meshStandardMaterial color="#2c3840" roughness={0.6} /></mesh>
      {/* left wall with a tall night window */}
      <mesh position={[-7, 4, 0]} rotation-y={Math.PI / 2} receiveShadow><planeGeometry args={[22, 8]} /><meshStandardMaterial color="#1a2329" roughness={0.92} /></mesh>
      <mesh position={[-6.98, 0.55, 0]} rotation-y={Math.PI / 2}><boxGeometry args={[22, 1.1, 0.03]} /><meshStandardMaterial color={wainscot} roughness={0.8} /></mesh>
      <mesh position={[-6.97, 3.3, -2.4]} rotation-y={Math.PI / 2}><planeGeometry args={[1.5, 2.9]} /><meshBasicMaterial map={tx.window} color={[1.5, 1.5, 1.7]} toneMapped={false} /></mesh>
      <mesh position={[-6.96, 1.82, -2.4]} rotation-y={Math.PI / 2}><boxGeometry args={[1.7, 0.08, 0.12]} /><meshStandardMaterial color="#2a343a" /></mesh>
      {/* right wall + ceiling, mostly lost in the dark */}
      <mesh position={[7.5, 4, 0]} rotation-y={-Math.PI / 2}><planeGeometry args={[22, 8]} /><meshStandardMaterial color="#182126" roughness={0.95} /></mesh>
      <mesh position={[0, 6.2, 0]} rotation-x={Math.PI / 2}><planeGeometry args={[22, 22]} /><meshStandardMaterial color="#070b0d" roughness={1} /></mesh>
      {[-1.4, 1.2].map(z => (
        <mesh key={z} position={[0, 6.1, z - 2]}><boxGeometry args={[14, 0.06, 0.1]} /><meshStandardMaterial color="#20262a" metalness={0.6} roughness={0.4} /></mesh>
      ))}
      <mesh position={[-2.75, 4.05, -5.95]}><planeGeometry args={[1.7, 0.64]} /><meshStandardMaterial map={tx.gallery} roughness={0.8} /></mesh>
      <Painting x={-4.7} y={2.55} w={1.25} h={1.55} map={tx.strataArt} />
      <Painting x={-0.3} y={2.75} w={2.3} h={1.55} map={tx.meteorArt} />
      <Painting x={1.9} y={2.55} w={1.05} h={1.25} map={tx.geodeArt} />
    </>
  )
}

export default function Museum({ beat, reduce, mobile, signs }) {
  const tx = useTextures(signs)
  const level = useRef(1)       // 1 = gallery lights on, ~0.2 = dimmed for the glow
  const flash = useRef(1)       // the flashlight switches off for the glow
  const swirl = useRef()
  const up = useRef()
  const moon = useRef()
  const reveal = beat >= 2

  useFrame((_, dt) => {
    const k = reduce ? 60 : 1.1
    level.current = damp(level.current, reveal ? 0.22 : 1, k, dt)
    flash.current = damp(flash.current, reveal ? 0 : 1, k * 1.6, dt)
    if (moon.current) moon.current.intensity = 0.55 * (0.35 + level.current * 0.65)
    if (swirl.current) swirl.current.opacity = damp(swirl.current.opacity, reveal ? 1 : 0, reduce ? 60 : 0.7, dt)
    if (up.current) up.current.intensity = damp(up.current.intensity, reveal ? 3.5 : 0, reduce ? 60 : 0.7, dt)
  })

  return (
    <group>
      <hemisphereLight args={['#2a3a5c', '#050505', 0.35]} />
      <ambientLight intensity={0.05} color="#6b7fa8" />
      {/* moonlight through the window */}
      <directionalLight ref={moon} position={[-9, 7, -1.5]} intensity={0.55} color="#8fb0ff" />
      <Shaft from={[-6.9, 3.6, -2.4]} to={[-3.6, 0, -1.6]} color="#9dbcff" radiusTop={0.55} radiusBottom={1.5} opacity={0.12} level={level} />

      {/* key light on the empty pedestal */}
      <Spot position={[0.5, 6.05, -0.4]} target={[PEDESTAL[0], 1.2, PEDESTAL[2]]} color="#ffd9a3" intensity={110} angle={0.28} beam={0.26} level={level} castShadow={!mobile} />
      {/* picture lights */}
      <Spot position={[-4.7, 6.05, -3.4]} target={[-4.7, 2.3, -6]} color="#ffcf8c" intensity={60} angle={0.34} beam={0.1} level={level} />
      {!mobile && <Spot position={[-0.3, 6.05, -3.2]} target={[-0.3, 2.6, -6]} color="#ffd59c" intensity={60} angle={0.4} beam={0.1} level={level} />}
      <Spot position={[1.9, 6.05, -3.4]} target={[1.9, 2.4, -6]} color="#ffcf8c" intensity={50} angle={0.3} beam={0.1} level={level} />
      {/* investigator's flashlight sweeping the floor */}
      <Spot position={[3.4, 2.3, 4.6]} target={[1.6, 0, -2.6]} color="#e2f0ff" intensity={60} angle={0.12} penumbra={0.5} beam={0.13} level={flash} sweep reduce={reduce} fixture={false} />

      {/* the glow, and the faint teal it throws back up onto everything */}
      <pointLight ref={up} position={[0.6, 0.35, -2.4]} intensity={0} distance={7} decay={2} color="#46e3d3" />

      {/* polished stone floor, wet from the mop */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <MeshReflectorMaterial
          map={tx.floor} blur={[400, 120]} resolution={mobile ? 256 : 1024} mixBlur={1} mixStrength={9}
          roughness={0.55} depthScale={1} minDepthThreshold={0.4} maxDepthThreshold={1.4}
          color="#ffffff" metalness={0.3} mirror={0.55}
        />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[1.5, 0.012, -2.625]} renderOrder={1}>
        <planeGeometry args={[9, 6.75]} />
        <meshBasicMaterial
          ref={swirl} map={tx.swirl} color={GLOW_COLOR} transparent opacity={0}
          blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false}
        />
      </mesh>

      <Room tx={tx} />
      <Pedestal plaque={tx.plaque} />
      <Shards />

      {/* rope barrier: three posts standing, one knocked over */}
      <Stanchion position={[-1.15, 0, -3.0]} />
      <Stanchion position={[1.15, 0, -3.0]} />
      <Stanchion position={[-1.15, 0, -0.6]} />
      <Stanchion position={[1.55, 0, -0.35]} fallen />
      <Rope from={[-1.15, 0.94, -3.0]} to={[1.15, 0.94, -3.0]} />
      <Rope from={[-1.15, 0.94, -3.0]} to={[-1.15, 0.94, -0.6]} />
      <Rope from={[1.15, 0.94, -3.0]} to={[1.7, 0.06, -0.5]} sag={0.4} />
      {/* police tape across the front */}
      <mesh position={[-1.9, 0.9, -1.4]} rotation={[0, 1.35, -0.03]}>
        <planeGeometry args={[2.6, 0.09]} />
        <meshStandardMaterial map={tx.tape} side={THREE.DoubleSide} roughness={0.5} emissive="#f2c230" emissiveIntensity={0.06} />
      </mesh>

      <EvidenceMarker position={[0.95, 0, -0.55]} map={tx.markers[0]} rot={-0.4} />
      <EvidenceMarker position={[-1.9, 0, 0.35]} map={tx.markers[1]} rot={0.3} />

      <MopBucket />
      <Vitrine />
      <StaffDoor staff={tx.staff} exit={tx.exit} marker={tx.markers[2]} />

      {/* dust hanging in the key light, and a little everywhere else */}
      <Dust count={mobile ? 30 : 60} sx={1.3} sy={4.4} sz={1.3} position={[PEDESTAL[0] + 0.2, 3.2, PEDESTAL[2] + 0.5]} size={0.035} opacity={0.75} color="#ffe6c0" reduce={reduce} />
      <Dust count={mobile ? 40 : 90} sx={11} sy={5} sz={8} position={[0, 2.6, -2]} size={0.03} opacity={0.35} color="#cfe0ff" reduce={reduce} />
    </group>
  )
}

/* A beam with no light of its own (the moonlight shaft). */
function Shaft({ from, to, color, radiusTop, radiusBottom, opacity, level }) {
  const group = useRef()
  const mat = useRef()
  const len = useMemo(() => new THREE.Vector3(...from).distanceTo(new THREE.Vector3(...to)), [from, to])
  const [look] = useState(() => new THREE.Vector3(...to))
  useFrame(() => {
    if (group.current) group.current.lookAt(look)
    if (mat.current) mat.current.uniforms.uOpacity.value = opacity * (0.4 + level.current * 0.6)
  })
  return (
    <group ref={group} position={from}>
      <Beam len={len} radiusTop={radiusTop} radiusBottom={radiusBottom} color={color} opacity={opacity} matRef={mat} />
    </group>
  )
}
