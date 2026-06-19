/**
 * ===========================================================================
 * 应急小达人 — 背景主题切换系统
 * ===========================================================================
 */

const BGTheme = {
  _themes: ['deep-space', 'starry-night', 'aurora-flow', 'dawn-light', 'digital-matrix', 'warm-light'],
  _current: 'deep-space',
  _matrixInterval: null,

  init() {
    const saved = localStorage.getItem('bg_theme');
    if (saved && this._themes.includes(saved)) {
      this._current = saved;
    }
    this.apply(this._current);
    // 更新设置页显示
    const names = {
      'deep-space': '深空指挥官',
      'starry-night': '星空极夜',
      'aurora-flow': '极光流动',
      'dawn-light': '自然晨曦',
      'digital-matrix': '数字矩阵',
      'warm-light': '温馨暖光'
    };
    const icons = {
      'deep-space': '🌌',
      'starry-night': '⭐',
      'aurora-flow': '🌈',
      'dawn-light': '🌅',
      'digital-matrix': '💻',
      'warm-light': '☀️'
    };
    const nameEl = document.getElementById('currentThemeName');
    const descEl = document.getElementById('currentThemeDesc');
    if (nameEl) nameEl.textContent = icons[this._current] + ' ' + names[this._current];
    if (descEl) descEl.textContent = '当前主题：' + names[this._current];
    console.log('🎨 背景主题系统已启动：' + this._current);
  },

  switch(theme) {
    if (!this._themes.includes(theme)) return;
    this._current = theme;
    try {
      localStorage.setItem('bg_theme', theme);
    } catch(e) {
      console.error('Storage error:', e);
    }
    this.apply(theme);

    // 显示提示
    const names = {
      'deep-space': '深空指挥官',
      'starry-night': '星空极夜',
      'aurora-flow': '极光流动',
      'dawn-light': '自然晨曦',
      'digital-matrix': '数字矩阵',
      'warm-light': '温馨暖光'
    };
    const icons = {
      'deep-space': '🌌',
      'starry-night': '⭐',
      'aurora-flow': '🌈',
      'dawn-light': '🌅',
      'digital-matrix': '💻',
      'warm-light': '☀️'
    };
    if (typeof V10Toast !== 'undefined') {
      V10Toast.show('已切换主题：' + names[theme], 'success', 2000);
    }
    // 更新设置页显示
    const nameEl = document.getElementById('currentThemeName');
    const descEl = document.getElementById('currentThemeDesc');
    if (nameEl) nameEl.textContent = icons[theme] + ' ' + names[theme];
    if (descEl) descEl.textContent = '当前主题：' + names[theme];
  },

  apply(theme) {
    const body = document.body;
    // 移除所有主题类
    this._themes.forEach(t => body.classList.remove('theme-' + t));
    // 添加新主题
    body.classList.add('theme-' + theme);

    // 清理旧的矩阵雨
    if (this._matrixInterval) {
      clearInterval(this._matrixInterval);
      this._matrixInterval = null;
    }
    const matrixContainer = document.getElementById('bgMatrix');
    if (matrixContainer) matrixContainer.innerHTML = '';

    // 数字矩阵主题：启动矩阵雨
    if (theme === 'digital-matrix') {
      this._startMatrixRain();
    }
  },

  _startMatrixRain() {
    const container = document.getElementById('bgMatrix');
    if (!container) return;
    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    const cols = Math.floor(window.innerWidth / 20);

    for (let i = 0; i < cols; i++) {
      const col = document.createElement('div');
      col.className = 'matrix-col';
      col.style.left = (i * 20) + 'px';
      col.style.animationDuration = (4 + Math.random() * 8) + 's';
      col.style.animationDelay = (Math.random() * 5) + 's';
      let text = '';
      for (let j = 0; j < 30; j++) {
        text += chars[Math.floor(Math.random() * chars.length)] + '\n';
      }
      col.textContent = text;
      container.appendChild(col);
    }
  },

  getCurrent() {
    return this._current;
  },

  next() {
    const idx = this._themes.indexOf(this._current);
    const next = this._themes[(idx + 1) % this._themes.length];
    this.switch(next);
  }
};

// 自动初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => BGTheme.init());
} else {
  BGTheme.init();
}

window.BGTheme = BGTheme;
