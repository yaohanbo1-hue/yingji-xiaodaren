# 应急小达人 v55 — 未修复 High 级别 Bug 深度检查报告

**检查日期**: 2026-06-14  
**检查范围**: 根目录 `sw-v55.js`、`game-engines.js` 及全项目 `.js` 文件  
**检查人**: 高级 QA 专家

---

## 按优先级排序的待修复清单

| 优先级 | Bug | 文件 | 影响 | 状态 |
|--------|-----|------|------|------|
| 🔴 P0 | Service Worker `addAll()` 安装失败 | `sw-v55.js` | 离线缓存失效，PWA 无法安装 | **未修复** |
| 🔴 P0 | `setInterval`/`setTimeout` 定时器泄漏（8+引擎） | `game-engines.js` | 内存/CPU 持续恶化，游戏卡顿 | **未修复** |
| 🟠 P1 | `allEngines` 数组重复引用 | `game-engines.js` | 冗余引用，可能导致初始化异常 | **未修复** |
| 🟠 P1 | `document.write` + `window.open` 注入用户输入 | `wrong-book.js` | XSS 风险，错题数据可注入脚本 | **未修复** |
| 🟡 P2 | 洗牌算法分布不均 | `game-engines.js` (8处) | 题目/卡牌顺序有偏，影响公平性 | **未修复** |

---

## 🔴 P0 — Bug 1: Service Worker `cache.addAll()` 错误处理策略

### 问题描述
`sw-v55.js` 第 82–90 行中，`cache.addAll(STATIC_ASSETS)` 在 `event.waitUntil` 内部执行。如果 `STATIC_ASSETS` 列表中**任一资源**返回 404 或 非 200 状态码，`addAll()` 的 Promise 会立即 reject，导致整个 `event.waitUntil` 的 Promise 失败。虽然 `.catch()` 捕获了错误并打印日志，但 `skipWaiting()` 不会执行，Service Worker 安装被标记为失败，离线缓存策略完全失效。

### 代码位置
- `sw-v55.js` 第 81–91 行

```javascript
// 当前代码（有缺陷）
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(STATIC_ASSETS);  // ← 任一 404 → 全失败
    }).then(function() {
      return self.skipWaiting();
    }).catch(function(err) {
      console.log('[SW] 缓存失败（部分资源可能不存在）:', err);
    })
  );
});
```

### 修复建议
将 `addAll` 拆分为逐资源缓存，使用 `Promise.all` + 单个资源的 `.catch()` 来跳过失败项，确保 `skipWaiting()` 始终执行：

```javascript
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return Promise.all(
        STATIC_ASSETS.map(function(url) {
          return cache.add(url).catch(function(err) {
            console.warn('[SW] 跳过缓存失败:', url, err);
          });
        })
      );
    }).then(function() {
      return self.skipWaiting();
    })
  );
});
```

---

## 🔴 P0 — Bug 2: 8+ 游戏引擎存在 `setInterval`/`setTimeout` 泄漏

### 问题描述
`game-engines.js` 中多个游戏引擎在 `init()`/`start()`/`showQuestion()` 时创建 `setInterval` 或 `setTimeout`，但**在重新初始化前不清理旧定时器**。当用户快速切换游戏模式、重复进入游戏或中途退出时，旧定时器继续运行，造成内存泄漏和 CPU 持续占用。

### 泄漏引擎清单

| 引擎 | 文件 | 行号 | 泄漏点 | 清理状态 |
|------|------|------|--------|----------|
| `QuizEngine` | `game-engines.js` | 718 | `_resetState()` 不清理 `timerInterval` | ❌ 未清理 |
| `PKEngine` | `game-engines.js` | 666 | `start()` 不清理旧 `timerInterval` | ❌ 未清理 |
| `KnowledgeRaceEngine` | `game-engines.js` | 437 | `init()` 不清理旧 `timer` | ❌ 未清理 |
| `TimeEscapeEngine` | `game-engines.js` | 939 | `init()` 不清理旧 `timer` | ❌ 未清理 |
| `TimedChallengeEngine` | `game-engines.js` | 952 | `init()` 不清理旧 `_timer` | ❌ 未清理 |
| `MemoryCardEngine` | `game-engines.js` | 476 | `init()` 不清理旧 `timer` | ❌ 未清理 |
| `DisasterQuizGame` | `game-engines.js` | 307 | `init()` 不清理旧 `_timer` | ❌ 未清理 |
| `ReactionGameV2` | `game-engines.js` | 744 | `init()` 不清理旧 `_timer` | ❌ 未清理 |
| `i18n.js` | `i18n.js` | 376 | `checkInterval` 无 `clearInterval` | ❌ 未清理 |

### 对比修复版本
`yingji-xiaodaren/game-engines.js` 中的 `QuizEngine._resetState()` 已添加 `this.timerInterval && clearInterval(this.timerInterval)`，但根目录版本**未同步**。

### 修复建议（统一模式）
在每个引擎的 `init()`/`start()`/`_resetState()` 开头添加清理逻辑：

```javascript
// 统一修复模板
init() {
  // 1. 先清理旧定时器
  if (this.timerInterval) { clearInterval(this.timerInterval); this.timerInterval = null; }
  if (this._timer) { clearInterval(this._timer); this._timer = null; }
  if (this.targetTimeout) { clearTimeout(this.targetTimeout); this.targetTimeout = null; }
  
  // 2. 重置状态
  this.active = true;
  // ... 原有逻辑
}

// 退出/销毁时统一清理
destroy() {
  if (this.timerInterval) { clearInterval(this.timerInterval); this.timerInterval = null; }
  if (this._timer) { clearInterval(this._timer); this._timer = null; }
  if (this.targetTimeout) { clearTimeout(this.targetTimeout); this.targetTimeout = null; }
  this.active = false;
}
```

---

## 🟠 P1 — Bug 3: `allEngines` 数组存在重复引用

### 问题描述
`game-engines.js` 第 1098 行定义的 `allEngines` 数组中，`TimeEscapeEngine` 和 `PrecisionEngine` 被重复引用了两次。这会导致某些自动化初始化/扫描逻辑中对这两个引擎执行两次操作，可能产生重复事件监听或数据初始化错误。

### 代码位置
- `game-engines.js` 第 1098 行
- `js/engines/allEngines.js` 第 11 行（同样问题）

```javascript
// 当前代码（有重复）
const allEngines = [
  // ... 前面省略 ...
  TimeEscapeEngine, PrecisionEngine, StoryChallengeEngine,
  TimeEscapeEngine, PrecisionEngine, StoryAdventureEngine,  // ← 重复！
  GuideEngine
];
```

### 修复建议
删除重复项：

```javascript
const allEngines = [
  // ... 前面省略 ...
  TimeEscapeEngine, PrecisionEngine, StoryChallengeEngine,
  StoryAdventureEngine,  // 删除重复的两个
  GuideEngine
];
```

---

## 🟠 P1 — Bug 4: `document.write` + `window.open` 存在 XSS 风险

### 问题描述
多处使用 `window.open('', '_blank')` + `document.write(html)` 的模式。其中 `wrong-book.js` 的打印功能将用户错题数据（`item.question`、`item.correctAnswer`、`item.explanation`）直接拼接到 HTML 字符串中写入新窗口。如果这些数据中包含 `<script>` 标签或事件处理器，会导致**反射型 XSS**。

### 代码位置

| 文件 | 行号 | 风险等级 | 说明 |
|------|------|----------|------|
| `wrong-book.js` | 284–317 | 🔴 **High** | `item.question` / `item.explanation` 来自用户数据，直接拼接 HTML |
| `cert-enhance.js` | 254–255 | 🟡 Low | `level.name` 来自内部静态定义，风险可控 |
| `report.js` | 443–448 | 🟡 Low | 使用 `canvas.toDataURL()`，无用户输入 |
| `report.js` | 498–503 | 🟡 Low | 同上 |

### 高风险代码（`wrong-book.js`）

```javascript
// 第 284–317 行
var win = window.open('', '_blank');
var html = '<html><head><title>错题本打印</title><style>...';
html += '<div class="question">' + item.question + '</div>';        // ← 用户输入
if (item.correctAnswer) html += '<div class="answer">' + item.correctAnswer + '</div>'; // ← 用户输入
if (item.explanation) html += '<div class="exp">' + item.explanation + '</div>';         // ← 用户输入
win.document.write(html);  // ← XSS 注入点
```

### 修复建议
对用户输入进行 HTML 转义后再拼接：

```javascript
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// 使用
html += '<div class="question">' + escapeHtml(item.question) + '</div>';
html += '<div class="answer">' + escapeHtml(item.correctAnswer) + '</div>';
html += '<div class="exp">' + escapeHtml(item.explanation) + '</div>';
```

同时建议将 `window.open` + `document.write` 模式替换为 Blob URL + `iframe` 或 `print()` API，避免 `document.write` 的同步写入风险。

---

## 🟡 P2 — Bug 5: 洗牌算法使用 `Math.random() - 0.5` 分布不均

### 问题描述
项目中多处使用 `arr.sort(() => Math.random() - 0.5)` 进行洗牌。该算法不是真正的 Fisher-Yates 洗牌，会导致**排序结果分布严重不均**——某些排列的概率远高于其他排列，影响题目顺序和卡牌抽取的公平性。

> 参考：`Array.prototype.sort` 的排序算法（V8 通常用 TimSort/QuickSort）在比较函数返回随机值时，会产生非均匀分布。JavaScript 的 sort 不是为随机比较设计的。

### 代码位置（`game-engines.js` 根目录版本）

| 行号 | 引擎/方法 | 代码片段 |
|------|-----------|----------|
| 34 | `AdaptiveDifficulty.selectCards` | `shuffle = arr => [...arr].sort(() => Math.random() - 0.5)` |
| 60 | `BattleEngine.init` | `[...ALL_CARDS].sort(() => Math.random() - 0.5)` |
| 437 | `KnowledgeRaceEngine.init` | `cards.sort(function(){return Math.random()-.5})` |
| 476 | `MemoryCardEngine._generateCards` | `pairs.concat(pairs).sort(function(){return Math.random()-.5})` |
| 666 | `PKEngine.start` | `[...ALL_CARDS].sort(() => Math.random() - 0.5)` |
| 705 | `PrecisionEngine.init` | `cards.sort(function(){return Math.random()-.5})` |
| 744 | `ReactionGameV2.init` | `cards.slice().sort(function(){return Math.random()-.5})` |
| 939 | `TimeEscapeEngine.init` | `cards.sort(function(){return Math.random()-.5})` |

### 正确示例（项目中已有）
`DailyChallengeEngine._generateDaily`（第 255 行）和 `MemoryGameV2._init`（第 489 行）已使用正确的 Fisher-Yates 洗牌：

```javascript
for (i = deck.length - 1; i > 0; i--) {
  var j = Math.floor(Math.random() * (i + 1));
  var t = deck[i];
  deck[i] = deck[j];
  deck[j] = t;
}
```

### 修复建议
统一替换为 Fisher-Yates 洗牌：

```javascript
function shuffleArray(arr) {
  const a = arr.slice(); // 不修改原数组
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 使用示例
const shuffled = shuffleArray(ALL_CARDS.filter(c => c.disaster !== 'equip'));
```

---

## 修复优先级与推荐排期

| 阶段 | 修复内容 | 预计工作量 | 验证方式 |
|------|----------|------------|----------|
| **Phase 1**（立即） | SW `addAll` 逐资源容错 | 30 min | DevTools → Application → Service Workers，模拟 404 资源 |
| **Phase 1**（立即） | 8+ 引擎定时器统一清理 | 1–2 h | 反复切换游戏模式，检查 DevTools Performance → CPU 占用是否回落 |
| **Phase 2**（本周） | `allEngines` 去重 | 10 min | 全局搜索 `allEngines` 数组确认无重复 |
| **Phase 2**（本周） | `wrong-book.js` HTML 转义 | 30 min | 在错题数据中加入 `<script>alert(1)</script>`，确认打印时无弹窗 |
| **Phase 3**（本周） | 8 处 `sort` 洗牌替换为 Fisher-Yates | 1 h | 单元测试统计分布均匀性（χ² 检验） |

---

## 附录：检查工具与方法论

1. **SW 检查**: 读取 `sw-v55.js` 第 81–91 行，分析 Promise 链和错误处理
2. **定时器泄漏**: `grep -n "setInterval\|setTimeout" game-engines.js`，逐引擎对比 `clearInterval`/`clearTimeout` 调用
3. **重复引用**: `grep -n "allEngines" game-engines.js`，检查数组成员唯一性
4. **XSS 搜索**: `grep -n "document\.write\|window\.open" *.js`，追溯用户输入拼接路径
5. **洗牌算法**: `grep -n "Math\.random() - 0.5\|Math.random()-.5" *.js`，统计所有使用位置

---

*报告结束。建议立即启动 Phase 1 修复，以解决 P0 级别的安装失败和内存泄漏问题。*
