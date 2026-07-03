/**
 * ============================================================================
 * ai-float-v55.js — AI 浮动助手增强模块（stub）
 * ============================================================================
 */
(function() {
  if (typeof AITutor === 'undefined') return;
  
  // AI 浮动助手 - 在游戏界面显示 AI 建议气泡
  const AIFloat = {
    active: false,
    _container: null,
    _interval: null,
    
    init: function() {
      if (this.active) return;
      this.active = true;
      this._createUI();
    },
    
    _createUI: function() {
      if (this._container) return;
      this._container = document.createElement('div');
      this._container.id = 'aiFloatContainer';
      this._container.style.cssText = 'position:fixed;bottom:120px;right:16px;z-index:999;display:none;';
      document.body.appendChild(this._container);
    },
    
    show: function(text, type) {
      if (!this._container) this._createUI();
      this._container.innerHTML = '<div class="ai-float-bubble" style="background:rgba(96,165,250,0.15);border:1px solid rgba(96,165,250,0.3);border-radius:16px;padding:12px 16px;max-width:260px;font-size:13px;color:#fff;backdrop-filter:blur(8px);animation:float-up 0.3s ease">' +
        '<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px"><span>🤖</span><span style="font-weight:600;font-size:12px;color:rgba(255,255,255,0.6)">AI 助手</span></div>' +
        '<div>' + text + '</div></div>';
      this._container.style.display = '';
      clearTimeout(this._hideTimer);
      var self = this;
      this._hideTimer = setTimeout(function() {
        if (self._container) self._container.style.display = 'none';
      }, 5000);
    },
    
    hide: function() {
      if (this._container) this._container.style.display = 'none';
    }
  };
  
  window.AIFloat = AIFloat;
  console.log('🤖 AI Float Helper loaded');
})();
