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
  }
};
