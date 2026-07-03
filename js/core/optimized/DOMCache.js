/**
 * ============================================================================
 * DOMCache.js — DOM 元素缓存
 * ============================================================================
 */

const DOMCache = {
  _cache: {},
  get: function(id) {
    if (!this._cache[id]) {
      this._cache[id] = document.getElementById(id);
    }
    return this._cache[id];
  },
  clear: function(id) {
    if (id) { delete this._cache[id]; }
    else { this._cache = {}; }
  },
  refresh: function(id) {
    delete this._cache[id];
    return this.get(id);
  }
};
