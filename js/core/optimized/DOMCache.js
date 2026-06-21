/**
 * ============================================================================
 * DOMCache - 高性能 DOM 元素缓存系统
 * ============================================================================
 * 设计目标：
 *  1. 消除所有重复 getElementById/querySelector 调用（原文件 258 次）
 *  2. 惰性初始化 + 自动失效重查
 *  3. 批量缓存 + 模式匹配缓存
 *  4. 减少重排重绘：批量读取/写入 DOM
 * ============================================================================
 */
const DOMCache = (function() {
  'use strict';

  const _cache = new Map();
  const _batchQueue = [];
  let _batchScheduled = false;

  /**
   * 获取元素（带缓存）
   * @param {string} id - 元素 ID
   * @param {boolean} refresh - 强制刷新缓存
   * @returns {HTMLElement|null}
   */
  function get(id, refresh = false) {
    if (!refresh && _cache.has(id)) {
      const el = _cache.get(id);
      // 验证缓存有效性（DOM 是否还在文档中）
      if (el && document.body.contains(el)) return el;
      _cache.delete(id); // 失效
    }
    const el = document.getElementById(id);
    if (el) _cache.set(id, el);
    return el;
  }

  /**
   * 查询单个元素（querySelector）
   * @param {string} selector - CSS 选择器
   * @param {HTMLElement} parent - 父元素（可选）
   * @returns {HTMLElement|null}
   */
  function query(selector, parent = document) {
    const key = (parent === document ? 'd' : parent.id || 'p') + ':' + selector;
    if (_cache.has(key)) {
      const el = _cache.get(key);
      if (el && document.body.contains(el)) return el;
      _cache.delete(key);
    }
    const el = parent.querySelector(selector);
    if (el) _cache.set(key, el);
    return el;
  }

  /**
   * 批量缓存多个 ID
   * @param {string[]} ids - ID 数组
   * @returns {Object} 映射对象 {id: element}
   */
  function batch(ids) {
    const result = {};
    for (const id of ids) {
      result[id] = get(id);
    }
    return result;
  }

  /**
   * 获取多个元素（querySelectorAll）
   * @param {string} selector - CSS 选择器
   * @param {HTMLElement} parent - 父元素
   * @returns {NodeList}
   */
  function queryAll(selector, parent = document) {
    return parent.querySelectorAll(selector);
  }

  /**
   * 批量写入 innerHTML（下一帧统一执行，减少重排）
   * @param {string} id - 目标元素 ID
   * @param {string} html - HTML 字符串
   */
  function setHTML(id, html) {
    const el = get(id);
    if (!el) return;

    // 使用 requestAnimationFrame 批量写入，减少重排
    _batchQueue.push({ el, html });
    if (!_batchScheduled) {
      _batchScheduled = true;
      requestAnimationFrame(() => {
        for (const item of _batchQueue) {
          item.el.innerHTML = item.html;
        }
        _batchQueue.length = 0;
        _batchScheduled = false;
      });
    }
  }

  /**
   * 清空所有缓存（页面切换时调用）
   */
  function clear() {
    _cache.clear();
  }

  /**
   * 缓存统计（调试用）
   */
  function stats() {
    return {
      size: _cache.size,
      keys: Array.from(_cache.keys())
    };
  }

  return {
    get,
    query,
    batch,
    queryAll,
    setHTML,
    clear,
    stats
  };
})();

// 全局快捷访问（保持向后兼容）
window.$id = DOMCache.get;
window.$qs = DOMCache.query;
window.$qsa = DOMCache.queryAll;
