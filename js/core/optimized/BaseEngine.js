/**
 * ============================================================================
 * BaseEngine - 游戏引擎抽象基类
 * ============================================================================
 * 设计目标：
 *  1. 提取所有引擎的公共 init() 模式（原文件 57 个引擎，30+ 个模式相同）
 *  2. 标准化状态管理、生命周期、事件绑定
 *  3. 提供模板方法模式：init → render → bindEvents → start
 *  4. 自动错误边界包裹
 * ============================================================================
 */
class BaseEngine {
  /**
   * @param {string} name - 引擎名称
   * @param {string} pageId - 对应页面 ID（PageManager 导航用）
   */
  constructor(name, pageId) {
    this.name = name;
    this.pageId = pageId;
    this.active = false;
    this._timer = null;
    this._data = {};
    this._initialized = false;
  }

  /**
   * 生命周期：初始化（子类可覆盖）
   * 默认流程：导航页面 → 重置状态 → 渲染 UI → 绑定事件 → 开始
   */
  init(options = {}) {
    return ErrorBoundary.safeCall(() => {
      this._beforeInit(options);

      // 1. 页面导航
      if (this.pageId && typeof PageManager !== 'undefined') {
        PageManager.navigate(this.pageId);
      }

      // 2. 重置状态
      this._resetState(options);

      // 3. 渲染 UI
      this.render();

      // 4. 绑定事件
      this._bindEvents();

      // 5. 开始运行
      this.active = true;
      this._start(options);

      this._initialized = true;
      this._afterInit(options);

      return this;
    }, `${this.name}.init`, this);
  }

  /** 初始化前钩子 */
  _beforeInit(options) {}

  /** 初始化后钩子 */
  _afterInit(options) {}

  /** 重置状态（子类必须覆盖） */
  _resetState(options) {
    this._data = {};
  }

  /** 渲染 UI（子类必须覆盖） */
  render() {
    console.warn(`[BaseEngine] ${this.name}.render() not implemented`);
  }

  /** 绑定事件（子类可选覆盖） */
  _bindEvents() {}

  /** 开始运行（子类可选覆盖） */
  _start(options) {}

  /** 清理资源 */
  destroy() {
    this.active = false;
    this._clearTimers();
    this._unbindEvents();
  }

  /** 设置定时器（自动追踪，便于清理） */
  _setTimer(fn, delay) {
    this._clearTimers();
    this._timer = setTimeout(fn, delay);
    return this._timer;
  }

  /** 设置间隔（自动追踪） */
  _setInterval(fn, delay) {
    this._clearTimers();
    this._timer = setInterval(fn, delay);
    return this._timer;
  }

  /** 清除定时器 */
  _clearTimers() {
    if (this._timer) {
      clearTimeout(this._timer);
      clearInterval(this._timer);
      this._timer = null;
    }
  }

  /** 解绑事件 */
  _unbindEvents() {}

  /** 获取当前游戏状态 */
  getState() {
    return { ...this._data, active: this.active };
  }
}

/**
 * 快速创建简单引擎的工厂函数
 * @param {string} name - 引擎名称
 * @param {string} pageId - 页面 ID
 * @param {Object} impl - 实现对象 { render, onStart, onAnswer, ... }
 */
function createEngine(name, pageId, impl) {
  const engine = new BaseEngine(name, pageId);
  for (const [key, val] of Object.entries(impl)) {
    engine[key] = val;
  }
  return engine;
}
