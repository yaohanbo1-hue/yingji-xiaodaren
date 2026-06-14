// ===== 开场演示模式 — 自动播放给评委看 =====
// 触发方式：URL 添加 ?demo=1 或 localStorage.demoMode = 'true'

(function() {
  'use strict';
  
  const DemoEngine = {
    active: false,
    step: 0,
    timer: null,
    delays: [],
    
    // 演示流程脚本
    script: [
      { action: 'wait',   ms: 1500,  desc: '等待加载完成' },
      { action: 'log',    text: '🎬 演示模式启动 — 自动展示各功能模块', desc: '开场白' },
      { action: 'toast',  text: '🎬 演示模式：自动展示各功能模块', ms: 3000, desc: '显示演示提示' },
      { action: 'wait',   ms: 2000,  desc: '停顿' },
      
      // 1. 展示主菜单动画
      { action: 'highlight', selector: '.menu-logo', ms: 2000, desc: '高亮品牌Logo' },
      { action: 'wait', ms: 800, desc: '停顿' },
      
      // 2. 展示学习中心
      { action: 'click', selector: '#catBtnLearn', desc: '点击学习中心' },
      { action: 'wait', ms: 1200, desc: '等待展开' },
      { action: 'highlight', selector: '.learn-grid .mode-btn:first-child', ms: 1500, desc: '高亮开盲盒' },
      { action: 'scroll', selector: '.learn-grid', desc: '滚动查看全部' },
      { action: 'wait', ms: 800, desc: '停顿' },
      
      // 3. 展示闯关挑战
      { action: 'click', selector: '#catBtnBattle', desc: '切换到闯关挑战' },
      { action: 'wait', ms: 1200, desc: '等待展开' },
      { action: 'highlight', selector: '.battle-grid .mode-btn:first-child', ms: 1500, desc: '高亮防灾大擂台' },
      { action: 'wait', ms: 800, desc: '停顿' },
      
      // 4. 展示百科
      { action: 'navigate', page: 'encyclopedia', desc: '进入百科页面' },
      { action: 'wait', ms: 2000, desc: '展示百科' },
      
      // 5. 展示AI导师
      { action: 'navigate', page: 'ai-tutor', desc: '进入AI导师' },
      { action: 'wait', ms: 2500, desc: '展示AI导师' },
      
      // 6. 展示认证
      { action: 'navigate', page: 'certification', desc: '进入能力认证' },
      { action: 'wait', ms: 2500, desc: '展示认证' },
      
      // 7. 展示灾害模拟
      { action: 'navigate', page: 'disaster-sim', desc: '进入灾害模拟' },
      { action: 'wait', ms: 2500, desc: '展示灾害模拟' },
      
      // 8. 展示真实案例
      { action: 'navigate', page: 'real-cases', desc: '进入真实案例' },
      { action: 'wait', ms: 2500, desc: '展示真实案例' },
      
      // 9. 展示学习报告
      { action: 'navigate', page: 'report', desc: '进入学习报告' },
      { action: 'wait', ms: 2000, desc: '展示学习报告' },
      
      // 10. 展示设置
      { action: 'navigate', page: 'settings', desc: '进入设置' },
      { action: 'wait', ms: 2000, desc: '展示设置' },
      
      // 11. 返回主菜单，展示底部导航
      { action: 'navigate', page: 'menu', desc: '返回主菜单' },
      { action: 'wait', ms: 1000, desc: '停顿' },
      { action: 'highlight', selector: '.menu-toolbar', ms: 2000, desc: '高亮底部导航' },
      
      // 结束
      { action: 'log', text: '✅ 演示结束 — 所有模块已展示完毕', desc: '结束' },
      { action: 'toast', text: '✅ 演示结束，现在您可以自由体验', ms: 4000, desc: '结束提示' },
      { action: 'done', desc: '完成' }
    ],
    
    // 启动演示
    start() {
      if (this.active) return;
      this.active = true;
      this.step = 0;
      console.log('[Demo] 演示模式启动');
      this.run();
    },
    
    // 执行下一步
    run() {
      if (!this.active || this.step >= this.script.length) {
        this.stop();
        return;
      }
      const item = this.script[this.step++];
      this.execute(item);
    },
    
    // 执行单个动作
    execute(item) {
      const self = this;
      switch (item.action) {
        case 'wait':
          this.timer = setTimeout(() => self.run(), item.ms);
          break;
          
        case 'log':
          console.log('[Demo]', item.text);
          this.run();
          break;
          
        case 'toast':
          this.showToast(item.text, item.ms);
          this.timer = setTimeout(() => self.run(), item.ms + 300);
          break;
          
        case 'highlight':
          this.highlightElement(item.selector, item.ms);
          this.timer = setTimeout(() => self.run(), item.ms + 300);
          break;
          
        case 'click':
          this.simulateClick(item.selector);
          this.timer = setTimeout(() => self.run(), 500);
          break;
          
        case 'scroll':
          this.smoothScroll(item.selector);
          this.timer = setTimeout(() => self.run(), 800);
          break;
          
        case 'navigate':
          if (typeof PageManager !== 'undefined') {
            PageManager.navigate(item.page);
          }
          this.timer = setTimeout(() => self.run(), 1000);
          break;
          
        case 'done':
          this.stop();
          break;
          
        default:
          this.run();
      }
    },
    
    // 显示演示提示
    showToast(text, ms) {
      const toast = document.createElement('div');
      toast.id = 'demoToast';
      toast.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:9999999;padding:12px 24px;background:linear-gradient(135deg,rgba(0,212,255,0.9),rgba(155,89,182,0.9));color:#fff;border-radius:24px;font-size:14px;font-weight:700;backdrop-filter:blur(12px);box-shadow:0 8px 32px rgba(0,0,0,0.4);animation:demoToastIn 0.4s ease;white-space:nowrap;pointer-events:none;';
      toast.textContent = text;
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.style.animation = 'demoToastOut 0.4s ease forwards';
        setTimeout(() => toast.remove(), 400);
      }, ms);
    },
    
    // 高亮元素
    highlightElement(selector, ms) {
      const el = document.querySelector(selector);
      if (!el) return;
      el.style.transition = 'all 0.3s ease';
      el.style.transform = 'scale(1.05)';
      el.style.boxShadow = '0 0 40px rgba(0,212,255,0.5), 0 0 80px rgba(155,89,182,0.3)';
      el.style.zIndex = '1000';
      el.style.position = 'relative';
      
      setTimeout(() => {
        el.style.transform = '';
        el.style.boxShadow = '';
        el.style.zIndex = '';
        el.style.position = '';
      }, ms);
    },
    
    // 模拟点击
    simulateClick(selector) {
      const el = document.querySelector(selector);
      if (el) {
        el.style.transition = 'transform 0.15s ease';
        el.style.transform = 'scale(0.95)';
        setTimeout(() => {
          el.style.transform = 'scale(1)';
          el.click();
        }, 150);
      }
    },
    
    // 平滑滚动
    smoothScroll(selector) {
      const el = document.querySelector(selector);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    },
    
    // 停止演示
    stop() {
      this.active = false;
      clearTimeout(this.timer);
      console.log('[Demo] 演示结束');
      // 清除所有演示样式
      document.querySelectorAll('[style*="z-index: 1000"]').forEach(el => {
        el.style.zIndex = '';
        el.style.position = '';
        el.style.boxShadow = '';
        el.style.transform = '';
      });
    },
    
    // 检查是否应启动演示
    check() {
      const url = new URL(window.location.href);
      if (url.searchParams.get('demo') === '1' || localStorage.getItem('demoMode') === 'true') {
        // 等待页面加载完成
        if (document.body.classList.contains('app-ready')) {
          this.start();
        } else {
          const checkReady = setInterval(() => {
            if (document.body.classList.contains('app-ready')) {
              clearInterval(checkReady);
              setTimeout(() => this.start(), 500);
            }
          }, 200);
        }
        return true;
      }
      return false;
    }
  };
  
  // 添加 CSS 动画
  const style = document.createElement('style');
  style.textContent = `
    @keyframes demoToastIn { from { opacity:0; transform:translateX(-50%) translateY(-20px) scale(0.9); } to { opacity:1; transform:translateX(-50%) translateY(0) scale(1); } }
    @keyframes demoToastOut { from { opacity:1; transform:translateX(-50%) translateY(0) scale(1); } to { opacity:0; transform:translateX(-50%) translateY(-20px) scale(0.9); } }
  `;
  document.head.appendChild(style);
  
  // 绑定到全局
  window.DemoEngine = DemoEngine;
  
  // 自动检测
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => DemoEngine.check());
  } else {
    DemoEngine.check();
  }
  
})();
