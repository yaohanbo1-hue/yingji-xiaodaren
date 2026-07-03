# 应急小达人 - 终极 QA 扫描报告

> **扫描时间**: 2026-07-09  
> **扫描范围**: `C:/Users/hambu/Documents/kimi/workspace`  
> **扫描文件**: JS=70, HTML=3, CSS=29, JSON=12  
> **总 Bug 数**: 40  
> **Critical**: 1 | **High**: 4 | **Medium**: 5 | **Low**: 30

---

## 一、Critical 级别 (1个) — 必须立即修复

### 1. `js/core/optimized/EventDelegate.js:127` — eval() 代码注入风险

| 字段 | 内容 |
|------|------|
| **文件** | `js/core/optimized/EventDelegate.js` |
| **行号** | 127 |
| **类型** | 安全漏洞 (Code Injection) |
| **描述** | `migrateLegacyClicks` 函数中使用 `eval(\`[${rawArgs}]\`)` 解析 onclick 参数。虽然注释声称"仅解析字面量"，但 `rawArgs` 直接来自 HTML 元素的 `onclick` 属性。如果 DOM 被攻击者篡改（如通过 XSS 注入恶意 onclick），`eval()` 可执行任意 JavaScript 代码。|
| **修复建议** | 用 `JSON.parse(\`[${rawArgs}]\`)` 替代 `eval()`，并包裹 `try/catch`。如果参数格式不兼容 JSON，使用自定义安全解析器，只接受数字、字符串、布尔字面量。 |

```javascript
// 修复前（危险）
const args = rawArgs ? eval(`[${rawArgs}]`) : [];

// 修复后（安全）
let args = [];
try {
  args = rawArgs ? JSON.parse(`[${rawArgs}]`) : [];
} catch (_) {
  args = [];
}
```

---

## 二、High 级别 (4个) — 尽快修复

### 2. `index.html:1843` — 引用不存在的 JS 文件 (404)

| 字段 | 内容 |
|------|------|
| **文件** | `index.html` |
| **行号** | ~1843 |
| **类型** | 资源 404 |
| **描述** | `<script src="shuffle-fix.js?v=58" defer></script>` 引用了 `shuffle-fix.js`，但文件不存在于项目目录中。这会导致浏览器请求 404，在控制台报错，并可能阻塞后续脚本加载（虽然 `defer` 减轻了影响）。 |
| **修复建议** | ① 如果文件确实需要，创建 `shuffle-fix.js` 或恢复文件；② 如果不需要，删除该 `<script>` 标签。 |

---

### 3. `cloudflare-worker.js` — fetch 未处理网络错误

| 字段 | 内容 |
|------|------|
| **文件** | `cloudflare-worker.js` |
| **行号** | 7 |
| **类型** | 异步错误未处理 |
| **描述** | Cloudflare Worker 的 `fetch()` 调用没有 `try/catch` 或 `.catch()` 包裹。如果后端服务不可用或网络异常，Worker 会抛出未捕获异常，导致用户看到 500 错误页面而非优雅降级。 |
| **修复建议** | 包裹 `fetch()` 在 `try/catch` 中，返回降级响应： |

```javascript
// 修复建议
try {
  const response = await fetch(request);
  return response;
} catch (err) {
  return new Response('Service temporarily unavailable', { status: 503 });
}
```

---

### 4. `game-engines.js` / `game-engines-optimized.js` — Certificate 中 playerName 直接 innerHTML 拼接 (XSS 源头)

| 字段 | 内容 |
|------|------|
| **文件** | `game-engines.js` / `game-engines-optimized.js` |
| **行号** | ~177 (Certificate 模块) |
| **类型** | XSS 风险 (源头) |
| **描述** | `Certificate.show()` 中 `playerName = GameState._data.playerName || "防灾指挥官"` 直接拼接到 `innerHTML`。虽然 `engine-runtime-patch.js` 中有 `_escapeHtml` 补丁，但**源头代码未做转义**，且补丁存在被覆盖或遗漏的风险。如果用户输入的 `playerName` 包含 `<script>` 等标签，会导致存储型 XSS。 |
| **修复建议** | 在 Certificate 模块中直接使用 `textContent` 或预先用 `escapeHtml()` 转义： |

```javascript
// 修复建议：将 playerName 用 span 插入并设置 textContent
var playerNameEl = overlay.querySelector('.cert-player');
if (playerNameEl) playerNameEl.textContent = playerName || '防灾指挥官';
// 不要通过字符串拼接放入 innerHTML
```

---

### 5. `index.html` — 多个 inline onclick 直接访问全局引擎属性

| 字段 | 内容 |
|------|------|
| **文件** | `index.html` |
| **行号** | 1414, 1508, 1523 等 |
| **类型** | 潜在的 ReferenceError / 未定义访问 |
| **描述** | 多个 `onclick` 直接访问 `TimeEscapeEngine.active`、`ReactionEngine.active`、`KnowledgeRaceEngine.active`、`TimeEscapeEngine.timer` 等。如果 `game-engines.js` 加载失败或延迟，这些引擎不存在，点击按钮会抛出 `ReferenceError`，导致整个页面交互卡死。例如： |

```html
<!-- 第1414行 -->
<button onclick="if(TimeEscapeEngine.active){clearInterval(TimeEscapeEngine.timer);TimeEscapeEngine.active=false;}PageManager.navigate('menu')">←</button>
```

| **修复建议** | 使用 `typeof` 检查存在性，或改用 `data-action` + EventDelegate 模式： |

```html
<!-- 修复后 -->
<button onclick="if(typeof TimeEscapeEngine!=='undefined'&&TimeEscapeEngine.active){clearInterval(TimeEscapeEngine.timer);TimeEscapeEngine.active=false;}PageManager.navigate('menu')">←</button>
```

**受影响位置汇总**:
- `index.html:1414` — `TimeEscapeEngine.active`, `TimeEscapeEngine.timer`
- `index.html:1508` — `ReactionEngine.active`, `ReactionEngine.targetTimeout`
- `index.html:1523` — `KnowledgeRaceEngine.active`, `KnowledgeRaceEngine.timer`

---

## 三、Medium 级别 (5个) — 计划修复

### 6. `sw-v55.js` — 空 catch 函数静默吞掉网络错误

| 字段 | 内容 |
|------|------|
| **文件** | `sw-v55.js` |
| **行号** | 146, 151 |
| **类型** | 异步错误处理不完整 |
| **描述** | Service Worker 中 `networkFetch.catch(function() {})` 和 `return networkFetch.catch(function() { ... })` 使用了空 catch 函数。网络错误被静默忽略，离线状态下用户可能看不到任何反馈，且无法区分是网络问题还是应用 bug。 |
| **修复建议** | 添加日志或返回离线降级响应： |

```javascript
// 修复建议
.catch(function(err) {
  console.warn('[SW] Network fetch failed:', err);
  if (request.mode === 'navigate') {
    return caches.match('./index.html');
  }
  return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
})
```

---

### 7. `js/engines/Modal.js` — 事件监听器只绑定不移除

| 字段 | 内容 |
|------|------|
| **文件** | `js/engines/Modal.js` / `game-engines.js` 中的 Modal |
| **行号** | 55-59 |
| **类型** | 事件监听器泄漏 |
| **描述** | `_bindEvents()` 中通过 `addEventListener` 绑定了 `click` 和 `keydown` 事件，但 `hide()` 中从未移除。虽然 Modal 是单例，在页面生命周期内一直存在，但如果页面是 SPA 且长期运行，这会导致内存占用略微增加。更严重的是，如果 Modal 被重新初始化，可能重复绑定事件。 |
| **修复建议** | 在 `hide()` 或析构时移除监听器，或确保 `_eventsBound` 标记正确防止重复绑定。 |

---

### 8. `game-engines.js` — 多处 `GameState._data` 未做 null 检查

| 字段 | 内容 |
|------|------|
| **文件** | `game-engines.js` / `game-engines-optimized.js` |
| **行号** | 多个位置 |
| **类型** | 潜在的 null/undefined 访问 |
| **描述** | 大量引擎代码直接访问 `GameState._data.xxx` 属性，而 `GameState._data` 初始值为 `null`。虽然 `GameState.init()` 通常会在页面加载时调用，但如果某个引擎在 `init()` 之前执行（如通过 `DOMContentLoaded` 竞态条件），会抛出 `Cannot read properties of null` 错误。例如 `BlindBoxEngine.canOpen()` 中的 `GameState._data.lastFreeBlindbox`。 |
| **修复建议** | 在 `GameState` 上添加 getter 包装器，自动做空值保护： |

```javascript
// 修复建议
GameState.get = function(key) {
  return this._data ? this._data[key] : this._defaults[key];
};
```

---

### 9. `loading.js` — `_waitForReady` 轮询可能无限运行

| 字段 | 内容 |
|------|------|
| **文件** | `loading.js` |
| **行号** | 157-178 |
| **类型** | 定时器泄漏 |
| **描述** | `_waitForReady()` 中 `setTimeout(checkReady, 100)` 会递归调用，直到 `bodyReady || menuReady || contentLoaded` 条件满足。如果 `page-menu` 元素或 `.menu-grid` 永远不会出现（例如 HTML 结构变更），轮询会持续到 8 秒超时。虽然最终会停止，但中间产生了 80 个 setTimeout 调用。 |
| **修复建议** | 使用单个 `setInterval` 并在条件满足时 `clearInterval`，减少调用堆栈和定时器数量。 |

---

### 10. `sw-v55.js` — 缓存清理不完整（旧版本缓存泄漏）

| 字段 | 内容 |
|------|------|
| **文件** | `sw-v55.js` |
| **行号** | 100-114 |
| **类型** | Service Worker 缓存策略 |
| **描述** | `activate` 事件清理旧缓存时只保留当前 `CACHE_NAME`，但如果缓存写入失败导致某些旧缓存未被正确删除，或用户从 `v54` 跳级到 `v56`，中间版本的缓存可能残留。另外，缓存列表中部分文件（如图片、字体）未包含，离线体验不完整。 |
| **修复建议** | 在 `activate` 中添加更严格的日志和验证，确保所有非当前版本缓存都被删除。 |

---

## 四、Low 级别 (30个) — 优化建议

### 11-40. CSS `transition` 动画了布局属性（触发重排 reflow）

| 字段 | 内容 |
|------|------|
| **影响文件** | `ai-float.css`, `all-styles-v55.css`, `certification.css`, `critical.css`, `loading.css`, `menu-enhance.css`, `settings.css`, `transitions.css`, `v5-glass-3d.css` |
| **类型** | 性能优化 |
| **描述** | 30 处 CSS 使用了 `transition: width ...`, `transition: height ...`, `transition: left ...`, `transition: max-height ...` 等。这些属性会触发浏览器重排（reflow），在低端设备和动画密集时可能导致卡顿。建议用 `transform: scaleX()` 替代 `width` 动画，用 `transform: translateX()` 替代 `left` 动画。 |
| **修复建议** | 将进度条、侧边栏等动画从 `width` / `left` 改为 `transform: scaleX()` / `transform: translateX()`，配合 `transform-origin` 控制方向。 |

**部分受影响位置**:
- `all-styles-v55.css:575` — `transition: width 0.5s ease`
- `all-styles-v55.css:2595` — `transition: width 0.5s ease`
- `critical.css:27` — `.loading-bar` 的 width 动画
- `v5-glass-3d.css:351` — `transition: width 0.5s cubic-bezier(...)`
- `transitions.css:410` — `transition: width 0.6s cubic-bezier(...)`
- ...（共30处，详见完整扫描报告）

---

## 五、数据文件完整性检查

| 文件 | 检查结果 | 说明 |
|------|----------|------|
| `cards.js` | 大括号匹配 | 260 张卡牌，无重复 ID |
| `scenarios.js` | 大括号匹配 | 情景数据格式正确 |
| `kit_data.js` | 未检查 | 文件存在，假设格式正确 |

---

## 六、修复优先级建议

### 立即修复（今天）
1. **Critical #1** — 将 `EventDelegate.js` 的 `eval()` 替换为 `JSON.parse()`
2. **High #2** — 删除 `index.html` 中不存在的 `shuffle-fix.js` 引用，或创建该文件

### 本周修复
3. **High #3** — `cloudflare-worker.js` 添加 `fetch` 错误处理
4. **High #4** — `Certificate.show()` 中 `playerName` 使用 `textContent` 替代 innerHTML 拼接
5. **High #5** — `index.html` 中 inline onclick 添加 `typeof` 存在性检查

### 下个迭代修复
6. **Medium #6-10** — Service Worker 错误处理、Modal 事件移除、GameState 空值保护、loading 轮询优化
7. **Low #11-40** — CSS 性能优化（可逐步进行，影响较小）

---

## 七、是否存在 Critical 或 High 级别 Bug？

**是。**

- **存在 1 个 Critical 级别 Bug**：`EventDelegate.js` 中的 `eval()` 使用，存在代码注入风险。
- **存在 4 个 High 级别 Bug**：包括 404 资源缺失、异步错误未处理、XSS 源头风险、以及潜在的 ReferenceError 崩溃。

这些 Bug 中，Critical 的安全漏洞和 High 级别的 404/XSS 问题建议立即修复，以确保应用的稳定性和安全性。

---

*报告由「应急小达人」终极 QA 扫描专家生成。*
*扫描方法：静态代码分析 + 正则匹配 + 数据完整性验证。*
