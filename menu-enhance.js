/**
 * ===========================================================================
 * 应急小达人 v1.2.0 — 主菜单视觉优化（修复版）
 * ===========================================================================
 * 
 * 修复：
 * 1. 移除入场动画（opacity:0 导致按钮不可见/不可点）
 * 2. 保留悬浮增强效果
 * 3. 保留鼠标光晕（pointer-events:none）
 * 
 * @version 1.2.1
 * ===========================================================================
 */

const MenuVisualEnhancer = {
  _mouseX: 0,
  _mouseY: 0,
  _glowElement: null,
  
  init() {
    // 创建鼠标跟随光晕
    this.createMouseGlow();
    
    // 增强菜单卡片悬浮效果（不改变初始状态）
    this.enhanceMenuCards();
    
    // 增强分类标题
    this.enhanceSectionHeaders();
    
    console.log('🎨 主菜单视觉增强已加载（修复版）');
  },
  
  // 创建鼠标跟随光晕
  createMouseGlow() {
    this._glowElement = document.createElement('div');
    this._glowElement.className = 'menu-mouse-glow';
    document.body.appendChild(this._glowElement);
    
    // 监听鼠标移动
    document.addEventListener('mousemove', (e) => {
      this._mouseX = e.clientX;
      this._mouseY = e.clientY;
      
      if (this._glowElement) {
        this._glowElement.style.left = e.clientX + 'px';
        this._glowElement.style.top = e.clientY + 'px';
      }
    });
  },
  
  // 增强菜单卡片 - 只添加悬浮效果，不改变初始样式
  enhanceMenuCards() {
    // 使用实际存在的 .mode-btn 选择器
    const cards = document.querySelectorAll('.mode-btn');
    
    cards.forEach((card) => {
      // 只添加悬浮交互效果，不修改初始 opacity/transform
      card.addEventListener('mouseenter', (e) => {
        // 保存原始样式
        if (!card.dataset.originalTransform) {
          card.dataset.originalTransform = card.style.transform || '';
          card.dataset.originalBoxShadow = card.style.boxShadow || '';
        }
        
        card.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease';
        card.style.transform = 'translateY(-4px) scale(1.02)';
        
        // 添加光晕效果
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', x + 'px');
        card.style.setProperty('--mouse-y', y + 'px');
      });
      
      card.addEventListener('mouseleave', () => {
        // 恢复原始样式
        card.style.transform = card.dataset.originalTransform || '';
        card.style.boxShadow = card.dataset.originalBoxShadow || '';
      });
      
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', x + 'px');
        card.style.setProperty('--mouse-y', y + 'px');
      });
    });
  },
  
  // 增强分类标题
  enhanceSectionHeaders() {
    const headers = document.querySelectorAll('.menu-section-title, .section-header');
    
    headers.forEach(header => {
      // 添加光效
      const glow = document.createElement('div');
      glow.className = 'section-header-glow';
      header.appendChild(glow);
    });
  }
};

// 自动初始化
document.addEventListener('DOMContentLoaded', function() {
  // 延迟初始化，确保菜单已渲染
  setTimeout(() => {
    MenuVisualEnhancer.init();
  }, 500);
});

// 挂载到全局
window.MenuVisualEnhancer = MenuVisualEnhancer;
