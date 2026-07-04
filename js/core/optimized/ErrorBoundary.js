/**
 * ============================================================================
 * ErrorBoundary.js — 错误边界
 * ============================================================================
 */

const ErrorBoundary = {
  _origOnError: null,
  init: function() {
    this._origOnError = window.onerror;
    window.onerror = function(msg, source, line, col, err) {
      console.warn('[ErrorBoundary]', msg, source + ':' + line);
      return true; // 阻止默认处理
    };
  },
  // [修复] 补全 wrapMethods 方法 — 包装关键引擎方法，捕获运行时错误避免阻断整个游戏
  wrapMethods: function(obj, name, methods) {
    if (!obj || !methods) return;
    methods.forEach(function(method) {
      if (typeof obj[method] !== 'function') return;
      var orig = obj[method];
      obj[method] = function() {
        try {
          return orig.apply(this, arguments);
        } catch(e) {
          console.error('[ErrorBoundary] ' + name + '.' + method + ' error:', e.message);
          return undefined; // 优雅降级，不中断游戏
        }
      };
    });
  }
};
