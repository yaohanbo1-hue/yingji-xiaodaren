/**
 * ===========================================================================
 * 应急小达人 v1.3.6 — 运行时健壮性增强
 * ===========================================================================
 * 1. SafeStore：安全 localStorage 封装（try/catch + 配额超限自愈）
 * 2. 全局错误兜底：window.onerror / unhandledrejection → 友好提示（不静默丢失）
 * 3. debounce / throttle 工具（防抖滚动/缩放等高频事件）
 *
 * 设计原则：纯工具，仅挂载到 window，不改动任何现有引擎逻辑；
 * terser 仅压缩不重命名，确保全局名稳定。
 * ===========================================================================
 */
(function () {
  'use strict';

  /* ---------- 1. 安全存储 ---------- */
  var SafeStore = {
    get: function (key, fallback) {
      try {
        var raw = localStorage.getItem(key);
        if (raw === null || raw === undefined) return fallback;
        try { return JSON.parse(raw); } catch (e) { return raw; }
      } catch (e) { return fallback; }
    },
    set: function (key, value) {
      try {
        var raw = (typeof value === 'string') ? value : JSON.stringify(value);
        localStorage.setItem(key, raw);
        return true;
      } catch (e) {
        // 配额超限 / 隐私模式：尝试清理非关键缓存后重试
        if (e && (e.name === 'QuotaExceededError' || e.code === 22)) {
          try {
            ['museumProgress', 'dailyTasks', 'lastFreeBlindbox', 'lastFreeSpin', 'lastDaily']
              .forEach(function (k) { try { localStorage.removeItem(k); } catch (_) {} });
            localStorage.setItem(key, (typeof value === 'string') ? value : JSON.stringify(value));
            return true;
          } catch (e2) { return false; }
        }
        return false;
      }
    },
    remove: function (key) { try { localStorage.removeItem(key); } catch (e) {} },
    // 兼容原 GameState 直读直写习惯
    read: function (key, fallback) { return this.get(key, fallback); },
    write: function (key, value) { return this.set(key, value); }
  };
  window.SafeStore = SafeStore;

  /* ---------- 2. 全局错误兜底 ---------- */
  function showErrorToast(msg) {
    try {
      if (typeof V10Toast !== 'undefined' && V10Toast.show) { V10Toast.show('⚠️ ' + msg, 'error'); return; }
    } catch (e) {}
    try {
      if (typeof Toast !== 'undefined' && Toast.show) { Toast.show('⚠️ ' + msg); return; }
    } catch (e) {}
    // 兜底 DOM 提示
    var t = document.createElement('div');
    t.textContent = '⚠️ ' + msg;
    t.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:rgba(220,38,38,.95);color:#fff;padding:10px 16px;border-radius:10px;font-size:13px;z-index:99999;box-shadow:0 8px 24px rgba(0,0,0,.4);max-width:80vw';
    document.body.appendChild(t);
    setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 4000);
  }

  // 防止错误集中爆发时一次性弹出大量提示
  var lastErrAt = 0;
  window.addEventListener('error', function (e) {
    // 仅处理脚本错误（含 message+filename）；资源 404 不带 message，自动忽略
    if (e && e.message && e.filename) {
      var now = Date.now();
      if (now - lastErrAt < 3000) return;
      lastErrAt = now;
      showErrorToast('运行出错：' + String(e.message || '').slice(0, 60));
    }
  });
  window.addEventListener('unhandledrejection', function (e) {
    var now = Date.now();
    if (now - lastErrAt < 3000) return;
    lastErrAt = now;
    var reason = e && e.reason;
    showErrorToast('请求失败：' + String((reason && reason.message) || '网络异常').slice(0, 60));
  });

  /* ---------- 3. 防抖 / 节流 ---------- */
  window.debounce = function (fn, wait) {
    var t;
    return function () {
      var ctx = this, args = arguments;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(ctx, args); }, wait || 150);
    };
  };
  window.throttle = function (fn, wait) {
    var last = 0;
    return function () {
      var now = Date.now();
      if (now - last >= (wait || 150)) { last = now; fn.apply(this, arguments); }
    };
  };

  if (window.console) console.log('🛡️ Runtime hardening v1.3.6 loaded');
})();
