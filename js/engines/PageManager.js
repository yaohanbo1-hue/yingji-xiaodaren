/**
 * ============================================================================
 * PageManager - Fixed Version
 * ============================================================================
 * 修复：AudioManager/Modal/VisualFX 等依赖未定义时导致的页面切换失败
 * ============================================================================
 */

const PageManager = {
  _currentPage: "menu",
  
  navigate(pageId) {
    try {
      // 安全调用 Modal.hide()
      if (typeof Modal !== 'undefined' && Modal.hide) {
        Modal.hide();
      }
      
      // 安全调用 AudioManager.play()
      if (typeof AudioManager !== 'undefined' && AudioManager.play) {
        try { AudioManager.play("whoosh"); } catch(e) {}
      }
      
      // VisualFX 转场效果
      if (typeof VisualFX !== 'undefined' && VisualFX.diagonalTransition) {
        return void VisualFX.diagonalTransition(() => {
          this._doSwitch(pageId);
        });
      }
      
      // 普通转场
      if (typeof TransitionEngine !== 'undefined' && TransitionEngine.flash) {
        try { TransitionEngine.flash(150); } catch(e) {}
      }
      
      this._doSwitch(pageId);
      
    } catch (e) {
      console.error('PageManager.navigate error:', e);
      // 即使出错，也尝试切换页面
      this._doSwitch(pageId);
    }
  },
  
  _doSwitch(pageId) {
    // 切换页面 active 状态
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    const target = document.getElementById(`page-${pageId}`);
    if (target) {
      target.classList.add("active");
    }
    this._currentPage = pageId;
    this._refreshPage(pageId);
  },
  
  _refreshPage(pageId) {
    // 工具栏显示控制
    var toolbar = document.querySelector(".menu-toolbar");
    if (toolbar) {
      var showToolbarPages = [
        "menu", "codex", "achievements", "stats", "leaderboard", "character", 
        "shop", "settings", "pet", "guide", "diary", "museum", "firstaid", 
        "workshop", "gacha", "music", "eggs", "base", "knowledge-race", 
        "reaction", "memory-card", "campaign", "story-adventure", "supplydrop", 
        "precision", "time-escape", "study", "story"
      ];
      toolbar.style.display = showToolbarPages.indexOf(pageId) >= 0 ? "flex" : "none";
      
      var toolbarBtns = document.querySelectorAll(".menu-toolbar .tool-btn");
      toolbarBtns.forEach(btn => btn.classList.remove("active"));
      var activeBtn = document.querySelector('.menu-toolbar .tool-btn[data-nav="' + pageId + '"]');
      if (activeBtn) activeBtn.classList.add("active");
    }
    
    // app 指针事件控制
    var app = document.getElementById("app");
    var noPointerPages = ["battle", "quiz", "free", "speed", "pk", "survival", "bossrush", "daily", "timed", "disasterquiz", "kit"];
    if (app) {
      app.style.pointerEvents = noPointerPages.indexOf(pageId) >= 0 ? "none" : "";
    }
    
    // BGM 切换
    if (typeof BGMEngine !== 'undefined') {
      try {
        if (pageId === "menu") {
          BGMEngine.playMenuBgm();
        } else if (pageId === "encyclopedia" || pageId === "scenario") {
          BGMEngine.playScenarioBgm();
        }
      } catch(e) {}
    }
    
    // 页面特定初始化
    if (pageId === "firstaid" && typeof FirstAidEngine !== 'undefined' && FirstAidEngine.render) {
      try { FirstAidEngine.render(); } catch(e) {}
    }
    if (pageId === "story" && typeof StoryEngine !== 'undefined' && StoryEngine._renderChapterSelect) {
      try { StoryEngine._renderChapterSelect(); } catch(e) {}
    }
    if (pageId === "time-escape" && typeof TimeEscapeEngine !== 'undefined' && TimeEscapeEngine.init) {
      try { TimeEscapeEngine.init(); } catch(e) {}
    }
  }
};

// 保持全局兼容
window.PageManager = PageManager;
