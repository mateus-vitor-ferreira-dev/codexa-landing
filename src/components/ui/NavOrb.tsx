'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useTheme } from '@/context/ThemeContext'

const POINT_COUNT   = 120
const RADIUS        = 1.3
const MAX_LINE_DIST = 0.55
const PULSE_COUNT   = 3

function makeTexture(r: number, g: number, b: number): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const ctx = c.getContext('2d')!
  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  grad.addColorStop(0,   'rgba(255,255,255,1)')
  grad.addColorStop(0.4, `rgba(${r},${g},${b},0.85)`)
  grad.addColorStop(1,   `rgba(${r},${g},${b},0)`)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 64, 64)
  return new THREE.CanvasTexture(c)
}

function buildPoints(): THREE.Vector3[] {
  const pts: THREE.Vector3[] = []
  for (let i = 0; i < POINT_COUNT; i++) {
    const phi   = Math.acos(1 - 2 * (i + 0.5) / POINT_COUNT)
    const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5)
    pts.push(new THREE.Vector3(
      Math.sin(phi) * Math.cos(theta) * RADIUS,
      Math.sin(phi) * Math.sin(theta) * RADIUS,
      Math.cos(phi)                   * RADIUS,
    ))
  }
  return pts
}

export function NavOrb() {
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const materialsRef = useRef<{ lineMat: THREE.LineBasicMaterial; ptMat: THREE.PointsMaterial } | null>(null)
  const { theme } = useTheme()

  useEffect(() => {
    const canvas    = canvasRef.current
    const container = canvas?.parentElement
    if (!canvas || !container) return

    const [r, g, b] = theme.rgb.split(',').map(n => parseInt(n.trim()))

    const scene    = new THREE.Scene()
    const camera   = new THREE.PerspectiveCamera(50, 1, 0.1, 100)
    camera.position.z = 3.2

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    const s = Math.min(container.clientWidth, container.clientHeight)
    renderer.setSize(s, s, false)

    const points = buildPoints()

    const ptGeom  = new THREE.BufferGeometry()
    const ptPos   = new Float32Array(POINT_COUNT * 3)
    points.forEach((p, i) => { ptPos[i*3]=p.x; ptPos[i*3+1]=p.y; ptPos[i*3+2]=p.z })
    ptGeom.setAttribute('position', new THREE.BufferAttribute(ptPos, 3))
    const ptTex  = makeTexture(r, g, b)
    const ptMat  = new THREE.PointsMaterial({
      size: 0.07, map: ptTex, transparent: true,
      depthWrite: false, blending: THREE.AdditiveBlending, color: 0xffffff,
    })
    const ptCloud = new THREE.Points(ptGeom, ptMat)

    const linePos: number[] = []
    for (let i = 0; i < points.length; i++)
      for (let j = i + 1; j < points.length; j++)
        if (points[i].distanceTo(points[j]) < MAX_LINE_DIST)
          linePos.push(points[i].x, points[i].y, points[i].z, points[j].x, points[j].y, points[j].z)

    const lineGeom = new THREE.BufferGeometry()
    lineGeom.setAttribute('position', new THREE.Float32BufferAttribute(linePos, 3))
    const lineMat = new THREE.LineBasicMaterial({
      color: theme.three, transparent: true, opacity: 0.3,
      blending: THREE.AdditiveBlending, depthWrite: false,
    })
    const lines = new THREE.LineSegments(lineGeom, lineMat)

    const orb = new THREE.Group()
    orb.add(ptCloud, lines)
    scene.add(orb)

    // Pulses
    const pulseMeshGeom = new THREE.SphereGeometry(0.04, 8, 8)
    const pulses = Array.from({ length: PULSE_COUNT }, () => {
      const mat  = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending })
      const mesh = new THREE.Mesh(pulseMeshGeom, mat)
      scene.add(mesh)
      return { mesh, mat, start: points[Math.floor(Math.random() * points.length)].clone(), end: points[Math.floor(Math.random() * points.length)].clone(), progress: Math.random(), speed: 0.006 + Math.random() * 0.006 }
    })

    materialsRef.current = { lineMat, ptMat }

    let raf = 0
    const animate = () => {
      raf = requestAnimationFrame(animate)
      orb.rotation.y += 0.004
      orb.rotation.x = Math.sin(Date.now() * 0.0003) * 0.15

      for (const p of pulses) {
        p.progress += p.speed
        if (p.progress >= 1) { p.start.copy(p.end); p.end.copy(points[Math.floor(Math.random() * points.length)]); p.progress = 0 }
        const pos = p.start.clone().lerp(p.end, p.progress)
        pos.normalize().multiplyScalar(RADIUS)
        p.mesh.position.copy(pos).applyEuler(orb.rotation)
        const fade = Math.sin(p.progress * Math.PI)
        p.mat.opacity = fade * 0.9
        p.mesh.scale.setScalar(0.5 + fade * 0.5)
      }

      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(raf)
      ptGeom.dispose(); ptMat.dispose(); ptTex.dispose()
      lineGeom.dispose(); lineMat.dispose()
      pulseMeshGeom.dispose()
      for (const p of pulses) p.mat.dispose()
      renderer.dispose()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update colors when theme changes without full remount
  useEffect(() => {
    const m = materialsRef.current
    if (!m) return
    const [r, g, b] = theme.rgb.split(',').map(n => parseInt(n.trim()))
    m.lineMat.color.setHex(theme.three)
    m.ptMat.map = makeTexture(r, g, b)
    m.ptMat.needsUpdate = true
  }, [theme.id, theme.three, theme.rgb])

  return (
    <div style={{ width: 36, height: 36, flexShrink: 0 }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  )
}
