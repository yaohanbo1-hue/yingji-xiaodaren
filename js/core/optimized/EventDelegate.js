/**
 * ============================================================================
 * EventDelegate - 统一事件委托系统
 * ============================================================================
 * 设计目标：
 *  1. 替代 101 个内联 onclick（性能差、XSS 风险、不可维护）
 *  2. 单一全局监听器，事件冒泡处理
 *  3. 通过 data-action 属性自动分发
 *  4. 支持动态内容（不需要每次重新绑定）
 * ============================================================================
 */
const EventDelegate = (function() {
  'use strict';

  const _handlers = new Map(); // action -> handler
  const _root = document.body;
  let _initialized = false;

  /**
   * 注册一个动作处理器
   * @param {string} action - 动作名称（data-action 的值）
   * @param {Function} handler - 处理函数(event, data)
   */
  function on(action, handler) {
    if (typeof handler !== 'function') {
      console.error(`[EventDelegate] Handler for "${action}" must be a function`);
      return;
    }
    _handlers.set(action, handler);
  }

  /**
   * 批量注册动作
   * @param {Object} map - { action: handler }
   */
  function register(map) {
    for (const [action, handler] of Object.entries(map)) {
      on(action, handler);
    }
  }

  /**
   * 注销动作
   * @param {string} action 
   */
  function off(action) {
    _handlers.delete(action);
  }

  /**
   * 核心分发逻辑
   * @param {Event} e 
   */
  function _dispatch(e) {
    const target = e.target.closest('[data-action]');
    if (!target) return;

    const action = target.dataset.action;
    if (!action) return;

    const handler = _handlers.get(action);
    if (!handler) return;

    // 解析 data-params JSON 参数
    let params = {};
    if (target.dataset.params) {
      try {
        params = JSON.parse(target.dataset.params);
      } catch (err) {
        console.warn(`[EventDelegate] Invalid JSON in data-params:`, target.dataset.params);
      }
    }

    // 执行处理器
    try {
      handler(e, params, target);
    } catch (err) {
      console.error(`[EventDelegate] Error in handler "${action}":`, err);
    }

    // 如果标记了 data-prevent-default，阻止默认行为
    if (target.dataset.preventDefault === 'true') {
      e.preventDefault();
    }

    // 如果标记了 data-stop-propagation，阻止冒泡
    if (target.dataset.stopPropagation === 'true') {
      e.stopPropagation();
    }
  }

  /**
   * 初始化全局监听（只需调用一次）
   */
  function init() {
    if (_initialized) return;
    _initialized = true;

    // 监听 click 事件（覆盖绝大多数交互）
    _root.addEventListener('click', _dispatch);

    // 监听自定义 data-trigger 事件类型
    _root.addEventListener('pointerdown', (e) => {
      const target = e.target.closest('[data-trigger="pointerdown"]');
      if (target) _dispatch(e);
    });

    console.log('[EventDelegate] Initialized with', _handlers.size, 'handlers');
  }

  /**
   * 为兼容性，保留旧版 onclick 包装器
   * 将 onclick="Engine.method()" 转为 data-action="method" 的方式
   */
  function migrateLegacyClicks(container) {
    const els = container.querySelectorAll('[onclick]');
    for (const el of els) {
      const onclick = el.getAttribute('onclick');
      if (!onclick) continue;

      // 简单解析：提取 Engine.method(arg) 模式
      const match = onclick.match(/^(\w+)\.(\w+)\((.*?)\)$/);
      if (match) {
        const [, engine, method, rawArgs] = match;
        el.dataset.action = `${engine}.${method}`;
        try {
          const args = rawArgs ? eval(`[${rawArgs}]`) : []; // 安全：仅解析字面量
          el.dataset.params = JSON.stringify({ args });
        } catch (_) {}
        el.removeAttribute('onclick');
      }
    }
  }

  return {
    on,
    register,
    off,
    init,
    migrateLegacyClicks
  };
})();
