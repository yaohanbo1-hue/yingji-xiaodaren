# 应急小达人 UI 检查报告 (v71)

> 检查日期：2026-07-02
> 检查范围：index.html, game-engines.js, all-styles-v55.css, critical.css, layout-fix.css, ui-ultimate.css, menu-manager.js
> 基于版本：v71 (commit 9fe32aa)

---

## 一、检查摘要

| 类别 | 数量 | 状态 |
|------|------|------|
| P1 严重问题 | 4 | 需立即修复 |
| P2 中等问题 | 5 | 建议尽快修复 |
| P3 轻微问题 | 3 | 可后续优化 |
| 已修复问题 | 8 | v71 已解决 |

**与 v49 报告对比**：v71 已修复了 6 个空白页面（firstaid/survival/bossrush/timed/eggs/memory-card）、日历网格崩坏、小游戏网格崩坏等 P1 问题。但引入了新的 CSS 覆盖 bug 和 JavaScript 调用错误。

---

## 二、P1 严重问题

### 1. CharacterEngine.render() 在 _refreshPage 中被错误调用，导致 JavaScript 错误

**问题描述**：
`PageManager._refreshPage`（`game-engines.js:689`）中调用 `CharacterEngine.render()` 时没有传递必需的 `context` 参数。`CharacterEngine.render()` 方法内部使用了 `context.disasterType`、`context.combo`、`context.questionNum`、`context.baseScore` 等属性，当 `context` 为 `undefined` 时会抛出 `TypeError: Cannot read property 'disasterType' of undefined`。

**影响页面**：角色选择页 (`page-character`)

**代码位置**：
```javascript
// game-engines.js:689 — _refreshPage
"character"===pageId&&void 0!==CharacterEngine&&CharacterEngine.render()  // ❌ 缺少 context 参数
```

`CharacterEngine.render()` 方法体：
```javascript
render(){
  var char=this.getSelected(),effects=[];
  return "doctor"!==char.id&&"commander"!==char.id||effects.push({type:"heal",value:2,desc:"被动：恢复 2 HP"}),
  "firefighter"===char.id&&"fire"===context.disasterType&&effects.push(...),  // ← context 未定义会报错
  ...
}
```

**修复建议**：
- 方案 A：修改 `_refreshPage` 中的调用，改为调用正确的角色页面渲染方法（如果存在）
- 方案 B：为 `CharacterEngine.render()` 添加默认参数保护：`context = context || {}`

---

### 2. StoryEngine 在 _refreshPage 中被双重调用，导致状态冲突

**问题描述**：
`PageManager._refreshPage` 中 `story` 页面有两个独立的分支，都会同时执行：
1. `StoryEngine._renderChapterSelect()` — 渲染章节选择列表
2. `StoryEngine.startChapter(0)` — 直接启动第 1 章

这会导致章节选择界面被立即覆盖，用户无法选择章节。

**影响页面**：故事模式 (`page-story`)

**代码位置**：
```javascript
// game-engines.js:689 — _refreshPage
"story"===pageId&&void 0!==StoryEngine&&StoryEngine._renderChapterSelect(),  // 分支 1
...
"story"===pageId&&void 0!==StoryEngine&&StoryEngine.startChapter(0)        // 分支 2（会覆盖分支1）
```

**修复建议**：
- 删除第二个分支，只保留 `_renderChapterSelect()`，让用户手动选择章节
- 或保留 `startChapter(0)`，删除 `_renderChapterSelect()`

---

### 3. all-styles-v55.css 覆盖 mode-btn 内联样式，导致特殊视觉特效丢失

**问题描述**：
`all-styles-v55.css` 第 3043-3048 行的规则会覆盖所有带有内联 `border-color`、`box-shadow` 或 `animation` 的 `.mode-btn` 的样式：

```css
/* all-styles-v55.css:3043-3048 */
.mode-btn[style*="border-color"],
.mode-btn[style*="box-shadow"],
.mode-btn[style*="animation"] {
  border-color: var(--glass-border) !important;  /* 统一为透明边框 */
  box-shadow: none !important;                    /* 移除发光效果 */
  animation: none !important;                     /* 移除动画 */
}
```

**影响页面**：主菜单 (`page-menu`)

**受影响按钮**（index.html 中的 mode-btn 内联样式）：
| 按钮 | 被覆盖的样式 | 效果 |
|------|-----------|------|
| 开盲盒 | `border-color: rgba(255,215,0,0.4); box-shadow: 0 0 25px rgba(255,215,0,0.15); animation: pulse-glow 2s infinite;` | 金色边框+脉冲动画消失 |
| AI 导师 | `border-color:rgba(96,165,250,0.4); box-shadow: 0 0 20px rgba(96,165,250,0.1);` | 蓝色发光效果消失 |
| 能力认证 | `border-color:rgba(245,158,11,0.4); box-shadow: 0 0 20px rgba(245,158,11,0.1);` | 橙色发光效果消失 |
| 灾害模拟 | `border-color:rgba(239,68,68,0.4); box-shadow: 0 0 20px rgba(239,68,68,0.1);` | 红色发光效果消失 |
| 错题本 | `border-color:rgba(248,113,113,0.4); box-shadow: 0 0 20px rgba(248,113,113,0.1);` | 粉色发光效果消失 |
| 学习报告 | `border-color:rgba(52,211,153,0.4); box-shadow: 0 0 20px rgba(52,211,153,0.1);` | 绿色发光效果消失 |

**修复建议**：
- 删除 `all-styles-v55.css` 第 3043-3048 行的规则，或者将 `!important` 去掉，让内联样式优先级恢复

---

### 4. critical.css 的 !important 覆盖导致 page-content padding 不一致

**问题描述**：
`critical.css` 中 `.page-content` 使用 `!important` 简写属性：
```css
/* critical.css:120 */
.page-content { padding: 70px 12px calc(88px + env(safe-area-inset-bottom, 0px)) !important; }
```

`all-styles-v55.css` / `ui-ultimate.css` 试图覆盖：
```css
/* all-styles-v55.css:6506-6513 / ui-ultimate.css:8-15 */
.page-content {
  padding-top: 20px;
  padding-left: 16px;
  padding-right: 16px;
  padding-bottom: calc(140px + env(safe-area-inset-bottom, 0px)) !important;
  max-width: 800px !important;
  margin: 0 auto !important;
}
```

由于 `critical.css` 的 `padding` 简写属性使用了 `!important`，`all-styles-v55.css` 中未加 `!important` 的 `padding-top/left/right` 无法覆盖它。实际效果：
- `padding-top` = 70px（来自 critical.css）而非 20px
- `padding-left/right` = 12px（来自 critical.css）而非 16px
- `padding-bottom` = calc(140px + env(...))（来自 all-styles-v55.css，因为它使用了 !important）

这导致页面顶部留白过大（70px 而不是 20px），左右边距偏窄（12px 而不是 16px）。

**影响页面**：所有带有 `.page-content` 类的子页面（30+ 个页面）

**修复建议**：
```css
/* 在 all-styles-v55.css 或 ui-ultimate.css 中添加 */
.page-content {
  padding-top: 20px !important;
  padding-left: 16px !important;
  padding-right: 16px !important;
  padding-bottom: calc(140px + env(safe-area-inset-bottom, 0px)) !important;
  max-width: 800px !important;
  margin: 0 auto !important;
}
```

---

## 三、P2 中等问题

### 5. ui-ultimate.css 隐藏 settings 页面副标题

**问题描述**：
`ui-ultimate.css` 第 86-88 行的规则会隐藏 `#page-settings` 中所有 `<p>` 标签：
```css
/* ui-ultimate.css:86-88 */
#page-settings h4 + p,
#page-settings p {
  display: none !important;
}
```

**影响页面**：设置页 (`page-settings`)

**被隐藏的内容**：
- `index.html:833`：`<p class="settings-subtitle">自定义你的防灾学习体验</p>` — 设置页副标题消失
- `index.html:1758`：`<p style="font-size:13px;color:var(--text-dim);margin-top:4px">改变游戏整体背景氛围</p>` — 主题弹窗说明文字消失

**修复建议**：
```css
/* 将通用的 p 选择器改为更精确的类选择器 */
#page-settings .settings-subtitle,
#page-settings .theme-modal-desc {
  display: none !important;
}
```

---

### 6. CSS 重复加载（all-styles-v55.css 包含 ui-ultimate.css 完整内容）

**问题描述**：
`all-styles-v55.css` 从第 6500 行开始包含了 `ui-ultimate.css` 的完整内容（约 491 行）。但 `index.html` 仍然单独加载了 `ui-ultimate.css`：

```html
<!-- index.html:104 -->
<link rel="stylesheet" href="ui-ultimate.css?v=71" media="print" onload="this.media='all'">
```

这导致 `ui-ultimate.css` 的内容被加载两次，增加了约 20KB 的冗余下载。

**修复建议**：
- 删除 `index.html` 第 104 行的 `ui-ultimate.css` 加载标签，因为 `all-styles-v55.css` 已经包含了相同内容

---

### 7. 部分页面缺少 _refreshPage 引擎调用，直接访问时内容空白

**问题描述**：
以下页面在 `PageManager._refreshPage` 中没有引擎渲染调用，如果用户通过 URL 直接访问或页面刷新，内容区域会显示空白：

| 页面 | 内容容器 | 缺少的引擎调用 | 影响 |
|------|---------|-------------|------|
| `wrong-book` | `id="wrongBookContent"` | `WrongBookEngine.renderPage()` | 错题列表空白 |
| `report` | `id="reportContent"` | `ReportEngine.showReport()` | 学习报告空白 |
| `disaster-sim` | `id="simContent"` | 无（有静态选择器）| 部分正常 |
| `real-cases` | `id="realCasesContent"` | `RealCasesEngine.init()` | 案例列表空白 |
| `ai-tutor` | `id="aiTutorContent"` | `AITutorEngine.init()` | AI 导师内容空白 |
| `certification` | `id="certContent"` | `CertificationEngine.init()` | 认证内容空白 |

**修复建议**：
在 `game-engines.js:689` 的 `_refreshPage` 方法中添加对应引擎调用：
```javascript
"wrong-book"===pageId&&void 0!==WrongBookEngine&&WrongBookEngine.renderPage&&WrongBookEngine.renderPage(),
"report"===pageId&&void 0!==ReportEngine&&ReportEngine.showReport&&ReportEngine.showReport(),
"real-cases"===pageId&&void 0!==RealCasesEngine&&RealCasesEngine.init&&RealCasesEngine.init(),
"ai-tutor"===pageId&&void 0!==AITutorEngine&&AITutorEngine.init&&AITutorEngine.init(),
"certification"===pageId&&void 0!==CertificationEngine&&CertificationEngine.init&&CertificationEngine.init()
```

---

### 8. 部分引擎存在双重初始化问题

**问题描述**：
以下引擎的 `init()` 方法内部调用 `PageManager.navigate()`，然后 `_refreshPage` 又会再次调用 `init()`：

```javascript
// BossRushEngine.init() 内部
init(){
  this._current=0, this._score=0, ...
  PageManager.navigate("bossrush"),  // ← 触发 _refreshPage
  this.startBoss()  // ← 初始化游戏状态
}

// _refreshPage 中
"bossrush"===pageId&&void 0!==BossRushEngine&&(BossRushEngine.init())  // ← 再次调用 init()
```

当用户从 menu 点击 `BossRushEngine.init()` 时：
1. 第一次 `init()` 执行 → `navigate("bossrush")` → `_refreshPage` → 第二次 `init()`
2. 第二次 `init()` 再次重置 `_current=0, _score=0`，虽然不会造成可见错误，但增加了不必要的 DOM 操作和状态重置

**受影响引擎**：`BossRushEngine`, `SurvivalEngine`, `TimedChallengeEngine`, `MemoryCardEngine`, `PrecisionEngine`, `TimeEscapeEngine`, `StoryAdventureEngine`, `ReactionEngine` 等

**修复建议**：
在这些引擎的 `init()` 方法开头添加防重入保护：
```javascript
init(){
  if (this._initializing) return;  // 防止双重初始化
  this._initializing = true;
  setTimeout(() => this._initializing = false, 500);
  // ... 原有初始化逻辑
}
```

---

## 四、P3 轻微问题

### 9. MenuManager 初始化时机可能导致菜单闪烁

**问题描述**：
`menu-manager.js` 的 `init()` 在 `DOMContentLoaded` 后 300ms 执行 `collapseAll()`：
```javascript
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
    MenuManager.init();  // 300ms 延迟
  }, 300);
});
```

在此期间，用户可能已经看到菜单内容，然后突然被隐藏。如果用户在此期间点击了分类按钮，可能会与 `collapseAll()` 冲突。

**修复建议**：
将 `collapseAll()` 的执行时机提前到页面加载开始时，或者使用 CSS 直接设置初始状态（`display: none`），而不是依赖 JavaScript 延迟隐藏。

---

### 10. index.html 中 mode-btn 的 HTML 缩进不一致

**问题描述**：
`index.html:277` 的 `<div class="mode-btn">` 缺少缩进，与其他同级元素不一致。这虽然不影响功能，但影响代码可读性和维护性。

**修复建议**：
统一格式化 index.html 中 menu 区域的 HTML 缩进。

---

### 11. 工具栏高亮延迟（v49 遗留问题，v71 部分改善）

**问题描述**：
`ui-report.md` 中提到的工具栏高亮滞后问题在 v71 中仍然存在，但程度较轻。`_refreshPage` 中更新高亮时，如果 `VisualFX.diagonalTransition` 正在执行，高亮更新会在动画完成后才执行。

**修复建议**：
将工具栏高亮更新逻辑移到 `PageManager.navigate()` 的最开始，确保在页面切换动画前更新高亮状态。

---

## 五、v71 已修复的问题（对比 v49 报告）

| v49 问题 | 状态 | 修复方式 |
|---------|------|---------|
| firstaid 页面空白 | ✅ 已修复 | `_refreshPage` 中改为 `FirstAidEngine.render(), void 0`（直接调用，不赋值） |
| survival 页面空白 | ✅ 已修复 | `_refreshPage` 中调用 `SurvivalEngine.init()` |
| bossrush 页面空白 | ✅ 已修复 | `_refreshPage` 中调用 `BossRushEngine.init()` |
| timed 页面空白 | ✅ 已修复 | `_refreshPage` 中调用 `TimedChallengeEngine.init()` |
| eggs 页面空白 | ✅ 已修复 | `_refreshPage` 中赋值 `eggs-content.innerHTML = EasterEggEngine.render()` |
| memory-card 页面空白 | ✅ 已修复 | `_refreshPage` 中调用 `MemoryCardEngine.init()` |
| calendar 网格崩坏 | ✅ 已修复 | `layout-fix.css` 中添加 `.calendar-grid` / `.calendar-day` 样式 |
| minigame 网格崩坏 | ✅ 已修复 | `layout-fix.css` 中添加 `.minigame-grid` / `.minigame-card` 样式 |
| 文字对比度低 | ✅ 部分修复 | `layout-fix.css` 中添加 `.menu-card-desc` / `.settings-card-desc` 对比度修复 |
| 空状态提示缺失 | ✅ 部分修复 | `layout-fix.css` 中添加 `.empty-state` / `.leaderboard-empty` / `.wrong-book-empty` 样式 |

---

## 六、修复优先级建议

1. **P1-1 CharacterEngine.render() 错误调用** — 会导致 JS 错误，角色页面无法正常使用
2. **P1-2 StoryEngine 双重调用** — 导致故事模式章节选择功能失效
3. **P1-3 mode-btn 样式被覆盖** — 影响主菜单视觉体验，多个按钮特效丢失
4. **P1-4 page-content padding 冲突** — 影响所有子页面的顶部留白和边距
5. **P2-1 settings 副标题被隐藏** — 影响设置页的信息完整性
6. **P2-2 CSS 重复加载** — 增加不必要的加载时间
7. **P2-3 页面缺少 _refreshPage 引擎调用** — 影响直接访问/刷新时的页面渲染
8. **P2-4 双重初始化** — 可能导致性能问题和状态异常
