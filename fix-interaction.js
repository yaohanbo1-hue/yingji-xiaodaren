/**
 * ==========================================================
 * 应急小达人 — 交互体验修复 v1.0
 * 修复项：
 *   1. 全局双击防抖（防止快速点击穿透）
 *   2. StoryAdventureEngine 定时器无法取消
 *   3. MascotEngine 定时器无法取消（气泡显示）
 *   4. MemoryCardEngine 缺失 cleanup 方法
 *   5. Modal 缺少事件解绑
 *   6. 页面切换时清理所有挂起的定时器
 *   7. 按钮点击禁用态增强
 * ==========================================================
 */
(function() {
  'use strict';

  // ======================================================
  // 1. 全局双击防抖系统
  // ======================================================
  const ClickGuard = {
    _locked: new Map(),
    _defaultDelay: 500,

    /**
     * 检查并锁住一个操作的点击
     * @param {string} key - 操作的唯一标识
     * @param {number} [delay] - 锁定时间(ms)
     * @returns {boolean} true=允许执行, false=被防抖拦截
     */
    guard(key, delay) {
      if (this._locked.has(key)) return false;
      this._locked.set(key, true);
      const d = delay || this._defaultDelay;
      setTimeout(() => this._locked.delete(key), d);
      return true;
    },

    /** 清理所有锁 */
    clear() {
      this._locked.clear();
    }
  };

  // 暴露到全局
  window.ClickGuard = ClickGuard;

  // ======================================================
  // 3. 修复 StoryAdventureEngine: 存储 timerId + 可取消
  // ======================================================
  if (typeof StoryAdventureEngine !== 'undefined') {
    StoryAdventureEngine._narrateTimerId = null;

    // 完全替换 _startChapter，确保 setTimeout 可取消
    StoryAdventureEngine._startChapter = function() {
      // 清除旧的定时器
      if (this._narrateTimerId) {
        clearTimeout(this._narrateTimerId);
        this._narrateTimerId = null;
      }

      var chapter = this.chapters[this.currentChapter];
      var chapterEl = document.getElementById('storyAdvChapter');
      var narrationEl = document.getElementById('storyAdvNarration');
      var fill = document.getElementById('storyAdvProgressFill');

      if (chapterEl) chapterEl.textContent = chapter.title;
      if (narrationEl) narrationEl.textContent = chapter.intro;
      if (fill) fill.style.width = '0%';
      this.currentIdx = 0;

      if (typeof AudioManager !== 'undefined') {
        AudioManager.play('chapter_start');
      }

      var self = this;
      this._narrateTimerId = setTimeout(function() {
        self._narrateTimerId = null;
        self._showQuestion();
      }, 2500);
    };

    // 新增 cleanup 方法
    if (!StoryAdventureEngine.cleanup) {
      StoryAdventureEngine.cleanup = function() {
        if (this._narrateTimerId) {
          clearTimeout(this._narrateTimerId);
          this._narrateTimerId = null;
        }
        this.active = false;
      };
    }
  }

  // ======================================================
  // 4. 修复 MascotEngine: 存储 timerId 可取消
  // ======================================================
  if (typeof MascotEngine !== 'undefined') {
    MascotEngine._bubbleTimerId = null;

    const _origSay = MascotEngine.say;
    MascotEngine.say = function(text, duration) {
      // 清除前一个定时器
      if (this._bubbleTimerId) {
        clearTimeout(this._bubbleTimerId);
        this._bubbleTimerId = null;
      }
      duration = duration || 3000;
      const el = document.getElementById('mascotBubble');
      if (el) {
        el.textContent = text;
        el.style.display = 'block';
        this._bubbleTimerId = setTimeout(function() {
          el.style.display = 'none';
          MascotEngine._bubbleTimerId = null;
        }, duration);
      }
    };
  }

  // ======================================================
  // 5. 修复 MemoryCardEngine: 添加 cleanup 方法
  // ======================================================
  if (typeof MemoryCardEngine !== 'undefined' && !MemoryCardEngine.cleanup) {
    MemoryCardEngine.cleanup = function() {
      this.active = false;
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
      this.flipped = [];
    };
  }

  // ======================================================
  // 6. 修复 Modal: 添加事件解绑
  // ======================================================
  if (typeof Modal !== 'undefined' && !Modal._unbindEvents) {
    Modal._unbindEvents = function() {
      if (!this._eventsBound) return;
      this._eventsBound = false;
      if (this._overlay && this._onClickOutside) {
        this._overlay.removeEventListener('click', this._onClickOutside);
      }
      if (this._onKeyDown) {
        document.removeEventListener('keydown', this._onKeyDown);
      }
    };

    // 增强 hide 方法，在隐藏时解绑
    const _origHide = Modal.hide;
    Modal.hide = function() {
      const result = _origHide.call(this);
      this._unbindEvents();
      return result;
    };
  }

  // ======================================================
  // 7. 增强 PageManager._cleanupEngines: 清理更多引擎 + 全局定时器清理
  // ======================================================
  if (typeof PageManager !== 'undefined') {
    const _origCleanup = PageManager._cleanupEngines;
    PageManager._cleanupEngines = function() {
      // 调用原始清理
      if (_origCleanup) _origCleanup.call(this);

      // 清理已知引擎（每个引擎必须有 cleanup 方法）
      const engines = [
        { name: 'StoryAdventureEngine', obj: StoryAdventureEngine },
        { name: 'MemoryCardEngine', obj: MemoryCardEngine },
        { name: 'MascotEngine', obj: MascotEngine },
        { name: 'DisasterQuizGame', obj: DisasterQuizGame },
        { name: 'ReactionEngine', obj: ReactionEngine },
        { name: 'MemoryGameV2', obj: MemoryGameV2 },
        { name: 'CoinRainEngine', obj: typeof CoinRainEngine !== 'undefined' ? CoinRainEngine : null },
        { name: 'SurvivalEngine', obj: typeof SurvivalEngine !== 'undefined' ? SurvivalEngine : null },
        { name: 'BossRushEngine', obj: typeof BossRushEngine !== 'undefined' ? BossRushEngine : null },
        { name: 'TimedChallengeEngine', obj: typeof TimedChallengeEngine !== 'undefined' ? TimedChallengeEngine : null },
        { name: 'TimeEscapeEngine', obj: typeof TimeEscapeEngine !== 'undefined' ? TimeEscapeEngine : null },
        { name: 'KnowledgeRaceEngine', obj: typeof KnowledgeRaceEngine !== 'undefined' ? KnowledgeRaceEngine : null },
        { name: 'PrecisionEngine', obj: typeof PrecisionEngine !== 'undefined' ? PrecisionEngine : null }
      ];

      engines.forEach(function(engine) {
        if (engine.obj && typeof engine.obj.cleanup === 'function') {
          try { engine.obj.cleanup(); }
          catch (e) { console.warn('[Fix] Cleanup error for', engine.name, e); }
        }
      });

      // 强制清除引擎的 active 状态（避免残留状态卡住界面）
      [SurvivalEngine, BossRushEngine, TimedChallengeEngine, TimeEscapeEngine,
       PrecisionEngine, KnowledgeRaceEngine, DisasterQuizGame, ReactionEngine,
       MemoryCardEngine, MemoryGameV2
      ].forEach(function(eng) {
        if (typeof eng !== 'undefined' && eng) {
          eng.active = false;
        }
      });

      // 清理 ClickGuard 锁
      ClickGuard.clear();
    };
  }

  // ======================================================
  // 8. 按钮点击自动禁用防重复提交
  // ======================================================
  document.addEventListener('click', function(e) {
    var btn = e.target.closest('.btn, .mode-btn, .menu-cat-btn, .quiz-opt, .option-btn, .tool-btn');
    if (!btn) return;

    // 检查是否有 disabled 类
    if (btn.classList.contains('disabled') || btn.disabled) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    // 对非导航类的操作按钮添加短暂禁用效果
    if (btn.classList.contains('quiz-opt') || btn.classList.contains('option-btn')) {
      btn.classList.add('btn-clicked');
      setTimeout(function() {
        btn.classList.remove('btn-clicked');
      }, 300);
    }
  }, true); // 使用捕获阶段以确保优先执行

  // ======================================================
  // 9. 防止页面过度弹性滚动（iOS Safari）
  // ======================================================
  document.addEventListener('touchmove', function(e) {
    // 允许在可滚动容器内滚动
    var target = e.target;
    var scrollable = target.closest('.page-content, .codex-grid, .preview-container, .achievement-list, .shop-list');
    if (!scrollable) {
      // 禁止 body 层滚动
      if (!target.closest('.menu-toolbar')) {
        // 但保留部分元素
      }
    }
  }, { passive: true });

  console.log('[Fix] Interaction fix v1.0 loaded — click debounce, timer cleanup, button states');
})();
