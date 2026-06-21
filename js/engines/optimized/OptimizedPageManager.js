/**
 * ============================================================================
 * OptimizedPageManager - 页面导航系统（重构版）
 * ============================================================================
 * 优化点：
 *  1. 导航防抖：300ms 内多次导航只执行一次
 *  2. DOM 缓存：缓存页面元素和工具栏
 *  3. 减少重排：批量 classList 操作
 *  4. 错误边界：导航失败不阻断应用
 *  5. 内存管理：页面切换时清理 DOMCache
 * ============================================================================
 */
const OptimizedPageManager = (function() {
  'use strict';

  let _currentPage = 'menu';
  let _navigateTimer = null;
  let _pages = null; // 缓存所有页面元素
  let _toolbar = null;
  let _app = null;

  // 配置常量
  const SHOW_TOOLBAR_PAGES = new Set([
    'menu', 'codex', 'achievements', 'stats', 'leaderboard', 'character',
    'shop', 'settings', 'pet', 'guide', 'diary', 'museum', 'firstaid',
    'workshop', 'gacha', 'music', 'eggs', 'base', 'knowledge-race',
    'reaction', 'memory-card', 'campaign', 'story-adventure', 'supplydrop',
    'precision', 'time-escape', 'study', 'story'
  ]);

  const NO_POINTER_PAGES = new Set([
    'battle', 'quiz', 'free', 'speed', 'pk', 'survival', 'bossrush',
    'daily', 'timed', 'disasterquiz', 'kit'
  ]);

  /** 惰性缓存页面元素 */
  function _cachePages() {
    if (_pages) return;
    _pages = DOMCache.queryAll('.page');
    _toolbar = DOMCache.query('.menu-toolbar');
    _app = DOMCache.get('app');
  }

  /** 导航到指定页面 */
  function navigate(pageId) {
    // 防抖保护
    if (_navigateTimer) return;
    _navigateTimer = setTimeout(() => { _navigateTimer = null; }, 300);

    ErrorBoundary.safeCall(() => {
      // 1. 隐藏弹窗
      if (typeof Modal !== 'undefined') Modal.hide();

      // 2. 播放音效
      try { AudioManager.play('whoosh'); } catch (e) {}

      // 3. 转场动画
      if (typeof VisualFX !== 'undefined' && VisualFX.diagonalTransition) {
        VisualFX.diagonalTransition(() => _doNavigate(pageId));
        return;
      }
      if (typeof TransitionEngine !== 'undefined') {
        TransitionEngine.flash(150);
      }
      _doNavigate(pageId);
    }, 'PageManager.navigate', undefined, pageId);
  }

  /** 执行页面切换 */
  function _doNavigate(pageId) {
    _cachePages();

    // 批量移除 active class（减少重排）
    if (_pages) {
      for (const p of _pages) {
        p.classList.remove('active');
      }
    }

    // 激活目标页面
    const target = DOMCache.get('page-' + pageId);
    if (target) {
      target.classList.add('active');
    } else {
      console.warn(`[PageManager] Page "page-${pageId}" not found`);
    }

    _currentPage = pageId;
    _refreshPage(pageId);

    // 页面切换后清理 DOM 缓存（防止元素过期）
    DOMCache.clear();
    // 重新缓存当前页面相关元素
    _cachePages();
  }

  /** 刷新页面状态（工具栏、BGM 等） */
  function _refreshPage(pageId) {
    // 工具栏显示/隐藏
    if (_toolbar) {
      _toolbar.style.display = SHOW_TOOLBAR_PAGES.has(pageId) ? 'flex' : 'none';
      // 更新工具栏按钮状态
      const btns = _toolbar.querySelectorAll('.tool-btn');
      for (const btn of btns) btn.classList.remove('active');
      const activeBtn = _toolbar.querySelector('.tool-btn[data-nav="' + pageId + '"]');
      if (activeBtn) activeBtn.classList.add('active');
    }

    // 指针事件控制
    if (_app) {
      _app.style.pointerEvents = NO_POINTER_PAGES.has(pageId) ? 'none' : '';
    }

    // BGM 切换
    if (typeof BGMEngine !== 'undefined') {
      if (pageId === 'menu') BGMEngine.playMenuBgm();
      else if (pageId === 'encyclopedia' || pageId === 'scenario') BGMEngine.playScenarioBgm();
    }

    // 页面特定初始化
    if (pageId === 'firstaid' && typeof FirstAidEngine !== 'undefined') {
      const el = DOMCache.get('firstAidContent');
      if (el) el.innerHTML = FirstAidEngine.render ? FirstAidEngine.render() : '';
    }
    if (pageId === 'codex' && typeof CodexEngine !== 'undefined') {
      CodexEngine.render();
    }
    if (pageId === 'achievements' && typeof AchievementEngine !== 'undefined') {
      const el = DOMCache.get('achievementList');
      if (el) el.innerHTML = AchievementEngine.render ? AchievementEngine.render() : '';
    }
  }

  function getCurrentPage() { return _currentPage; }

  return { navigate, getCurrentPage };
})();

// 向后兼容
window.PageManager = OptimizedPageManager;
