/**
 * ============================================================================
 * game-core.js — 游戏核心模块
 * ============================================================================
 */

// SafeStorage — 安全的 localStorage 封装
const SafeStorage = {
  _prefix: 'yj_',
  get: function(key, def) {
    try {
      var val = JSON.parse(localStorage.getItem(this._prefix + key));
      return val !== null ? val : def;
    } catch(e) { return def; }
  },
  set: function(key, val) {
    try { localStorage.setItem(this._prefix + key, JSON.stringify(val)); } catch(e) {}
  },
  remove: function(key) {
    try { localStorage.removeItem(this._prefix + key); } catch(e) {}
  }
};

// GameRegistry — 模块注册和健康检查
const GameRegistry = {
  _modules: {},
  register: function(name, module) {
    this._modules[name] = module;
  },
  get: function(name) {
    return this._modules[name];
  },
  list: function() {
    return Object.keys(this._modules);
  },
  healthCheck: function() {
    var expected = ['GameState', 'PageManager', 'QuizEngine', 'ScenarioEngine', 'StudyEngine',
      'BlindBoxEngine', 'CheckinEngine', 'BattleEngine', 'SurvivalEngine', 'BossRushEngine',
      'TimedChallengeEngine', 'StoryEngine', 'AchievementEngine', 'CodexEngine', 'Modal',
      'MenuManager', 'AudioManager'];
    var missing = [];
    expected.forEach(function(m) {
      if (typeof window[m] === 'undefined') missing.push(m);
    });
    return { ok: missing.length === 0, missing: missing };
  }
};

// 全局错误处理
window.addEventListener('error', function(e) {
  console.warn('[Core] Error:', e.message);
});
window.addEventListener('unhandledrejection', function(e) {
  console.warn('[Core] Unhandled:', e.reason);
});
