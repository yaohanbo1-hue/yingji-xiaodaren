/**
 * ============================================================================
 * game.js - Refactored Entry Point
 * ============================================================================
 * Loads all core utilities and engine modules in dependency order.
 * ============================================================================
 */

// Core utilities (load first)
// utils.js - DOMUtils, StorageUtils, AnimationUtils, ErrorHandler, GameUtils
// game-core.js - SafeStorage, GameRegistry, global error handlers

// Engine modules are loaded via separate script tags in index.html
// See: js/engines/ directory

// Post-initialization hook
window.addEventListener('DOMContentLoaded', () => {
  console.log('Game engines loaded:', GameRegistry.list().length);
  const health = GameRegistry.healthCheck();
  if (!health.ok) {
    console.warn('Missing critical modules:', health.missing.join(', '));
  }
});
