/**
 * ===========================================================================
 * 应急小达人 v1.2.0 — 演示模式引擎
 * ===========================================================================
 * 
 * 功能：
 * 1. 按 D 键进入演示模式（自动按顺序展示亮点）
 * 2. 按 → / ← 手动切换亮点页面
 * 3. 按 ESC 退出演示模式
 * 4. 演示提示浮层（告诉评委当前在看什么）
 * 
 * 亮点顺序：
 * 1. 主菜单（展示整体规模）
 * 2. 盲盒开箱（创新性）
 * 3. 灾害模拟（互动性）
 * 4. AI 导师（教育性）
 * 5. 真实案例（科学性）
 * 6. 能力认证（完成度）
 * 
 * @version 1.2.0
 * ===========================================================================
 */

const DemoMode = {
  _active: false,
  _currentIndex: 0,
  _hintEl: null,
  
  _highlights: [
    { page: 'menu', label: '🏠 主菜单 — 32种游戏模式', desc: '学习中心 + 闯关挑战 + 认证模拟' },
    { page: 'blindbox', label: '🎁 盲盒开箱 — 核心创新', desc: '随机抽卡 · 4种稀有度 · 369张知识卡' },
    { page: 'disaster-sim', label: '🎬 灾害模拟 — 沉浸体验', desc: 'Canvas粒子系统 · 真实决策 · 4种灾害' },
    { page: 'ai-tutor', label: '🤖 AI导师 — 智能诊断', desc: '12维雷达图 · 个性化推荐 · 数据驱动' },
    { page: 'real-cases', label: '📖 真实案例 — 科学教育', desc: '8个历史事件 · 权威数据 · 情景还原' },
    { page: 'certification', label: '🏅 能力认证 — 激励体系', desc: '5级认证 · Canvas证书 · 可打印' }
  ],
  
  init() {
    // 监听键盘
    document.addEventListener('keydown', (e) => {
      // D 键切换演示模式
      if (e.key === 'd' || e.key === 'D') {
        // 排除输入框
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        this.toggle();
      }
      
      // 演示模式下：左右箭头切换
      if (this._active) {
        if (e.key === 'ArrowRight' || e.key === ' ') {
          e.preventDefault();
          this.next();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          this.prev();
        } else if (e.key === 'Escape') {
          this.stop();
        }
      }
    });
    
    // 创建提示浮层
    this._createHint();
  },
  
  toggle() {
    if (this._active) {
      this.stop();
    } else {
      this.start();
    }
  },
  
  start() {
    this._active = true;
    this._currentIndex = 0;
    this._hintEl.classList.add('demo-hint-visible');
    this._showHighlight(0);
    
    // 显示提示
    this._showToast('🎬 演示模式已开启\n→ 下一页 | ← 上一页 | ESC 退出');
  },
  
  stop() {
    this._active = false;
    this._hintEl.classList.remove('demo-hint-visible');
    this._showToast('演示模式已关闭');
  },
  
  next() {
    this._currentIndex = (this._currentIndex + 1) % this._highlights.length;
    this._showHighlight(this._currentIndex);
  },
  
  prev() {
    this._currentIndex = (this._currentIndex - 1 + this._highlights.length) % this._highlights.length;
    this._showHighlight(this._currentIndex);
  },
  
  _showHighlight(index) {
    const highlight = this._highlights[index];
    
    // 导航到对应页面
    if (typeof PageManager !== 'undefined') {
      PageManager.navigate(highlight.page);
    }
    
    // 更新提示
    this._hintEl.innerHTML = `
      <div class="demo-hint-label">${highlight.label}</div>
      <div class="demo-hint-desc">${highlight.desc}</div>
      <div class="demo-hint-progress">${index + 1} / ${this._highlights.length}</div>
    `;
  },
  
  _createHint() {
    this._hintEl = document.createElement('div');
    this._hintEl.className = 'demo-hint';
    this._hintEl.innerHTML = `
      <div class="demo-hint-label"></div>
      <div class="demo-hint-desc"></div>
      <div class="demo-hint-progress"></div>
    `;
    document.body.appendChild(this._hintEl);
  },
  
  _toastEl: null,
  _showToast(msg) {
    if (!this._toastEl) {
      this._toastEl = document.createElement('div');
      this._toastEl.className = 'demo-toast';
      document.body.appendChild(this._toastEl);
    }
    this._toastEl.textContent = msg;
    this._toastEl.classList.add('demo-toast-visible');
    setTimeout(() => {
      this._toastEl.classList.remove('demo-toast-visible');
    }, 2000);
  }
};

// 自动初始化
document.addEventListener('DOMContentLoaded', () => {
  DemoMode.init();
});

window.DemoMode = DemoMode;
