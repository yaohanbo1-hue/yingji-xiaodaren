/**
 * ===========================================================================
 * 应急小达人 v1.1.0 Clean — 极简 Canvas 粒子背景
 * ===========================================================================
 * 设计理念：克制、精致、不抢内容风头
 * 参考：Apple / Linear / Vercel 背景风格
 * 
 * 【变化】
 * - 粒子数量减少 70%，更稀疏
 * - 统一蓝色调，去掉杂乱颜色
 * - 去掉流星、星云等干扰元素
 * - 保留微弱连线和呼吸感
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

// 精简粒子系统
const PARTICLE_COUNT = 40; // 原来 150，现在 40
const LINE_DIST = 100;

class Particle {
  constructor() { this.reset(true); }
  reset(init) {
    this.x = init ? Math.random() * W : Math.random() * W;
    this.y = init ? Math.random() * H : Math.random() * H;
    this.r = Math.random() * 1.2 + 0.5;
    this.vx = (Math.random() - 0.5) * 0.15;
    this.vy = (Math.random() - 0.5) * 0.15;
    this.baseAlpha = Math.random() * 0.15 + 0.05;
    this.phase = Math.random() * Math.PI * 2;
    this.breatheSpeed = 0.008 + Math.random() * 0.005;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.phase += this.breatheSpeed;
    if (this.x < -10) this.x = W + 10;
    if (this.x > W + 10) this.x = -10;
    if (this.y < -10) this.y = H + 10;
    if (this.y > H + 10) this.y = -10;
  }
  draw() {
    const alpha = this.baseAlpha * (0.7 + 0.3 * Math.sin(this.phase));
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#5BA4CF';
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
        const alpha = 0.04 * (1 - dist / LINE_DIST);
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = '#5BA4CF';
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
  
  requestAnimationFrame(animate);
}
animate();
}
