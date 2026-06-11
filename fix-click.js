/**
 * ===========================================================================
 * 点击修复补丁 v2.0 — 彻底解决 #app 拦截问题
 * ===========================================================================
 * 
 * 问题：#app 有 position:relative + z-index:3，创建了层叠上下文。
 * elementsFromPoint 返回 #app 在按钮之上，导致点击被拦截。
 * 
 * 修复：
 * 1. 将 #app 的 pointer-events 设为 none
 * 2. 只让 .page.active 及其子元素接收点击
 * 3. 底部工具栏单独设为 auto
 * 4. 用 MutationObserver 防止 game.js 覆盖
 * 
 * ===========================================================================
 */

(function() {
  'use strict';
  
  function applyFix() {
    var app = document.getElementById('app');
    if (!app) return;
    
    // #app 不接收点击
    app.style.pointerEvents = 'none';
    
    // 所有活跃页面及其子元素接收点击
    var style = document.createElement('style');
    style.id = 'fix-click-patch-v2';
    style.textContent = [
      '#app { pointer-events: none !important; }',
      '.page.active { pointer-events: auto !important; }',
      '.page.active * { pointer-events: auto !important; }',
      '.menu-toolbar { pointer-events: auto !important; }',
      '.menu-toolbar * { pointer-events: auto !important; }',
      '#modalOverlay { pointer-events: auto !important; }',
      '#modalOverlay * { pointer-events: auto !important; }',
      '.guide-overlay { pointer-events: auto !important; }',
      '.guide-overlay * { pointer-events: auto !important; }',
      '.tutorial-overlay { pointer-events: auto !important; }',
      '.tutorial-overlay * { pointer-events: auto !important; }',
      '.share-modal-overlay { pointer-events: auto !important; }',
      '.share-modal-overlay * { pointer-events: auto !important; }',
      '.demo-hint { pointer-events: none !important; }',
      '.menu-mouse-glow { pointer-events: none !important; }',
      '.fx-effects, .fx-effects * { pointer-events: none !important; }',
      '.bg-gradient, #bgCanvas, .bg-noise { pointer-events: none !important; }'
    ].join('\n');
    
    // 移除旧版本
    var old = document.getElementById('fix-click-patch-v2');
    if (old) old.remove();
    
    document.head.appendChild(style);
    
    // MutationObserver 防止 game.js 覆盖 pointerEvents
    var observer = new MutationObserver(function(mutations) {
      for (var i = 0; i < mutations.length; i++) {
        if (mutations[i].attributeName === 'style') {
          if (app.style.pointerEvents !== 'none') {
            app.style.pointerEvents = 'none';
          }
        }
      }
    });
    
    observer.observe(app, {
      attributes: true,
      attributeFilter: ['style']
    });
    
    console.log('🔧 点击修复补丁 v2.0 已加载');
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyFix);
  } else {
    setTimeout(applyFix, 100);
  }
})();
