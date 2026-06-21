/**
 * ============================================================================
 * Modal 弹窗系统 v2.0 — 交互增强版
 * ============================================================================
 *
 * 优化内容：
 * 1. 点击外部区域关闭弹窗
 * 2. ESC 键关闭弹窗
 * 3. 右上角添加关闭按钮（×）
 * 4. 弹性缩放进入动画（cubic-bezier 弹性曲线）
 * 5. 弹窗出现时阻止底层页面滚动
 * 6. 支持连锁弹窗（关闭后恢复之前的滚动状态）
 * 7. 打开/关闭音效反馈
 *
 * @version 2.0
 * ============================================================================
 */

const Modal = {
  _scrollTop: 0,
  _isOpen: false,
  _closeBtn: null,
  _overlay: null,
  _content: null,
  _titleEl: null,
  _descEl: null,
  _iconEl: null,
  _onKeyDown: null,
  _onClickOutside: null,

  init() {
    this._overlay = document.getElementById('modalOverlay');
    this._content = document.getElementById('modalContent');
    this._titleEl = document.getElementById('modalTitle');
    this._descEl = document.getElementById('modalDesc');
    if (!this._overlay || !this._content) return;

    // 创建关闭按钮
    this._createCloseBtn();

    // 绑定事件
    this._bindEvents();
  },

  _createCloseBtn() {
    if (this._closeBtn) return;
    const btn = document.createElement('button');
    btn.className = 'modal-close-btn';
    btn.innerHTML = '✕';
    btn.setAttribute('aria-label', '关闭弹窗');
    btn.style.cssText = `
      position: absolute;
      top: 12px;
      right: 12px;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: none;
      background: rgba(255,255,255,0.08);
      color: rgba(255,255,255,0.6);
      font-size: 16px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s ease, opacity 0.2s ease, box-shadow 0.2s ease;
      z-index: 10;
      padding: 0;
      line-height: 1;
    `;
    btn.onmouseenter = () => {
      btn.style.background = 'rgba(255,255,255,0.15)';
      btn.style.color = 'rgba(255,255,255,0.9)';
      btn.style.transform = 'scale(1.1)';
    };
    btn.onmouseleave = () => {
      btn.style.background = 'rgba(255,255,255,0.08)';
      btn.style.color = 'rgba(255,255,255,0.6)';
      btn.style.transform = 'scale(1)';
    };
    btn.onclick = (e) => {
      e.stopPropagation();
      this.hide();
    };
    this._closeBtn = btn;
  },

  _bindEvents() {
    // 点击外部关闭
    this._onClickOutside = (e) => {
      if (e.target === this._overlay) {
        this.hide();
      }
    };

    // ESC 键关闭
    this._onKeyDown = (e) => {
      if (e.key === 'Escape' && this._isOpen) {
        this.hide();
      }
    };

    this._overlay.addEventListener('click', this._onClickOutside);
    document.addEventListener('keydown', this._onKeyDown);
  },

  show(title, desc, icon = '📢') {
    if (!this._overlay) this.init();
    if (!this._overlay) return;

    this._titleEl.textContent = title;
    this._descEl.innerHTML = desc;

    // 找到图标元素（第一个 div）
    const iconEl = this._content.querySelector('div:first-child');
    if (iconEl) iconEl.textContent = icon;

    // 插入关闭按钮到弹窗内容中
    const modalBox = this._overlay.querySelector('.modal-box') || this._content;
    if (this._closeBtn && !this._closeBtn.parentNode) {
      modalBox.style.position = 'relative';
      modalBox.appendChild(this._closeBtn);
    }

    // 阻止底层滚动
    this._blockScroll();

    // 显示弹窗
    this._overlay.classList.add('active');
    this._isOpen = true;

    // 播放打开音效
    if (typeof SFXEngine !== 'undefined' && SFXEngine.modalOpen) {
      try { SFXEngine.modalOpen(); } catch (_) {}
    }

    // 触觉反馈
    if (navigator.vibrate) {
      try { navigator.vibrate(12); } catch (_) {}
    }
  },

  hide() {
    if (!this._overlay || !this._isOpen) return;

    this._overlay.classList.remove('active');
    this._isOpen = false;

    // 恢复底层滚动
    this._restoreScroll();

    // 播放关闭音效
    if (typeof SFXEngine !== 'undefined' && SFXEngine.modalClose) {
      try { SFXEngine.modalClose(); } catch (_) {}
    }
  },

  _blockScroll() {
    if (document.body.style.overflow === 'hidden') return;
    this._scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = '-' + this._scrollTop + 'px';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    document.body.dataset.modalScrollLocked = 'true';
  },

  _restoreScroll() {
    if (document.body.dataset.modalScrollLocked !== 'true') return;
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.style.height = '';
    document.body.dataset.modalScrollLocked = '';
    window.scrollTo(0, this._scrollTop);
  }
};

// 页面加载完成后自动初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Modal.init());
} else {
  Modal.init();
}

// 导出到全局
window.Modal = Modal;
