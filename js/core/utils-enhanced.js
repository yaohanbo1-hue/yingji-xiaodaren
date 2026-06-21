/**
 * ============================================================================
 * 应急小达人 - 增强工具函数库
 * ============================================================================
 * 提取自 game-engines.js 的公共代码模式，用于减少重复代码、
 * 优化 DOM 操作性能、统一错误处理和边界检查。
 * ============================================================================
 */

'use strict';

// ============================================================================
// 常量定义 (替代魔法数字)
// ============================================================================

const CONSTANTS = Object.freeze({
  /** 最大等级上限 */
  MAX_LEVEL: 999,
  /** 最大卡牌等级 */
  MAX_CARD_LEVEL: 5,
  /** 碎片合成所需数量 */
  FRAGMENT_COST: 10,
  /** 默认答题时间限制(秒) */
  DEFAULT_TIME_LIMIT: 15,
  /** 战斗模式默认时间限制 */
  BATTLE_TIME_LIMIT: 20,
  /** 每日盲盒免费次数 */
  DAILY_FREE_BLINDBOX: 1,
  /** 扭蛋消耗金币 */
  GACHA_COST: 30,
  /** 刮刮卡消耗金币 */
  SCRATCH_COST: 40,
  /** 签到奖励周期 */
  CHECKIN_CYCLE_DAYS: 30,
  /** 排行榜最大条目数 */
  LEADERBOARD_MAX_ENTRIES: 10,
  /** 记忆卡牌默认配对数 */
  MEMORY_DEFAULT_PAIRS: 8,
  /** 每日任务模板数量 */
  DAILY_TASK_COUNT: 5,
  /** 连击里程碑阈值 */
  COMBO_MILESTONES: [3, 5, 8, 10, 15, 20],
  /** 稀有度顺序 */
  RARITY_ORDER: ['common', 'rare', 'epic', 'legendary'],
  /** 稀有度中文映射 */
  RARITY_LABELS: {
    common: '普通',
    fine: '精良',
    rare: '稀有',
    epic: '史诗',
    legendary: '传说',
    mythic: '神话'
  },
  /** 灾害类型图标映射 */
  DISASTER_ICONS: {
    earthquake: '🌍',
    flood: '🌊',
    typhoon: '🌪️',
    fire: '🔥',
    lightning: '⚡',
    blizzard: '❄️',
    landslide: '⛰️',
    volcano: '🌋',
    epidemic: '🦠',
    gas: '💨',
    elevator: '🛗',
    snowstorm: '❄️',
    tornado: '🌀',
    thunder: '⚡',
    drought: '☀️',
    equip: '🎒',
    general: '📚'
  },
  /** 星期中文 */
  WEEKDAYS: ['日', '一', '二', '三', '四', '五', '六'],
  /** 月份中文 */
  MONTHS: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
});

// ============================================================================
// DOM 缓存与操作工具
// ============================================================================

/** @type {Map<string, HTMLElement>} DOM 元素缓存 */
const DOM_CACHE = new Map();

/**
 * 获取 DOM 元素，带缓存机制
 * @param {string} id - 元素 ID
 * @returns {HTMLElement|null} 元素或 null
 */
function getEl(id) {
  if (!id || typeof id !== 'string') return null;
  if (DOM_CACHE.has(id)) {
    const el = DOM_CACHE.get(id);
    // 验证缓存是否仍然有效（元素仍在 DOM 中）
    if (el && document.body.contains(el)) return el;
    DOM_CACHE.delete(id);
  }
  const el = document.getElementById(id);
  if (el) DOM_CACHE.set(id, el);
  return el;
}

/**
 * 安全获取元素，不存在则返回虚拟对象防止报错
 * @param {string} id - 元素 ID
 * @returns {HTMLElement|{style:{},textContent:'',innerHTML:''}} 
 */
function getElSafe(id) {
  return getEl(id) || { style: {}, textContent: '', innerHTML: '', classList: { add() {}, remove() {} } };
}

/**
 * 设置元素文本内容
 * @param {string} id - 元素 ID
 * @param {string} text - 文本内容
 */
function setText(id, text) {
  const el = getEl(id);
  if (el) el.textContent = text ?? '';
}

/**
 * 设置元素 HTML 内容
 * @param {string} id - 元素 ID
 * @param {string} html - HTML 内容
 */
function setHTML(id, html) {
  const el = getEl(id);
  if (el) el.innerHTML = html ?? '';
}

/**
 * 设置元素 display 样式
 * @param {string} id - 元素 ID
 * @param {string} display - display 值
 */
function setDisplay(id, display) {
  const el = getEl(id);
  if (el) el.style.display = display;
}

/**
 * 设置元素宽度（常用于进度条）
 * @param {string} id - 元素 ID
 * @param {string|number} width - 宽度值
 */
function setWidth(id, width) {
  const el = getEl(id);
  if (el) el.style.width = typeof width === 'number' ? width + '%' : width;
}

/**
 * 创建带属性的 DOM 元素
 * @param {string} tag - 标签名
 * @param {string} [className] - 类名
 * @param {Object} [attrs] - 属性对象
 * @returns {HTMLElement} 创建的元素
 */
function createEl(tag, className, attrs) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (attrs) {
    for (const [key, val] of Object.entries(attrs)) {
      if (key === 'style' && typeof val === 'object') {
        Object.assign(el.style, val);
      } else {
        el.setAttribute(key, val);
      }
    }
  }
  return el;
}

/**
 * 清除 DOM 缓存（页面切换时调用）
 */
function clearDOMCache() {
  DOM_CACHE.clear();
}

// ============================================================================
// 数组/随机工具
// ============================================================================

/**
 * Fisher-Yates 洗牌算法
 * @template T
 * @param {T[]} arr - 源数组
 * @returns {T[]} 新数组（不改变原数组）
 */
function shuffle(arr) {
  if (!Array.isArray(arr) || arr.length < 2) return arr ? [...arr] : [];
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * 从数组中随机取一项
 * @template T
 * @param {T[]} arr - 源数组
 * @returns {T|null} 随机项或 null
 */
function randomItem(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * 从数组中随机取 N 项
 * @template T
 * @param {T[]} arr - 源数组
 * @param {number} n - 数量
 * @returns {T[]} 随机项数组
 */
function randomPick(arr, n) {
  if (!Array.isArray(arr) || arr.length === 0) return [];
  return shuffle(arr).slice(0, Math.min(n, arr.length));
}

/**
 * 生成随机整数 [min, max)
 * @param {number} min - 最小值（包含）
 * @param {number} max - 最大值（不包含）
 * @returns {number} 随机整数
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

// ============================================================================
// 日期工具
// ============================================================================

/**
 * 获取今天日期字符串 (YYYY-MM-DD)
 * @returns {string}
 */
function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * 获取昨天日期字符串 (YYYY-MM-DD)
 * @returns {string}
 */
function getYesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

/**
 * 格式化日期为中文
 * @param {Date} [date] - 日期对象，默认今天
 * @returns {string} YYYY年M月D日
 */
function formatDateCN(date) {
  const d = date || new Date();
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

/**
 * 格式化日期为 YYYY-MM-DD
 * @param {Date} date - 日期对象
 * @returns {string}
 */
function formatDateISO(date) {
  if (!date) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// ============================================================================
// 游戏通用数据工具
// ============================================================================

/**
 * 检查全局变量是否可用
 * @param {string} name - 变量名
 * @returns {boolean}
 */
function isDefined(name) {
  return typeof window[name] !== 'undefined';
}

/**
 * 安全获取 GameState 数据
 * @param {string} key - 数据键名
 * @param {*} defaultValue - 默认值
 * @returns {*}
 */
function getGameData(key, defaultValue) {
  if (!isDefined('GameState') || !GameState._data) return defaultValue;
  return GameState._data[key] ?? defaultValue;
}

/**
 * 过滤出知识卡（排除装备卡）
 * @param {Object[]} [cards] - 卡牌数组，默认使用 ALL_CARDS
 * @returns {Object[]}
 */
function getKnowledgeCards(cards) {
  const pool = cards || (typeof ALL_CARDS !== 'undefined' ? ALL_CARDS : []);
  return pool.filter(c => c && c.disaster !== 'equip');
}

/**
 * 安全查找卡牌
 * @param {string|number} id - 卡牌 ID
 * @returns {Object|null}
 */
function findCardById(id) {
  if (!isDefined('ALL_CARDS') || !Array.isArray(ALL_CARDS)) return null;
  return ALL_CARDS.find(c => c && c.id === id) || null;
}

/**
 * 获取当前语言设置
 * @returns {string}
 */
function getCurrentLang() {
  return getGameData('lang', 'zh');
}

/**
 * 获取卡牌问题文本（根据语言）
 * @param {Object} card - 卡牌对象
 * @returns {string}
 */
function getCardQuestion(card) {
  if (!card) return '';
  const lang = getCurrentLang();
  if (lang === 'zh' && card.zh && card.zh.q) return card.zh.q;
  return card.question || card.zh?.q || '';
}

/**
 * 获取卡牌选项（根据语言）
 * @param {Object} card - 卡牌对象
 * @returns {string[]}
 */
function getCardOptions(card) {
  if (!card) return [];
  const lang = getCurrentLang();
  if (lang === 'zh' && card.zh && Array.isArray(card.zh.opts)) return card.zh.opts;
  return card.options || card.zh?.opts || [];
}

/**
 * 获取卡牌正确答案索引（根据语言）
 * @param {Object} card - 卡牌对象
 * @returns {number}
 */
function getCardCorrectIndex(card) {
  if (!card) return 0;
  const lang = getCurrentLang();
  if (lang === 'zh' && card.zh && card.zh.ans !== undefined) return card.zh.ans;
  return card.correctOption || 0;
}

/**
 * 获取灾害类型图标
 * @param {string} type - 灾害类型
 * @returns {string}
 */
function getDisasterIcon(type) {
  return CONSTANTS.DISASTER_ICONS[type] || '🌍';
}

// ============================================================================
// 模板/渲染工具
// ============================================================================

/**
 * 构建进度条 HTML
 * @param {number} pct - 百分比 0-100
 * @param {Object} [opts] - 选项
 * @returns {string} HTML 字符串
 */
function buildProgressBar(pct, opts = {}) {
  const { color = 'var(--cyber-blue, #00D4FF)', height = '6px', className = 'v10-progress' } = opts;
  return `<div class="${className}" style="height:${height};"><div class="v10-progress-fill" style="width:${Math.min(100, pct)}%;background:${color};"></div></div>`;
}

/**
 * 构建计分板 HTML
 * @param {Object} scores - 分数对象
 * @returns {string} HTML 字符串
 */
function buildScoreBoard(scores) {
  const { score = 0, lives = 0, combo = 0, difficulty = 0, total = 0 } = scores;
  const items = [];
  if (score !== undefined) items.push({ label: '得分', value: score, color: '#FFD700' });
  if (lives !== undefined) items.push({ label: '生命', value: lives, color: '#FF6B35' });
  if (combo !== undefined) items.push({ label: '连击', value: combo, color: '#00D4FF' });
  if (difficulty !== undefined) items.push({ label: '难度', value: difficulty, color: '#00E676' });
  if (total !== undefined) items.push({ label: '进度', value: total, color: '#AB47BC' });
  
  return `<div style="display:flex;justify-content:center;gap:24px;margin-bottom:20px;flex-wrap:wrap;">
    ${items.map(item => `<div style="text-align:center;"><div style="font-size:1.8rem;font-weight:800;color:${item.color};">${item.value}</div><div style="font-size:0.7rem;color:rgba(255,255,255,0.4);">${item.label}</div></div>`).join('')}
  </div>`;
}

/**
 * 构建答题选项 HTML
 * @param {Object[]} options - 选项数组 {text, isCorrect, callback}
 * @param {string} callbackName - 全局回调函数名
 * @returns {string} HTML 字符串
 */
function buildQuizOptions(options, callbackName) {
  if (!Array.isArray(options) || options.length === 0) return '';
  const letters = ['A', 'B', 'C', 'D'];
  return options.map((opt, i) => {
    const letter = letters[i] || String(i + 1);
    return `<div class="quiz-opt" onclick="${callbackName}(${i})" style="padding:12px 16px;margin:6px 0;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:10px;cursor:pointer;color:rgba(255,255,255,0.85);font-size:0.85rem;">
      <span style="color:var(--cyber-blue);margin-right:8px;">${letter}</span>${opt.text}
    </div>`;
  }).join('');
}

/**
 * 构建带图标的选项按钮
 * @param {string} icon - 图标
 * @param {string} text - 文本
 * @param {string} onclick - 点击事件
 * @param {Object} [style] - 额外样式
 * @returns {string} HTML 字符串
 */
function buildOptionBtn(icon, text, onclick, style = {}) {
  const extraStyle = Object.entries(style).map(([k, v]) => `${k}:${v}`).join(';');
  return `<div class="option-btn" onclick="${onclick}" style="padding:12px 16px;margin:6px 0;background:rgba(255,255,255,0.04);border-radius:10px;border:1px solid rgba(255,255,255,0.06);cursor:pointer;text-align:left;color:rgba(255,255,255,0.85);font-size:0.85rem;${extraStyle}">
    <span style="margin-right:8px;">${icon}</span>${text}
  </div>`;
}

/**
 * 构建 V10 卡片容器
 * @param {string} content - 内容 HTML
 * @param {Object} [opts] - 选项
 * @returns {string} HTML 字符串
 */
function buildCard(content, opts = {}) {
  const { padding = '16px', textAlign = 'left' } = opts;
  return `<div class="v10-card" style="padding:${padding};text-align:${textAlign};">${content}</div>`;
}

// ============================================================================
// 事件绑定工具 (替代内联 onclick)
// ============================================================================

/**
 * 事件委托绑定器
 * @param {string} containerId - 容器 ID
 * @param {string} selector - 子元素选择器
 * @param {string} event - 事件名
 * @param {Function} handler - 处理函数
 * @returns {Function} 解绑函数
 */
function delegateEvent(containerId, selector, event, handler) {
  const container = getEl(containerId);
  if (!container) return () => {};
  const wrapped = (e) => {
    const target = e.target.closest(selector);
    if (target) handler(e, target);
  };
  container.addEventListener(event, wrapped);
  return () => container.removeEventListener(event, wrapped);
}

/**
 * 一次性绑定带参数的点击事件（用于动态生成内容）
 * 通过 data-idx 属性来传递索引
 * @param {string} containerId - 容器 ID
 * @param {string} className - 子元素类名
 * @param {Function} handler - 处理函数(index, el)
 */
function bindIndexedClicks(containerId, className, handler) {
  const container = getEl(containerId);
  if (!container) return;
  container.querySelectorAll('.' + className).forEach((el, idx) => {
    el.dataset.idx = String(idx);
    el.onclick = () => handler(idx, el);
  });
}

// ============================================================================
// 状态管理工具
// ============================================================================

/**
 * 通用游戏引擎基类
 * 提供基本的 init / cleanup / reset 模式
 */
class BaseGameEngine {
  constructor() {
    this.active = false;
    this.timer = null;
    this.score = 0;
    this.currentIdx = 0;
  }

  /** 清理计时器 */
  clearTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /** 清理状态 */
  cleanup() {
    this.clearTimer();
    this.active = false;
  }

  /** 重置状态 */
  reset() {
    this.cleanup();
    this.score = 0;
    this.currentIdx = 0;
  }

  /**
   * 安全导航到页面
   * @param {string} pageId - 页面 ID
   */
  navigate(pageId) {
    if (isDefined('PageManager') && PageManager.navigate) {
      PageManager.navigate(pageId);
    }
  }

  /**
   * 播放音效
   * @param {string} sound - 音效名
   */
  playSound(sound) {
    if (isDefined('AudioManager') && AudioManager.play) {
      AudioManager.play(sound);
    }
  }
}

// ============================================================================
// 错误处理与日志
// ============================================================================

/**
 * 安全执行函数，捕获错误
 * @param {Function} fn - 要执行的函数
 * @param {string} [context] - 错误上下文描述
 * @param {*} [defaultValue] - 失败时的返回值
 * @returns {*}
 */
function safeExec(fn, context = '', defaultValue) {
  try {
    return fn();
  } catch (e) {
    console.warn(`[safeExec${context ? ' ' + context : ''}]`, e);
    return defaultValue;
  }
}

/**
 * 安全调用对象方法
 * @param {Object} obj - 对象
 * @param {string} method - 方法名
 * @param {...*} args - 参数
 * @returns {*}
 */
function safeCall(obj, method, ...args) {
  if (!obj || typeof obj[method] !== 'function') return undefined;
  try {
    return obj[method](...args);
  } catch (e) {
    console.warn(`[safeCall ${method}]`, e);
    return undefined;
  }
}

// ============================================================================
// 数字/数学工具
// ============================================================================

/**
 * 限制数值范围
 * @param {number} val - 值
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @returns {number}
 */
function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

/**
 * 计算百分比并限制在 0-100
 * @param {number} part - 部分值
 * @param {number} total - 总值
 * @returns {number}
 */
function calcPercent(part, total) {
  if (!total) return 0;
  return Math.min(100, Math.round((part / total) * 100));
}

// ============================================================================
// 导出 (兼容 CommonJS / ES Module / 全局变量)
// ============================================================================

const UtilsEnhanced = {
  CONSTANTS,
  DOM_CACHE,
  getEl, getElSafe, setText, setHTML, setDisplay, setWidth, createEl, clearDOMCache,
  shuffle, randomItem, randomPick, randomInt,
  getTodayStr, getYesterdayStr, formatDateCN, formatDateISO,
  isDefined, getGameData, getKnowledgeCards, findCardById,
  getCurrentLang, getCardQuestion, getCardOptions, getCardCorrectIndex, getDisasterIcon,
  buildProgressBar, buildScoreBoard, buildQuizOptions, buildOptionBtn, buildCard,
  delegateEvent, bindIndexedClicks,
  BaseGameEngine,
  safeExec, safeCall,
  clamp, calcPercent
};

// 全局挂载
window.UtilsEnhanced = UtilsEnhanced;
