/**
 * ============================================================================
 * Bug 修复补丁 (bugfix-patch.js)
 * 集中修复测试发现的所有 JS 相关问题
 * ============================================================================
 */

(function() {
  'use strict';

  // ============================================================
  // 修复1：ErrorBoundary.wrapMethods 不是函数
  // ============================================================
  if (typeof ErrorBoundary !== 'undefined' && !ErrorBoundary.wrapMethods) {
    ErrorBoundary.wrapMethods = function(obj, name, methods) {
      if (!obj || !methods) return;
      methods.forEach(function(method) {
        if (typeof obj[method] !== 'function') return;
        var orig = obj[method];
        obj[method] = function() {
          try {
            return orig.apply(this, arguments);
          } catch(e) {
            console.error('[ErrorBoundary] ' + name + '.' + method + ' error:', e.message);
            // 优雅降级，不中断游戏
            return undefined;
          }
        };
      });
    };
    console.log('[BugFix] ErrorBoundary.wrapMethods 已补全');
  }

  // ============================================================
  // 修复2：tilt3d.js MutationObserver 重复绑定事件
  // ============================================================
  // 等 tilt3d.js 加载后，替换其 addTilt3D 函数添加去重标记
  function patchTilt3D() {
    if (typeof addTilt3D === 'undefined' || window._tilt3dPatched) return;
    window._tilt3dPatched = true;

    var origAddTilt3D = addTilt3D;
    addTilt3D = function(selector) {
      document.querySelectorAll(selector).forEach(function(el) {
        // 跳过已绑定 tilt3d 的元素
        if (el.dataset.tilt3d === '1') return;
        el.dataset.tilt3d = '1';

        el.addEventListener('mousemove', function(e) {
          var rect = el.getBoundingClientRect();
          var x = (e.clientX - rect.left) / rect.width - 0.5;
          var y = (e.clientY - rect.top) / rect.height - 0.5;
          el.style.transform = 'perspective(500px) rotateY(' + (x * 10) + 'deg) rotateX(' + (-y * 10) + 'deg)';
        });
        el.addEventListener('mouseleave', function() {
          el.style.transform = '';
        });
      });
    };
    console.log('[BugFix] tilt3d 重复绑定已修复');
  }

  // 延迟执行，确保 tilt3d.js 已加载
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', patchTilt3D);
  } else {
    setTimeout(patchTilt3D, 100);
  }

  // ============================================================
  // 修复3：btn-clicked 可能永久禁用按钮
  // ============================================================
  // 在页面切换时清除所有 btn-clicked 状态
  function clearBtnClicked() {
    document.querySelectorAll('.btn-clicked').forEach(function(el) {
      el.classList.remove('btn-clicked');
    });
  }

  // 监听页面可见性变化（移动端切换 app 返回后定时器可能被节流）
  document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
      // 页面重新可见时，清除可能卡住的 btn-clicked
      setTimeout(clearBtnClicked, 200);
    }
  });

  // 拦截 PageManager.navigate，在导航后清除 btn-clicked
  if (typeof PageManager !== 'undefined' && PageManager.navigate) {
    var origNavigate = PageManager.navigate;
    PageManager.navigate = function(pageId) {
      clearBtnClicked();
      return origNavigate.apply(this, arguments);
    };
    console.log('[BugFix] btn-clicked 清理已挂载到 PageManager.navigate');
  }

  // ============================================================
  // 修复4：SafeStorage localStorage 保护（原 game.js 中的逻辑，因 const 冲突丢失）
  // ============================================================
  if (!window._safeStoragePatched) {
    window._safeStoragePatched = true;
    try {
      var _origSetItem = localStorage.setItem.bind(localStorage);
      var _origGetItem = localStorage.getItem.bind(localStorage);
      var _origRemoveItem = localStorage.removeItem.bind(localStorage);
      localStorage.setItem = function(key, value) {
        try { return _origSetItem(key, value); }
        catch(e) { console.error('[SafeStorage] setItem error:', e); }
      };
      localStorage.getItem = function(key) {
        try { return _origGetItem(key); }
        catch(e) { return null; }
      };
      localStorage.removeItem = function(key) {
        try { return _origRemoveItem(key); }
        catch(e) { return null; }
      };
    } catch(e) {
      console.warn('[SafeStorage] localStorage 保护初始化失败:', e);
    }
  }

  // ============================================================
  // 修复10：创建 AI 浮动按钮（右下角）
  // ============================================================
  // ai-float.css 定义了样式但未被引用，且无 JS 创建按钮元素
  function createAIFab() {
    if (document.querySelector('.ai-fab')) return; // 已存在

    var fab = document.createElement('button');
    fab.className = 'ai-fab';
    fab.innerHTML = '🤖';
    fab.title = 'AI 防灾导师';
    fab.setAttribute('aria-label', 'AI 防灾导师');
    fab.onclick = function() {
      // 跳转到 AI 导师页面
      if (typeof PageManager !== 'undefined' && PageManager.navigate) {
        PageManager.navigate('ai-tutor');
      }
    };
    document.body.appendChild(fab);
    console.log('[BugFix] AI 浮动按钮已创建');
  }

  // 延迟创建，确保 DOM 和引擎就绪
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(createAIFab, 1000);
    });
  } else {
    setTimeout(createAIFab, 1000);
  }

  console.log('[BugFix] bugfix-patch.js 已加载');
})();
