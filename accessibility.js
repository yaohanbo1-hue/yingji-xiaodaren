/**
 * ===========================================================================
 * 应急小达人 v1.2.0 — 无障碍 & 移动端增强
 * ===========================================================================
 * 
 * 1. ARIA 标签自动注入
 * 2. 键盘导航支持（Tab / Enter / Escape）
 * 3. 触摸事件优化（300ms 延迟消除）
 * 4. 高对比度模式支持
 * 5. 屏幕阅读器友好
 * 
 * @version 1.2.0
 * ===========================================================================
 */

(function() {
  'use strict';
  
  // ===== 1. ARIA 标签注入 =====
  function injectAriaLabels() {
    // 页面容器
    document.querySelectorAll('.page').forEach(function(page) {
      var id = page.id.replace('page-', '');
      var names = {
        'menu': '主菜单',
        'battle': '防灾大擂台',
        'free': '自由模式',
        'speed': '速答挑战',
        'pk': '双人PK',
        'survival': '生存模式',
        'bossrush': 'Boss Rush',
        'daily': '每日挑战',
        'timed': '限时挑战',
        'timed-escape': '限时逃生',
        'codex': '卡牌图鉴',
        'achievements': '成就系统',
        'stats': '数据统计',
        'leaderboard': '排行榜',
        'character': '角色',
        'encyclopedia': '百科',
        'calendar': '日历',
        'minigame': '小游戏',
        'shop': '商城',
        'settings': '设置',
        'study': '学习模式',
        'ai-tutor': 'AI 智能导师',
        'certification': '能力认证',
        'disaster-sim': '灾害模拟',
        'real-cases': '真实案例',
        'scenario': '情景模式',
        'campaign': '故事模式',
        'story': '故事模式',
        'pets': '宠物',
        'guide': '新手引导',
        'diary': '防灾日记',
        'museum': '防灾馆',
        'firstaid': '急救模拟',
        'synthesis': '卡牌工坊',
        'gacha': '扭蛋机',
        'music': '音乐',
        'eggs': '彩蛋',
        'base': '基地',
        'knowledge-race': '知识竞速',
        'reaction': '反应速度',
        'memory-card': '记忆翻牌',
        'precision': '精准投放',
        'precision-strike': '精准打击',
        'time-escape': '限时逃生',
        'story-adventure': '防灾大冒险',
        'story_mode': '故事模式'
      };
      page.setAttribute('role', 'region');
      page.setAttribute('aria-label', names[id] || id);
    });
    
    // 按钮
    document.querySelectorAll('.mode-btn, .menu-cat-btn, .tool-btn').forEach(function(btn) {
      btn.setAttribute('role', 'button');
      btn.setAttribute('tabindex', '0');
      var text = btn.textContent.trim().replace(/\s+/g, ' ').substring(0, 50);
      btn.setAttribute('aria-label', text);
    });
    
    // 选项
    document.querySelectorAll('.quiz-opt, .choice-btn, .scenario-opt').forEach(function(opt, i) {
      opt.setAttribute('role', 'button');
      opt.setAttribute('tabindex', '0');
      var letters = ['A', 'B', 'C', 'D'];
      opt.setAttribute('aria-label', '选项 ' + letters[i % 4]);
    });
    
    // 导航栏
    var toolbar = document.querySelector('.menu-toolbar');
    if (toolbar) {
      toolbar.setAttribute('role', 'navigation');
      toolbar.setAttribute('aria-label', '底部导航栏');
    }
    
    // 模态框
    var modal = document.getElementById('modalOverlay');
    if (modal) {
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-label', '提示框');
    }
    
    // 进度条
    document.querySelectorAll('.hp-bar, .exp-bar, .level-bar, [class*="progress"]').forEach(function(bar) {
      bar.setAttribute('role', 'progressbar');
      bar.setAttribute('aria-valuemin', '0');
      bar.setAttribute('aria-valuemax', '100');
    });
    
    // 返回按钮
    document.querySelectorAll('.back-float, .back-to-categories').forEach(function(btn) {
      btn.setAttribute('aria-label', '返回');
    });
  }
  
  // ===== 2. 键盘导航 =====
  function setupKeyboardNav() {
    document.addEventListener('keydown', function(e) {
      // Escape 关闭模态框 / 返回菜单
      if (e.key === 'Escape') {
        var modal = document.getElementById('modalOverlay');
        if (modal && modal.classList.contains('active')) {
          if (typeof Modal !== 'undefined') Modal.hide();
          return;
        }
        
        var activePage = document.querySelector('.page.active');
        if (activePage && activePage.id !== 'page-menu') {
          if (typeof PageManager !== 'undefined') PageManager.navigate('menu');
          return;
        }
      }
      
      // Enter 触发当前聚焦元素
      if (e.key === 'Enter') {
        var focused = document.activeElement;
        if (focused && (focused.classList.contains('mode-btn') || 
                        focused.classList.contains('menu-cat-btn') ||
                        focused.classList.contains('tool-btn') ||
                        focused.classList.contains('quiz-opt') ||
                        focused.classList.contains('choice-btn') ||
                        focused.hasAttribute('onclick'))) {
          focused.click();
        }
      }
      
      // 方向键在选项中导航
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        var options = Array.from(document.querySelectorAll(
          '.page.active .quiz-opt, .page.active .choice-btn'
        ));
        if (options.length === 0) return;
        
        e.preventDefault();
        var current = options.indexOf(document.activeElement);
        var next;
        if (e.key === 'ArrowDown') {
          next = current < options.length - 1 ? current + 1 : 0;
        } else {
          next = current > 0 ? current - 1 : options.length - 1;
        }
        options[next].focus();
      }
    });
  }
  
  // ===== 3. 触摸优化 =====
  function optimizeTouch() {
    // NOTE: touch-active 反馈、双击缩放阻止、触觉反馈已集中在 optimizer-mobile.js
    // 此处仅保留 accessibility 独有的 iOS 橡皮筋效果阻止

    // 移动端视口优化
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      document.body.classList.add('touch-device');
      
      // 禁用 iOS 橡皮筋效果（在页面容器上）
      var app = document.getElementById('app');
      if (app) {
        app.addEventListener('touchmove', function(e) {
          if (e.target === app) {
            e.preventDefault();
          }
        }, { passive: false });
      }
    }
  }
  
  // ===== 4. 高对比度支持 =====
  function setupHighContrast() {
    // 检测系统偏好
    if (window.matchMedia && window.matchMedia('(prefers-contrast: high)').matches) {
      document.body.classList.add('high-contrast');
    }
    
    // 监听变化
    if (window.matchMedia) {
      window.matchMedia('(prefers-contrast: high)').addEventListener('change', function(e) {
        document.body.classList.toggle('high-contrast', e.matches);
      });
    }
  }
  
  // ===== 5. 减少动画偏好 =====
  function setupReducedMotion() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.body.classList.add('reduced-motion');
      
      // 禁用所有 CSS 动画
      var style = document.createElement('style');
      style.textContent = `
        .reduced-motion *,
        .reduced-motion *::before,
        .reduced-motion *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      `;
      document.head.appendChild(style);
    }
  }
  
  // ===== 6. 屏幕阅读器实时通知 =====
  function setupLiveRegion() {
    var liveRegion = document.createElement('div');
    liveRegion.id = 'aria-live-region';
    liveRegion.setAttribute('role', 'status');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);';
    document.body.appendChild(liveRegion);
    
    // 提供全局通知函数
    window.announceToSR = function(message) {
      liveRegion.textContent = '';
      setTimeout(function() {
        liveRegion.textContent = message;
      }, 100);
    };
  }
  
  // ===== 初始化 =====
  function init() {
    injectAriaLabels();
    setupKeyboardNav();
    optimizeTouch();
    setupHighContrast();
    setupReducedMotion();
    setupLiveRegion();
    
    // 延迟重新注入（等动态内容加载完）
    setTimeout(injectAriaLabels, 2000);
    
    console.log('♿ Accessibility & Mobile v1.2.0 loaded');
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
})();
