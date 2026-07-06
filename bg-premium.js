/**
 * ===========================================================================
 * 应急小达人 v1.2.0 Premium — Canvas 粒子背景
 * ===========================================================================
 * 设计方向：Deep Command Center
 * 粒子色调：Slate Blue / Amber / Violet（与 CSS 光晕呼应）
 * ===========================================================================
 */
const bgCanvas = document.getElementById('bgCanvas');
if (!bgCanvas) { /* 容错 */ } else {
const ctx = bgCanvas.getContext('2d');
let W, H, frame = 0;

function resize() {
  W = bgCanvas.width = window.innerWidth;
  H = bgCanvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

const PARTICLE_COUNT = 70;
const LINE_DIST = 130;

class Particle {
  constructor() { this.reset(true); }
  reset(init) {
    this.x = init ? Math.random() * W : Math.random() * W;
    this.y = init ? Math.random() * H : Math.random() * H;
    this.r = Math.random() * 1.8 + 1;
    this.vx = (Math.random() - 0.5) * 0.15;
    this.vy = (Math.random() - 0.5) * 0.15;
    this.baseAlpha = Math.random() * 0.25 + 0.1;
    this.phase = Math.random() * Math.PI * 2;
    this.breatheSpeed = 0.004 + Math.random() * 0.004;
    // 三种色调：蓝 / 紫 / 琥珀
    const r = Math.random();
    if (r < 0.5) this.color = [96, 165, 250];    // slate-blue
    else if (r < 0.8) this.color = [167, 139, 250]; // violet
    else this.color = [251, 146, 60];             // amber
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.phase += this.breatheSpeed;
    if (this.x < -15) this.x = W + 15;
    if (this.x > W + 15) this.x = -15;
    if (this.y < -15) this.y = H + 15;
    if (this.y > H + 15) this.y = -15;
  }
  draw() {
    const [r, g, b] = this.color;
    const alpha = this.baseAlpha * (0.6 + 0.4 * Math.sin(this.phase));
    
    // 光晕
    ctx.globalAlpha = alpha * 0.2;
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r * 4, 0, Math.PI * 2);
    ctx.fill();
    
    // 核心
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

const particles = [];
for (let i = 0; i < PARTICLE_COUNT; i++) {
  particles.push(new Particle());
}

function drawLines() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < LINE_DIST) {
        const alpha = 0.05 * (1 - dist / LINE_DIST);
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = 'rgba(96, 165, 250, 1)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }
}

function animate() {
  frame++;
  ctx.clearRect(0, 0, W, H);
  ctx.globalAlpha = 1;

  for (const p of particles) { p.update(); }
  drawLines();
  for (const p of particles) { p.draw(); }

  if (_bgRunning) requestAnimationFrame(animate);
}

// v1.3.5：尊重“减少动态效果”系统设置；标签页隐藏时暂停动画以降低 CPU/电量开销
const _reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let _bgRunning = false;

if (_reduceMotion) {
  // 仅绘制一帧静态背景，不进入持续动画循环
  for (const p of particles) { p.update(); }
  drawLines();
  for (const p of particles) { p.draw(); }
} else {
  _bgRunning = true;
  requestAnimationFrame(animate);
}

document.addEventListener('visibilitychange', function() {
  if (document.hidden) {
    _bgRunning = false;
  } else if (!_reduceMotion && !_bgRunning) {
    _bgRunning = true;
    requestAnimationFrame(animate);
  }
});
}
