/**
 * ===========================================================================
 * 应急小达人 v1.2.0 — 品牌加载动画
 * ===========================================================================
 * 
 * 首次打开时显示 3 秒品牌动画，之后不再显示（localStorage 记录）
 * 
 * @version 1.2.0
 * ===========================================================================
 */

const LoadingScreen = {
  _shown: false,
  
  init() {
    // 兜底：无论加载动画是否展示，都强制标记 app-ready，
    // 否则 critical.css 的 .page 显隐机制（旧版依赖 app-ready）可能让整页不可见。
    LoadingScreen._forceAppReady();

    // 检查是否已显示过
    try {
      if (localStorage.getItem('disaster_hq_loading_shown')) {
        return;
      }
    } catch(e) { return; }
    
    this._shown = true;
    this._show();
  },

  // 强制把 body 标记为已就绪（幂等，可重复调用）
  _forceAppReady() {
    try {
      if (!document.body.classList.contains('app-ready')) {
        document.body.classList.add('app-ready');
      }
    } catch (e) { /* noop */ }
  },
  
  _show() {
    var overlay = document.createElement('div');
    overlay.id = 'loadingScreen';
    overlay.innerHTML = `
      <div class="loading-container">
        <div class="loading-logo">
          <div class="loading-icon">🌪️</div>
          <h1 class="loading-title">应急小达人</h1>
          <p class="loading-subtitle">Disaster Blind Box Command HQ</p>
        </div>
        
        <div class="loading-bar-container">
          <div class="loading-bar"></div>
        </div>
        
        <p class="loading-tip" id="loadingTip">正在加载防灾知识库...</p>
        
        <div class="loading-particles">
          <span></span><span></span><span></span><span></span><span></span>
          <span></span><span></span><span></span>
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    // 安全兜底：无论进度动画是否完成，最多 6 秒后强制移除全屏遮罩并标记就绪。
    // 防止动画/定时器在个别设备上异常，导致 #loadingScreen 永久拦截所有点击
    // （表现为“所有模块点击无反应”）。
    setTimeout(function() {
      if (overlay && overlay.parentNode) {
        overlay.style.pointerEvents = 'none';
        overlay.classList.add('loading-fade-out');
        setTimeout(function() {
          if (overlay && overlay.parentNode) overlay.remove();
          LoadingScreen._forceAppReady();
        }, 600);
      }
    }, 6000);
    
    // 动画进度条
    var bar = overlay.querySelector('.loading-bar');
    var tip = overlay.querySelector('#loadingTip');
    var tips = [
      '正在加载防灾知识库...',
      '准备 369 张知识卡牌...',
      '初始化灾害模拟引擎...',
      '加载 AI 导师系统...',
      '准备就绪！'
    ];
    
    var progress = 0;
    var tipIndex = 0;
    
    var interval = setInterval(function() {
      progress += 2;
      bar.style.width = progress + '%';
      
      if (progress >= 20 * (tipIndex + 1) && tipIndex < tips.length - 1) {
        tipIndex++;
        tip.style.opacity = '0';
        setTimeout(function() {
          tip.textContent = tips[tipIndex];
          tip.style.opacity = '1';
        }, 150);
      }
      
      if (progress >= 100) {
        clearInterval(interval);
        LoadingScreen._forceAppReady();
        setTimeout(function() {
          overlay.style.pointerEvents = 'none';
          overlay.classList.add('loading-fade-out');
          setTimeout(function() {
            overlay.remove();
            LoadingScreen._forceAppReady();
            try {
              localStorage.setItem('disaster_hq_loading_shown', '1');
            } catch(e) { console.error('Storage error:', e); }
          }, 500);
        }, 300);
      }
    }, 50); // 总共约 2.5 秒
  }
};

// 立即执行（不等 DOMContentLoaded）
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    LoadingScreen.init();
  });
} else {
  LoadingScreen.init();
}
