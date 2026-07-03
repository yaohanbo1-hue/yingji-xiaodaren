/**
 * ============================================================================
 * utils-enhanced.js — 增强工具函数
 * ============================================================================
 */

// 防抖
function debounce(fn, delay) {
  var timer = null;
  return function() {
    var ctx = this, args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function() { fn.apply(ctx, args); }, delay);
  };
}

// 节流
function throttle(fn, limit) {
  var inThrottle = false;
  return function() {
    if (inThrottle) return;
    fn.apply(this, arguments);
    inThrottle = true;
    setTimeout(function() { inThrottle = false; }, limit);
  };
}

// HTML 转义（XSS 防护）
function escapeHtml(s) {
  if (!s || typeof s !== 'string') return '';
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
}

// 颜色工具
const ColorUtils = {
  hexToRgba: function(hex, alpha) {
    var r = parseInt(hex.slice(1,3), 16),
        g = parseInt(hex.slice(3,5), 16),
        b = parseInt(hex.slice(5,7), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + (alpha || 1) + ')';
  },
  randomHsl: function() {
    return 'hsl(' + Math.floor(Math.random() * 360) + ',70%,60%)';
  }
};
