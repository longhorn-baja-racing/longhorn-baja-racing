import type { SeasonId } from "@/lib/seasons"

/*
  Lightweight 2D particle layer for seasonal decorations: a handful of leaves,
  snowflakes, petals, or fireflies drawn on one fixed canvas. A few dozen
  particles per frame, paused while the tab is hidden, and never started under
  prefers-reduced-motion.
*/

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  spin: number
  angle: number
  flip: number
  flipSpeed: number
  sway: number
  phase: number
  color: string
  life: number
  maxLife: number
  ambient: boolean
}

const palettes: Record<SeasonId, string[]> = {
  autumn: ["#e6a43a", "#d9822b", "#c8571a", "#b54212", "#8e3617"],
  winter: ["#ffffff", "#f4f1ec", "#dfe9ff"],
  bluebonnets: ["#3b5bdb", "#4263eb", "#4c6ef5", "#5c7cfa", "#f8f9fa"],
  fireflies: ["#f4ff9a", "#e9ff7a", "#fff3a0"],
}

const ambientCount: Record<SeasonId, number> = { autumn: 9, winter: 46, bluebonnets: 9, fireflies: 16 }

// Maple-style leaf outline in a unit box centered on the origin.
const LEAF: [number, number][] = [[0, -0.5], [0.1, -0.25], [0.34, -0.38], [0.28, -0.11], [0.5, -0.08], [0.3, 0.13], [0.4, 0.28], [0.07, 0.35], [-0.01, 0.5], [-0.06, 0.34], [-0.38, 0.3], [-0.28, 0.1], [-0.5, -0.1], [-0.22, -0.11], [-0.33, -0.35], [-0.08, -0.24]]

export type ParticleLayer = { burst: (x: number, y: number, count?: number) => void; dispose: () => void }

export function createParticles(canvas: HTMLCanvasElement, season: SeasonId): ParticleLayer {
  const ctx = canvas.getContext("2d")!
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
  let w = 0, h = 0
  const resize = () => {
    w = window.innerWidth
    h = window.innerHeight
    canvas.width = Math.round(w * dpr)
    canvas.height = Math.round(h * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }
  resize()

  const leaf = new Path2D()
  LEAF.forEach(([x, y], i) => (i ? leaf.lineTo(x, y) : leaf.moveTo(x, y)))
  leaf.closePath()
  const glow = document.createElement("canvas")
  glow.width = glow.height = 64
  const gctx = glow.getContext("2d")!
  const grad = gctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  grad.addColorStop(0, "rgba(244,255,154,1)")
  grad.addColorStop(0.25, "rgba(233,255,122,0.55)")
  grad.addColorStop(1, "rgba(233,255,122,0)")
  gctx.fillStyle = grad
  gctx.fillRect(0, 0, 64, 64)

  const palette = palettes[season]
  const pick = () => palette[Math.floor(Math.random() * palette.length)]
  const particles: Particle[] = []

  const spawn = (ambient: boolean, x?: number, y?: number): Particle => {
    const fire = season === "fireflies"
    const snow = season === "winter"
    const size = snow ? 1.2 + Math.random() * 2.4 : fire ? 10 + Math.random() * 12 : 14 + Math.random() * 12
    return {
      x: x ?? Math.random() * w,
      y: y ?? (fire ? h * (0.25 + Math.random() * 0.75) : -30 - Math.random() * h * (ambient ? 1 : 0.1)),
      vx: (Math.random() - 0.5) * (ambient ? 14 : 120),
      vy: fire ? (Math.random() - 0.5) * 10 : snow ? 22 + Math.random() * 30 : 34 + Math.random() * 36,
      size,
      spin: (Math.random() - 0.5) * 2.4,
      angle: Math.random() * Math.PI * 2,
      flip: Math.random() * Math.PI * 2,
      flipSpeed: 1.5 + Math.random() * 2.5,
      sway: snow ? 10 + Math.random() * 14 : 18 + Math.random() * 30,
      phase: Math.random() * Math.PI * 2,
      color: pick(),
      life: 0,
      maxLife: fire ? 6 + Math.random() * 8 : Infinity,
      ambient,
    }
  }
  for (let i = 0; i < ambientCount[season]; i++) {
    const p = spawn(true)
    if (season !== "fireflies") p.y = Math.random() * h
    particles.push(p)
  }

  const draw = (p: Particle, t: number) => {
    const sx = p.x + Math.sin(t * 0.8 + p.phase) * p.sway
    if (season === "winter") {
      ctx.globalAlpha = 0.75
      ctx.fillStyle = p.color
      ctx.beginPath()
      ctx.arc(sx, p.y, p.size, 0, Math.PI * 2)
      ctx.fill()
      return
    }
    if (season === "fireflies") {
      const blink = Math.max(0, Math.sin(t * 2.2 + p.phase * 3)) ** 3
      const fade = Math.min(1, p.life / 1.2, (p.maxLife - p.life) / 1.2)
      ctx.globalAlpha = blink * Math.max(0, fade) * 0.9
      ctx.drawImage(glow, sx - p.size, p.y - p.size, p.size * 2, p.size * 2)
      return
    }
    ctx.save()
    ctx.translate(sx, p.y)
    ctx.rotate(p.angle)
    ctx.scale(Math.cos(p.flip) * 0.85 + 0.15 * Math.sign(Math.cos(p.flip) || 1), 1)
    ctx.globalAlpha = 0.92
    ctx.fillStyle = p.color
    if (season === "autumn") {
      ctx.scale(p.size, p.size * 1.2)
      ctx.fill(leaf)
    } else {
      ctx.beginPath()
      ctx.ellipse(0, 0, p.size * 0.26, p.size * 0.42, 0, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
  }

  let raf = 0
  let last = 0
  let time = 0
  const tick = (now: number) => {
    raf = requestAnimationFrame(tick)
    const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016)
    last = now
    time += dt
    ctx.clearRect(0, 0, w, h)
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i]
      p.life += dt
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.vx *= p.ambient ? 1 : 1 - Math.min(1, dt * 0.9)
      p.angle += p.spin * dt
      p.flip += p.flipSpeed * dt
      if (season === "fireflies") {
        p.vx += (Math.random() - 0.5) * 30 * dt
        p.vy += (Math.random() - 0.5) * 30 * dt
      }
      const gone = p.y > h + 40 || p.life > p.maxLife || p.x < -80 || p.x > w + 80
      if (gone) {
        if (p.ambient) particles[i] = spawn(true)
        else particles.splice(i, 1)
        continue
      }
      draw(p, time)
    }
    ctx.globalAlpha = 1
  }
  const onVisibility = () => {
    cancelAnimationFrame(raf)
    last = 0
    if (!document.hidden) raf = requestAnimationFrame(tick)
  }
  document.addEventListener("visibilitychange", onVisibility)
  window.addEventListener("resize", resize)
  raf = requestAnimationFrame(tick)

  return {
    burst(x, y, count = 14) {
      for (let i = 0; i < count && particles.length < 160; i++) {
        const p = spawn(false, x + (Math.random() - 0.5) * 90, y + Math.random() * 10)
        if (season === "fireflies") p.maxLife = 2.5 + Math.random() * 3
        particles.push(p)
      }
    },
    dispose() {
      cancelAnimationFrame(raf)
      document.removeEventListener("visibilitychange", onVisibility)
      window.removeEventListener("resize", resize)
    },
  }
}
