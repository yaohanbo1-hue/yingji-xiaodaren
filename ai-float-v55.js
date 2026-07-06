/**
 * ============================================================================
 * ai-float-v55.js — AI 悬浮球+对话面板
 * 右下角常驻按钮，点击弹出 AI 导师对话面板
 * ============================================================================
 */
(function() {
  'use strict';

  // 等待 DOM 就绪后创建（不依赖 AITutor，按钮直接可用）
  function init() {
    // 创建按钮
    const fab = document.createElement('button');
    fab.className = 'ai-fab';
    fab.id = 'aiFab';
    fab.setAttribute('aria-label', 'AI 防灾导师');
    fab.innerHTML = '🤖<span class="ai-fab-badge"></span>';
    document.body.appendChild(fab);

    // 创建面板
    const panel = document.createElement('div');
    panel.className = 'ai-float-panel';
    panel.id = 'aiFloatPanel';
    panel.style.display = 'none';
    panel.innerHTML = '<div class="ai-float-header"><div class="ai-float-title"><span class="ai-float-avatar">🤖</span><div><div class="ai-float-name">AI 防灾导师</div><div class="ai-float-status">DeepSeek 驱动</div></div></div><button class="ai-float-close" id="aiFloatClose" aria-label="关闭">✕</button></div><div class="ai-float-body" id="aiFloatBody"><div class="ai-float-welcome">AI 防灾导师已就绪！<br><br>💡 你可以问：<br>• "地震来了怎么办？"<br>• "推荐我练习什么？"<br>• "洪水时如何自救？"<br>• "讲个防灾冷知识"</div></div><div class="ai-float-footer"><button class="ai-float-btn" id="aiFloatOpenBtn">🤖 打开 AI 导师</button></div>';
    document.body.appendChild(panel);

    // 面板样式（防丢失）
    panel.style.cssText = 'position:fixed !important;bottom:calc(100px + env(safe-area-inset-bottom,0px)) !important;right:20px !important;width:360px !important;max-height:520px !important;z-index:10000 !important;background:rgba(15,23,42,0.97) !important;border:1px solid rgba(255,255,255,0.08) !important;border-radius:20px !important;backdrop-filter:blur(24px) !important;-webkit-backdrop-filter:blur(24px) !important;box-shadow:0 8px 40px rgba(0,0,0,0.5) !important;overflow:hidden !important;display:none;flex-direction:column !important;';

    // 点击按钮切换面板
    fab.addEventListener('click', function(e) {
      if (panel.style.display !== 'none') {
        panel.style.display = 'none';
        return;
      }
      panel.style.display = 'flex';
      
      // 自动导航到 AI 导师页面
      if (typeof PageManager !== 'undefined') {
        PageManager.navigate('ai-tutor');
      }
    });

    // 关闭面板
    const closeBtn = document.getElementById('aiFloatClose');
    if (closeBtn) {
      closeBtn.addEventListener('click', function() {
        panel.style.display = 'none';
      });
    }

    // 打开按钮
    const openBtn = document.getElementById('aiFloatOpenBtn');
    if (openBtn) {
      openBtn.addEventListener('click', function() {
        if (typeof PageManager !== 'undefined') {
          PageManager.navigate('ai-tutor');
        }
        panel.style.display = 'none';
      });
    }

    // 点击面板外关闭
    document.addEventListener('click', function(e) {
      if (panel.style.display === 'none') return;
      if (!panel.contains(e.target) && e.target !== fab && !fab.contains(e.target)) {
        panel.style.display = 'none';
      }
    });

    // 暴露接口
    window.AIFloatUI = {
      show: function() { panel.style.display = 'flex'; },
      hide: function() { panel.style.display = 'none'; },
      toggle: function() { panel.style.display = panel.style.display === 'none' ? 'flex' : 'none'; }
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
