/**
 * ============================================================================
 * utils.js — 核心工具函数
 * ============================================================================
 */

// DOM 工具
const DOMUtils = {
  $: function(id) { return document.getElementById(id); },
  $$: function(sel, ctx) { return (ctx || document).querySelectorAll(sel); },
  create: function(tag, attrs, html) {
    var el = document.createElement(tag);
    if (attrs) for (var k in attrs) el.setAttribute(k, attrs[k]);
    if (html) el.innerHTML = html;
    return el;
  },
  show: function(el) { if (el) el.style.display = ''; },
  hide: function(el) { if (el) el.style.display = 'none'; }
};

// 存储工具
const StorageUtils = {
  get: function(k, def) {
    try { var v = JSON.parse(localStorage.getItem('yj_' + k)); return v !== null ? v : def; }
    catch(e) { return def; }
  },
  set: function(k, v) {
    try { localStorage.setItem('yj_' + k, JSON.stringify(v)); } catch(e) {}
  },
  remove: function(k) {
    try { localStorage.removeItem('yj_' + k); } catch(e) {}
  }
};

// 动画工具
const AnimationUtils = {
  lerp: function(a, b, t) { return a + (b - a) * t; },
  clamp: function(v, min, max) { return Math.max(min, Math.min(max, v)); },
  easeOut: function(t) { return 1 - Math.pow(1 - t, 3); }
};

// 通用游戏工具
const GameUtils = {
  shuffle: function(arr) {
    var a = arr.slice(), i = a.length, j, t;
    while (i--) { j = Math.floor(Math.random() * (i + 1)); t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  },
  randomItem: function(arr) { return arr[Math.floor(Math.random() * arr.length)]; },
  formatTime: function(s) { return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
};

// 全局错误处理
const ErrorHandler = {
  wrap: function(fn, context) {
    return function() {
      try { return fn.apply(context || this, arguments); }
      catch(e) { console.warn('[EH]', e.message); return null; }
    };
  }
};
