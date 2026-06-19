/**
 * ===========================================================================
 * 应急小达人 v1.2.0 — 新手引导增强引擎（修复版）
 * ===========================================================================
 * 
 * 修复：
 * 1. 添加 restart() 方法 — 点击引导按钮可强制重新开始
 * 2. 覆盖 GuideEngine — 确保引导按钮调用增强版
 * 3. 步骤更准确 — 使用实际存在的 DOM 选择器
 * 4. 展开菜单后再定位 — 避免找不到目标元素
 * 
 * @version 1.2.1
 * ===========================================================================
 */

const GuideEnhancer = {
  _storageKey: 'disaster_hq_guide_completed',
  _currentStep: 0,
  _overlay: null,
  _tooltip: null,
  _isRunning: false,
  
  // 引导步骤定义（修复选择器）
  _steps: [
    {
      title: '👋 欢迎来到应急小达人！',
      desc: '这里是你的防灾学习基地。接下来我会带你快速了解所有功能。',
      target: null,
      position: 'center',
      action: null
    },
    {
      title: '📚 学习中心',
      desc: '点击"学习中心"展开学习模块，包括开盲盒、每日签到等。',
      target: '#catBtnLearn',
      position: 'bottom',
      action: function() {
        GuideEnhancer._expandMenu('learn');
      }
    },
    {
      title: '🎁 开盲盒',
      desc: '每天免费开盲盒，收集369张防灾知识卡牌！点击即可开启。',
      target: '.learn-grid .mode-btn:first-child',
      position: 'bottom',
      action: function() {
        GuideEnhancer._expandMenu('learn');
      }
    },
    {
      title: '📅 每日签到',
      desc: '每天打卡学习，连续签到获得额外奖励！',
      target: '.learn-grid .mode-btn:nth-child(2)',
      position: 'bottom',
      action: function() {
        GuideEnhancer._expandMenu('learn');
      }
    },
    {
      title: '⚔️ 闯关挑战',
      desc: '32种游戏模式！大擂台、速答、双人PK、生存模式等。',
      target: '#catBtnBattle',
      position: 'bottom',
      action: function() {
        GuideEnhancer._expandMenu('battle');
      }
    },
    {
      title: '🏅 认证与模拟',
      desc: '获取能力认证证书，体验灾害模拟和真实案例还原。',
      target: null,
      position: 'center',
      action: null
    },
    {
      title: '📕 底部工具栏',
      desc: '这里可以查看错题本、学习报告、分享成绩和设置。',
      target: '.menu-toolbar',
      position: 'center',
      action: null
    },
    {
      title: '🎉 引导完成！',
      desc: '你已经掌握了所有基本操作。现在就开始你的防灾学习之旅吧！\n\n💡 随时可以点击"新手引导"重新查看。',
      target: null,
      position: 'center',
      action: null
    }
  ],
  
  _expandMenu(category) {
    var MenuMgr = window.MenuManager;
    if (!MenuMgr) return;
    // 优先使用 _expandSection（直接展开，不切换）
    if (typeof MenuMgr._expandSection === 'function') {
      MenuMgr._expandSection(category);
      return;
    }
    // 降级：直接操作 DOM
    var sections = document.querySelectorAll('.menu-section');
    var btnLearn = document.getElementById('catBtnLearn');
    var btnBattle = document.getElementById('catBtnBattle');
    if (category === 'learn') {
      if (sections[0]) {
        sections[0].classList.add('expanded');
        sections[0].style.display = '';
        var grid = sections[0].querySelector('.menu-grid');
        if (grid) { grid.style.display = ''; grid.style.opacity = '1'; grid.style.maxHeight = 'none'; }
      }
      if (btnLearn) btnLearn.classList.add('active');
      if (sections[1]) { sections[1].style.display = 'none'; sections[1].classList.remove('expanded'); }
      if (btnBattle) btnBattle.classList.remove('active');
    } else if (category === 'battle') {
      if (sections[0]) { sections[0].style.display = 'none'; sections[0].classList.remove('expanded'); }
      if (btnLearn) btnLearn.classList.remove('active');
      if (sections[1]) {
        sections[1].classList.add('expanded');
        sections[1].style.display = '';
        var grid = sections[1].querySelector('.menu-grid');
        if (grid) { grid.style.display = ''; grid.style.opacity = '1'; grid.style.maxHeight = 'none'; }
      }
      if (btnBattle) btnBattle.classList.add('active');
    }
  },
  
  _checkTarget(step) {
    if (!step.target) return true;
    var el = document.querySelector(step.target);
    if (!el) return false;
    var rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  },

  init() {
    // 首次进入自动触发
    try {
      if (!localStorage.getItem(this._storageKey)) {
        setTimeout(() => this.start(), 1500);
      }
    } catch(e) {
      setTimeout(() => this.start(), 1500);
    }
  },
  
  // 重新开始引导（点击引导按钮时调用）
  restart() {
    if (this._isRunning) {
      // 已经在运行，跳到下一步
      this.next();
      return;
    }
    try { localStorage.removeItem(this._storageKey); } catch(e) { console.error(e); }
    this.start();
  },
  
  forceRestart() {
    this._clearUI();
    this._isRunning = false;
    try { localStorage.removeItem(this._storageKey); } catch(e) { console.error(e); }
    this.start();
  },
  
  start() {
    if (this._isRunning) return;
    this._isRunning = true;
    this._currentStep = 0;
    try { localStorage.setItem(this._storageKey, '1'); } catch(e) { console.error(e); }
    
    // 绑定键盘和resize事件
    this._boundKeydown = function(e) {
      if (!GuideEnhancer._isRunning) return;
      switch(e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case 'Enter':
          e.preventDefault();
          GuideEnhancer.next();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          GuideEnhancer.prev();
          break;
        case 'Escape':
          e.preventDefault();
          GuideEnhancer.skip();
          break;
      }
    };
    this._boundResize = function() {
      if (!GuideEnhancer._isRunning || !GuideEnhancer._tooltip) return;
      var step = GuideEnhancer._steps[GuideEnhancer._currentStep];
      if (step.target && step.position !== 'center') {
        var target = document.querySelector(step.target);
        if (target) {
          GuideEnhancer._positionTooltip(target, step.position);
        }
      }
    };
    document.addEventListener('keydown', this._boundKeydown);
    window.addEventListener('resize', this._boundResize);
    
    // 确保学习中心展开，让后续步骤能定位到 .learn-grid 内的元素
    this._expandMenu('learn');
    
    // 确保在主菜单
    if (typeof PageManager !== 'undefined') {
      PageManager.navigate('menu');
    }
    
    // 等待页面切换完成
    setTimeout(() => {
      this._showStep();
    }, 600);
  },
  
  _showStep() {
    try {
      if (this._currentStep >= this._steps.length) {
        this.complete();
        return;
      }
      
      var step = this._steps[this._currentStep];
      
      // 清除之前的UI
      this._clearUI();
      
      // 执行步骤动作（如展开菜单）
      if (step.action) {
        step.action();
      }
      
      // 等待DOM更新后渲染
      setTimeout(() => {
        // 如果目标元素不存在，尝试展开对应的菜单再检查一次
        if (step.target && !this._checkTarget(step)) {
          var targetSel = step.target;
          if (targetSel.indexOf('learn-grid') >= 0 || targetSel === '#catBtnLearn') {
            this._expandMenu('learn');
          } else if (targetSel.indexOf('battle-grid') >= 0 || targetSel === '#catBtnBattle') {
            this._expandMenu('battle');
          }
          // 再次延迟渲染，等待菜单展开动画
          setTimeout(() => this._renderStep(step), 300);
        } else {
          this._renderStep(step);
        }
      }, step.action ? 400 : 50);
    } catch (e) {
      console.error('GuideEnhancer._showStep error:', e);
      setTimeout(() => this.next(), 100);
    }
  },
  
  _renderStep(step) {
    try {
      // 创建遮罩层
      this._overlay = document.createElement('div');
      this._overlay.className = 'guide-overlay';
      // 不拦截点击 — 让用户可以正常操作
      this._overlay.style.pointerEvents = 'none';
      document.body.appendChild(this._overlay);
      
      // 高亮目标元素
      if (step.target) {
        var target = document.querySelector(step.target);
        if (target) {
          var computedStyle = window.getComputedStyle(target);
          var pos = computedStyle.position;
          // 已定位元素（fixed/absolute/sticky）不改变 position，直接加样式
          if (pos === 'fixed' || pos === 'absolute' || pos === 'sticky') {
            target.classList.add('guide-highlight-positioned');
          } else {
            target.classList.add('guide-highlight');
          }
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      
      // 创建提示气泡
      this._tooltip = document.createElement('div');
      this._tooltip.className = 'guide-tooltip guide-tooltip-' + step.position;
      
      var isLast = this._currentStep === this._steps.length - 1;
      var isFirst = this._currentStep === 0;
      
      this._tooltip.innerHTML = 
        '<div class="guide-tooltip-title">' + step.title + '</div>' +
        '<div class="guide-tooltip-desc">' + step.desc + '</div>' +
        '<div class="guide-tooltip-footer">' +
          '<span class="guide-tooltip-progress">' + (this._currentStep + 1) + ' / ' + this._steps.length + '</span>' +
          '<div class="guide-tooltip-btns">' +
            (!isFirst ? '<button class="guide-btn guide-btn-skip" onclick="GuideEnhancer.prev()">← 上一步</button>' : '') +
            (!isLast ? '<button class="guide-btn guide-btn-skip" onclick="GuideEnhancer.skip()">跳过</button>' : '') +
            '<button class="guide-btn guide-btn-next" onclick="GuideEnhancer.next()">' +
              (isLast ? '🚀 开始学习' : '下一步 →') +
            '</button>' +
          '</div>' +
        '</div>';
      document.body.appendChild(this._tooltip);
      
      // 定位提示气泡
      if (step.target && step.position !== 'center') {
        var target = document.querySelector(step.target);
        if (target) {
          this._positionTooltip(target, step.position);
        } else {
          // 目标不存在，居中显示
          this._tooltip.className = 'guide-tooltip guide-tooltip-center';
        }
      }
    } catch (e) {
      console.error('GuideEnhancer._renderStep error:', e);
      // 出错时居中显示，确保用户至少能看到引导
      if (this._tooltip) this._tooltip.remove();
      this._tooltip = document.createElement('div');
      this._tooltip.className = 'guide-tooltip guide-tooltip-center';
      this._tooltip.innerHTML = 
        '<div class="guide-tooltip-title">引导提示</div>' +
        '<div class="guide-tooltip-desc">继续下一步？</div>' +
        '<div class="guide-tooltip-footer">' +
          '<span class="guide-tooltip-progress">' + (this._currentStep + 1) + ' / ' + this._steps.length + '</span>' +
          '<div class="guide-tooltip-btns">' +
            '<button class="guide-btn guide-btn-skip" onclick="GuideEnhancer.skip()">跳过</button>' +
            '<button class="guide-btn guide-btn-next" onclick="GuideEnhancer.next()">下一步 →</button>' +
          '</div>' +
        '</div>';
      document.body.appendChild(this._tooltip);
    }
  },
  
  _positionTooltip(target, position) {
    var rect = target.getBoundingClientRect();
    
    // 如果目标元素不可见（宽高为0），居中显示
    if (rect.width === 0 || rect.height === 0) {
      this._tooltip.className = 'guide-tooltip guide-tooltip-center';
      return;
    }
    
    var tooltip = this._tooltip;
    
    // 先显示以获取尺寸
    tooltip.style.visibility = 'hidden';
    tooltip.style.display = 'block';
    var tipRect = tooltip.getBoundingClientRect();
    tooltip.style.visibility = '';
    
    var top, left;
    
    switch (position) {
      case 'bottom':
        top = rect.bottom + 15;
        left = rect.left + rect.width / 2 - tipRect.width / 2;
        break;
      case 'top':
        top = rect.top - tipRect.height - 15;
        left = rect.left + rect.width / 2 - tipRect.width / 2;
        break;
      case 'left':
        top = rect.top + rect.height / 2 - tipRect.height / 2;
        left = rect.left - tipRect.width - 15;
        break;
      case 'right':
        top = rect.top + rect.height / 2 - tipRect.height / 2;
        left = rect.right + 15;
        break;
      default:
        this._tooltip.className = 'guide-tooltip guide-tooltip-center';
        return;
    }
    
    if (typeof top === 'number') {
      // 确保不超出屏幕，优先保持在计算位置，如果不合适则尝试反向，都不行则居中
      var fitsAbove = rect.top - tipRect.height - 15 >= 10;
      var fitsBelow = rect.bottom + 15 + tipRect.height <= window.innerHeight - 10;
      
      if (position === 'top' && !fitsAbove) {
        if (fitsBelow) {
          top = rect.bottom + 15;
        } else {
          this._tooltip.className = 'guide-tooltip guide-tooltip-center';
          return;
        }
      } else if (position === 'bottom' && !fitsBelow) {
        if (fitsAbove) {
          top = rect.top - tipRect.height - 15;
        } else {
          this._tooltip.className = 'guide-tooltip guide-tooltip-center';
          return;
        }
      }
      // 所有位置都进行垂直边界保护，防止target在视口边缘时tooltip被截断
      top = Math.max(10, top);
      if (top + tipRect.height > window.innerHeight - 10) {
        top = window.innerHeight - tipRect.height - 10;
      }
      tooltip.style.top = top + 'px';
    }
    if (typeof left === 'number') {
      tooltip.style.left = Math.max(10, Math.min(left, window.innerWidth - tipRect.width - 10)) + 'px';
    }
  },
  
  _clearUI() {
    if (this._overlay) {
      this._overlay.remove();
      this._overlay = null;
    }
    if (this._tooltip) {
      this._tooltip.remove();
      this._tooltip = null;
    }
    // 移除高亮
    document.querySelectorAll('.guide-highlight').forEach(function(el) {
      el.classList.remove('guide-highlight');
    });
    // 移除定位元素的高亮
    document.querySelectorAll('.guide-highlight-positioned').forEach(function(el) {
      el.classList.remove('guide-highlight-positioned');
    });
    // 移除键盘和resize监听
    if (this._boundKeydown) {
      document.removeEventListener('keydown', this._boundKeydown);
      this._boundKeydown = null;
    }
    if (this._boundResize) {
      window.removeEventListener('resize', this._boundResize);
      this._boundResize = null;
    }
  },
  
  next() {
    this._currentStep++;
    this._showStep();
  },
  
  prev() {
    if (this._currentStep > 0) {
      this._currentStep--;
      this._showStep();
    }
  },
  
  skip() {
    this.complete();
  },
  
  complete() {
    this._clearUI();
    this._isRunning = false;
    try { localStorage.setItem(this._storageKey, '1'); } catch(e) { console.error(e); }
    
    // 回到主菜单
    if (typeof PageManager !== 'undefined') {
      PageManager.navigate('menu');
    }
  },
  
  // 重置引导
  reset() {
    try { localStorage.removeItem(this._storageKey); } catch(e) { console.error(e); }
  }
};

// 立即挂载到全局，确保页面按钮可以直接调用
window.GuideEnhancer = GuideEnhancer;

// 自动初始化
document.addEventListener('DOMContentLoaded', function() {
  // 首次进入自动触发
  setTimeout(function() {
    GuideEnhancer.init();
  }, 2000);
  
  // 覆盖 GuideEngine，确保引导按钮调用增强版
  // 延迟覆盖，等 game.js 加载完
  setTimeout(function() {
    if (typeof GuideEngine !== 'undefined') {
      // 保存原始方法
      var originalInit = GuideEngine.init;
      // 覆盖 init 为增强版的 restart
      GuideEngine.init = function() {
        GuideEnhancer.restart();
      };
    }
    
    // 同时挂载 GuideEnhancer 到全局
    window.GuideEnhancer = GuideEnhancer;
  }, 1000);
});
