/**
 * ===========================================================================
 * 菜单管理器 — 补全缺失的 MenuManager
 * ===========================================================================
 * 
 * 问题：index.html 中 onclick="MenuManager.toggleCategory('learn')"
 * 但 game.js 中没有定义 MenuManager，导致点击分类按钮报错，菜单无法展开。
 * 
 * 功能：
 * 1. 点击分类按钮展开/折叠对应菜单区
 * 2. 高亮当前选中的分类按钮
 * 3. 平滑动画过渡
 * 
 * ===========================================================================
 */

const MenuManager = {
  _currentCategory: null,
  
  init() {
    // 默认显示分类选择状态（不展开任何模块）
    this.collapseAll();
    console.log('📂 菜单管理器已加载');
  },
  
  toggleCategory(category) {
    if (this._currentCategory === category) {
      // 点击同一个分类 → 折叠回总览
      this.collapseAll();
    } else {
      // 展开指定分类
      this._expandSection(category);
    }
  },
  
  _expandSection(category) {
    var sections = document.querySelectorAll('.menu-section');
    var categoryBtns = document.querySelectorAll('.menu-cat-btn');
    var backBtn = document.getElementById('backToCategories');
    var menuLogo = document.querySelector('.menu-logo');
    var menuStats = document.querySelector('.menu-stats');
    var menuCategoryBtns = document.querySelector('.menu-category-btns');
    
    // 展开分类时：隐藏标题、按钮容器、底部统计，让分类内容全屏展示
    if (menuLogo) {
      menuLogo.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      menuLogo.style.opacity = '0';
      menuLogo.style.transform = 'translateY(-20px)';
      setTimeout(function() { menuLogo.style.display = 'none'; }, 300);
    }
    if (menuCategoryBtns) {
      menuCategoryBtns.style.transition = 'opacity 0.3s ease';
      menuCategoryBtns.style.opacity = '0';
      setTimeout(function() { menuCategoryBtns.style.display = 'none'; }, 300);
    }
    if (menuStats) {
      menuStats.style.transition = 'opacity 0.3s ease';
      menuStats.style.opacity = '0';
      setTimeout(function() { menuStats.style.display = 'none'; }, 300);
    }
    
    sections.forEach(function(section) {
      var grid = section.querySelector('.menu-grid');
      var title = section.querySelector('.menu-section-title');
      
      if (!grid) return;
      
      // 判断这个 section 属于哪个分类
      var isLearn = section.querySelector('.learn-grid') !== null || 
                    (title && title.classList.contains('learn-title'));
      var isBattle = section.querySelector('.battle-grid') !== null ||
                     (title && title.classList.contains('battle-title'));
      
      var shouldShow = (category === 'learn' && isLearn) || 
                       (category === 'battle' && isBattle);
      
      if (shouldShow) {
        // 展开
        section.style.display = '';
        section.classList.remove('collapsed');
        section.classList.add('expanded');
        grid.style.display = '';
        grid.style.maxHeight = grid.scrollHeight + 200 + 'px';
        grid.style.opacity = '1';
        grid.style.overflow = 'visible';
      } else {
        // 折叠
        section.style.display = 'none';
        section.classList.add('collapsed');
        section.classList.remove('expanded');
      }
    });
    
    // 高亮分类按钮（只改 class，不改 style，因为容器已隐藏）
    categoryBtns.forEach(function(btn) {
      var isLearnBtn = btn.classList.contains('learn-btn');
      var isBattleBtn = btn.classList.contains('battle-btn');
      var isActive = (category === 'learn' && isLearnBtn) || 
                     (category === 'battle' && isBattleBtn);
      
      if (isActive) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    
    // 显示"返回分类"按钮
    if (backBtn) {
      backBtn.style.display = 'flex';
    }
    
    this._currentCategory = category;
  },
  
  collapseAll() {
    var sections = document.querySelectorAll('.menu-section');
    var categoryBtns = document.querySelectorAll('.menu-cat-btn');
    var backBtn = document.getElementById('backToCategories');
    var menuLogo = document.querySelector('.menu-logo');
    var menuStats = document.querySelector('.menu-stats');
    var menuCategoryBtns = document.querySelector('.menu-category-btns');
    
    // 恢复显示标题、按钮容器、底部统计（返回主菜单状态）
    if (menuLogo) {
      menuLogo.style.display = '';
      setTimeout(function() {
        menuLogo.style.opacity = '1';
        menuLogo.style.transform = 'translateY(0)';
      }, 10);
    }
    if (menuCategoryBtns) {
      menuCategoryBtns.style.display = '';
      setTimeout(function() {
        menuCategoryBtns.style.opacity = '1';
      }, 10);
    }
    if (menuStats) {
      menuStats.style.display = '';
      setTimeout(function() { menuStats.style.opacity = '1'; }, 10);
    }
    
    // 隐藏所有分区（回到分类选择状态，只显示按钮）
    sections.forEach(function(section) {
      section.style.display = 'none';
      section.classList.add('collapsed');
      section.classList.remove('expanded');
      var grid = section.querySelector('.menu-grid');
      if (grid) {
        grid.style.display = 'none';
        grid.style.maxHeight = '0';
        grid.style.opacity = '0';
        grid.style.overflow = 'hidden';
      }
    });
    
    // 取消高亮
    categoryBtns.forEach(function(btn) {
      btn.classList.remove('active');
      btn.style.transform = '';
      btn.style.boxShadow = '';
    });
    
    // 隐藏"返回分类"按钮
    if (backBtn) {
      backBtn.style.display = 'none';
    }
    
    this._currentCategory = null;
  }
};

// 自动初始化
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
    MenuManager.init();
  }, 300);
});

window.MenuManager = MenuManager;
