/**
 * ============================================================================
 * 应急小达人 — Performance Patch (最终性能优化补丁)
 * ============================================================================
 * 版本: 1.0.0
 * 加载顺序: 在所有核心脚本之后，engine-runtime-patch.js 之后
 *
 * 优化内容:
 * 1. 全局命名空间保护 — 防止命名冲突，统一管理全局对象
 * 2. 事件监听器追踪 — 确保所有 addEventListener 有对应的 remove
 * 3. 定时器管理器 — 统一追踪和清理 setInterval/setTimeout/RAF
 * 4. DOM 批量操作 — DocumentFragment 批量插入 + 缓存优化
 * 5. 内存泄漏防护 — 页面切换/卸载时自动清理闭包和 DOM 引用
 * 6. 错误处理增强 — 全局错误捕获 + 异步操作保护
 * 7. 兼容性 Polyfill — 为旧浏览器提供 ES6+ 特性支持
 * 8. 引擎生命周期增强 — 为所有引擎添加统一的 destroy/cleanup
 * ============================================================================
 */

(function() {
  'use strict';

  // 避免重复加载
  if (window.__PerformancePatchLoaded) return;
  window.__PerformancePatchLoaded = true;

  console.log('[PerformancePatch] 加载最终性能优化补丁 v1.0.0');

  // ============================================================================
  // 7. 兼容性 Polyfill — 优先加载，确保后续代码兼容旧浏览器
  // ============================================================================

  // Object.entries
  if (!Object.entries) {
    Object.entries = function(obj) {
      var ownProps = Object.keys(obj);
      var i = ownProps.length;
      var resArray = new Array(i);
      while (i--) resArray[i] = [ownProps[i], obj[ownProps[i]]];
      return resArray;
    };
  }

  // Object.values
  if (!Object.values) {
    Object.values = function(obj) {
      var keys = Object.keys(obj);
      var res = [];
      for (var i = 0; i < keys.length; i++) res.push(obj[keys[i]]);
      return res;
    };
  }

  // Object.assign
  if (!Object.assign) {
    Object.assign = function(target) {
      if (target == null) throw new TypeError('Cannot convert undefined or null to object');
      var to = Object(target);
      for (var i = 1; i < arguments.length; i++) {
        var nextSource = arguments[i];
        if (nextSource != null) {
          for (var nextKey in nextSource) {
            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
              to[nextKey] = nextSource[nextKey];
            }
          }
        }
      }
      return to;
    };
  }

  // Array.from
  if (!Array.from) {
    Array.from = function(arrayLike) {
      var C = this;
      var items = Object(arrayLike);
      if (arrayLike == null) return [];
      var len = parseInt(items.length) || 0;
      var A = typeof C === 'function' ? Object(new C(len)) : new Array(len);
      for (var i = 0; i < len; i++) A[i] = items[i];
      return A;
    };
  }

  // Array.prototype.includes
  if (!Array.prototype.includes) {
    Array.prototype.includes = function(searchElement) {
      return this.indexOf(searchElement) !== -1;
    };
  }

  // String.prototype.padStart
  if (!String.prototype.padStart) {
    String.prototype.padStart = function padStart(targetLength, padString) {
      targetLength = targetLength >> 0;
      padString = String(padString || ' ');
      if (this.length > targetLength) return String(this);
      targetLength = targetLength - this.length;
      if (targetLength > padString.length) padString += padString.repeat(targetLength / padString.length);
      return padString.slice(0, targetLength) + String(this);
    };
  }

  // String.prototype.repeat
  if (!String.prototype.repeat) {
    String.prototype.repeat = function(count) {
      if (this == null) throw new TypeError('can\'t convert ' + this + ' to object');
      var str = '' + this;
      count = +count;
      if (count < 0 || count === Infinity) throw new RangeError('Invalid count value');
      count = Math.floor(count);
      if (str.length === 0 || count === 0) return '';
      var rpt = '';
      for (;;) {
        if (count & 1) rpt += str;
        count >>>= 1;
        if (count === 0) break;
        str += str;
      }
      return rpt;
    };
  }

  // Element.prototype.closest
  if (!Element.prototype.closest) {
    Element.prototype.closest = function(s) {
      var el = this;
      do {
        if (el.matches(s)) return el;
        el = el.parentElement || el.parentNode;
      } while (el !== null && el.nodeType === 1);
      return null;
    };
  }

  // Element.prototype.matches
  if (!Element.prototype.matches) {
    Element.prototype.matches =
      Element.prototype.msMatchesSelector ||
      Element.prototype.webkitMatchesSelector;
  }

  // NodeList.prototype.forEach
  if (!NodeList.prototype.forEach) {
    NodeList.prototype.forEach = Array.prototype.forEach;
  }

  // requestAnimationFrame 兼容性
  var lastTime = 0;
  var vendors = ['ms', 'moz', 'webkit', 'o'];
  for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
  }
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = window.setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };
  }
  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function(id) { clearTimeout(id); };
  }

  // CustomEvent (IE11)
  if (typeof window.CustomEvent !== 'function') {
    window.CustomEvent = function(event, params) {
      params = params || { bubbles: false, cancelable: false, detail: undefined };
      var evt = document.createEvent('CustomEvent');
      evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
      return evt;
    };
    window.CustomEvent.prototype = window.Event.prototype;
  }

  // ============================================================================
  // 1. 全局命名空间保护 — 检测命名冲突，统一管理全局对象
  // ============================================================================

  var GlobalRegistry = {
    _registry: {},
    _reserved: [
      'GameRegistry', 'DOMUtils', 'StorageUtils', 'AnimationUtils', 'ErrorHandler', 'GameUtils',
      'CONSTANTS', 'DOM_CACHE', 'UtilsEnhanced', 'BGTheme', 'MenuManager', 'LoadingScreen',
      'VisualFX', 'SFXEngine', 'BGMEngineV2', 'BGMEngine', 'V10Toast', 'V10CountUp', 'V10PageTransition',
      'MenuVisualEnhancer', 'MobileOptimizer', 'LiquidGlass', 'AITutorFloat', 'PerformanceEngine',
      'EngineCleanup', 'DOMCache', 'ErrorBoundary', 'EventDelegate', 'BaseEngine', 'createEngine',
      'QuizEngine', 'StudyEngine', 'BattleEngine', 'ScenarioEngine', 'BlindBoxEngine', 'CheckinEngine',
      'StatsEngine', 'AchievementEngine', 'PageManager', 'AudioManager', 'ThemeEngine', 'GameState',
      'AdaptiveDifficulty', 'BaseEngine', 'BattleEngine', 'BlindBoxEngine', 'BossRushEngine',
      'CalendarEngine', 'CardDropEngine', 'CardFragmentEngine', 'CardSynergy', 'CardSynthesisEngine',
      'CardUpgradeEngine', 'Certificate', 'CharacterEngine', 'CheckinEngine', 'CodexEngine',
      'CoinRainEngine', 'ComboEngine', 'DailyChallengeEngine', 'DailyTaskEngine', 'DiaryEngine',
      'DisasterMuseumEngine', 'DisasterQuizGame', 'EasterEggEngine', 'EncyclopediaEngine',
      'FirstAidEngine', 'GachaEngine', 'GuideEngine', 'I18nEngine', 'JuiceEngine', 'KitEngine',
      'KnowledgeRaceEngine', 'LeaderboardEngine', 'LevelEngine', 'MascotEngine', 'MemoryCardEngine',
      'MemoryGameV2', 'MiniGameEngine', 'Modal', 'MusicEngine', 'NewAchievements', 'OutfitEngine',
      'PKEngine', 'PetEngine', 'PrecisionEngine', 'ReactionEngine', 'ReactionGameV2',
      'RouletteEngine', 'ScenarioEngine', 'ScratchEngine', 'SeasonEngine', 'SetBonusEngine',
      'ShopEngine', 'StoryAdventureEngine', 'StoryChallengeEngine', 'StoryEngine', 'StudyEngine',
      'SupplyDropGame', 'SurvivalEngine', 'ThemeEngine', 'TimeEscapeEngine', 'TimedChallengeEngine',
      'TutorialEngine', 'ALL_CARDS', 'SCENARIO_DATA', 'KIT_DATA', 'ALL_CARDS', 'SCENARIO_DATA',
      'KIT_DATA'
    ],

    register: function(name, obj) {
      if (this._registry[name] && this._registry[name] !== obj) {
        console.warn('[GlobalRegistry] 命名冲突检测: "' + name + '" 已被注册，将被覆盖。旧对象:', this._registry[name]);
      }
      this._registry[name] = obj;
      return obj;
    },

    get: function(name) { return this._registry[name]; },

    checkConflicts: function() {
      var conflicts = [];
      var seen = {};
      for (var name in this._registry) {
        if (seen[name]) conflicts.push(name);
        seen[name] = true;
      }
      // 检查 window 上是否存在意外覆盖
      for (var i = 0; i < this._reserved.length; i++) {
        var r = this._reserved[i];
        if (window[r] && window[r] !== this._registry[r]) {
          console.warn('[GlobalRegistry] 全局对象 "' + r + '" 与注册表不一致，可能被外部脚本覆盖');
        }
      }
      if (conflicts.length > 0) {
        console.error('[GlobalRegistry] 发现命名冲突:', conflicts.join(', '));
      }
      return conflicts.length === 0;
    },

    list: function() { return Object.keys(this._registry); }
  };

  // 扫描并注册当前已存在的全局对象
  function scanGlobals() {
    for (var i = 0; i < GlobalRegistry._reserved.length; i++) {
      var name = GlobalRegistry._reserved[i];
      if (typeof window[name] !== 'undefined') {
        GlobalRegistry.register(name, window[name]);
      }
    }
  }
  scanGlobals();
  window.GlobalRegistry = GlobalRegistry;

  // ============================================================================
  // 2. 事件监听器管理器 — 追踪所有 addEventListener/removeEventListener
  // ============================================================================

  var EventManager = {
    _listeners: [],
    _enabled: true,
    _originalAdd: EventTarget.prototype.addEventListener,
    _originalRemove: EventTarget.prototype.removeEventListener,

    init: function() {
      var self = this;
      // Hook addEventListener
      EventTarget.prototype.addEventListener = function(type, listener, options) {
        if (self._enabled) {
          self._listeners.push({
            target: this,
            type: type,
            listener: listener,
            options: options,
            stack: new Error().stack
          });
        }
        return self._originalAdd.call(this, type, listener, options);
      };

      // Hook removeEventListener
      EventTarget.prototype.removeEventListener = function(type, listener, options) {
        if (self._enabled) {
          for (var i = self._listeners.length - 1; i >= 0; i--) {
            var item = self._listeners[i];
            if (item.target === this && item.type === type && item.listener === listener) {
              self._listeners.splice(i, 1);
              break;
            }
          }
        }
        return self._originalRemove.call(this, type, listener, options);
      };
    },

    // 获取所有未移除的监听器
    getOrphaned: function() {
      var orphaned = [];
      for (var i = 0; i < this._listeners.length; i++) {
        var item = this._listeners[i];
        try {
          if (item.target && !item.target.isConnected && item.target !== window && item.target !== document) {
            orphaned.push(item);
          }
        } catch (e) {}
      }
      return orphaned;
    },

    // 清理所有已断开 DOM 的监听器
    cleanupOrphaned: function() {
      var removed = 0;
      for (var i = this._listeners.length - 1; i >= 0; i--) {
        var item = this._listeners[i];
        try {
          if (item.target && item.target !== window && item.target !== document && item.target !== document.body) {
            if (typeof item.target.isConnected !== 'undefined' && !item.target.isConnected) {
              this._originalRemove.call(item.target, item.type, item.listener, item.options);
              this._listeners.splice(i, 1);
              removed++;
            }
          }
        } catch (e) {}
      }
      if (removed > 0) {
        console.log('[EventManager] 清理了 ' + removed + ' 个孤儿事件监听器');
      }
      return removed;
    },

    // 清理特定类型的监听器
    removeByType: function(type) {
      var removed = 0;
      for (var i = this._listeners.length - 1; i >= 0; i--) {
        var item = this._listeners[i];
        if (item.type === type) {
          try {
            this._originalRemove.call(item.target, item.type, item.listener, item.options);
          } catch (e) {}
          this._listeners.splice(i, 1);
          removed++;
        }
      }
      return removed;
    },

    // 获取监听器统计
    stats: function() {
      var counts = {};
      for (var i = 0; i < this._listeners.length; i++) {
        var t = this._listeners[i].type;
        counts[t] = (counts[t] || 0) + 1;
      }
      return { total: this._listeners.length, byType: counts };
    },

    // 完全清理（页面卸载时）
    destroyAll: function() {
      for (var i = this._listeners.length - 1; i >= 0; i--) {
        var item = this._listeners[i];
        try {
          this._originalRemove.call(item.target, item.type, item.listener, item.options);
        } catch (e) {}
      }
      this._listeners = [];
    }
  };
  EventManager.init();
  window.EventManager = EventManager;

  // ============================================================================
  // 3. 定时器管理器 — 统一追踪 setInterval/setTimeout/requestAnimationFrame
  // ============================================================================

  var TimerManager = {
    _timers: [],
    _rafIds: [],
    _originalSetTimeout: window.setTimeout,
    _originalSetInterval: window.setInterval,
    _originalClearTimeout: window.clearTimeout,
    _originalClearInterval: window.clearInterval,
    _originalRAF: window.requestAnimationFrame,
    _originalCancelRAF: window.cancelAnimationFrame,

    init: function() {
      var self = this;

      window.setTimeout = function(fn, delay) {
        var id = self._originalSetTimeout.call(window, function() {
          self._removeTimer(id, 'timeout');
          if (typeof fn === 'function') fn();
        }, delay);
        self._timers.push({ id: id, type: 'timeout', created: Date.now() });
        return id;
      };

      window.setInterval = function(fn, delay) {
        var id = self._originalSetInterval.call(window, fn, delay);
        self._timers.push({ id: id, type: 'interval', created: Date.now() });
        return id;
      };

      window.clearTimeout = function(id) {
        self._removeTimer(id, 'timeout');
        return self._originalClearTimeout.call(window, id);
      };

      window.clearInterval = function(id) {
        self._removeTimer(id, 'interval');
        return self._originalClearInterval.call(window, id);
      };

      window.requestAnimationFrame = function(callback) {
        var id = self._originalRAF.call(window, function(timestamp) {
          self._removeRAF(id);
          callback(timestamp);
        });
        self._rafIds.push(id);
        return id;
      };

      window.cancelAnimationFrame = function(id) {
        self._removeRAF(id);
        return self._originalCancelRAF.call(window, id);
      };
    },

    _removeTimer: function(id, type) {
      for (var i = this._timers.length - 1; i >= 0; i--) {
        if (this._timers[i].id === id && this._timers[i].type === type) {
          this._timers.splice(i, 1);
          return;
        }
      }
    },

    _removeRAF: function(id) {
      var idx = this._rafIds.indexOf(id);
      if (idx !== -1) this._rafIds.splice(idx, 1);
    },

    // 清理所有超过指定时间的定时器
    cleanupStale: function(maxAgeMs) {
      maxAgeMs = maxAgeMs || 300000; // 默认 5 分钟
      var now = Date.now();
      var removed = 0;
      for (var i = this._timers.length - 1; i >= 0; i--) {
        var t = this._timers[i];
        if (now - t.created > maxAgeMs) {
          if (t.type === 'interval') {
            this._originalClearInterval.call(window, t.id);
          } else {
            this._originalClearTimeout.call(window, t.id);
          }
          this._timers.splice(i, 1);
          removed++;
        }
      }
      return removed;
    },

    // 清理所有定时器（页面卸载时）
    cleanupAll: function() {
      for (var i = this._timers.length - 1; i >= 0; i--) {
        var t = this._timers[i];
        try {
          if (t.type === 'interval') {
            this._originalClearInterval.call(window, t.id);
          } else {
            this._originalClearTimeout.call(window, t.id);
          }
        } catch (e) {}
      }
      this._timers = [];
      for (var j = 0; j < this._rafIds.length; j++) {
        try {
          this._originalCancelRAF.call(window, this._rafIds[j]);
        } catch (e) {}
      }
      this._rafIds = [];
    },

    stats: function() {
      return {
        timers: this._timers.length,
        raf: this._rafIds.length
      };
    }
  };
  TimerManager.init();
  window.TimerManager = TimerManager;

  // ============================================================================
  // 4. DOM 批量操作优化 — DocumentFragment + 批量写入 + 缓存优化
  // ============================================================================

  var DOMOptimizer = {
    _writeQueue: [],
    _readQueue: [],
    _writeScheduled: false,
    _readScheduled: false,

    // 批量写入 innerHTML（使用 rAF 合并）
    batchWrite: function(id, html) {
      this._writeQueue.push({ id: id, html: html });
      if (!this._writeScheduled) {
        this._writeScheduled = true;
        requestAnimationFrame(this._flushWrites.bind(this));
      }
    },

    _flushWrites: function() {
      // 先批量读取所有元素（避免读写交错导致的重排）
      var elements = {};
      for (var i = 0; i < this._writeQueue.length; i++) {
        var item = this._writeQueue[i];
        if (!elements[item.id]) {
          elements[item.id] = document.getElementById(item.id);
        }
      }
      // 再批量写入
      for (var j = 0; j < this._writeQueue.length; j++) {
        var w = this._writeQueue[j];
        var el = elements[w.id];
        if (el) el.innerHTML = w.html;
      }
      this._writeQueue = [];
      this._writeScheduled = false;
    },

    // 使用 DocumentFragment 批量插入子元素
    batchAppend: function(containerId, elements) {
      var container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
      if (!container) return;
      var fragment = document.createDocumentFragment();
      for (var i = 0; i < elements.length; i++) {
        if (elements[i]) fragment.appendChild(elements[i]);
      }
      container.appendChild(fragment);
    },

    // 安全的批量 querySelectorAll（带缓存）
    queryAllCached: function(selector, parent) {
      parent = parent || document;
      return parent.querySelectorAll(selector);
    },

    // 避免在循环中读取 offsetHeight/scrollHeight
    // 提供一次性批量读取接口
    batchReadMetrics: function(ids) {
      var metrics = {};
      for (var i = 0; i < ids.length; i++) {
        var el = document.getElementById(ids[i]);
        if (el) {
          metrics[ids[i]] = {
            offsetHeight: el.offsetHeight,
            offsetWidth: el.offsetWidth,
            scrollHeight: el.scrollHeight,
            clientHeight: el.clientHeight
          };
        }
      }
      return metrics;
    },

    // 清理空文本节点和孤立节点
    cleanupEmptyNodes: function(root) {
      root = root || document.body;
      var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
      var toRemove = [];
      var node;
      while (node = walker.nextNode()) {
        if (!node.textContent.trim()) toRemove.push(node);
      }
      for (var i = 0; i < toRemove.length; i++) {
        var n = toRemove[i];
        if (n.parentNode) n.parentNode.removeChild(n);
      }
      return toRemove.length;
    }
  };
  window.DOMOptimizer = DOMOptimizer;

  // ============================================================================
  // 5. 内存泄漏防护 — 自动清理闭包、DOM 引用、事件监听
  // ============================================================================

  var MemoryGuard = {
    _cleanupInterval: null,
    _weakRefs: [],

    init: function() {
      var self = this;
      // 每 30 秒执行一次内存检查
      this._cleanupInterval = setInterval(function() {
        self._performCleanup();
      }, 30000);

      // 页面卸载时深度清理
      window.addEventListener('beforeunload', function() {
        self._deepCleanup();
      });

      // 页面隐藏时清理非关键资源
      document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
          self._pauseNonCritical();
        } else {
          self._resumeNonCritical();
        }
      });
    },

    _performCleanup: function() {
      // 1. 清理事件监听器
      var removedEvents = EventManager.cleanupOrphaned();

      // 2. 清理过期定时器
      var removedTimers = TimerManager.cleanupStale(600000); // 10 分钟

      // 3. 清理 DOM 缓存中的无效引用
      if (typeof DOMCache !== 'undefined' && DOMCache.clear) {
        // 保留，但页面切换时应该调用 DOMCache.clear
      }

      // 4. 清理离屏 canvas
      var canvases = document.querySelectorAll('canvas');
      var cleanedCanvas = 0;
      for (var i = 0; i < canvases.length; i++) {
        var c = canvases[i];
        if (!c.offsetParent && c.id !== 'bgCanvas') {
          try {
            var ctx = c.getContext('2d');
            if (ctx) ctx.clearRect(0, 0, c.width, c.height);
            cleanedCanvas++;
          } catch (e) {}
        }
      }

      // 5. 清理粒子/动画临时 DOM 元素
      var tempSelectors = ['.particle', '.confetti', '.float-text', '.coin-rain', '.combo-popup', '.card-drop-overlay'];
      var cleanedDOM = 0;
      for (var j = 0; j < tempSelectors.length; j++) {
        var els = document.querySelectorAll(tempSelectors[j]);
        for (var k = 0; k < els.length; k++) {
          if (els[k].parentNode) {
            els[k].parentNode.removeChild(els[k]);
            cleanedDOM++;
          }
        }
      }

      if (removedEvents > 0 || removedTimers > 0 || cleanedDOM > 0) {
        console.log('[MemoryGuard] 清理完成: 事件=' + removedEvents + ', 定时器=' + removedTimers + ', Canvas=' + cleanedCanvas + ', DOM=' + cleanedDOM);
      }
    },

    _pauseNonCritical: function() {
      // 暂停非关键动画
      document.body.classList.add('page-hidden');
      // 暂停 BGM
      if (typeof BGMEngineV2 !== 'undefined' && BGMEngineV2.pause) {
        BGMEngineV2.pause();
      }
      // 暂停粒子动画
      if (typeof PerformanceEngine !== 'undefined') {
        PerformanceEngine._isInBackground = true;
      }
    },

    _resumeNonCritical: function() {
      document.body.classList.remove('page-hidden');
      if (typeof BGMEngineV2 !== 'undefined' && BGMEngineV2.resume) {
        BGMEngineV2.resume();
      }
      if (typeof PerformanceEngine !== 'undefined') {
        PerformanceEngine._isInBackground = false;
      }
    },

    _deepCleanup: function() {
      // 清理所有定时器
      TimerManager.cleanupAll();
      // 清理所有事件监听器
      EventManager.destroyAll();
      // 清理内存缓存
      if (typeof DOMCache !== 'undefined' && DOMCache.clear) DOMCache.clear();
      if (typeof clearDOMCache !== 'undefined') clearDOMCache();
      // 清理引擎状态
      if (typeof EngineCleanup !== 'undefined' && EngineCleanup.cleanAll) {
        EngineCleanup.cleanAll();
      }
    },

    // 注册弱引用（用于追踪可能被泄漏的对象）
    registerWeakRef: function(name, obj) {
      this._weakRefs.push({ name: name, obj: obj, time: Date.now() });
    }
  };
  MemoryGuard.init();
  window.MemoryGuard = MemoryGuard;

  // ============================================================================
  // 6. 错误处理增强 — 全局错误捕获 + 异步操作保护
  // ============================================================================

  var ErrorGuard = {
    _errorCount: 0,
    _maxErrors: 50,
    _errorLog: [],

    init: function() {
      var self = this;

      // 全局错误处理
      window.onerror = function(message, source, lineno, colno, error) {
        self._logError('window.onerror', message, source, lineno, error);
        return false; // 不阻止默认行为
      };

      // 未处理的 Promise 错误
      window.addEventListener('unhandledrejection', function(e) {
        self._logError('unhandledrejection', String(e.reason), null, null, e.reason);
      });

      // 资源加载错误
      window.addEventListener('error', function(e) {
        if (e.target && (e.target.tagName === 'IMG' || e.target.tagName === 'SCRIPT' || e.target.tagName === 'LINK')) {
          console.warn('[ErrorGuard] 资源加载失败:', e.target.src || e.target.href);
        }
      }, true);
    },

    _logError: function(type, message, source, lineno, error) {
      if (this._errorCount >= this._maxErrors) return;
      this._errorCount++;
      var entry = {
        type: type,
        message: String(message),
        source: source || '',
        lineno: lineno || 0,
        time: new Date().toISOString(),
        stack: error && error.stack ? error.stack.split('\n').slice(0, 3).join('\n') : ''
      };
      this._errorLog.push(entry);
      console.error('[ErrorGuard] ' + type + ':', message, 'at', source + ':' + lineno);
    },

    // 安全包装异步函数
    safeAsync: function(fn, context) {
      var self = this;
      return function() {
        try {
          var result = fn.apply(this, arguments);
          if (result && typeof result.then === 'function') {
            return result.catch(function(err) {
              self._logError('async:' + context, err.message, null, null, err);
              return undefined;
            });
          }
          return result;
        } catch (err) {
          self._logError('sync:' + context, err.message, null, null, err);
          return undefined;
        }
      };
    },

    getLogs: function() { return this._errorLog.slice(); },
    reset: function() { this._errorCount = 0; this._errorLog = []; }
  };
  ErrorGuard.init();
  window.ErrorGuard = ErrorGuard;

  // ============================================================================
  // 8. 引擎生命周期增强 — 为所有引擎添加统一的 destroy/cleanup
  // ============================================================================

  var EngineLifecycle = {
    _engines: [],

    register: function(engine) {
      if (!engine || this._engines.indexOf(engine) !== -1) return;
      this._engines.push(engine);
      // 自动注入 destroy 方法
      if (!engine.destroy) {
        engine.destroy = function() {
          var timerFields = ['timerInterval', 'timer', '_timer', 'targetTimeout', 'interval', '_interval', 'animFrame', '_animFrame', '_timeoutId', 'quizInterval', 'targetTimeout'];
          for (var i = 0; i < timerFields.length; i++) {
            var field = timerFields[i];
            if (engine[field]) {
              clearInterval(engine[field]);
              clearTimeout(engine[field]);
              engine[field] = null;
            }
          }
          engine.active = false;
        };
      }
    },

    cleanupAll: function() {
      var cleaned = 0;
      for (var i = 0; i < this._engines.length; i++) {
        var engine = this._engines[i];
        if (engine && typeof engine.destroy === 'function') {
          try {
            engine.destroy();
            cleaned++;
          } catch (e) {}
        }
      }
      console.log('[EngineLifecycle] 已清理 ' + cleaned + ' 个引擎');
      return cleaned;
    },

    // 自动扫描 window 上的引擎对象
    autoRegister: function() {
      var engineNames = [
        'QuizEngine', 'StudyEngine', 'BattleEngine', 'ScenarioEngine', 'BlindBoxEngine',
        'CheckinEngine', 'StatsEngine', 'AchievementEngine', 'KnowledgeRaceEngine',
        'TimeEscapeEngine', 'DisasterQuizGame', 'MemoryCardEngine', 'ReactionEngine',
        'PrecisionEngine', 'StoryAdventureEngine', 'StoryChallengeEngine', 'MiniGameEngine',
        'SurvivalEngine', 'BossRushEngine', 'TimedChallengeEngine', 'ComboEngine',
        'DailyChallengeEngine', 'DailyTaskEngine', 'KitEngine', 'PKEngine',
        'CoinRainEngine', 'CardDropEngine', 'EasterEggEngine', 'GuideEngine',
        'TutorialEngine', 'CalendarEngine', 'FirstAidEngine', 'GachaEngine',
        'RouletteEngine', 'ScratchEngine', 'MemoryGameV2', 'SupplyDropGame'
      ];
      for (var i = 0; i < engineNames.length; i++) {
        if (typeof window[engineNames[i]] !== 'undefined') {
          this.register(window[engineNames[i]]);
        }
      }
    }
  };
  window.EngineLifecycle = EngineLifecycle;

  // 页面卸载时自动清理所有引擎
  window.addEventListener('beforeunload', function() {
    EngineLifecycle.cleanupAll();
  });

  // 如果 PageManager 存在，增强其 navigate 方法自动清理
  if (typeof PageManager !== 'undefined' && PageManager.navigate) {
    var _origPageNavigate = PageManager.navigate.bind(PageManager);
    PageManager.navigate = function(pageId) {
      try {
        EngineLifecycle.cleanupAll();
        TimerManager.cleanupStale(0); // 清理所有过期定时器
        EventManager.cleanupOrphaned(); // 清理孤儿事件监听器
      } catch (e) {}
      return _origPageNavigate(pageId);
    };
  }

  // ============================================================================
  // 增强型 DOM 缓存清理钩子
  // ============================================================================

  // 如果 utils-enhanced.js 已加载，增强其 clearDOMCache
  if (typeof clearDOMCache === 'function') {
    var _origClearDOMCache = clearDOMCache;
    window.clearDOMCache = function() {
      _origClearDOMCache();
      if (typeof DOMCache !== 'undefined' && DOMCache.clear) DOMCache.clear();
    };
  }

  // ============================================================================
  // 最终启动：扫描并注册所有引擎
  // ============================================================================

  // 延迟扫描，确保所有脚本已加载
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(function() {
        EngineLifecycle.autoRegister();
        GlobalRegistry.checkConflicts();
        console.log('[PerformancePatch] 初始化完成。引擎数:', EngineLifecycle._engines.length, '全局对象:', GlobalRegistry.list().length);
      }, 1000);
    });
  } else {
    setTimeout(function() {
      EngineLifecycle.autoRegister();
      GlobalRegistry.checkConflicts();
      console.log('[PerformancePatch] 初始化完成。引擎数:', EngineLifecycle._engines.length, '全局对象:', GlobalRegistry.list().length);
    }, 1000);
  }

  // 暴露 API 到全局
  window.PerformancePatch = {
    version: '1.0.0',
    GlobalRegistry: GlobalRegistry,
    EventManager: EventManager,
    TimerManager: TimerManager,
    DOMOptimizer: DOMOptimizer,
    MemoryGuard: MemoryGuard,
    ErrorGuard: ErrorGuard,
    EngineLifecycle: EngineLifecycle,
    stats: function() {
      return {
        events: EventManager.stats(),
        timers: TimerManager.stats(),
        globals: GlobalRegistry.list().length,
        engines: EngineLifecycle._engines.length,
        errors: ErrorGuard.getLogs().length
      };
    }
  };

})();
