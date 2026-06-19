/**
 * ============================================================================
 * game.js - Game Core Entry Point (Refactored)
 * ============================================================================
 * This file serves as the central hub for loading all game modules.
 * It initializes the core systems and provides the SafeStorage monkey-patch.
 *
 * Version: 1.2.0-refactored
 * Date: 2026-06-19
 * ============================================================================
 */

// ============================================================================
// SafeStorage monkey-patch - protects localStorage from quota errors
// ============================================================================
try {
  const _origSetItem = localStorage.setItem;
  const _origGetItem = localStorage.getItem;
  const _origRemoveItem = localStorage.removeItem;

  localStorage.setItem = function(key, value) {
    try {
      return _origSetItem.call(localStorage, key, value);
    } catch (e) {
      console.error('Storage setItem error:', e);
    }
  };

  localStorage.getItem = function(key) {
    try {
      return _origGetItem.call(localStorage, key);
    } catch (e) {
      return null;
    }
  };

  localStorage.removeItem = function(key) {
    try {
      return _origRemoveItem.call(localStorage, key);
    } catch (e) {
      return null;
    }
  };
} catch (e) {
  console.error('SafeStorage initialization failed:', e);
}

// ============================================================================
// Module Registry - Tracks all loaded engines for debugging and introspection
// ============================================================================
const GameRegistry = {
  modules: new Map(),

  register(name, module) {
    this.modules.set(name, module);
    return module;
  },

  get(name) {
    return this.modules.get(name);
  },

  list() {
    return Array.from(this.modules.keys());
  },

  healthCheck() {
    const missing = [];
    const expected = [
      'Modal', 'PageManager', 'AudioManager', 'ThemeEngine', 'GameState',
      'BattleEngine', 'QuizEngine', 'StudyEngine', 'ScenarioEngine',
      'BlindBoxEngine', 'CheckinEngine', 'StatsEngine', 'AchievementEngine'
    ];
    for (const name of expected) {
      if (!this.modules.has(name)) {
        missing.push(name);
      }
    }
    return { ok: missing.length === 0, missing };
  }
};

// ============================================================================
// Global error handler for uncaught errors
// ============================================================================
window.addEventListener('error', (e) => {
  console.error('Global error:', e.message, 'at', e.filename, ':', e.lineno);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason);
});
