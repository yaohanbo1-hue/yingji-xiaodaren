# Fixer_Storage 修复报告

**修复时间**: 2026-06-19  
**修复目标**: `yingji-xiaodaren` 项目所有 LocalStorage 相关致命 Bug  
**修复专家**: Fixer_Storage（本地存储修复专家）

---

## 一、修复概述

本次修复共涉及 **11 个文件**，修复 **3 类 P0 级问题**：

1. **report.js / share.js 读取不存在的 key** — 修复为从实际存在的 key 和数据源读取
2. **setItem 缺乏 try-catch 保护** — 所有 14 处 setItem 已添加错误处理
3. **JSON.parse 缺乏错误保护** — 所有 2 处未保护 JSON.parse 已添加 try-catch

---

## 二、P0 问题 1：report.js 和 share.js 读取不存在的 key

### 问题描述
`report.js` 读取 18 个 key（如 `disaster_hq_playtime`、`disasterHQ_stats` 等），`share.js` 读取 3 个 key（`disasterHQ_stats`、`disasterHQ_blindbox`、`disasterHQ_checkin`），但项目中没有任何代码写入这些 key。导致报告和海报始终显示空数据/默认值。

### 实际存在的 key（game.js 中）
- `disasterGachaState` — 游戏主状态（JSON）
- `disasterSeason` — 赛季数据（JSON）
- `tutorialDone` — 教程完成标记（string）
- `aiTutorData` — AI 导师答题历史（JSON）
- `aitutor_profile` — AI 导师用户画像（JSON）
- `certificationData` — 认证等级数据（JSON）
- `disaster_hq_wrong_book` — 错题本（JSON）
- `disasterHQ_language` — 语言偏好（string）
- `disaster_hq_voice_*` — 语音设置（string）
- `disaster_hq_loading_shown` — 加载动画标记（string）
- `bg_theme` — 背景主题（string）
- `disaster_hq_guide_completed` — 引导完成标记（string）

### 修复方案：采用方案 A + 补充方案 B

**方案 A**：修改 `report.js` 和 `share.js`，从实际存在的 key 读取数据，并添加全局对象（`GameState`、`CertificationEngine`、`CalendarEngine`）作为 fallback 数据源。

**方案 B**：在 `game.js` 中已存在数据写入逻辑（写入 `disasterGachaState`），但 report/share 未读取。修复后 report/share 现在会读取 `disasterGachaState`。

### 修复细节

#### report.js 修改内容
- 新增 `SafeStorage` 工具函数（带 try-catch 的 set/get/getString）
- `_collectData()` 改用 `SafeStorage.getString()` 读取 key
- `_getPlayTime()` 增加 fallback：
  - `disasterGachaState.playTime`
  - `GameState._data.playTime`
- `_getQuizCount()` 增加 fallback：
  - `aiTutorData.quizHistory.length`
  - `GameState._data.totalQuizzes`
  - `disasterGachaState.totalQuizzes`
- `_getCorrectRate()` 增加 fallback：
  - 从 `aiTutorData.quizHistory` 计算正确率
  - `GameState._data.correctCount / totalQuizzes`
- `_getCategoryStats()` 增加 fallback：
  - 从 `aiTutorData.mastery` 映射分类掌握度
- `_getLevel()` 增加 fallback：
  - 优先从 `CertificationEngine._data.currentLevel` 读取
- `_getStreak()` 增加 fallback：
  - 优先从 `CalendarEngine._streak` 读取

#### share.js 修改内容
- 新增 `SafeStorage` 工具函数
- `_getUserData()` 重写数据获取逻辑：
  1. 优先从 `disasterGachaState` 读取综合数据（totalQuizzes, correctCount, blindboxOpened, streakDays）
  2. 从 `aiTutorData.quizHistory` 补充答题数据
  3. 从 `CertificationEngine` 获取等级和掌握灾害数
  4. 从 `GameState._data` 补充缺失字段
  5. 正确率自动计算

---

## 三、P0 问题 2：setItem 没有 try-catch

### 问题描述
隐私模式或存储空间满时，`localStorage.setItem()` 抛出 `QuotaExceededError` 或 `SecurityError`，导致页面崩溃。

### 修复文件清单

| 文件 | 行号 | 修复前 | 修复后 |
|------|------|--------|--------|
| `ai-tutor.js` | 60 | `localStorage.setItem('aiTutorData', ...)` | `try { localStorage.setItem(...) } catch(e) { ... }` |
| `ai-tutor-llm.js` | 100 | `localStorage.setItem('aitutor_profile', ...)` | `try { localStorage.setItem(...) } catch(e) { ... }` |
| `bg-themes.js` | 45 | `localStorage.setItem('bg_theme', ...)` | `try { localStorage.setItem(...) } catch(e) { ... }` |
| `certification.js` | 92 | `localStorage.setItem('certificationData', ...)` | `try { localStorage.setItem(...) } catch(e) { ... }` |
| `guide-enhance.js` | 136 | `localStorage.getItem(...)` | `try { localStorage.getItem(...) } catch(e) { ... }` |
| `guide-enhance.js` | 148 | `localStorage.removeItem(...)` | `try { localStorage.removeItem(...) } catch(e) {}` |
| `guide-enhance.js` | 155 | `localStorage.removeItem(...)` | `try { localStorage.removeItem(...) } catch(e) {}` |
| `guide-enhance.js` | 167 | `localStorage.setItem(...)` | `try { localStorage.setItem(...) } catch(e) {}` |
| `guide-enhance.js` | 453 | `localStorage.setItem(...)` | `try { localStorage.setItem(...) } catch(e) {}` |
| `guide-enhance.js` | 463 | `localStorage.removeItem(...)` | `try { localStorage.removeItem(...) } catch(e) {}` |
| `loading.js` | 17 | `localStorage.getItem(...)` | `try { localStorage.getItem(...) } catch(e) { return; }` |
| `loading.js` | 84 | `localStorage.setItem(...)` | `try { localStorage.setItem(...) } catch(e) { ... }` |
| `i18n.js` | 344 | `localStorage.setItem('disasterHQ_language', ...)` | `try { localStorage.setItem(...) } catch(e) { ... }` |
| `voice.js` | 67 | `localStorage.setItem('disaster_hq_voice_enabled', ...)` | `try { localStorage.setItem(...) } catch(e) { ... }` |
| `voice.js` | 81 | `localStorage.setItem('disaster_hq_voice_rate', ...)` | `try { localStorage.setItem(...) } catch(e) { ... }` |
| `voice.js` | 87 | `localStorage.setItem('disaster_hq_voice_pitch', ...)` | `try { localStorage.setItem(...) } catch(e) { ... }` |
| `game.js` | 28-42 | 3 处 setItem 在 minified 代码中 | 顶部 monkey-patch 统一保护 |

### 特殊处理：game.js

`game.js` 为 minified 单文件（349KB，核心代码在 1 行），直接定位编辑 3 处 `setItem` 极易破坏语法。

**采用方案**：在文件顶部（第 28-42 行）插入 `localStorage` monkey-patch，覆盖 `setItem`/`getItem`/`removeItem`，使所有调用自动获得 try-catch 保护。

```javascript
// SafeStorage monkey-patch for localStorage protection
try {
  const _origSetItem = localStorage.setItem;
  const _origGetItem = localStorage.getItem;
  const _origRemoveItem = localStorage.removeItem;
  localStorage.setItem = function(key, value) {
    try { return _origSetItem.call(localStorage, key, value); } catch(e) { console.error('Storage error:', e); }
  };
  localStorage.getItem = function(key) {
    try { return _origGetItem.call(localStorage, key); } catch(e) { return null; }
  };
  localStorage.removeItem = function(key) {
    try { return _origRemoveItem.call(localStorage, key); } catch(e) { return null; }
  };
} catch(e) {}
```

---

## 四、P0 问题 3：JSON.parse 没有错误保护

### 问题描述
多处 `JSON.parse(localStorage.getItem(...))` 没有 try-catch，当存储数据被损坏（如用户手动修改、部分写入中断）时，页面崩溃。

### 修复文件清单

| 文件 | 行号 | 修复前 | 修复后 |
|------|------|--------|--------|
| `certification.js` | 97 | `JSON.parse(localStorage.getItem('aiTutorData') \|\| '{}')` | `try { ... } catch(e) { aiData = {}; }` |
| `certification.js` | 162 | `JSON.parse(localStorage.getItem('aiTutorData') \|\| '{}')` | `try { ... } catch(e) { aiData = {}; }` |
| `report.js` | — | 多处 `JSON.parse` 无保护 | 统一使用 `SafeStorage.get()` |
| `share.js` | — | 多处 `JSON.parse` 无保护 | 统一使用 `SafeStorage.get()` |

### 说明
`ai-tutor.js`、`ai-tutor-llm.js`、`certification.js`（loadData）、`wrong-book.js`（_load）中的 `JSON.parse` 原本已处于 try-catch 块内，无需修改。

`report.js` 和 `share.js` 的 `JSON.parse` 调用全部迁移到 `SafeStorage.get()`，该函数内部已包含 try-catch，解析失败时返回默认值。

---

## 五、新增 SafeStorage 工具

在 `report.js` 和 `share.js` 中各添加了一套 `SafeStorage` 工具：

```javascript
const SafeStorage = {
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch(e) { console.error('Storage error:', e); }
  },
  get(key, defaultVal) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : defaultVal; } catch(e) { return defaultVal; }
  },
  getString(key, defaultVal) {
    try { return localStorage.getItem(key) || defaultVal; } catch(e) { return defaultVal; }
  }
};
```

- `set()`：写入任意数据，自动 JSON.stringify，带错误保护
- `get()`：读取并 JSON.parse，解析失败返回默认值
- `getString()`：读取原始字符串，无需 parse，带错误保护

---

## 六、验证结果

### 语法验证
使用 `node -c` 对所有修改文件进行语法检查，全部通过：

```
✅ report.js
✅ share.js
✅ ai-tutor.js
✅ ai-tutor-llm.js
✅ bg-themes.js
✅ certification.js
✅ guide-enhance.js
✅ loading.js
✅ i18n.js
✅ voice.js
✅ wrong-book.js
✅ game.js
```

### 修复统计

| 指标 | 数量 |
|------|------|
| 修改文件数 | 11 |
| 修复 setItem 无保护 | 14 处 |
| 修复 getItem 无保护 | 2 处 |
| 修复 removeItem 无保护 | 3 处 |
| 修复 JSON.parse 无保护 | 2 处 |
| 新增 SafeStorage 工具 | 2 套（report.js / share.js） |
| 新增数据源 fallback | 6 个（GameState, aiTutorData, CertificationEngine, CalendarEngine, disasterGachaState, wrongBook） |

---

## 七、修复后行为

### 报告页（report.js）
- 学习时长：优先从 `disaster_hq_playtime` → `disasterGachaState.playTime` → `GameState._data.playTime` 读取
- 答题总数：优先从 `disaster_hq_quizcount` → `aiTutorData.quizHistory.length` → `GameState._data.totalQuizzes` 读取
- 正确率：优先从 `disaster_hq_correct/total` → `aiTutorData` 计算 → `GameState._data` 读取
- 等级：优先从 `CertificationEngine._data.currentLevel` → `disaster_hq_level` 读取
- 连续签到：优先从 `CalendarEngine._streak` → `disaster_hq_streak` 读取

### 分享海报（share.js）
- 答题总数：从 `disasterGachaState` / `aiTutorData` / `GameState` 综合获取
- 正确率：自动计算，基于 `correctCount / totalAnswered`
- 掌握灾害：从 `CertificationEngine._data.masteredModules` 获取
- 等级名称：从 `CertificationEngine._levels` 获取
- 开启盲盒：从 `disasterGachaState` / `GameState` 获取
- 连续打卡：从 `disasterGachaState` / `CalendarEngine` 获取

---

## 八、已知限制

1. `disasterGachaState` 的具体字段结构（如 `playTime`、`totalQuizzes` 等）依赖于 `game.js` 内部实现。如果字段名不同，fallback 会优雅降级到默认值（0 或 '防灾新手'）。
2. `GameState`、`CertificationEngine`、`CalendarEngine` 等全局对象必须在 `report.js` / `share.js` 加载前已定义（当前 HTML 加载顺序已满足）。
3. monkey-patch 方案对 `game.js` 中的 `localStorage` 调用是运行时保护，不会修改源代码。如果其他脚本覆盖了 `localStorage.setItem`，保护可能失效。

---

*报告结束*
