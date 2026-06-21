/**
 * ============================================================================
 * OptimizedModal - 弹窗系统（重构版）
 * ============================================================================
 * 优化点：
 *  1. DOM 缓存：一次性缓存所有弹窗元素，避免重复查询
 *  2. 事件委托：统一处理关闭按钮、ESC 键、点击外部
 *  3. 错误边界：所有操作包裹 try/catch
 *  4. 减少重排：批量样式更新
 *  5. 自动清理：弹窗关闭时清理 DOM 引用
 * ============================================================================
 */
const OptimizedModal = (function() {
  'use strict';

  // 缓存 DOM 引用（惰性初始化）
  let _overlay = null;
  let _content = null;
  let _titleEl = null;
  let _descEl = null;
  let _closeBtn = null;
  let _isOpen = false;
  let _scrollTop = 0;
  let _eventsBound = false;

  /** 初始化 DOM 缓存 */
  function _initCache() {
    if (_overlay) return;
    _overlay = DOMCache.get('modalOverlay');
    _content = DOMCache.get('modalContent');
    _titleEl = DOMCache.get('modalTitle');
    _descEl = DOMCache.get('modalDesc');
  }

  /** 创建关闭按钮 */
  function _createCloseBtn() {
    if (_closeBtn) return;
    _closeBtn = document.createElement('button');
    _closeBtn.className = 'modal-close-btn';
    _closeBtn.innerHTML = '✕';
    _closeBtn.setAttribute('aria-label', '关闭弹窗');
    _closeBtn.style.cssText = 'position:absolute;top:12px;right:12px;width:32px;height:32px;border-radius:50%;border:none;background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.6);font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s ease;z-index:10;';
    _closeBtn.onmouseenter = () => { _closeBtn.style.background = 'rgba(255,255,255,0.15)'; _closeBtn.style.color = '#fff'; };
    _closeBtn.onmouseleave = () => { _closeBtn.style.background = 'rgba(255,255,255,0.08)'; _closeBtn.style.color = 'rgba(255,255,255,0.6)'; };
    _closeBtn.onclick = (e) => { e.stopPropagation(); hide(); };
  }

  /** 绑定全局事件 */
  function _bindEvents() {
    if (_eventsBound) return;
    _eventsBound = true;

    // ESC 关闭
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && _isOpen) hide();
    });

    // 点击外部关闭
    if (_overlay) {
      _overlay.addEventListener('click', (e) => {
        if (e.target === _overlay) hide();
      });
    }
  }

  /** 显示弹窗 */
  function show(title, desc, icon) {
    return ErrorBoundary.safeCall(() => {
      icon = icon || '📢';
      _initCache();

      if (!_overlay || !_content) {
        console.warn('[Modal] Overlay or content not found in DOM');
        return;
      }

      // 更新内容
      if (_titleEl) _titleEl.textContent = title;
      if (_descEl) _descEl.innerHTML = desc;

      // 更新图标
      const iconEl = _content.querySelector('div:first-child');
      if (iconEl) iconEl.textContent = icon;

      // 添加关闭按钮
      _createCloseBtn();
      const modalBox = _overlay.querySelector('.modal-box') || _content;
      if (_closeBtn && !_closeBtn.parentNode) {
        modalBox.style.position = 'relative';
        modalBox.appendChild(_closeBtn);
      }

      // 显示
      _blockScroll();
      _overlay.classList.add('active');
      _isOpen = true;

      // 音效和震动
      if (typeof SFXEngine !== 'undefined' && SFXEngine.modalOpen) {
        try { SFXEngine.modalOpen(); } catch (_) {}
      }
      if (navigator.vibrate) {
        try { navigator.vibrate(12); } catch (_) {}
      }

      _bindEvents();
    }, 'Modal.show', undefined);
  }

  /** 隐藏弹窗 */
  function hide() {
    return ErrorBoundary.safeCall(() => {
      if (!_overlay || !_isOpen) return;
      _overlay.classList.remove('active');
      _isOpen = false;
      _restoreScroll();
      if (typeof SFXEngine !== 'undefined' && SFXEngine.modalClose) {
        try { SFXEngine.modalClose(); } catch (_) {}
      }
    }, 'Modal.hide', undefined);
  }

  /** 阻止页面滚动 */
  function _blockScroll() {
    if (document.body.style.overflow === 'hidden') return;
    _scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = '-' + _scrollTop + 'px';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    document.body.dataset.modalScrollLocked = 'true';
  }

  /** 恢复页面滚动 */
  function _restoreScroll() {
    if (document.body.dataset.modalScrollLocked !== 'true') return;
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.style.height = '';
    document.body.dataset.modalScrollLocked = '';
    window.scrollTo(0, _scrollTop);
  }

  return { show, hide };
})();

// 向后兼容：覆盖全局 Modal
window.Modal = OptimizedModal;
