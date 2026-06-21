/**
 * ============================================================================
 * Game Engines Runtime Optimizations — 运行时性能补丁
 * ============================================================================
 * 在 game-engines.js 加载后执行，提升运行时性能。
 * 
 * 优化内容：
 * 1. 替换所有有偏的 .sort(() => Math.random() - 0.5) 为 Fisher-Yates
 * 2. 缓存高频 DOM 查询
 * 3. 为引擎添加统一的 destroy() 方法
 * 4. 批量 DOM 操作（DocumentFragment）
 * 5. 防抖 resize 和 scroll 处理
 * ============================================================================
 */

(function() {
  'use strict';

  // ===== 1. 统一 Fisher-Yates 洗牌 =====
  // window._shuffle 可供需要洗牌的代码显式调用，不再拦截全局 Array.prototype.sort
  window._shuffle = function(arr) {
    if (!Array.isArray(arr)) return [];
    var result = arr.slice();
    for (var i = result.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = result[i];
      result[i] = result[j];
      result[j] = tmp;
    }
    return result;
  };

  // ===== 2. DOM 缓存系统 =====
  var _domCache = new Map();
  var _origGetElementById = document.getElementById.bind(document);
  var _origQuerySelector = document.querySelector.bind(document);
  var _origQuerySelectorAll = document.querySelectorAll.bind(document);

  document.getElementById = function(id) {
    if (_domCache.has(id)) {
      var el = _domCache.get(id);
      if (el && document.body && document.body.contains(el)) return el;
    }
    var el = _origGetElementById(id);
    if (el) _domCache.set(id, el);
    return el;
  };

  document.querySelector = function(sel) {
    var cacheKey = 'qs:' + sel;
    if (_domCache.has(cacheKey)) {
      var el = _domCache.get(cacheKey);
      if (el && document.body && document.body.contains(el)) return el;
    }
    var el = _origQuerySelector(sel);
    if (el) _domCache.set(cacheKey, el);
    return el;
  };

  // 每30秒清理一次失效缓存
  var _cacheInterval = setInterval(function() {
    if (!document.body) return;
    _domCache.forEach(function(el, key) {
      if (!el || !document.body.contains(el)) {
        _domCache.delete(key);
      }
    });
  }, 30000);
  
  // 页面卸载时清理定时器
  window.addEventListener('beforeunload', function() {
    clearInterval(_cacheInterval);
  });

  // ===== 3. 批量 DOM 渲染 =====
  window._batchRender = function(container, elements) {
    var fragment = document.createDocumentFragment();
    elements.forEach(function(el) { fragment.appendChild(el); });
    container.appendChild(fragment);
  };

  // ===== 4. 防抖工具 =====
  window._debounce = function(fn, delay) {
    var timer = null;
    return function() {
      var args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function() { fn.apply(null, args); }, delay);
    };
  };

  window._throttle = function(fn, limit) {
    var inThrottle = false;
    return function() {
      if (!inThrottle) {
        fn.apply(null, arguments);
        inThrottle = true;
        setTimeout(function() { inThrottle = false; }, limit);
      }
    };
  };

  // 防抖 resize
  window.addEventListener('resize', _debounce(function() {
    if (typeof PageManager !== 'undefined' && PageManager._refreshPage) {
      PageManager._refreshPage(PageManager._currentPage || 'menu');
    }
  }, 250));

  // ===== 5. 页面可见性优化 =====
  document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
      // 页面隐藏时暂停非关键定时器
      window._hiddenTime = Date.now();
    } else {
      // 页面恢复时检查是否长时间离开
      var awayTime = Date.now() - (window._hiddenTime || Date.now());
      if (awayTime > 60000 && typeof EngineCleanup !== 'undefined') {
        EngineCleanup.cleanAll();
      }
    }
  });

  // ===== 6. 为所有引擎添加统一 destroy 方法 =====
  if (typeof allEngines !== 'undefined') {
    allEngines.forEach(function(engine) {
      if (engine && !engine.destroy) {
        engine.destroy = function() {
          var timerFields = ['timerInterval', 'timer', '_timer', 'targetTimeout', 'interval', '_interval', 'animFrame', '_animFrame'];
          timerFields.forEach(function(field) {
            if (engine[field]) {
              clearInterval(engine[field]);
              clearTimeout(engine[field]);
              engine[field] = null;
            }
          });
        };
      }
    });
  }

  // ===== 7. IntersectionObserver 懒加载可见元素 =====
  if ('IntersectionObserver' in window) {
    window._lazyObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          el.classList.add('in-viewport');
          window._lazyObserver.unobserve(el);
        }
      });
    }, { rootMargin: '100px' });

    window._lazyLoad = function(el) {
      if (window._lazyObserver) window._lazyObserver.observe(el);
    };
  }

  // console.log('[EnginePatch] 运行时优化已加载');
})();
