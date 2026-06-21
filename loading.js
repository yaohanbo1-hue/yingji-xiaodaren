/**
 * ===========================================================================
 * 应急小达人 v1.3.0 — 品牌加载动画 + 骨架屏
 * ===========================================================================
 * 
 * 首次打开时显示 3 秒品牌动画，之后不再显示（localStorage 记录）
 * 新增：骨架屏效果，在内容加载期间显示渐进式骨架
 * 
 * @version 1.3.0
 * ===========================================================================
 */

const LoadingScreen = {
  _shown: false,
  _skeleton: null,
  
  init() {
    // 检查是否已显示过
    try {
      if (localStorage.getItem('disaster_hq_loading_shown')) {
        // 即使跳过品牌动画，仍显示骨架屏
        this._showSkeleton();
        return;
      }
    } catch(e) { return; }
    
    this._shown = true;
    this._show();
  },
  
  _show() {
    var overlay = document.createElement('div');
    overlay.id = 'loadingScreen';
    overlay.innerHTML = `
      <div class="loading-container" id="loadingContainer">
        <div class="loading-logo">
          <div class="loading-icon">🌪️</div>
          <h1 class="loading-title">应急小达人</h1>
          <p class="loading-subtitle">Disaster Blind Box Command HQ</p>
        </div>
        
        <div class="loading-percent" id="loadingPercent">0%</div>
        
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
    
    // 动画进度条
    var bar = overlay.querySelector('.loading-bar');
    var tip = overlay.querySelector('#loadingTip');
    var percentEl = overlay.querySelector('#loadingPercent');
    var container = overlay.querySelector('#loadingContainer');
    var progress = 0;
    var tipIndex = 0;
    
    var interval = setInterval(function() {
      progress += 2;
      bar.style.width = progress + '%';
      if (percentEl) {
        percentEl.textContent = progress + '%';
      }
      
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
        if (percentEl) {
          percentEl.textContent = '100% 🎉';
        }
        if (container) {
          container.classList.add('loading-complete');
        }
        overlay.classList.add('loading-complete-flash');
        setTimeout(function() {
          overlay.classList.add('loading-fade-out');
          setTimeout(function() {
            overlay.remove();
            try {
              localStorage.setItem('disaster_hq_loading_shown', '1');
            } catch(e) { console.error('Storage error:', e); }
            // 品牌动画结束后显示骨架屏
            LoadingScreen._showSkeleton();
          }, 500);
        }, 600);
      }
    }, 50); // 总共约 2.5 秒
  },
  
  // 骨架屏：内容加载期间显示
  _showSkeleton() {
    var skeleton = document.createElement('div');
    skeleton.id = 'skeletonScreen';
    skeleton.className = 'skeleton-screen show';
    skeleton.innerHTML = `
      <div class="skeleton-header"></div>
      <div class="skeleton-grid">
        <div class="skeleton-card"></div>
        <div class="skeleton-card"></div>
        <div class="skeleton-card"></div>
        <div class="skeleton-card"></div>
        <div class="skeleton-card"></div>
        <div class="skeleton-card"></div>
      </div>
    `;
    document.body.appendChild(skeleton);
    this._skeleton = skeleton;
    
    // 检测页面是否准备好，然后渐隐骨架屏
    this._waitForReady();
  },
  
  _waitForReady() {
    var self = this;
    var checkReady = function() {
      // 检查 app-ready 类或关键元素是否存在
      var bodyReady = document.body.classList.contains('app-ready');
      var menuReady = document.getElementById('page-menu') && 
                      document.getElementById('page-menu').classList.contains('active');
      var contentLoaded = document.querySelector('.menu-grid') && 
                          document.querySelector('.menu-grid').children.length > 0;
      
      if (bodyReady || menuReady || contentLoaded) {
        self._hideSkeleton();
      } else {
        setTimeout(checkReady, 100);
      }
    };
    
    // 最多等待 5 秒
    setTimeout(function() {
      self._hideSkeleton();
    }, 5000);
    
    checkReady();
  },
  
  _hideSkeleton() {
    if (!this._skeleton) return;
    this._skeleton.classList.remove('show');
    setTimeout(function() {
      if (LoadingScreen._skeleton) {
        LoadingScreen._skeleton.remove();
        LoadingScreen._skeleton = null;
      }
    }, 400);
  },
  
  // 手动隐藏骨架屏（供外部调用）
  hideSkeleton() {
    this._hideSkeleton();
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

// 导出到全局
window.LoadingScreen = LoadingScreen;
