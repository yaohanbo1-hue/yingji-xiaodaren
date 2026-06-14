/**
 * ===========================================================================
 * 应急小达人 — Liquid Glass 液态玻璃 + 3D 全息交互系统
 * ===========================================================================
 *
 * 特性：
 * 1. 鼠标跟随 3D 倾斜（Tilt）—— 卡片随鼠标角度旋转
 * 2. 鼠标光追高光（Spotlight）—— 液态玻璃上的光标反射
 * 3. 丝滑过渡引擎（Smooth Engine）—— 所有交互带弹性缓动
 * 4. 视差层级（Parallax Depth）—— 背景、内容、前景分层移动
 * 5. 磁性吸附按钮（Magnetic Buttons）—— 按钮被光标吸引
 *
 * @version 1.0.0
 * ===========================================================================
 */

(function() {
  'use strict';

  const LiquidGlass = {
    // 配置
    config: {
      tiltMaxAngle: 12,           // 3D 倾斜最大角度
      tiltPerspective: 800,         // 3D 透视距离
      tiltScale: 1.02,            // 悬停放大倍数
      spotlightIntensity: 0.15,   // 光追强度
      parallaxStrength: 0.08,     // 视差强度
      magneticRange: 60,          // 磁性吸附范围(px)
      magneticStrength: 0.3,      // 磁性吸附强度
      smoothDuration: 0.6,        // 过渡时长(s)
      smoothEasing: 'cubic-bezier(0.23, 1, 0.32, 1)', // 丝滑缓动曲线
    },

    // 初始化
    init() {
      this._addStyles();
      this._initTilt();
      this._initSpotlight();
      this._initMagnetic();
      this._initParallax();
      this._initSmoothTransitions();
      this._initEntranceAnimations();
      console.log('💎 Liquid Glass + 3D 系统已加载');
    },

    // 注入动态样式
    _addStyles() {
      const style = document.createElement('style');
      style.textContent = `
        /* ===== 丝滑全局过渡 ===== */
        .liquid-smooth {
          transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1) !important;
        }
        .liquid-smooth-fast {
          transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1) !important;
        }
        .liquid-smooth-slow {
          transition: all 1s cubic-bezier(0.23, 1, 0.32, 1) !important;
        }

        /* ===== 3D 透视容器 ===== */
        .liquid-perspective {
          perspective: 800px;
          transform-style: preserve-3d;
        }

        /* ===== 液态玻璃卡片 ===== */
        .liquid-card {
          position: relative;
          background: rgba(255, 255, 255, 0.03) !important;
          backdrop-filter: blur(24px) saturate(1.8) !important;
          -webkit-backdrop-filter: blur(24px) saturate(1.8) !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          border-radius: 24px !important;
          overflow: hidden !important;
          transform-style: preserve-3d;
          transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1),
                      box-shadow 0.6s cubic-bezier(0.23, 1, 0.32, 1),
                      border-color 0.4s ease !important;
          will-change: transform;
        }
        .liquid-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1.5px;
          background: linear-gradient(135deg, 
            rgba(255,255,255,0.25) 0%, 
            rgba(255,255,255,0.05) 25%, 
            rgba(255,255,255,0) 50%, 
            rgba(255,255,255,0.05) 75%, 
            rgba(255,255,255,0.2) 100%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
          z-index: 1;
          opacity: 0.6;
          transition: opacity 0.4s ease;
        }
        .liquid-card::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: radial-gradient(
            600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
            rgba(255, 255, 255, 0.12) 0%,
            transparent 40%
          );
          pointer-events: none;
          z-index: 2;
          opacity: 0;
          transition: opacity 0.4s ease;
        }
        .liquid-card:hover::after {
          opacity: 1;
        }
        .liquid-card:hover::before {
          opacity: 1;
        }
        .liquid-card:hover {
          border-color: rgba(255, 255, 255, 0.15) !important;
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.3),
            0 0 0 1px rgba(255, 255, 255, 0.05),
            inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
        }

        /* ===== 液态玻璃按钮 ===== */
        .liquid-btn {
          position: relative;
          background: rgba(255, 255, 255, 0.06) !important;
          backdrop-filter: blur(16px) saturate(1.5) !important;
          -webkit-backdrop-filter: blur(16px) saturate(1.5) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 16px !important;
          overflow: hidden !important;
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1) !important;
          transform-style: preserve-3d;
          will-change: transform;
        }
        .liquid-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: radial-gradient(
            200px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
            rgba(255, 255, 255, 0.2) 0%,
            transparent 50%
          );
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .liquid-btn:hover::before {
          opacity: 1;
        }
        .liquid-btn:hover {
          background: rgba(255, 255, 255, 0.1) !important;
          border-color: rgba(255, 255, 255, 0.2) !important;
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.08) !important;
        }
        .liquid-btn:active {
          transform: translateY(0) scale(0.98);
          transition-duration: 0.1s !important;
        }

        /* ===== 全息霓虹边框 ===== */
        .liquid-neon {
          position: relative;
          border-radius: 20px;
          overflow: hidden;
        }
        .liquid-neon::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 22px;
          background: linear-gradient(135deg, 
            #00d4ff 0%, #9b59b6 25%, #ff2d95 50%, #ffd700 75%, #00d4ff 100%);
          z-index: -1;
          opacity: 0;
          transition: opacity 0.6s ease;
          filter: blur(8px);
        }
        .liquid-neon:hover::before {
          opacity: 0.5;
          animation: neonRotate 3s linear infinite;
        }
        @keyframes neonRotate {
          0% { filter: blur(8px) hue-rotate(0deg); }
          100% { filter: blur(8px) hue-rotate(360deg); }
        }

        /* ===== 浮动粒子背景 ===== */
        .liquid-particles {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }
        .liquid-particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: rgba(0, 212, 255, 0.4);
          border-radius: 50%;
          filter: blur(1px);
          animation: particleFloat 8s ease-in-out infinite;
        }
        @keyframes particleFloat {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.6; }
          50% { transform: translateY(-100vh) translateX(50px); opacity: 0.3; }
          90% { opacity: 0.6; }
        }

        /* ===== 入场动画 ===== */
        .liquid-enter {
          opacity: 0;
          transform: translateY(30px) scale(0.95);
          transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .liquid-enter.visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
        .liquid-enter-stagger > .liquid-enter {
          transition-delay: calc(var(--i, 0) * 0.08s);
        }

        /* ===== 加载动画 ===== */
        .liquid-loader {
          position: fixed;
          inset: 0;
          z-index: 999999;
          background: #050510;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          transition: opacity 0.8s cubic-bezier(0.23, 1, 0.32, 1),
                      visibility 0.8s ease;
        }
        .liquid-loader.hidden {
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
        }
        .liquid-loader-orb {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, 
            rgba(0, 212, 255, 0.3) 0%, 
            rgba(155, 89, 182, 0.2) 40%, 
            rgba(0, 0, 0, 0) 70%);
          backdrop-filter: blur(20px) saturate(2);
          -webkit-backdrop-filter: blur(20px) saturate(2);
          border: 1px solid rgba(255, 255, 255, 0.1);
          position: relative;
          animation: orbPulse 2s ease-in-out infinite, orbFloat 3s ease-in-out infinite;
          box-shadow: 
            0 0 60px rgba(0, 212, 255, 0.2),
            0 0 120px rgba(155, 89, 182, 0.1),
            inset 0 0 40px rgba(255, 255, 255, 0.05);
        }
        .liquid-loader-orb::before {
          content: '🚨';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 48px;
          filter: drop-shadow(0 0 20px rgba(0, 212, 255, 0.6));
        }
        @keyframes orbPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        @keyframes orbFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        .liquid-loader-ring {
          position: absolute;
          width: 160px;
          height: 160px;
          border-radius: 50%;
          border: 1px solid rgba(0, 212, 255, 0.1);
          animation: ringSpin 6s linear infinite;
        }
        .liquid-loader-ring:nth-child(2) {
          width: 200px;
          height: 200px;
          border-color: rgba(155, 89, 182, 0.08);
          animation-duration: 8s;
          animation-direction: reverse;
        }
        @keyframes ringSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .liquid-loader-text {
          margin-top: 40px;
          font-size: 18px;
          font-weight: 700;
          color: rgba(0, 212, 255, 0.6);
          letter-spacing: 6px;
          text-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
          animation: textGlow 2s ease-in-out infinite;
        }
        @keyframes textGlow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        .liquid-loader-bar {
          width: 200px;
          height: 2px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 1px;
          margin-top: 20px;
          overflow: hidden;
        }
        .liquid-loader-fill {
          height: 100%;
          width: 0%;
          background: linear-gradient(90deg, #00d4ff, #9b59b6);
          border-radius: 1px;
          transition: width 0.4s cubic-bezier(0.23, 1, 0.32, 1);
          box-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
        }

        /* ===== 页面切换动画 ===== */
        .liquid-page-enter {
          animation: pageEnter 0.5s cubic-bezier(0.23, 1, 0.32, 1) forwards;
        }
        @keyframes pageEnter {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .liquid-page-exit {
          animation: pageExit 0.3s cubic-bezier(0.23, 1, 0.32, 1) forwards;
        }
        @keyframes pageExit {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to { opacity: 0; transform: translateY(-20px) scale(0.98); }
        }

        /* ===== 水波纹点击效果 ===== */
        .liquid-ripple {
          position: relative;
          overflow: hidden;
        }
        .liquid-ripple .ripple-effect {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          transform: scale(0);
          animation: rippleAnim 0.6s ease-out forwards;
          pointer-events: none;
        }
        @keyframes rippleAnim {
          to { transform: scale(4); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    },

    // 3D 倾斜系统
    _initTilt() {
      const cards = document.querySelectorAll('.mode-btn, .feature-item, .liquid-card, .btn');
      cards.forEach(card => {
        card.classList.add('liquid-card');
        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const rotateX = ((y - centerY) / centerY) * -this.config.tiltMaxAngle;
          const rotateY = ((x - centerX) / centerX) * this.config.tiltMaxAngle;
          
          card.style.transform = `perspective(${this.config.tiltPerspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${this.config.tiltScale})`;
          card.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
          card.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
        });
        card.addEventListener('mouseleave', () => {
          card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale(1)';
        });
      });
    },

    // 光追高光系统
    _initSpotlight() {
      document.addEventListener('mousemove', (e) => {
        const cards = document.querySelectorAll('.liquid-card');
        cards.forEach(card => {
          const rect = card.getBoundingClientRect();
          if (e.clientX >= rect.left - 100 && e.clientX <= rect.right + 100 &&
              e.clientY >= rect.top - 100 && e.clientY <= rect.bottom + 100) {
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            card.style.setProperty('--mouse-x', `${x}%`);
            card.style.setProperty('--mouse-y', `${y}%`);
          }
        });
      });
    },

    // 磁性吸附按钮
    _initMagnetic() {
      const buttons = document.querySelectorAll('.btn, .tool-btn, .mode-btn');
      buttons.forEach(btn => {
        btn.classList.add('liquid-btn');
        btn.addEventListener('mousemove', (e) => {
          const rect = btn.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          const dist = Math.sqrt(x * x + y * y);
          if (dist < this.config.magneticRange) {
            const moveX = x * this.config.magneticStrength;
            const moveY = y * this.config.magneticStrength;
            btn.style.transform = `translate(${moveX}px, ${moveY}px)`;
          }
        });
        btn.addEventListener('mouseleave', () => {
          btn.style.transform = 'translate(0, 0)';
        });
      });
    },

    // 视差层级
    _initParallax() {
      const layers = document.querySelectorAll('.bg-orb, .dust, .geo-ring');
      document.addEventListener('mousemove', (e) => {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        const dx = (e.clientX - cx) / cx;
        const dy = (e.clientY - cy) / cy;
        layers.forEach((layer, i) => {
          const depth = (i + 1) * this.config.parallaxStrength;
          layer.style.transform = `translate(${dx * depth * 50}px, ${dy * depth * 50}px)`;
          layer.style.transition = 'transform 0.3s ease-out';
        });
      });
    },

    // 丝滑过渡引擎
    _initSmoothTransitions() {
      // 为所有页面容器添加平滑过渡
      const pages = document.querySelectorAll('.page');
      pages.forEach(page => {
        page.style.transition = 'opacity 0.5s cubic-bezier(0.23, 1, 0.32, 1), transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
      });

      // 覆盖 PageManager 导航，添加丝滑过渡
      const originalNavigate = window.PageManager?.navigate;
      if (originalNavigate) {
        window.PageManager.navigate = function(pageId) {
          const currentPage = document.querySelector('.page.active');
          if (currentPage) {
            currentPage.style.opacity = '0';
            currentPage.style.transform = 'translateY(-20px) scale(0.98)';
            setTimeout(() => {
              originalNavigate.call(this, pageId);
              const newPage = document.querySelector(`#page-${pageId}`);
              if (newPage) {
                newPage.style.opacity = '0';
                newPage.style.transform = 'translateY(20px) scale(0.98)';
                requestAnimationFrame(() => {
                  newPage.style.opacity = '1';
                  newPage.style.transform = 'translateY(0) scale(1)';
                });
              }
            }, 300);
          } else {
            originalNavigate.call(this, pageId);
          }
        };
      }
    },

    // 入场动画
    _initEntranceAnimations() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

      const items = document.querySelectorAll('.mode-btn, .feature-item, .menu-cat-btn');
      items.forEach((item, i) => {
        item.classList.add('liquid-enter');
        item.style.setProperty('--i', i);
        observer.observe(item);
      });

      // 初始触发一次
      setTimeout(() => {
        items.forEach(item => item.classList.add('visible'));
      }, 500);
    },

    // 创建浮动粒子
    createParticles(count = 30) {
      const container = document.createElement('div');
      container.className = 'liquid-particles';
      for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'liquid-particle';
        p.style.left = `${Math.random() * 100}%`;
        p.style.top = `${Math.random() * 100}%`;
        p.style.animationDelay = `${Math.random() * 8}s`;
        p.style.animationDuration = `${6 + Math.random() * 6}s`;
        p.style.width = `${2 + Math.random() * 4}px`;
        p.style.height = p.style.width;
        const colors = ['rgba(0,212,255,0.4)', 'rgba(155,89,182,0.4)', 'rgba(255,45,149,0.3)', 'rgba(0,230,118,0.3)'];
        p.style.background = colors[Math.floor(Math.random() * colors.length)];
        container.appendChild(p);
      }
      document.body.appendChild(container);
    },

    // 水波纹点击
    addRipple(element) {
      element.classList.add('liquid-ripple');
      element.addEventListener('click', (e) => {
        const ripple = document.createElement('span');
        ripple.className = 'ripple-effect';
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
        ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
        element.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
      });
    }
  };

  // 暴露到全局
  window.LiquidGlass = LiquidGlass;

  // 页面加载后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => LiquidGlass.init());
  } else {
    setTimeout(() => LiquidGlass.init(), 100);
  }
})();
