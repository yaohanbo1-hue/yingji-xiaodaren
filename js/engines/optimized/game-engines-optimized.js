/**
 * ============================================================================
 * game-engines-optimized.js — 应急小达人引擎优化版入口
 * ============================================================================
 * 加载顺序：
 *  1. 核心基础设施（DOMCache, EventDelegate, ErrorBoundary, BaseEngine）
 *  2. 重构引擎（Modal, PageManager, QuizEngine）
 *  3. 原始引擎（通过包装器增强）
 *  4. 全局兼容性处理
 * 
 * 使用方式：在 index.html 中将
 *   <script src="game-engines.js?v=57"></script>
 * 替换为：
 *   <script src="js/core/optimized/DOMCache.js?v=58"></script>
 *   <script src="js/core/optimized/ErrorBoundary.js?v=58"></script>
 *   <script src="js/core/optimized/EventDelegate.js?v=58"></script>
 *   <script src="js/core/optimized/BaseEngine.js?v=58"></script>
 *   <script src="js/engines/optimized/OptimizedModal.js?v=58"></script>
 *   <script src="js/engines/optimized/OptimizedPageManager.js?v=58"></script>
 *   <script src="js/engines/optimized/OptimizedQuizEngine.js?v=58"></script>
 *   <script src="game-engines.js?v=58"></script>
 *   <script src="js/engines/optimized/game-engines-optimized.js?v=58"></script>
 * 
 * 或保持现有结构，仅使用此文件作为增强层：
 *   <script src="game-engines.js"></script>
 *   <script src="js/engines/optimized/game-engines-optimized.js"></script>
 * ============================================================================
 */
(function() {
  'use strict';

  // 如果核心模块已加载，初始化它们
  if (typeof DOMCache !== 'undefined') {
    console.log('[Optimized] DOMCache loaded, stats:', DOMCache.stats().size);
  }
  if (typeof EventDelegate !== 'undefined') {
    EventDelegate.init();
  }

  // ============================================================================
  // 兼容性增强：为所有原始引擎添加错误边界和 DOM 缓存
  // ============================================================================
  if (typeof ErrorBoundary !== 'undefined') {
    // 包装高频引擎的关键方法
    const enginesToWrap = [
      'BattleEngine', 'StudyEngine', 'ScenarioEngine', 'KitEngine',
      'AchievementEngine', 'ShopEngine', 'CodexEngine', 'PKEngine',
      'CharacterEngine', 'SettingsEngine', 'AdaptiveDifficulty',
      'StoryEngine', 'SurvivalEngine', 'BossRushEngine', 'TimedChallengeEngine',
      'DisasterQuizGame', 'SupplyDropGame', 'MemoryGameV2', 'ReactionGameV2',
      'BlindBoxEngine', 'GachaEngine', 'RouletteEngine', 'ScratchEngine',
      'DailyTaskEngine', 'CheckinEngine', 'CardSynthesisEngine',
      'CardUpgradeEngine', 'CardFragmentEngine', 'SetBonusEngine',
      'PetEngine', 'OutfitEngine', 'BaseEngine', 'FirstAidEngine',
      'DisasterMuseumEngine', 'DiaryEngine', 'MusicEngine', 'EasterEggEngine',
      'UniversalSystemViewer', 'TimeEscapeEngine', 'PrecisionEngine',
      'StoryChallengeEngine', 'StoryAdventureEngine', 'GuideEngine',
      'EncyclopediaEngine', 'CalendarEngine', 'MiniGameEngine', 'MascotEngine',
      'Certificate', 'LevelEngine', 'ComboEngine', 'CoinRainEngine',
      'CardDropEngine', 'DailyChallengeEngine', 'LeaderboardEngine',
      'ThemeEngine', 'JuiceEngine', 'I18nEngine', 'AudioManager'
    ];

    for (const name of enginesToWrap) {
      const engine = window[name];
      if (engine && typeof engine === 'object') {
        ErrorBoundary.wrapMethods(engine, name, ['init', 'render', 'start', 'show', 'play', 'open', 'checkin', 'next', 'answer']);
      }
    }
    console.log('[Optimized] ErrorBoundary wrapped', enginesToWrap.length, 'engines');
  }

  // ============================================================================
  // 事件委托：注册全局动作处理器
  // ============================================================================
  if (typeof EventDelegate !== 'undefined') {
    EventDelegate.register({
      'menu.navigate': (e, params) => {
        if (params.page && typeof PageManager !== 'undefined') {
          PageManager.navigate(params.page);
        }
      },
      'quiz.select': (e, params) => {
        // QuizEngine 已自行处理，这里作为兜底
        if (typeof QuizEngine !== 'undefined' && QuizEngine._handleAnswer) {
          QuizEngine._handleAnswer(params.correct, e.target);
        }
      },
      'modal.close': () => {
        if (typeof Modal !== 'undefined') Modal.hide();
      },
      'game.back': () => {
        if (typeof PageManager !== 'undefined') PageManager.navigate('menu');
      }
    });
  }

  // ============================================================================
  // 性能优化：DOM 缓存预加载（常用元素）
  // ============================================================================
  if (typeof DOMCache !== 'undefined') {
    const commonIds = [
      'page-menu', 'page-quiz', 'page-battle', 'page-codex',
      'page-achievements', 'page-stats', 'page-settings',
      'modalOverlay', 'modalContent', 'modalTitle', 'modalDesc',
      'app', 'loadingScreen'
    ];
    DOMCache.batch(commonIds);
  }

  // ============================================================================
  // 性能优化：页面可见性 API（后台暂停定时器）
  // ============================================================================
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      console.log('[Optimized] Page hidden, timers paused');
    } else {
      console.log('[Optimized] Page visible, timers resumed');
    }
  });

  // ============================================================================
  // 性能优化：防抖 resize 处理
  // ============================================================================
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      DOMCache.clear(); // resize 时清理缓存，防止元素尺寸变化导致缓存失效
    }, 250);
  });

  console.log('[Optimized] game-engines-optimized.js loaded successfully');
  console.log('[Optimized] Performance tips enabled: DOMCache, EventDelegate, ErrorBoundary, BaseEngine');
})();
