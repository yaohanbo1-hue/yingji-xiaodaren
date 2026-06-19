/**
 * ============================================================================
 * optimizer-mobile.js — 移动端优化引擎
 * 版本: 1.0.0
 * 生成时间: 2026-06-14
 * ============================================================================
 * 
 * 优化内容:
 * 1. 虚拟键盘检测与适配（visualViewport API）
 * 2. 输入框自动滚动到可见区域
 * 3. 滑动返回手势（页面内左滑返回）
 * 4. 触摸设备增强检测
 * 5. 低端设备自动降级
 * 6. 横屏/竖屏切换适配
 * 7. 底部安全区域动态调整
 * 8. 输入框防键盘遮挡
 * 
 * @requires CSS: optimizer-mobile.css
 * ============================================================================
 */

(function() {
  'use strict';

  const MobileOptimizer = {
    _isTouch: false,
    _isMobile: false,
    _isLowPerf: false,
    _keyboardHeight: 0,
    _viewportHeight: window.innerHeight,
    _swipeStartX: 0,
    _swipeStartY: 0,
    _swipeStartTime: 0,
    _activeInput: null,

    /* ===== 初始化 ===== */
    init() {
      this._detectDevice();
      this._setupViewportOptimization();
      this._setupVirtualKeyboard();
      this._setupSwipeGestures();
      this._setupInputOptimization();
      this._setupOrientationHandling();
      this._setupLowPerfDetection();
      this._setupTouchFeedback();
      this._setupPreventZoom();
      this._setupSafeAreaAdjustment();

      console.log('📱 Mobile Optimizer v1.0.0 loaded | touch=' + this._isTouch + ' | mobile=' + this._isMobile + ' | lowPerf=' + this._isLowPerf);
    },

    /* ===== 1. 设备检测 ===== */
    _detectDevice() {
      const ua = navigator.userAgent;
      this._isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      this._isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua);

      if (this._isTouch) {
        document.body.classList.add('touch-device');
      }
      if (this._isMobile) {
        document.body.classList.add('mobile-device');
      }
    },

    /* ===== 2. 视口优化 ===== */
    _setupViewportOptimization() {
      // 确保 viewport 正确设置（如果 index.html 已修改则跳过）
      let vp = document.querySelector('meta[name="viewport"]');
      if (!vp) {
        vp = document.createElement('meta');
        vp.name = 'viewport';
        document.head.appendChild(vp);
      }

      // 动态检测 viewport 是否包含 viewport-fit=cover
      const content = vp.content || '';
      if (!content.includes('viewport-fit=cover')) {
        vp.content = content + ',viewport-fit=cover';
      }
      if (!content.includes('interactive-widget')) {
        vp.content = vp.content + ',interactive-widget=resizes-content';
      }
    },

    /* ===== 3. 虚拟键盘适配 ===== */
    _setupVirtualKeyboard() {
      const self = this;

      // 使用 visualViewport API（现代浏览器）
      if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', function() {
          self._handleViewportChange();
        });
        window.visualViewport.addEventListener('scroll', function() {
          self._handleViewportChange();
        });
      }

      // 传统 resize 兜底
      window.addEventListener('resize', function() {
        self._handleViewportChange();
      });

      // 输入框 focus/blur 监听
      document.addEventListener('focusin', function(e) {
        if (self._isInputElement(e.target)) {
          self._activeInput = e.target;
          document.body.classList.add('keyboard-open');
          self._scrollInputIntoView(e.target);
          // 延迟再次滚动（等待键盘完全弹出）
          setTimeout(function() {
            self._scrollInputIntoView(e.target);
          }, 300);
          setTimeout(function() {
            self._scrollInputIntoView(e.target);
          }, 600);
        }
      });

      document.addEventListener('focusout', function(e) {
        if (self._isInputElement(e.target)) {
          self._activeInput = null;
          document.body.classList.remove('keyboard-open');
        }
      });
    },

    _isInputElement(el) {
      if (!el) return false;
      const tag = el.tagName.toLowerCase();
      const type = (el.type || '').toLowerCase();
      return tag === 'textarea' ||
             tag === 'select' ||
             (tag === 'input' && ['text', 'number', 'email', 'tel', 'url', 'search', 'password'].indexOf(type) !== -1);
    },

    _handleViewportChange() {
      const currentHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
      const keyboardHeight = this._viewportHeight - currentHeight;

      if (keyboardHeight > 150) {
        this._keyboardHeight = keyboardHeight;
        document.body.classList.add('keyboard-open');
        document.body.style.setProperty('--keyboard-height', keyboardHeight + 'px');

        // 如果当前有输入框聚焦，滚动它到可见区域
        if (this._activeInput) {
          this._scrollInputIntoView(this._activeInput);
        }
      } else {
        this._keyboardHeight = 0;
        document.body.classList.remove('keyboard-open');
        document.body.style.setProperty('--keyboard-height', '0px');
      }
    },

    _scrollInputIntoView(input) {
      if (!input) return;

      const rect = input.getBoundingClientRect();
      const viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
      const viewportTop = window.visualViewport ? window.visualViewport.offsetTop : 0;
      const keyboardTop = viewportHeight - this._keyboardHeight;

      // 如果输入框被键盘遮挡
      if (rect.bottom > keyboardTop - 20) {
        const scrollNeeded = rect.bottom - (keyboardTop - 80);

        if (window.visualViewport && window.visualViewport.offsetTop !== undefined) {
          // 使用 visualViewport 偏移
          const targetScroll = window.scrollY + viewportTop + scrollNeeded;
          window.scrollTo({ top: targetScroll, behavior: 'smooth' });
        } else {
          // 兜底：滚动父容器
          const scrollableParent = this._findScrollableParent(input);
          if (scrollableParent) {
            scrollableParent.scrollBy({ top: scrollNeeded, behavior: 'smooth' });
          }
        }
      }
    },

    _findScrollableParent(el) {
      let parent = el.parentElement;
      while (parent) {
        const style = window.getComputedStyle(parent);
        const overflow = style.overflow + style.overflowY;
        if (overflow.includes('auto') || overflow.includes('scroll')) {
          return parent;
        }
        parent = parent.parentElement;
      }
      return document.querySelector('.page.active .page-content') || document.documentElement;
    },

    /* ===== 4. 输入框优化 ===== */
    _setupInputOptimization() {
      const self = this;

      // 为所有输入框添加合适的属性
      document.querySelectorAll('input:not([type="checkbox"]):not([type="radio"]):not([type="hidden"]), textarea').forEach(function(input) {
        // 防止 iOS 自动缩放
        if (!input.style.fontSize || parseInt(input.style.fontSize) < 16) {
          input.style.fontSize = '16px';
        }

        // 添加正确的 inputmode
        const placeholder = (input.placeholder || '').toLowerCase();
        if (!input.getAttribute('inputmode')) {
          if (placeholder.includes('电话') || placeholder.includes('手机') || placeholder.includes('tel')) {
            input.setAttribute('inputmode', 'tel');
          } else if (placeholder.includes('邮箱') || placeholder.includes('email') || input.type === 'email') {
            input.setAttribute('inputmode', 'email');
          } else if (placeholder.includes('搜索') || placeholder.includes('search')) {
            input.setAttribute('inputmode', 'search');
          } else if (input.type === 'number') {
            input.setAttribute('inputmode', 'numeric');
          } else {
            input.setAttribute('inputmode', 'text');
          }
        }

        // 自动完成和校正
        if (!input.getAttribute('autocomplete')) {
          input.setAttribute('autocomplete', 'off');
        }
        if (!input.getAttribute('autocorrect')) {
          input.setAttribute('autocorrect', 'off');
        }
        if (!input.getAttribute('autocapitalize')) {
          input.setAttribute('autocapitalize', 'off');
        }
        if (!input.getAttribute('spellcheck')) {
          input.setAttribute('spellcheck', 'false');
        }
      });

      // 动态添加的输入框也处理（MutationObserver）
      const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(m) {
          m.addedNodes.forEach(function(node) {
            if (node.nodeType === 1) {
              if (node.tagName === 'INPUT' || node.tagName === 'TEXTAREA') {
                self._optimizeInput(node);
              }
              if (node.querySelectorAll) {
                node.querySelectorAll('input, textarea').forEach(function(input) {
                  self._optimizeInput(input);
                });
              }
            }
          });
        });
      });
      observer.observe(document.body, { childList: true, subtree: true });
    },

    _optimizeInput(input) {
      if (input.dataset.mobileOptimized) return;
      input.dataset.mobileOptimized = '1';

      const style = window.getComputedStyle(input);
      if (parseInt(style.fontSize) < 16) {
        input.style.fontSize = '16px';
      }
      input.setAttribute('inputmode', input.getAttribute('inputmode') || 'text');
      input.setAttribute('autocomplete', 'off');
      input.setAttribute('autocorrect', 'off');
      input.setAttribute('autocapitalize', 'off');
    },

    /* ===== 5. 滑动手势 ===== */
    _setupSwipeGestures() {
      const self = this;
      let startX, startY, startTime;
      const SWIPE_THRESHOLD = 80;      // 滑动距离阈值
      const SWIPE_TIME_LIMIT = 400;  // 滑动时间阈值(ms)
      const EDGE_ZONE = 30;            // 边缘触发区宽度

      document.addEventListener('touchstart', function(e) {
        const touch = e.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
        startTime = Date.now();
      }, { passive: true });

      document.addEventListener('touchmove', function(e) {
        if (!startX || !startY) return;
        // 防止水平滑动时页面上下滚动（在可滑动区域）
        const touch = e.touches[0];
        const deltaX = touch.clientX - startX;
        const deltaY = touch.clientY - startY;

        // 如果水平滑动大于垂直滑动，且在边缘区域，阻止默认滚动
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10 && startX < EDGE_ZONE) {
          // 仅在非输入框区域
          if (!self._isInputElement(e.target)) {
            e.preventDefault();
          }
        }
      }, { passive: false });

      document.addEventListener('touchend', function(e) {
        if (!startX || !startY) return;

        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - startX;
        const deltaY = touch.clientY - startY;
        const elapsed = Date.now() - startTime;

        // 水平滑动判定
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > SWIPE_THRESHOLD && elapsed < SWIPE_TIME_LIMIT) {
          // 从左侧边缘右滑 = 返回上一页
          if (startX < EDGE_ZONE && deltaX > 0) {
            self._handleSwipeBack();
          }
        }

        startX = null;
        startY = null;
      }, { passive: true });
    },

    _handleSwipeBack() {
      const activePage = document.querySelector('.page.active');
      if (!activePage) return;

      const pageId = activePage.id.replace('page-', '');
      // 非菜单页面可以滑动返回
      if (pageId !== 'menu' && typeof PageManager !== 'undefined') {
        // 添加触觉反馈
        if (navigator.vibrate) navigator.vibrate(10);
        PageManager.navigate('menu');
      }
    },

    /* ===== 6. 方向切换处理 ===== */
    _setupOrientationHandling() {
      const self = this;

      window.addEventListener('orientationchange', function() {
        // 延迟等待旋转完成
        setTimeout(function() {
          self._viewportHeight = window.innerHeight;
          self._adjustSafeArea();
        }, 300);
      });

      // 初始调整
      this._adjustSafeArea();
    },

    /* ===== 7. 安全区域动态调整 ===== */
    _adjustSafeArea() {
      // 检测是否为 iOS 设备且支持安全区域
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (!isIOS) return;

      // 获取实际安全区域（CSS env 值由浏览器提供，这里只做兜底）
      const safeTop = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sat')) || 0;
      const safeBottom = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sab')) || 0;

      document.documentElement.style.setProperty('--safe-area-top', safeTop + 'px');
      document.documentElement.style.setProperty('--safe-area-bottom', safeBottom + 'px');
    },

    _setupSafeAreaAdjustment() {
      // 监听安全区域变化（如 iOS 底部栏显示/隐藏）
      const self = this;
      window.addEventListener('resize', function() {
        self._adjustSafeArea();
      });
    },

    /* ===== 8. 低端设备检测 ===== */
    _setupLowPerfDetection() {
      const cores = navigator.hardwareConcurrency || 2;
      const memory = navigator.deviceMemory || 4;
      const isLowEnd = cores <= 2 || memory <= 2 || this._isLowEndDevice();

      if (isLowEnd) {
        this._isLowPerf = true;
        document.body.classList.add('low-perf-mode');
        console.log('⚡ Low performance mode activated (cores:' + cores + ', memory:' + memory + 'GB)');
      }
    },

    _isLowEndDevice() {
      // 通过性能检测判断
      const start = performance.now();
      for (let i = 0; i < 100000; i++) {
        Math.sqrt(i);
      }
      const duration = performance.now() - start;
      return duration > 15; // 如果简单计算耗时 > 15ms，认为是低端设备
    },

    /* ===== 9. 触摸反馈增强 ===== */
    _setupTouchFeedback() {
      const self = this;
      if (!this._isTouch) return;

      // 快速点击反馈（在 touchstart 时添加 class，比 :active 更快）
      document.addEventListener('touchstart', function(e) {
        const btn = e.target.closest('.mode-btn, .menu-cat-btn, .tool-btn, .quiz-opt, .choice-btn, .btn-primary, .btn-secondary, .ai-fab, .back-float');
        if (btn) {
          btn.classList.add('touch-active');
          // 添加轻微触觉反馈
          if (navigator.vibrate && self._isMobile) {
            navigator.vibrate(5);
          }
        }
      }, { passive: true });

      document.addEventListener('touchend', function(e) {
        document.querySelectorAll('.touch-active').forEach(function(el) {
          el.classList.remove('touch-active');
        });
      }, { passive: true });

      document.addEventListener('touchcancel', function(e) {
        document.querySelectorAll('.touch-active').forEach(function(el) {
          el.classList.remove('touch-active');
        });
      }, { passive: true });
    },

    /* ===== 10. 防止双指缩放（保留 accessibility） ===== */
    _setupPreventZoom() {
      // 通过 CSS 控制，不使用 JS 阻止默认行为（避免影响 accessibility）
      // 已经在 CSS 中设置了 touch-action
      // 这里额外处理 iOS 双击缩放
      let lastTouchEnd = 0;
      document.addEventListener('touchend', function(e) {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
          e.preventDefault();
        }
        lastTouchEnd = now;
      }, false);
    }
  };

  /* ===== 初始化 ===== */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      MobileOptimizer.init();
    });
  } else {
    MobileOptimizer.init();
  }

  // 暴露到全局
  window.MobileOptimizer = MobileOptimizer;
})();
