/**
 * ============================================================================
 * performance-patch.js — 性能补丁
 * ============================================================================
 */
(function() {
  // requestAnimationFrame 降级
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(cb) { return setTimeout(cb, 16); };
  }
  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function(id) { clearTimeout(id); };
  }

  // 被动事件侦听器（提升滚动性能）
  var _origAdd = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function(type, listener, options) {
    var opts = options;
    if (type === 'touchstart' || type === 'touchmove' || type === 'wheel' || type === 'mousewheel') {
      if (typeof opts === 'boolean') {
        opts = { capture: opts, passive: true };
      } else if (typeof opts === 'object') {
        opts = Object.assign({}, opts, { passive: true });
      } else {
        opts = { passive: true };
      }
    }
    return _origAdd.call(this, type, listener, opts);
  };
})();
