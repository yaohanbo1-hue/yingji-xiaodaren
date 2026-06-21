/**
 * ============================================================================
 * Engine Cleanup Tool — 定时器泄漏防护
 * ============================================================================
 * 
 * 自动清理所有游戏引擎的 setInterval/setTimeout，防止内存泄漏。
 * 在 PageManager 切换页面时调用。
 * 
 * @version 1.0
 * ============================================================================
 */

const EngineCleanup = {
  // 已知的定时器字段名
  _timerFields: ['timerInterval', 'timer', '_timer', 'targetTimeout', 'interval', '_interval', 'animFrame', '_animFrame'],

  // 清理单个引擎
  clean(engine) {
    if (!engine || typeof engine !== 'object') return;
    
    this._timerFields.forEach(function(field) {
      if (engine[field]) {
        clearInterval(engine[field]);
        clearTimeout(engine[field]);
        engine[field] = null;
      }
    });
    
    // 如果引擎有自定义 destroy 方法，也调用
    if (typeof engine.destroy === 'function') {
      try { engine.destroy(); } catch (e) { /* ignore */ }
    }
  },

  // 清理所有已知引擎
  cleanAll() {
    if (typeof allEngines !== 'undefined' && Array.isArray(allEngines)) {
      allEngines.forEach(function(engine) {
        EngineCleanup.clean(engine);
      });
    }
    
    // 额外清理全局可能泄漏的定时器
    if (typeof QuizEngine !== 'undefined') this.clean(QuizEngine);
    if (typeof PKEngine !== 'undefined') this.clean(PKEngine);
    if (typeof KnowledgeRaceEngine !== 'undefined') this.clean(KnowledgeRaceEngine);
    if (typeof TimeEscapeEngine !== 'undefined') this.clean(TimeEscapeEngine);
    if (typeof TimedChallengeEngine !== 'undefined') this.clean(TimedChallengeEngine);
    if (typeof MemoryCardEngine !== 'undefined') this.clean(MemoryCardEngine);
    if (typeof DisasterQuizGame !== 'undefined') this.clean(DisasterQuizGame);
    if (typeof ReactionGameV2 !== 'undefined') this.clean(ReactionGameV2);
    if (typeof BattleEngine !== 'undefined') this.clean(BattleEngine);
    if (typeof PrecisionEngine !== 'undefined') this.clean(PrecisionEngine);
    if (typeof StoryChallengeEngine !== 'undefined') this.clean(StoryChallengeEngine);
    if (typeof StoryAdventureEngine !== 'undefined') this.clean(StoryAdventureEngine);
    if (typeof MiniGameEngine !== 'undefined') this.clean(MiniGameEngine);
    if (typeof SurvivalEngine !== 'undefined') this.clean(SurvivalEngine);
    if (typeof BossRushEngine !== 'undefined') this.clean(BossRushEngine);
  }
};

window.EngineCleanup = EngineCleanup;

// 自动监听：页面切换前清理所有引擎定时器
window.addEventListener('beforeunload', function() {
  EngineCleanup.cleanAll();
});

// 如果 PageManager 存在，hook 其 navigate 方法自动清理
if (typeof PageManager !== 'undefined' && typeof PageManager.navigate === 'function') {
  var _origNavigate = PageManager.navigate.bind(PageManager);
  PageManager.navigate = function(page) {
    EngineCleanup.cleanAll();
    return _origNavigate(page);
  };
}
