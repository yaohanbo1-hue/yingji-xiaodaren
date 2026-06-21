/**
 * ===========================================================================
 * 应急小达人 v1.4.0 — 简洁加载动画 + 骨架屏
 * ===========================================================================
 *
 * 首次打开时显示品牌动画，之后不再显示（localStorage 记录）
 * 骨架屏：内容加载期间显示渐进式骨架
 * 优化：使用现有 HTML 加载界面，避免 DOM 重复创建
 * 优化：减少动画，适配 prefers-reduced-motion
 *
 * @version 1.4.0
 * ===========================================================================
 */

const tips = [
  '正在加载防灾知识库...',
  '正在连接灾害预警系统...',
  '正在准备应急装备...',
  '正在生成安全逃生路线...',
  '正在初始化防灾模拟场景...',
  '正在加载今日灾害挑战...',
  '正在准备学习模式题库...',
  '正在同步防灾日记数据...'
];

const LoadingScreen = {
  _shown: false,
  _skeleton: null,
  _overlay: null,
  _bar: null,
  _tip: null,
  _percentEl: null,
  _container: null,
  _interval: null,
  _reducedMotion: false,

  init() {
    // 检测用户是否偏好减少动画
    this._reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this._overlay = document.getElementById('loadingScreen');
    if (!this._overlay) {
      // 保底：如果 HTML 中没有加载界面，直接显示骨架屏
      this._showSkeleton();
      this._waitForReady();
      return;
    }

    // 绑定已有元素
    this._bar = document.getElementById('loadingBar');
    this._tip = document.getElementById('loadingTip');
    this._percentEl = document.getElementById('loadingPercent');
    this._container = document.getElementById('loadingContainer');

    try {
      if (localStorage.getItem('disaster_hq_loading_shown')) {
        // 已展示过品牌动画：直接跳过，显示骨架屏
        this._overlay.classList.add('hidden');
        setTimeout(() => {
          if (this._overlay) this._overlay.style.display = 'none';
        }, this._reducedMotion ? 50 : 500);
        this._showSkeleton();
        this._waitForReady();
        return;
      }
    } catch (e) {
      // localStorage 不可用，直接跳过品牌动画
      this._overlay.classList.add('hidden');
      this._showSkeleton();
      this._waitForReady();
      return;
    }

    this._shown = true;
    this._show();
  },

  _show() {
    var progress = 0;
    var tipIndex = 0;
    var self = this;
    var step = this._reducedMotion ? 5 : 2; // 减少动画时加速
    var intervalMs = this._reducedMotion ? 30 : 50;

    this._interval = setInterval(function() {
      progress += step;
      if (progress > 100) progress = 100;

      if (self._bar) {
        self._bar.style.transform = 'scaleX(' + (progress / 100) + ')';
      }
      if (self._percentEl) {
        self._percentEl.textContent = progress + '%';
      }

      if (progress >= 15 * (tipIndex + 1) && tipIndex < tips.length - 1) {
        tipIndex++;
        if (self._tip) {
          self._tip.style.opacity = '0';
          setTimeout(function() {
            if (self._tip) {
              self._tip.textContent = tips[tipIndex];
              self._tip.style.opacity = '1';
            }
          }, 150);
        }
      }

      if (progress >= 100) {
        clearInterval(self._interval);
        if (self._percentEl) {
          self._percentEl.textContent = '100% 🎉';
        }
        if (self._container) {
          self._container.classList.add('loading-complete');
        }
        if (!self._reducedMotion) {
          self._overlay.classList.add('loading-complete-flash');
        }
        setTimeout(function() {
          self._overlay.classList.add('loading-fade-out');
          setTimeout(function() {
            self._overlay.style.display = 'none';
            try {
              localStorage.setItem('disaster_hq_loading_shown', '1');
            } catch (e) { /* ignore */ }
            // 品牌动画结束后显示骨架屏
            self._showSkeleton();
            self._waitForReady();
          }, self._reducedMotion ? 50 : 500);
        }, self._reducedMotion ? 100 : 600);
      }
    }, intervalMs);
  },

  // 骨架屏：内容加载期间显示
  _showSkeleton() {
    var skeleton = document.getElementById('skeletonScreen');
    if (!skeleton) {
      skeleton = document.createElement('div');
      skeleton.id = 'skeletonScreen';
      skeleton.className = 'skeleton-screen show';
      skeleton.innerHTML = `
        <div class="skeleton-header"></div>
        <div class="skeleton-grid">
          <div class="skeleton-card"></div>
          <div class="skeleton-card"></div>
          <div class="skeleton-card"></div>
          <div class="skeleton-card"></div>
        </div>
      `;
      document.body.appendChild(skeleton);
    }
    this._skeleton = skeleton;
  },

  _waitForReady() {
    var self = this;
    var checkReady = function() {
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

    // 最多等待 8 秒（给用户更多时间加载大资源）
    setTimeout(function() {
      self._hideSkeleton();
    }, 8000);

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
