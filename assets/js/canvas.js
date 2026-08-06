const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches

class ParticleField {
  constructor(canvas, palette, density) {
    this.canvas = canvas
    this.context = canvas.getContext('2d')
    this.palette = palette
    this.density = density
    this.particles = []
    this.pointer = { x: -500, y: -500 }
    this.resize = this.resize.bind(this)
    this.draw = this.draw.bind(this)
    addEventListener('resize', this.resize, { passive: true })
    canvas.parentElement.addEventListener('pointermove', event => {
      const bounds = canvas.getBoundingClientRect()
      this.pointer = { x: event.clientX - bounds.left, y: event.clientY - bounds.top }
    }, { passive: true })
    canvas.parentElement.addEventListener('pointerleave', () => this.pointer = { x: -500, y: -500 })
    this.resize()
    this.draw()
  }

  resize() {
    const ratio = Math.min(devicePixelRatio || 1, 2)
    const bounds = this.canvas.getBoundingClientRect()
    this.width = bounds.width
    this.height = bounds.height
    this.canvas.width = this.width * ratio
    this.canvas.height = this.height * ratio
    this.context.setTransform(ratio, 0, 0, ratio, 0, 0)
    const count = Math.min(85, Math.floor(this.width * this.height / this.density))
    this.particles = Array.from({ length: count }, () => ({
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      vx: (Math.random() - .5) * .22,
      vy: (Math.random() - .5) * .22,
      size: Math.random() * 1.8 + .4,
      gold: Math.random() > .82
    }))
  }

  update(particle) {
    const dx = particle.x - this.pointer.x
    const dy = particle.y - this.pointer.y
    const distance = Math.hypot(dx, dy)
    if (distance < 130 && distance > 0) {
      particle.x += dx / distance * 1.2
      particle.y += dy / distance * 1.2
    }
    particle.x += particle.vx
    particle.y += particle.vy
    if (particle.x < 0 || particle.x > this.width) particle.vx *= -1
    if (particle.y < 0 || particle.y > this.height) particle.vy *= -1
  }

  draw() {
    const context = this.context
    context.clearRect(0, 0, this.width, this.height)
    this.particles.forEach((particle, index) => {
      if (!reducedMotion) this.update(particle)
      const block = Math.max(3, Math.round(particle.size * 3))
      context.fillStyle = particle.gold ? this.palette.gold : this.palette.dot
      context.fillRect(Math.round(particle.x), Math.round(particle.y), block, block)
      this.particles.slice(index + 1).forEach(neighbor => {
        const distance = Math.hypot(particle.x - neighbor.x, particle.y - neighbor.y)
        if (distance < 115) {
          context.beginPath()
          context.moveTo(particle.x, particle.y)
          context.lineTo(neighbor.x, particle.y)
          context.lineTo(neighbor.x, neighbor.y)
          context.strokeStyle = this.palette.line.replace('ALPHA', ((1 - distance / 115) * .42).toFixed(2))
          context.stroke()
        }
      })
    })
    if (!reducedMotion) requestAnimationFrame(this.draw)
  }
}

const canvasPalette = {
  dot: 'rgba(165,230,201,.72)', gold: 'rgba(232,185,87,.95)', line: 'rgba(165,230,201,ALPHA)'
}
const heroCanvas = document.querySelector('#hero-canvas')
if (heroCanvas) new ParticleField(heroCanvas, canvasPalette, innerWidth < 600 ? 24000 : 14500)
document.querySelectorAll('.page-canvas').forEach(canvas => {
  new ParticleField(canvas, canvasPalette, innerWidth < 600 ? 26000 : 18000)
})
