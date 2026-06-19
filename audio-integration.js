/**
 * ===========================================================================
 * 应急小达人 v1.2.0 — 音效/BGM 集成桥接
 * ===========================================================================
 * 
 * 将 SFXEngine 和 BGMEngineV2 无缝集成到现有游戏流程中：
 * - 页面切换时自动切换 BGM
 * - 答题时播放音效
 * - UI 交互时播放反馈音
 * - 增强版 BGM 替代旧版步进音序器
 * 
 * @version 1.2.0
 * ===========================================================================
 */

(function() {
  'use strict';
  
  // ===== 1. 页面切换时自动切换 BGM =====
  var originalNavigate = null;
  
  function hookPageManager() {
    if (typeof PageManager === 'undefined') return;
    
    // 保存原始 navigate
    originalNavigate = PageManager.navigate.bind(PageManager);
    
    // 包装 navigate
    PageManager.navigate = function(pageId) {
      // 调用原始导航
      originalNavigate(pageId);
      
      // 播放页面切换音效
      if (typeof SFXEngine !== 'undefined') {
        SFXEngine.init();
        SFXEngine.click();
      }
      
      // 切换 BGM
      if (typeof BGMEngineV2 !== 'undefined') {
        BGMEngineV2.init();
        
        var battlePages = ['battle', 'pk', 'survival', 'bossrush', 'speed', 'daily', 
                          'timed', 'timed-escape', 'knowledge-race', 'reaction',
                          'precision', 'precision-strike', 'time-escape', 'story',
                          'story_mode', 'story-adventure', 'campaign'];
        var scenarioPages = ['scenario', 'disaster-sim', 'real-cases', 'firstaid',
                            'museum', 'knowledge'];
        var menuPages = ['menu', 'codex', 'achievements', 'stats', 'leaderboard',
                        'character', 'encyclopedia', 'calendar', 'minigame', 'shop',
                        'settings', 'pets', 'guide', 'diary', 'synthesis', 'gacha',
                        'music', 'eggs', 'base', 'study', 'ai-tutor', 'certification'];
        
        if (battlePages.indexOf(pageId) >= 0) {
          BGMEngineV2.playBattle();
        } else if (scenarioPages.indexOf(pageId) >= 0) {
          BGMEngineV2.playScenario();
        } else if (menuPages.indexOf(pageId) >= 0) {
          BGMEngineV2.playMenu();
        }
      }
    };
  }
  
  // ===== 2. 答题音效增强 =====
  function hookQuizEngine() {
    // 监听答题结果
    document.addEventListener('click', function(e) {
      var opt = e.target.closest('.quiz-opt, .choice-btn, .scenario-opt');
      if (!opt) return;
      
      // 延迟检查结果（等游戏逻辑处理完）
      setTimeout(function() {
        if (typeof SFXEngine === 'undefined') return;
        
        if (opt.classList.contains('correct')) {
          SFXEngine.correct();
        } else if (opt.classList.contains('wrong')) {
          SFXEngine.wrong();
        }
      }, 100);
    });
  }
  
  // ===== 2.5 按钮点击音效增强（全面覆盖） =====
  function hookButtonClicks() {
    document.addEventListener('click', function(e) {
      var btn = e.target.closest('.mode-btn, .tool-btn, .menu-cat-btn, .btn, .btn-primary, .btn-secondary, .back-float, .settings-card, .placeholder-btn, .shop-item, .character-card, .achievement-item, .codex-card');
      if (!btn) return;
      
      if (typeof SFXEngine === 'undefined') return;
      SFXEngine.init();
      SFXEngine.click();
      
      // 添加涟漪效果
      if (!btn.classList.contains('btn-ripple')) {
        btn.classList.add('btn-ripple');
      }
    });
  }
  
  // ===== 3. UI 交互音效 =====
  function hookUIInteractions() {
    if (typeof SFXEngine === 'undefined') return;
    
    // 模态框打开/关闭
    var modalObserver = new MutationObserver(function(mutations) {
      mutations.forEach(function(m) {
        if (m.attributeName !== 'class') return;
        var overlay = document.getElementById('modalOverlay');
        if (!overlay) return;
        
        SFXEngine.init();
        if (overlay.classList.contains('active')) {
          SFXEngine.modalOpen();
        } else {
          SFXEngine.modalClose();
        }
      });
    });
    
    var overlay = document.getElementById('modalOverlay');
    if (overlay) {
      modalObserver.observe(overlay, { attributes: true, attributeFilter: ['class'] });
    }
    
    // 按钮 hover 音效（仅桌面端）
    if (!('ontouchstart' in window)) {
      document.addEventListener('mouseover', function(e) {
        var btn = e.target.closest('.mode-btn, .menu-cat-btn, .tool-btn');
        if (btn && typeof SFXEngine !== 'undefined') {
          SFXEngine.hover();
        }
      });
    }
  }
  
  // ===== 4. 连击音效 =====
  function hookComboSystem() {
    document.addEventListener('click', function(e) {
      var opt = e.target.closest('.quiz-opt');
      if (!opt || !opt.classList.contains('correct')) return;
      
      if (typeof SFXEngine === 'undefined') return;
      
      // 检测连击
      var streakEl = document.getElementById('battleStreak') || 
                     document.querySelector('.streak-display');
      if (streakEl) {
        var match = streakEl.textContent.match(/(\d+)/);
        if (match) {
          var combo = parseInt(match[1]);
          if (combo >= 3) {
            SFXEngine.combo(combo);
          }
        }
      }
    });
  }
  
  // ===== 5. 胜利/失败音效 =====
  function hookGameEnd() {
    // 监听模态框中的胜利/失败提示
    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(m) {
        if (m.type !== 'childList') return;
        
        var title = document.getElementById('modalTitle');
        if (!title) return;
        
        var text = title.textContent.toLowerCase();
        if (typeof SFXEngine === 'undefined') return;
        
        if (text.indexOf('胜利') >= 0 || text.indexOf('恭喜') >= 0 || 
            text.indexOf('通关') >= 0 || text.indexOf('🎉') >= 0) {
          SFXEngine.victory();
        } else if (text.indexOf('失败') >= 0 || text.indexOf('💀') >= 0 ||
                   text.indexOf('救援失败') >= 0) {
          SFXEngine.gameOver();
        } else if (text.indexOf('升级') >= 0 || text.indexOf('🎊') >= 0) {
          SFXEngine.levelUp();
        } else if (text.indexOf('解锁') >= 0 || text.indexOf('🔓') >= 0) {
          SFXEngine.unlock();
        }
      });
    });
    
    var content = document.getElementById('modalContent');
    if (content) {
      observer.observe(content, { childList: true, subtree: true });
    }
  }
  
  // ===== 6. 金币获得音效 =====
  function hookCoinSound() {
    document.addEventListener('click', function(e) {
      var el = e.target.closest('.coin-float-text, [class*="coin"]');
      if (el && typeof SFXEngine !== 'undefined') {
        SFXEngine.coin();
      }
    });
  }
  
  var _initialized = false;
  
  // ===== 初始化 =====
  function init() {
    // 等待游戏引擎加载
    if (typeof PageManager === 'undefined') {
      setTimeout(init, 100);
      return;
    }
    if (_initialized) return;
    _initialized = true;
    
    hookPageManager();
    hookQuizEngine();
    hookButtonClicks();
    hookUIInteractions();
    hookComboSystem();
    hookGameEnd();
    hookCoinSound();
    
    console.log('🔊 SFX/BGM Integration v1.2.0 loaded');
  }
  
  // DOM 加载后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
})();
