# Inspector_Storage 报告 — 应急小达人 LocalStorage 审计

> **检查时间**: 2026-06-19 14:17 CST  
> **检查目录**: `C:\Users\hambu\Documents\kimi\workspace\yingji-xiaodaren`  
> **检查范围**: 所有 `.js`, `.html`, `.css` 文件中的 `localStorage` 使用  
> **检查专家**: Inspector_Storage

---

## 1. 执行摘要

本次审计共检查 **17 个文件**，发现 **25 个 localStorage key** 被使用。  
**发现问题**: 12 个（其中 P0 严重 2 个，P1 高 3 个，P2 中 3 个，P3 低 4 个）。

最严重的问题是 **report.js 和 share.js 的数据源断裂** — 这两个模块读取的 `localStorage key` 没有任何代码进行写入，导致学习报告和分享海报功能永远只能显示空数据/默认值。

---

## 2. LocalStorage 使用统计

### 2.1 按文件统计

| # | 文件 | 使用次数 | 存储的 Key | 风险等级 |
|---|------|---------|-----------|---------|
| 1 | `game.js` | 3 写入 + 大量读取 | `disasterGachaState`, `disasterSeason`, `tutorialDone` | ⚠️ 中 |
| 2 | `ai-tutor.js` | 1 写入 + 1 读取 | `aiTutorData` | 🔴 高 |
| 3 | `ai-tutor-llm.js` | 1 写入 + 2 读取 | `aitutor_profile`, `aiTutorData` | 🔴 高 |
| 4 | `certification.js` | 1 写入 + 1 读取 | `certificationData`, `aiTutorData` (读) | 🔴 高 |
| 5 | `bg-themes.js` | 1 写入 + 1 读取 | `bg_theme` | 🟡 低 |
| 6 | `i18n.js` | 1 写入 + 1 读取 | `disasterHQ_language` | 🟡 低 |
| 7 | `loading.js` | 1 写入 | `disaster_hq_loading_shown` | 🟡 低 |
| 8 | `guide-enhance.js` | 1 写入 + 1 读取 + 2 删除 | `disaster_hq_guide_completed` | 🟡 低 |
| 9 | `voice.js` | 3 写入 + 3 读取 | `disaster_hq_voice_enabled`, `disaster_hq_voice_rate`, `disaster_hq_voice_pitch` | 🟡 低 |
| 10 | `wrong-book.js` | 1 写入 + 1 读取 | `disaster_hq_wrong_book` | 🔴 高 |
| 11 | `report.js` | 12 读取（**无写入**） | `disaster_hq_*`, `play_time`, `quiz_count`, `correct_count`, `total_count`, `player_level`, `login_streak`, `achievements` | 🔴 严重 |
| 12 | `share.js` | 3 读取（**无写入**） | `disasterHQ_stats`, `disasterHQ_blindbox`, `disasterHQ_checkin` | 🔴 严重 |
| 13 | `cache-clear.html` | 1 清除 | 全部 `localStorage` | 🟡 低 |
| 14 | `encyclopedia_extra.js` | 仅注释提及 | — | — |
| 15 | `bg-themes.css` | 仅注释提及 | — | — |
| 16 | `all-styles.css` | 仅注释提及 | — | — |
| 17 | `index.html` | 仅注释提及 | — | — |

### 2.2 按 Key 统计

| Key | 写入文件 | 读取文件 | 数据类型 | 说明 |
|-----|---------|---------|---------|------|
| `disasterGachaState` | `game.js` | `game.js` | JSON 对象 | 游戏主状态（金币、等级、卡牌等） |
| `disasterSeason` | `game.js` | `game.js` | JSON 对象 | 赛季数据 |
| `tutorialDone` | `game.js` | `game.js` | 字符串 | 教程完成标记 |
| `aiTutorData` | `ai-tutor.js` | `ai-tutor.js`, `certification.js`, `ai-tutor-llm.js` | JSON 对象 | AI 导师答题历史、掌握度 |
| `aitutor_profile` | `ai-tutor-llm.js` | `ai-tutor-llm.js` | JSON 对象 | 用户画像（兴趣、弱点） |
| `certificationData` | `certification.js` | `certification.js` | JSON 对象 | 认证等级、证书 |
| `bg_theme` | `bg-themes.js` | `bg-themes.js` | 字符串 | 背景主题偏好 |
| `disasterHQ_language` | `i18n.js` | `i18n.js` | 字符串 | 语言偏好（zh/en） |
| `disaster_hq_loading_shown` | `loading.js` | `loading.js` | 字符串 | 加载动画已显示标记 |
| `disaster_hq_guide_completed` | `guide-enhance.js` | `guide-enhance.js` | 字符串 | 新手引导完成标记 |
| `disaster_hq_voice_enabled` | `voice.js` | `voice.js` | 字符串 | 语音开关（`'true'`/`'false'`） |
| `disaster_hq_voice_rate` | `voice.js` | `voice.js` | 字符串 | 语速（浮点数字符串） |
| `disaster_hq_voice_pitch` | `voice.js` | `voice.js` | 字符串 | 音调（浮点数字符串） |
| `disaster_hq_wrong_book` | `wrong-book.js` | `wrong-book.js` | JSON 数组 | 错题数据 |
| `disaster_hq_name` | **无** | `report.js` | — | ⚠️ **从未写入** |
| `disaster_hq_playtime` | **无** | `report.js` | — | ⚠️ **从未写入** |
| `disaster_hq_totalTime` | **无** | `report.js` | — | ⚠️ **从未写入** |
| `play_time` | **无** | `report.js` | — | ⚠️ **从未写入** |
| `disaster_hq_quizcount` | **无** | `report.js` | — | ⚠️ **从未写入** |
| `disaster_hq_totalQuizzes` | **无** | `report.js` | — | ⚠️ **从未写入** |
| `quiz_count` | **无** | `report.js` | — | ⚠️ **从未写入** |
| `disaster_hq_correct` | **无** | `report.js` | — | ⚠️ **从未写入** |
| `correct_count` | **无** | `report.js` | — | ⚠️ **从未写入** |
| `disaster_hq_total` | **无** | `report.js` | — | ⚠️ **从未写入** |
| `total_count` | **无** | `report.js` | — | ⚠️ **从未写入** |
| `disaster_hq_category_stats` | **无** | `report.js` | — | ⚠️ **从未写入** |
| `disaster_hq_achievements` | **无** | `report.js` | — | ⚠️ **从未写入** |
| `achievements` | **无** | `report.js` | — | ⚠️ **从未写入** |
| `disaster_hq_level` | **无** | `report.js` | — | ⚠️ **从未写入** |
| `player_level` | **无** | `report.js` | — | ⚠️ **从未写入** |
| `disaster_hq_streak` | **无** | `report.js` | — | ⚠️ **从未写入** |
| `login_streak` | **无** | `report.js` | — | ⚠️ **从未写入** |
| `disasterHQ_stats` | **无** | `share.js` | — | ⚠️ **从未写入** |
| `disasterHQ_blindbox` | **无** | `share.js` | — | ⚠️ **从未写入** |
| `disasterHQ_checkin` | **无** | `share.js` | — | ⚠️ **从未写入** |

---

## 3. 发现的问题

### 🔴 P0 — 严重

#### BUG-001: report.js 和 share.js 数据源断裂（功能完全失效）

**问题描述**:  
`report.js` 和 `share.js` 读取的 **18 个 localStorage key 没有任何代码写入**。这导致：
- 学习报告功能无法显示真实游戏数据（始终显示默认值：学习时长 0 分钟、答题数 0、正确率 0%、等级 1、签到 0 天）
- 分享海报功能无法显示真实数据（始终显示空数据）

**具体证据**:
```javascript
// report.js (lines 22, 38-40, 49-51, 56-59, 82, 113-114, 130-131, 136-137)
studentName: localStorage.getItem('disaster_hq_name') || '防灾小学员',
// ... 这些 key 在代码库中没有任何 setItem 调用

// share.js (lines 142, 150, 156)
const saved = localStorage.getItem('disasterHQ_stats');
const blindbox = localStorage.getItem('disasterHQ_blindbox');
const checkin = localStorage.getItem('disasterHQ_checkin');
// ... 这些 key 同样没有任何 setItem 调用
```

**影响**: 学习报告和分享海报功能完全失效，用户看到的永远是空数据。  
**修复建议**: 见第 4 节「修复建议」。

---

#### BUG-002: 多处 `localStorage.setItem` 缺少 `try-catch` 保护

**问题描述**:  
以下文件中的 `setItem` 调用没有 `try-catch` 包裹，在以下场景会抛出未捕获异常：
- 浏览器隐私模式（部分浏览器禁用 localStorage）
- 存储空间已满（`QuotaExceededError`）
- 用户手动禁用 localStorage

**受影响的文件和代码**:

| 文件 | 行号 | 代码 |
|------|------|------|
| `ai-tutor.js` | 60 | `localStorage.setItem('aiTutorData', JSON.stringify(this._data));` |
| `certification.js` | 92 | `localStorage.setItem('certificationData', JSON.stringify(this._data));` |
| `bg-themes.js` | 45 | `localStorage.setItem('bg_theme', theme);` |
| `i18n.js` | 344 | `localStorage.setItem('disasterHQ_language', lang);` |
| `loading.js` | 84 | `localStorage.setItem('disaster_hq_loading_shown', '1');` |
| `guide-enhance.js` | 148 | `localStorage.removeItem(this._storageKey);` + `localStorage.setItem(...)` |
| `guide-enhance.js` | 155 | `localStorage.removeItem(this._storageKey);` |
| `guide-enhance.js` | 448 | `localStorage.setItem(this._storageKey, '1');` |
| `guide-enhance.js` | 458 | `localStorage.removeItem(this._storageKey);` |
| `voice.js` | 67 | `localStorage.setItem('disaster_hq_voice_enabled', this._enabled);` |
| `voice.js` | 81 | `localStorage.setItem('disaster_hq_voice_rate', this._rate);` |
| `voice.js` | 87 | `localStorage.setItem('disaster_hq_voice_pitch', this._pitch);` |

**对比（良好实践）**:  
`game.js` 和 `wrong-book.js` 的 `save()` 方法使用了 `try-catch`：
```javascript
// game.js (良好示例)
save(){try{localStorage.setItem("disasterGachaState",JSON.stringify(this._data))}catch(e){}}

// wrong-book.js (良好示例)
_save() {
  try {
    localStorage.setItem(this._storageKey, JSON.stringify(this._wrongItems));
  } catch (e) {
    console.warn('错题本保存失败');
  }
}
```

**影响**: 在隐私模式或存储满时，页面可能崩溃或功能异常。  
**修复建议**: 统一使用 `try-catch` 包裹所有 `localStorage.setItem/removeItem` 调用。

---

### 🟠 P1 — 高

#### BUG-003: 存储空间溢出无处理

**问题描述**:  
没有任何代码检测 `QuotaExceededError` 或主动清理过期数据。  
以下数据可能无限增长：

| 数据 | 文件 | 当前限制 | 风险 |
|------|------|---------|------|
| 错题本 | `wrong-book.js` | 无限制 | 用户答错越多，数据越大 |
| AI 导师对话历史 | `ai-tutor.js` | 仅 `quizHistory` 截断到 500 条 | `_chatHistory` 截断到 20 条，但 `recommendations` 无限制 |
| 赛季历史 | `game.js` | 无限制 | `SeasonEngine._data.history` 可能无限增长 |
| 盲盒历史 | `game.js` | 无限制 | `blindboxHistory` 数组可能无限增长 |
| 签到记录 | `game.js` | 无限制 | `checkinDates` 数组可能无限增长 |
| 日记 | `game.js` | 无限制 | `diary` 数组可能无限增长 |

**影响**: 长期使用后 localStorage 可能达到 5-10MB 上限，导致所有写入失败。  
**修复建议**: 为所有数组类型数据设置大小上限和自动淘汰策略。

---

#### BUG-004: JSON 解析缺少错误保护

**问题描述**:  
`report.js` 中多处 `JSON.parse` 没有 `try-catch` 包裹：

```javascript
// report.js:82-91
var stats = localStorage.getItem('disaster_hq_category_stats');
if (stats) {
  var parsed = JSON.parse(stats);  // 无 try-catch
  // ...
}

// report.js:113-117
var data = localStorage.getItem('disaster_hq_achievements') || localStorage.getItem('achievements');
if (data) {
  achievements = JSON.parse(data);  // 无 try-catch
}
```

虽然这些 key 当前没有写入（BUG-001），但如果未来有代码写入损坏的数据，会导致整个报告功能崩溃。

**影响**: 损坏的 JSON 数据会导致页面崩溃。  
**修复建议**: 所有 `JSON.parse` 都使用 `try-catch` 包裹。

---

#### BUG-005: 数据格式不一致，缺乏统一序列化策略

**问题描述**:  
项目中存在多种数据存储格式，缺乏统一规范：

| 类型 | 示例 | 问题 |
|------|------|------|
| JSON 字符串 | `JSON.stringify({...})` | game.js, ai-tutor.js 等 |
| 布尔字符串 | `'true'` / `'false'` | voice.js 的 `disaster_hq_voice_enabled` |
| 数字字符串 | `'1'` / `'1.5'` | loading.js, voice.js |
| 原始字符串 | `'zh'` | i18n.js |
| 直接存数字 | 无 | 无模块直接存数字 |

`voice.js` 中读取布尔值的方式：
```javascript
// voice.js:33
this._enabled = localStorage.getItem('disaster_hq_voice_enabled') === 'true';
// 如果值不是 'true'（如 '1' 或 'yes'），会错误地判断为 false
```

**影响**: 数据格式不一致增加维护难度，容易导致类型转换错误。  
**修复建议**: 统一使用 JSON 序列化所有非字符串数据。

---

### 🟡 P2 — 中

#### BUG-006: 缺少数据版本迁移机制（除 game.js 外）

**问题描述**:  
只有 `game.js` 有版本控制机制（`_version:2` + `_ensureDefaults()`），其他模块完全没有：

| 模块 | 是否有版本控制 | 风险 |
|------|--------------|------|
| `game.js` | ✅ `_version:2` | 良好 |
| `ai-tutor.js` | ❌ 无 | 数据结构变更会导致 `JSON.parse` 后缺少字段 |
| `certification.js` | ❌ 无 | 同上 |
| `wrong-book.js` | ❌ 无 | 同上 |
| `ai-tutor-llm.js` | ❌ 无 | 同上 |
| `share.js` | ❌ 无 | 同上 |
| `report.js` | ❌ 无 | 同上 |

**影响**: 当模块升级数据结构时，旧版本数据会导致功能异常或崩溃。  
**修复建议**: 所有使用 JSON 存储的模块都应增加 `version` 字段和 `_migrateData()` 方法。

---

#### BUG-007: 隐私数据存储未加密

**问题描述**:  
以下隐私数据以明文形式存储在 localStorage 中：

| 数据 | 文件 | 敏感程度 |
|------|------|---------|
| 用户画像（兴趣、弱点、聊天次数） | `ai-tutor-llm.js` (`aitutor_profile`) | 中 |
| 完整答题历史（包含正确/错误记录） | `ai-tutor.js` (`aiTutorData`) | 中 |
| 错题记录（薄弱知识点） | `wrong-book.js` (`disaster_hq_wrong_book`) | 中 |
| 认证证书数据 | `certification.js` (`certificationData`) | 低 |
| 游戏行为统计 | `game.js` (`disasterGachaState`) | 低 |

**影响**: 虽然这不是金融应用，但用户的学习数据（尤其是弱点分析）属于隐私信息。在同一台电脑上，其他网页脚本或浏览器扩展可以读取这些数据。  
**修复建议**: 对于敏感数据，考虑使用简单的加密/混淆（如 Base64 + 简单异或）。对于非敏感数据，保持现状即可。

---

#### BUG-008: 缺少内置数据重置/清理功能

**问题描述**:  
游戏内没有提供"重置所有数据"的功能。用户如果想清除数据，只能：
1. 手动在浏览器控制台执行 `localStorage.clear()`
2. 使用外部的 `cache-clear.html` 工具

`cache-clear.html` 是一个独立的页面，不是游戏内置功能，且其调用 `localStorage.clear()` 会清除同一域下 **所有** 数据，可能误伤其他应用。

**影响**: 用户无法在游戏内重置进度，体验不佳。  
**修复建议**: 在设置页面添加"重置所有数据"按钮，使用确认对话框，并精确删除相关 key 而非 `clear()`。

---

### 🟢 P3 — 低

#### BUG-009: cache-clear.html 的 `localStorage.clear()` 过于粗暴

**问题描述**:  
`cache-clear.html:36` 调用了 `localStorage.clear()`，这会清除同一域下的所有数据，包括：
- 用户在其他页面保存的数据
- 其他应用的数据
- 浏览器的某些设置

```javascript
// cache-clear.html:36
localStorage.clear();
```

**影响**: 可能误删其他应用数据。  
**修复建议**: 只删除与本应用相关的 key，而非全部清除。

---

#### BUG-010: 编码/字符问题

**问题描述**:  
`game.js` 中存在一些编码异常的字符（乱码），这些可能来自文件编码问题或压缩工具的问题。例如在某些字符串中出现了 `ͭ` 等乱码字符。虽然这些主要在注释或不常用的字符串中，但可能导致某些字符串比较失败。

**影响**: 低概率的功能异常。  
**修复建议**: 检查文件编码（应使用 UTF-8），重新保存文件。

---

#### BUG-011: `report.js` 中的数据冗余与「幽灵 Key」

**问题描述**:  
`report.js` 为同一类数据提供了多个 fallback key（例如 `disaster_hq_playtime` → `disaster_hq_totalTime` → `play_time`），但实际上这些 key 都没有被写入。这种设计意图可能是兼容旧版本数据，但由于没有任何代码写入这些 key，这些 fallback 逻辑永远不会被触发，只会增加代码复杂度和维护成本。

**影响**: 代码维护困难，容易误导开发者。  
**修复建议**: 移除所有未被使用的 fallback key，直接从 `GameState` 主数据读取。

---

#### BUG-012: `voice.js` 的 `parseFloat` 无异常处理

**问题描述**:  
```javascript
// voice.js:34-35
this._rate = parseFloat(localStorage.getItem('disaster_hq_voice_rate')) || 1.0;
this._pitch = parseFloat(localStorage.getItem('disaster_hq_voice_pitch')) || 1.0;
```

如果 localStorage 中存入了非数字字符串（如 `'abc'`），`parseFloat` 返回 `NaN`，`|| 1.0` 可以正确处理。但如果存入 `'null'` 或 `'undefined'`，`parseFloat` 返回 `NaN`，`|| 1.0` 也能处理。所以这个问题实际上不太严重。

**影响**: 极低。  
**修复建议**: 可保持现状，或显式使用 `isNaN()` 检查。

---

## 4. 修复建议

### 4.1 立即修复（P0）

#### 修复 BUG-001: 统一数据源

**方案 A（推荐）**: 让 `report.js` 和 `share.js` 直接从 `GameState` 主数据读取。

```javascript
// report.js 修改示例
_collectData() {
  var data = {
    date: new Date().toLocaleDateString('zh-CN'),
    studentName: (GameState._data && GameState._data.name) || '防灾小学员',
    totalTime: this._getPlayTime(),
    totalQuizzes: this._getQuizCount(),
    correctRate: this._getCorrectRate(),
    categoryStats: this._getCategoryStats(),
    weakAreas: this._getWeakAreas(),
    achievements: this._getAchievements(),
    wrongBookStats: this._getWrongBookStats(),
    level: this._getLevel(),
    streak: this._getStreak()
  };
  return data;
},

_getPlayTime() {
  // 从 GameState 读取实际数据
  var stats = GameState._data && GameState._data.stats;
  var minutes = (stats && stats.gamesPlayed) || 0; // 或计算实际时间
  // ... 后续计算保持不变
},

_getQuizCount() {
  var stats = GameState._data && GameState._data.stats;
  return (stats && (stats.correct + stats.wrong)) || 0;
},

_getCorrectRate() {
  var stats = GameState._data && GameState._data.stats;
  var correct = (stats && stats.correct) || 0;
  var total = (stats && (stats.correct + stats.wrong)) || 0;
  return total === 0 ? 0 : Math.round(correct / total * 100);
},

_getLevel() {
  return (GameState._data && GameState._data.level) || 1;
},

_getStreak() {
  return (GameState._data && GameState._data.checkinStreak) || 0;
}
```

**方案 B**: 在 `game.js` 的 `GameState.save()` 中同时写入 `report.js` 和 `share.js` 期望的 key。不推荐，因为这会重复存储数据，浪费空间。

---

#### 修复 BUG-002: 统一添加 `try-catch`

建议创建一个通用的 `safeLocalStorage` 工具函数：

```javascript
// 在 game.js 或一个独立的 utils.js 中
const SafeStorage = {
  set(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      console.warn('localStorage setItem failed:', key, e);
      return false;
    }
  },
  
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn('localStorage getItem failed:', key, e);
      return null;
    }
  },
  
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.warn('localStorage removeItem failed:', key, e);
      return false;
    }
  },
  
  setJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn('localStorage setJSON failed:', key, e);
      if (e.name === 'QuotaExceededError') {
        // 可选：触发数据清理
        this._handleQuotaExceeded();
      }
      return false;
    }
  },
  
  getJSON(key, defaultValue) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : defaultValue;
    } catch (e) {
      console.warn('localStorage getJSON failed:', key, e);
      return defaultValue;
    }
  },
  
  _handleQuotaExceeded() {
    // 触发全局清理事件
    window.dispatchEvent(new CustomEvent('storageQuotaExceeded'));
  }
};
```

然后所有模块改用：
```javascript
// ai-tutor.js 修改示例
saveData() {
  SafeStorage.setJSON('aiTutorData', this._data);
}

loadData() {
  this._data = SafeStorage.getJSON('aiTutorData', this._getEmptyData());
}
```

---

### 4.2 短期修复（P1）

#### 修复 BUG-003: 数据大小限制

为每个可能无限增长的数组添加上限：

```javascript
// wrong-book.js 修改示例
addWrong(...) {
  // ... 现有逻辑 ...
  
  // 限制错题总数，防止存储溢出
  if (this._wrongItems.length > 200) {
    // 移除已掌握的或最早添加的错题
    this._wrongItems = this._wrongItems
      .sort((a, b) => (b.mastered ? 1 : 0) - (a.mastered ? 1 : 0) || a.firstWrongTime - b.firstWrongTime)
      .slice(-200);
  }
  
  this._save();
}

// game.js 修改示例
// 在 GameState.save() 之前截断数据
_ensureLimits() {
  if (this._data.blindboxHistory.length > 100) {
    this._data.blindboxHistory = this._data.blindboxHistory.slice(-100);
  }
  if (this._data.checkinDates.length > 365) {
    this._data.checkinDates = this._data.checkinDates.slice(-365);
  }
  if (this._data.diary.length > 100) {
    this._data.diary = this._data.diary.slice(-100);
  }
  // ... 其他数组
}
```

---

#### 修复 BUG-004: 所有 JSON.parse 添加 try-catch

使用 `SafeStorage.getJSON()` 工具函数即可解决。

---

#### 修复 BUG-005: 统一数据格式

建议所有非字符串数据统一使用 JSON 序列化：

```javascript
// 统一示例
// 存储布尔值
SafeStorage.setJSON('voice_enabled', true);  // 存 true 而非 'true'
// 读取布尔值
this._enabled = SafeStorage.getJSON('voice_enabled', true);

// 存储数字
SafeStorage.setJSON('voice_rate', 1.2);  // 存 1.2 而非 '1.2'
// 读取数字
this._rate = SafeStorage.getJSON('voice_rate', 1.0);
```

对于需要向后兼容的情况：
```javascript
// voice.js 兼容读取
loadSettings() {
  const enabled = SafeStorage.getJSON('voice_enabled_v2', null);
  if (enabled !== null) {
    this._enabled = enabled;
  } else {
    // 兼容旧版本（字符串格式）
    const legacy = SafeStorage.get('disaster_hq_voice_enabled');
    this._enabled = legacy === 'true';
  }
}
```

---

### 4.3 中期修复（P2）

#### 修复 BUG-006: 添加数据版本迁移

每个模块在存储数据时添加 `version` 字段：

```javascript
// ai-tutor.js 修改示例
const DATA_VERSION = 1;

saveData() {
  SafeStorage.setJSON('aiTutorData', {
    ...this._data,
    _version: DATA_VERSION
  });
}

loadData() {
  const saved = SafeStorage.getJSON('aiTutorData', null);
  if (!saved) {
    this._data = this._getEmptyData();
    return;
  }
  
  // 版本迁移
  if (!saved._version || saved._version < DATA_VERSION) {
    this._data = this._migrateData(saved);
  } else {
    this._data = saved;
  }
  
  // 确保字段存在
  if (!this._data.quizHistory) this._data.quizHistory = [];
  if (!this._data.mastery) this._data.mastery = {};
  // ...
}

_migrateData(oldData) {
  const newData = this._getEmptyData();
  // 迁移旧数据字段
  if (oldData.quizHistory) newData.quizHistory = oldData.quizHistory;
  if (oldData.mastery) newData.mastery = oldData.mastery;
  // ... 其他字段
  return newData;
}
```

---

#### 修复 BUG-007: 隐私数据简单加密

对于敏感数据，使用简单的混淆加密（不需要高强度加密，因为只是防止明文暴露）：

```javascript
// 简单混淆工具（可选）
const DataObfuscator = {
  _key: 'yingji-xiaodaren-v1',  // 简单的密钥
  
  encode(data) {
    const json = JSON.stringify(data);
    let result = '';
    for (let i = 0; i < json.length; i++) {
      result += String.fromCharCode(json.charCodeAt(i) ^ this._key.charCodeAt(i % this._key.length));
    }
    return btoa(result);  // Base64 编码
  },
  
  decode(str) {
    try {
      const raw = atob(str);
      let result = '';
      for (let i = 0; i < raw.length; i++) {
        result += String.fromCharCode(raw.charCodeAt(i) ^ this._key.charCodeAt(i % this._key.length));
      }
      return JSON.parse(result);
    } catch (e) {
      return null;
    }
  }
};

// 使用示例
SafeStorage.setItem('aitutor_profile_v2', DataObfuscator.encode(this._userProfile));
this._userProfile = DataObfuscator.decode(SafeStorage.getItem('aitutor_profile_v2')) || {...};
```

**注意**: 这不是真正的安全加密，只是防止明文暴露。如果需要真正的安全，应使用后端存储。

---

#### 修复 BUG-008: 添加内置数据重置功能

在设置页面添加"重置数据"按钮：

```javascript
// 在设置页面添加
function resetAllData() {
  if (!confirm('⚠️ 确定要重置所有数据吗？此操作不可恢复！')) return;
  
  // 精确删除相关 key，不调用 clear()
  const keys = [
    'disasterGachaState', 'disasterSeason', 'tutorialDone',
    'aiTutorData', 'aitutor_profile', 'certificationData',
    'bg_theme', 'disasterHQ_language', 'disaster_hq_loading_shown',
    'disaster_hq_guide_completed', 'disaster_hq_voice_enabled',
    'disaster_hq_voice_rate', 'disaster_hq_voice_pitch',
    'disaster_hq_wrong_book'
  ];
  
  keys.forEach(key => {
    try { localStorage.removeItem(key); } catch (e) {}
  });
  
  alert('✅ 数据已重置，页面将重新加载');
  location.reload();
}
```

---

### 4.4 可选优化（P3）

#### 修复 BUG-009: cache-clear.html 精确删除

```javascript
// cache-clear.html 修改
function forceReload() {
  // 只删除本应用相关的 key
  const appKeys = ['disasterGachaState', 'disasterSeason', /* ... 所有 key ... */];
  appKeys.forEach(key => {
    try { localStorage.removeItem(key); } catch (e) {}
  });
  // 不调用 localStorage.clear()
  // ...
}
```

---

#### 修复 BUG-010: 检查文件编码

确保 `game.js` 使用 UTF-8 编码保存，无 BOM。

---

## 5. 修复优先级建议

| 优先级 | Bug ID | 描述 | 预计工作量 |
|--------|--------|------|-----------|
| 🔴 立即 | BUG-001 | report.js / share.js 数据源断裂 | 2-3 小时 |
| 🔴 立即 | BUG-002 | 添加 try-catch 保护 | 1-2 小时 |
| 🟠 本周 | BUG-003 | 数据大小限制 | 2 小时 |
| 🟠 本周 | BUG-004 | JSON.parse 错误处理 | 1 小时（如用 SafeStorage） |
| 🟠 本周 | BUG-005 | 统一数据格式 | 2-3 小时 |
| 🟡 本月 | BUG-006 | 数据版本迁移 | 3-4 小时 |
| 🟡 本月 | BUG-007 | 隐私数据加密 | 2 小时 |
| 🟡 本月 | BUG-008 | 内置重置功能 | 1-2 小时 |
| 🟢 后续 | BUG-009 ~ 012 | 低优先级问题 | 2-3 小时 |

---

## 6. 附录：推荐的 `SafeStorage` 完整实现

建议创建一个 `safe-storage.js` 文件，供所有模块使用：

```javascript
/**
 * ===========================================================================
 * SafeStorage — 安全的 localStorage 封装
 * ===========================================================================
 * 
 * 功能：
 * 1. 所有操作带 try-catch，防止隐私模式/存储满时崩溃
 * 2. 自动 JSON 序列化/反序列化
 * 3. 存储空间溢出检测和通知
 * 4. 统一的数据版本管理
 * ===========================================================================
 */

const SafeStorage = {
  _enabled: true,
  _quotaWarningFired: false,
  
  init() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, '1');
      localStorage.removeItem(test);
      this._enabled = true;
    } catch (e) {
      this._enabled = false;
      console.warn('localStorage 不可用，数据将不会持久化');
    }
  },
  
  set(key, value) {
    if (!this._enabled) return false;
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      this._handleError(e, key);
      return false;
    }
  },
  
  get(key) {
    if (!this._enabled) return null;
    try {
      return localStorage.getItem(key);
    } catch (e) {
      this._handleError(e, key);
      return null;
    }
  },
  
  remove(key) {
    if (!this._enabled) return false;
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      this._handleError(e, key);
      return false;
    }
  },
  
  setJSON(key, value) {
    if (!this._enabled) return false;
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      this._handleError(e, key);
      return false;
    }
  },
  
  getJSON(key, defaultValue = null) {
    if (!this._enabled) return defaultValue;
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : defaultValue;
    } catch (e) {
      console.warn(`SafeStorage: JSON.parse failed for key "${key}", returning default`);
      return defaultValue;
    }
  },
  
  clear() {
    if (!this._enabled) return false;
    try {
      localStorage.clear();
      return true;
    } catch (e) {
      this._handleError(e, 'clear');
      return false;
    }
  },
  
  getSize() {
    if (!this._enabled) return 0;
    let total = 0;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        total += (key.length + value.length) * 2; // UTF-16 = 2 bytes per char
      }
    } catch (e) {}
    return total;
  },
  
  getUsagePercent() {
    // 估算：通常浏览器限制 5-10MB
    const limit = 5 * 1024 * 1024; // 5MB
    return Math.min(100, Math.round((this.getSize() / limit) * 100));
  },
  
  _handleError(e, key) {
    console.warn(`SafeStorage error for key "${key}":`, e.message);
    if (e.name === 'QuotaExceededError' || e.code === 22) {
      if (!this._quotaWarningFired) {
        this._quotaWarningFired = true;
        window.dispatchEvent(new CustomEvent('storageQuotaExceeded', {
          detail: { key, size: this.getSize() }
        }));
      }
    }
  }
};

SafeStorage.init();
window.SafeStorage = SafeStorage;
```

---

> **报告生成完毕**  
> 共检查文件 17 个，发现 25 个 localStorage key，识别 12 个 bug。  
> 最严重的 2 个 P0 问题会导致报告和分享功能完全失效，建议立即修复。

