/**
 * ============================================================================
 * ErrorBoundary - 运行时错误边界与优雅降级
 * ============================================================================
 * 设计目标：
 *  1. 为所有引擎方法添加 try/catch 包装（原文件仅 24 处，覆盖率极低）
 *  2. 提供 safeCall 工具函数
 *  3. 引擎初始化失败时优雅降级，不阻断整个游戏
 *  4. 错误日志上报（控制台 + 可选远程）
 * ============================================================================
 */
const ErrorBoundary = (function() {
  'use strict';

  const _errorLog = [];
  const MAX_LOG_SIZE = 50;

  /**
   * 安全执行函数，捕获错误并返回默认值
   * @param {Function} fn - 要执行的函数
   * @param {string} context - 错误上下文描述
   * @param {*} fallback - 出错时的返回值
   * @param  {...any} args - 传递给 fn 的参数
   * @returns {*}
   */
  function safeCall(fn, context, fallback, ...args) {
    try {
      return fn(...args);
    } catch (err) {
      _logError(err, context);
      return fallback;
    }
  }

  /**
   * 安全异步执行
   * @param {Function} fn - 返回 Promise 的函数
   * @param {string} context 
   * @param {*} fallback 
   * @param  {...any} args 
   */
  async function safeCallAsync(fn, context, fallback, ...args) {
    try {
      return await fn(...args);
    } catch (err) {
      _logError(err, context);
      return fallback;
    }
  }

  /**
   * 包装对象的所有方法，添加 try/catch
   * @param {Object} obj - 目标对象
   * @param {string} namespace - 命名空间（日志用）
   * @param {string[]} methodNames - 要包装的方法名（可选，默认所有函数）
   * @returns {Object} 原对象（修改后的）
   */
  function wrapMethods(obj, namespace, methodNames) {
    const keys = methodNames || Object.keys(obj);
    for (const key of keys) {
      const fn = obj[key];
      if (typeof fn !== 'function') continue;

      obj[key] = function(...args) {
        try {
          return fn.apply(this, args);
        } catch (err) {
          _logError(err, `${namespace}.${key}`);
          return undefined;
        }
      };
    }
    return obj;
  }

  /**
   * 引擎初始化包装器
   * @param {Function} initFn - 引擎初始化函数
   * @param {string} engineName - 引擎名称
   * @returns {boolean} 是否成功
   */
  function safeInit(initFn, engineName) {
    try {
      initFn();
      console.log(`[ErrorBoundary] ${engineName} initialized successfully`);
      return true;
    } catch (err) {
      _logError(err, `init:${engineName}`);
      console.error(`[ErrorBoundary] ${engineName} init failed, game continues with degraded mode`);
      return false;
    }
  }

  /**
   * 内部错误日志
   */
  function _logError(err, context) {
    const entry = {
      time: new Date().toISOString(),
      context,
      message: err.message,
      stack: err.stack?.split('\n').slice(0, 3).join('\n')
    };
    _errorLog.push(entry);
    if (_errorLog.length > MAX_LOG_SIZE) _errorLog.shift();
    console.error(`[ErrorBoundary] ${context}:`, err.message);
  }

  /**
   * 获取错误日志
   */
  function getLogs() {
    return [..._errorLog];
  }

  /**
   * 全局未捕获错误处理（增强版）
   */
  function setupGlobalHandlers() {
    window.addEventListener('error', (e) => {
      _logError(e.error || new Error(e.message), `global:${e.filename}:${e.lineno}`);
    });
    window.addEventListener('unhandledrejection', (e) => {
      _logError(e.reason instanceof Error ? e.reason : new Error(String(e.reason)), 'unhandledrejection');
    });
  }

  return {
    safeCall,
    safeCallAsync,
    wrapMethods,
    safeInit,
    getLogs,
    setupGlobalHandlers
  };
})();

// 安装全局错误处理器
ErrorBoundary.setupGlobalHandlers();
