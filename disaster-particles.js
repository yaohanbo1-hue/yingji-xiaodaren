/**
 * ===========================================================================
 * 应急小达人 v1.2.0 — 灾害模拟粒子增强引擎
 * ===========================================================================
 * 
 * 功能：
 * 1. 增强粒子系统（更多粒子类型、物理效果）
 * 2. 地震：裂缝扩展 + 碎石飞溅 + 灰尘弥漫
 * 3. 洪水：水花飞溅 + 波纹扩散 + 泡沫漂浮
 * 4. 山火：火星飞溅 + 烟雾升腾 + 余烬飘散
 * 5. 台风：雨滴倾斜 + 落叶飞舞 + 碎片横飞
 * 
 * @version 1.2.0
 * ===========================================================================
 */

const DisasterParticlesEnhancer = {
  _particles: [],
  _maxParticles: 200,
  _animationId: null,
  
  // 粒子类型
  _types: {
    // 地震 - 碎石
    debris: {
      color: '#8B4513',
      size: [2, 6],
      speed: [2, 5],
      gravity: 0.3,
      life: [30, 60],
      rotation: true
    },
    // 地震 - 灰尘
    dust: {
      color: 'rgba(139, 115, 85, 0.6)',
      size: [10, 30],
      speed: [0.5, 1.5],
      gravity: -0.02,
      life: [60, 120],
      fadeOut: true
    },
    // 洪水 - 水花
    splash: {
      color: '#3B82F6',
      size: [3, 8],
      speed: [3, 6],
      gravity: 0.4,
      life: [20, 40],
      bounce: true
    },
    // 洪水 - 泡沫
    foam: {
      color: 'rgba(255, 255, 255, 0.8)',
      size: [4, 10],
      speed: [0.5, 1],
      gravity: -0.05,
      life: [80, 150],
      wobble: true
    },
    // 山火 - 火星
    ember: {
      color: '#FF6B35',
      size: [2, 5],
      speed: [1, 3],
      gravity: -0.1,
      life: [40, 80],
      glow: true,
      flicker: true
    },
    // 山火 - 烟雾
    smoke: {
      color: 'rgba(80, 80, 80, 0.4)',
      size: [20, 50],
      speed: [0.3, 0.8],
      gravity: -0.05,
      life: [100, 200],
      fadeOut: true,
      expand: true
    },
    // 台风 - 雨滴
    rain: {
      color: '#60A5FA',
      size: [1, 3],
      speed: [8, 15],
      gravity: 0.5,
      life: [30, 60],
      angle: 45, // 倾斜角度
      trail: true
    },
    // 台风 - 落叶
    leaf: {
      color: '#22C55E',
      size: [6, 12],
      speed: [3, 6],
      gravity: 0.1,
      life: [80, 150],
      rotation: true,
      wobble: true
    }
  },
  
  // 创建粒子
  createParticle(type, x, y, options = {}) {
    const config = this._types[type];
    if (!config) return null;
    
    const particle = {
      type: type,
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * (config.speed[1] - config.speed[0]) + config.speed[0],
      vy: (Math.random() - 0.5) * (config.speed[1] - config.speed[0]) - config.speed[0],
      size: config.size[0] + Math.random() * (config.size[1] - config.size[0]),
      life: config.life[0] + Math.random() * (config.life[1] - config.life[0]),
      maxLife: config.life[1],
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.2,
      color: options.color || config.color,
      gravity: config.gravity,
      opacity: 1,
      config: config
    };
    
    // 应用选项
    if (options.vx !== undefined) particle.vx = options.vx;
    if (options.vy !== undefined) particle.vy = options.vy;
    if (options.angle) {
      const rad = options.angle * Math.PI / 180;
      particle.vx = Math.cos(rad) * config.speed[1];
      particle.vy = Math.sin(rad) * config.speed[1];
    }
    
    this._particles.push(particle);
    
    // 限制粒子数量
    if (this._particles.length > this._maxParticles) {
      this._particles.shift();
    }
    
    return particle;
  },
  
  // 地震效果
  earthquakeBurst(x, y, intensity = 1) {
    const count = Math.floor(20 * intensity);
    
    // 碎石
    for (let i = 0; i < count; i++) {
      this.createParticle('debris', x + (Math.random() - 0.5) * 50, y);
    }
    
    // 灰尘
    for (let i = 0; i < count / 2; i++) {
      this.createParticle('dust', x + (Math.random() - 0.5) * 100, y + Math.random() * 30);
    }
  },
  
  // 洪水效果
  floodSplash(x, y, intensity = 1) {
    const count = Math.floor(15 * intensity);
    
    // 水花
    for (let i = 0; i < count; i++) {
      this.createParticle('splash', x + (Math.random() - 0.5) * 30, y);
    }
    
    // 泡沫
    for (let i = 0; i < count / 3; i++) {
      this.createParticle('foam', x + (Math.random() - 0.5) * 80, y + Math.random() * 20);
    }
  },
  
  // 山火效果
  fireBurst(x, y, intensity = 1) {
    const count = Math.floor(25 * intensity);
    
    // 火星
    for (let i = 0; i < count; i++) {
      this.createParticle('ember', x + (Math.random() - 0.5) * 40, y);
    }
    
    // 烟雾
    for (let i = 0; i < count / 4; i++) {
      this.createParticle('smoke', x + (Math.random() - 0.5) * 60, y - Math.random() * 20);
    }
  },
  
  // 台风效果
  typhoonBurst(x, y, intensity = 1) {
    const count = Math.floor(30 * intensity);
    
    // 雨滴（倾斜）
    for (let i = 0; i < count; i++) {
      this.createParticle('rain', x + Math.random() * 200 - 100, y - 50, { angle: 45 + Math.random() * 10 });
    }
    
    // 落叶
    for (let i = 0; i < count / 5; i++) {
      this.createParticle('leaf', x + (Math.random() - 0.5) * 100, y);
    }
  },
  
  // 更新粒子
  update() {
    for (let i = this._particles.length - 1; i >= 0; i--) {
      const p = this._particles[i];
      
      // 应用重力
      p.vy += p.gravity;
      
      // 更新位置
      p.x += p.vx;
      p.y += p.vy;
      
      // 更新旋转
      if (p.config.rotation) {
        p.rotation += p.rotationSpeed;
      }
      
      // 摇摆效果
      if (p.config.wobble) {
        p.x += Math.sin(p.life * 0.1) * 0.5;
      }
      
      // 淡出效果
      if (p.config.fadeOut) {
        p.opacity = p.life / p.maxLife;
      }
      
      // 扩大效果（烟雾）
      if (p.config.expand) {
        p.size += 0.2;
      }
      
      // 闪烁效果（火星）
      if (p.config.flicker) {
        p.opacity = 0.5 + Math.random() * 0.5;
      }
      
      // 反弹效果（水花）
      if (p.config.bounce && p.vy > 0) {
        p.vy *= -0.5;
      }
      
      // 减少生命
      p.life--;
      
      // 移除死亡粒子
      if (p.life <= 0) {
        this._particles.splice(i, 1);
      }
    }
  },
  
  // 绘制粒子
  draw(ctx) {
    this._particles.forEach(p => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.opacity;
      
      // 发光效果
      if (p.config.glow) {
        ctx.shadowColor = p.color;
        ctx.shadowBlur = p.size * 2;
      }
      
      // 轨迹效果
      if (p.config.trail) {
        const gradient = ctx.createLinearGradient(0, 0, -p.vx * 3, -p.vy * 3);
        gradient.addColorStop(0, p.color);
        gradient.addColorStop(1, 'transparent');
        ctx.strokeStyle = gradient;
        ctx.lineWidth = p.size;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-p.vx * 3, -p.vy * 3);
        ctx.stroke();
      }
      
      // 绘制粒子
      ctx.fillStyle = p.color;
      
      if (p.type === 'leaf') {
        // 叶子形状
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size / 2, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'debris') {
        // 碎石（不规则形状）
        ctx.beginPath();
        ctx.moveTo(-p.size / 2, -p.size / 3);
        ctx.lineTo(p.size / 2, -p.size / 4);
        ctx.lineTo(p.size / 3, p.size / 2);
        ctx.lineTo(-p.size / 3, p.size / 3);
        ctx.closePath();
        ctx.fill();
      } else {
        // 圆形粒子
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.restore();
    });
  },
  
  // 清理
  clear() {
    this._particles = [];
  },
  
  // 获取粒子数量
  getCount() {
    return this._particles.length;
  }
};

// 钩入原有灾害模拟系统
document.addEventListener('DOMContentLoaded', function() {
  const checkInterval = setInterval(() => {
    if (typeof DisasterSimEngine !== 'undefined') {
      clearInterval(checkInterval);
      
      // 保存原有动画方法（_animate 是提取后的对象方法）
      const originalAnimate = DisasterSimEngine._animate;
      
      // 增强动画循环
      DisasterSimEngine._animate = function() {
        // 调用原有动画
        if (originalAnimate) {
          originalAnimate.call(this);
        }
        
        // 更新和绘制增强粒子
        DisasterParticlesEnhancer.update();
        DisasterParticlesEnhancer.draw(this._ctx);
      };
      
      console.log('🌪️ 灾害粒子增强引擎已加载');
    }
  }, 100);
});

// 挂载到全局
window.DisasterParticlesEnhancer = DisasterParticlesEnhancer;
