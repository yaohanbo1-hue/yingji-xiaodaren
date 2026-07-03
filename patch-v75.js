/**
 * ============================================================================
 * patch-v75.js — v75 紧急补丁：补全缺失引擎和方法
 * ============================================================================
 */
(function() {
  'use strict';

  function _escapeHtml(s) {
    if (!s || typeof s !== 'string') return '';
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#x27;');
  }

  function applyPatches() {
    // 1. 补全 KitEngine 缺失方法
    if (typeof KitEngine !== 'undefined') {
      if (!KitEngine.quit) {
        KitEngine.quit = function() {
          if (this.clearTimer && typeof this.clearTimer === 'function') this.clearTimer();
          this.active = false;
          if (typeof PageManager !== 'undefined') PageManager.navigate('campaign');
        };
      }
      if (!KitEngine.confirm) {
        KitEngine.confirm = function() {
          if (this.finish && typeof this.finish === 'function') this.finish();
        };
      }
    }

    // 2. GameState.save 防抖
    if (typeof GameState !== 'undefined' && GameState.save) {
      var _origSave = GameState.save.bind(GameState);
      var _saveTimer = null;
      GameState.save = function() {
        var self = this, args = arguments;
        clearTimeout(_saveTimer);
        _saveTimer = setTimeout(function() { _origSave.apply(self, args); }, 300);
      };
    }

    // 3. VisualFX 补丁
    if (typeof VisualFX !== 'undefined' && VisualFX.startBattleParticles) {
      var _origVfx = VisualFX.startBattleParticles.bind(VisualFX);
      VisualFX.startBattleParticles = function() {
        this._vfxResizeHandler = null;
        return _origVfx.apply(this, arguments);
      };
    }

    // 4. AudioManager context 恢复
    if (typeof AudioManager !== 'undefined' && AudioManager._getCtx) {
      var _origCtx = AudioManager._getCtx.bind(AudioManager);
      AudioManager._getCtx = function() {
        var ctx = _origCtx.apply(this, arguments);
        if (ctx && ctx.state === 'suspended') {
          try { ctx.resume(); } catch(e) {}
        }
        return ctx;
      };
    }

    // 5. PKEngine XSS 防护
    if (typeof PKEngine !== 'undefined' && PKEngine.endGame) {
      var _origEndGame = PKEngine.endGame.bind(PKEngine);
      PKEngine.endGame = function() {
        var p1 = _escapeHtml(String(this.p1Name || '玩家1'));
        var p2 = _escapeHtml(String(this.p2Name || '玩家2'));
        var resultEl = document.getElementById('pkResultPlayers');
        if (resultEl) {
          resultEl.innerHTML = '<div class="stat-label">' + p1 + '</div><div class="stat-label">' + p2 + '</div>';
        }
        return _origEndGame.apply(this, arguments);
      };
    }

    // 6. AITutor XSS 防护
    if (typeof AITutor !== 'undefined' && AITutor._showBubble) {
      var _origBubble = AITutor._showBubble.bind(AITutor);
      AITutor._showBubble = function(text) {
        var safeText = _escapeHtml(String(text || '')).replace(/\n/g, '<br>');
        return _origBubble.call(this, safeText);
      };
    }

    // 7. 全局 HTML 转义函数
    if (!window._escapeHtml) {
      window._escapeHtml = _escapeHtml;
    }

    // 8. 触摸反馈样式
    var style = document.createElement('style');
    style.textContent = '.btn, .mode-btn, .tool-btn, .quiz-opt { transition: transform 0.15s ease, box-shadow 0.15s ease; } .btn:active, .mode-btn:active, .tool-btn:active, .quiz-opt:active { transform: scale(0.96); }';
    document.head.appendChild(style);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyPatches);
  } else {
    setTimeout(applyPatches, 500);
  }
})();
