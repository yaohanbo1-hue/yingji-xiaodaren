# 应急小达人 v55 — CSS/JS 一致性深度检查报告

> **检查日期**: 2025年7月13日  
> **检查范围**: `all-styles-v55.css` 样式完整性 vs `index.html` 页面结构 vs `game-engines.js` 引擎实现  
> **文件规模**: `index.html` (2,105 行), `game-engines.js` (1,033 行), `all-styles-v55.css` (8,083 行), 其他补充文件 7 个  
> **页面总数**: 51 个 `#page-*` 容器  
> **版本**: v1.3.2 (v74)

---

## 执行摘要

本次检查采用 **三向对比法**：将 HTML 中的 `id`、CSS 中的选择器、JS 中的引擎名和 `render()` 方法进行交叉验证，并在所有项目 CSS 文件中搜索引擎动态生成的 class 名。共发现 **8 项严重错误**、**11 项高优先级遗漏**、**10 项中低优先级问题**。

---

## 问题总表（按严重度排序）

| 优先级 | 类别 | 问题描述 | 影响范围 | 证据位置 |
|:---:|:---|:---|:---|:---|
| **P1** | CSS 缺失 | `.v10-card` 无任何 CSS 定义 | 5+ 引擎渲染的卡片容器 | 搜索全项目 CSS 无匹配 |
| **P1** | CSS 缺失 | `.v10-progress` / `.v10-badge` 无定义 | 进度条、徽章组件 | 搜索全项目 CSS 无匹配 |
| **P1** | CSS 缺失 | `.memory-card` / `.memory-card-inner` 无定义 | MemoryCardEngine 翻牌卡片 | 搜索全项目 CSS 无匹配 |
| **P1** | CSS 缺失 | `.pk-*` 系列类无定义（pk-setup, pk-name-inputs 等 7 个） | PK 对战页面排版 | 搜索全项目 CSS 无匹配 |
| **P1** | JS 错误 | `FirstAidEngine.render()` 不存在 | 急救模拟页面无法渲染 | `index.html:277` → `game-engines.js:350` |
| **P1** | JS 错误 | `LevelEngine` 未定义 | 角色升级/等级系统崩溃 | `game-engines.js` 全文无定义 |
| **P1** | JS 错误 | `SettingsEngine` 未定义 | 设置页音效切换报错 | `index.html:538` 引用, 无定义 |
| **P1** | JS 错误 | `TransitionEngine` 未定义 | 页面切换转场动画失败 | `game-engines.js:689` 引用 |
| **P2** | CSS 缺失 | `.game-container` 无定义 | 生存挑战、Boss 挑战等 7 个页面 | 搜索全项目 CSS 无匹配 |
| **P2** | CSS 缺失 | `.btn-battle` 无定义 | 扭蛋/刮刮乐按钮样式 | 搜索全项目 CSS 无匹配 |
| **P2** | CSS 缺失 | `.option-btn` 无定义 | 生存挑战/限时挑战选项按钮 | 搜索全项目 CSS 无匹配 |
| **P2** | CSS 缺失 | `.card-grid` / `.card-item` 无定义 | 扭蛋/轮盘/刮刮乐卡片网格 | 搜索全项目 CSS 无匹配 |
| **P2** | CSS 缺失 | `.daily-task-item` 无定义 | 日常任务/碎片/升级/套装页面 | 搜索全项目 CSS 无匹配 |
| **P2** | CSS 缺失 | 签到/日历组件类缺失（7 个） | 签到墙、日历视图排版 | 搜索全项目 CSS 无匹配 |
| **P2** | CSS 缺失 | 测验结果类缺失（4 个） | 答题结果展示样式 | 搜索全项目 CSS 无匹配 |
| **P2** | CSS 缺失 | 统计面板类缺失（6 个） | 英雄等级/经验条/金币显示 | 搜索全项目 CSS 无匹配 |
| **P2** | CSS 缺失 | 学习导航类缺失（3 个） | 学习模式导航栏 | 搜索全项目 CSS 无匹配 |
| **P2** | CSS 缺失 | 测验选项子类缺失（2 个） | 选项字母/文本样式 | 搜索全项目 CSS 无匹配 |
| **P2** | CSS 缺失 | 10 个页面 ID 无专用 CSS 选择器 | 依赖通用 `.page` / `.page-content` | 搜索全项目 CSS 无匹配 |
| **P3** | CSS 薄弱 | 8 个页面仅有极少量 CSS 规则 | 样式覆盖不足，可能显示异常 | `all-styles-v55.css` 选择器统计 |

---

## P1 — 严重错误（Critical）

### 1. `.v10-card` 缺失（影响 5+ 引擎）

**问题**: 以下引擎在 `render()` 方法中生成的 HTML 字符串均使用 `<div class="v10-card">` 作为卡片容器，但**全项目所有 CSS 文件中均无此类的任何定义**：

- `BossRushEngine.render()` — Boss 挑战卡片
- `SurvivalEngine.render()` — 生存挑战卡片
- `TimedChallengeEngine.render()` — 限时挑战卡片
- `DailyChallengeEngine.render()` — 每日挑战卡片
- `DisasterQuizGame` 相关代码
- `SupplyDropGame` 相关代码
- `ReactionGameV2` 相关代码

**后果**: 这些卡片将退化为无样式的 `<div>`，失去边框、阴影、背景、内边距等视觉层次，导致游戏体验严重下降。

**证据路径**: `all-styles-v55.css` 全文搜索 `v10-card` 无结果；`game-engines.js` 中每个引擎的 `render()` 方法均包含 `'...class="v10-card"...'`。

---

### 2. `.v10-progress` / `.v10-badge` 缺失

**问题**: `BossRushEngine` 和 `SurvivalEngine` 使用 `<div class="v10-progress"><div class="v10-progress-fill">` 作为进度条，但这两个类无任何 CSS 定义。

**后果**: 进度条不会显示，玩家无法看到 Boss 血量或任务进度。

**证据路径**: `game-engines.js` 中 `BossRushEngine.render()` 包含 `class="v10-progress"` 和 `class="v10-progress-fill"`；全项目 CSS 无定义。

---

### 3. `.memory-card` / `.memory-card-inner` 缺失

**问题**: `MemoryCardEngine` 创建翻牌记忆游戏卡片时，使用 `class="memory-card"` 和 `class="memory-card-inner"`，但这两个类无 CSS 定义。

**后果**: 记忆卡片无 3D 翻转效果、无尺寸约束、无网格布局，游戏功能性受损。

**证据路径**: `game-engines.js` 中 `MemoryCardEngine._render()` 使用 `memory-card` 和 `memory-card-inner`；全项目 CSS 无定义。

---

### 4. `.pk-*` 系列类缺失（7 个）

**问题**: `index.html` 中 PK 对战设置页面包含以下类，但全项目 CSS 无定义：

- `.pk-setup` — 设置面板容器
- `.pk-name-inputs` — 玩家名称输入区
- `.pk-name-group` — 输入框分组
- `.pk-vs` — VS 标志
- `.pk-settings` — 设置选项区
- `.pk-setting` — 单个设置项
- `.pk-name-input` — 输入框样式

**后果**: PK 页面完全无样式，输入框和按钮排列混乱。

**证据路径**: `index.html` 中存在这些 class；`all-styles-v55.css` 及其他 CSS 文件均无定义。

---

### 5. `FirstAidEngine.render()` 不存在（JS 运行时错误）

**问题**: `index.html:277` 直接调用 `FirstAidEngine.render()`：

```html
<div class="mode-btn" onclick="PageManager.navigate('firstaid');setTimeout(function(){FirstAidEngine.render()},100)" ...>
```

但在 `game-engines.js:350` 中，`FirstAidEngine` 仅定义为 `{ SCENARIOS: {...} }` 对象，**无 `render()` 方法**。

**后果**: 用户点击"急救模拟"按钮后，页面导航成功但 100ms 后触发 `TypeError: FirstAidEngine.render is not a function`，急救内容无法渲染。

**证据路径**:
- `index.html:277`: `setTimeout(function(){FirstAidEngine.render()},100)`
- `game-engines.js:350`: `const FirstAidEngine = {SCENARIOS: [...]}`（无 render 方法）

---

### 6. `LevelEngine` 未定义（JS 引用错误）

**问题**: `game-engines.js` 中 `CharacterEngine.select()` 和 `StatsEngine.render()` 均引用 `LevelEngine`，但全项目无此引擎定义。

**后果**: 角色选择和统计页面在涉及等级计算时会抛出 `ReferenceError: LevelEngine is not defined`。

**证据路径**:
- `game-engines.js` 中 `CharacterEngine` 引用 `LevelEngine`
- `game-engines.js` 中 `StatsEngine` 引用 `LevelEngine`
- 全项目搜索 `LevelEngine` 无定义

---

### 7. `SettingsEngine` 未定义（JS 引用错误）

**问题**: `index.html` 中 `onclick="SettingsEngine.toggleSFX(this)"` 直接调用 `SettingsEngine`，且 `game-engines.js` 开头的 `allEngines` 列表包含 `SettingsEngine`，但全项目无此引擎定义。

**后果**: 点击设置页面的音效切换开关会触发 `ReferenceError: SettingsEngine is not defined`。

**证据路径**:
- `index.html:538`: `onclick="SettingsEngine.toggleSFX(this)"`
- `game-engines.js` 中 `allEngines` 包含 `SettingsEngine`
- 全项目搜索 `SettingsEngine` 无定义

---

### 8. `TransitionEngine` 未定义（JS 引用错误）

**问题**: `game-engines.js` 中 `PageManager._cleanupEngines()` 包含 `void 0 !== TransitionEngine && TransitionEngine.flash(150)`，但全项目无此引擎定义。

**后果**: 页面切换时的转场动画效果不会执行。虽然 `void 0 !== TransitionEngine` 检查可防止报错，但功能缺失。

**证据路径**: `game-engines.js:689`: `void 0 !== TransitionEngine && TransitionEngine.flash(150)`

---

## P2 — 高优先级遗漏（High）

### 9. `.game-container` 缺失

**影响页面**: `page-daily`, `page-survival`, `page-bossrush`, `page-timed`, `page-story`, `page-disasterquiz`, `page-supplydrop`

**后果**: 这些游戏页面容器缺少统一的内边距、最大宽度约束和响应式布局，可能导致内容贴边或在大屏幕上过度拉伸。

---

### 10. `.btn-battle` 缺失

**影响引擎**: `GachaEngine`, `ScratchEngine`

**后果**: 战斗/行动按钮无统一样式，可能与其他按钮样式不一致。

---

### 11. `.option-btn` 缺失

**影响引擎**: `SurvivalEngine`, `TimedChallengeEngine`

**后果**: 生存挑战和限时挑战的选项按钮缺少悬停效果、激活状态样式和选中反馈。

---

### 12. `.card-grid` / `.card-item` 缺失

**影响引擎**: `GachaEngine`, `RouletteEngine`, `ScratchEngine`

**后果**: 卡片网格布局无 CSS Grid / Flexbox 定义，卡片可能垂直堆叠而非网格排列。

---

### 13. `.daily-task-item` 缺失

**影响引擎**: `DailyTaskEngine`, `CardFragmentEngine`, `CardUpgradeEngine`, `SetBonusEngine`, `OutfitEngine`, `PetEngine`

**后果**: 日常任务列表、卡片碎片、装备升级等页面中的列表项无统一样式。

---

### 14. 签到/日历组件类缺失（7 个）

**缺失类**: `.checkin-panel`, `.checkin-grid`, `.checkin-day`, `.calendar-header-bar`, `.calendar-checkin-banner`, `.calendar-month-title`, `.calendar-day`

**影响引擎**: `CheckinEngine`, `CalendarEngine`

**后果**: 签到墙和日历视图缺少网格布局、日期高亮和签到状态样式。

---

### 15. 测验结果类缺失（4 个）

**缺失类**: `.quiz-result-icon`, `.quiz-result-title`, `.quiz-result-score`, `.quiz-result-stats`

**影响引擎**: `BossRushEngine`, `SurvivalEngine`, `TimedChallengeEngine`, `DailyChallengeEngine`

**后果**: 答题结果展示无视觉层次，分数和统计信息可能平铺显示。

---

### 16. 统计面板类缺失（6 个）

**缺失类**: `.dashboard-hero`, `.dashboard-kpi`, `.hero-level`, `.hero-xp-bar`, `.hero-coins`, `.coin-icon`, `.coin-value`

**影响引擎**: `StatsEngine`

**后果**: 个人统计仪表盘缺少英雄卡片、KPI 指标和金币显示的样式，数据可视化效果不足。

---

### 17. 学习导航类缺失（3 个）

**缺失类**: `.study-nav`, `.study-nav-btn`, `.study-nav-primary`

**影响引擎**: `StudyEngine`

**后果**: 学习模式导航栏缺少激活状态、主按钮高亮和响应式布局。

---

### 18. 测验选项子类缺失（2 个）

**缺失类**: `.quiz-opt-letter`, `.quiz-opt-text`

**影响引擎**: `BaseEngine`, `BossRushEngine`, `SurvivalEngine`, `TimedChallengeEngine`

**后果**: 选项字母（A/B/C/D）和文本缺少样式分离，可能影响选项对齐和可读性。

---

### 19. 10 个页面 ID 无专用 CSS 选择器

**页面列表**:
- `#page-quiz` — 快速答题
- `#page-battle` — 知识对战
- `#page-pk` — PK 对战
- `#page-scenario` — 情景模拟
- `#page-kit` — 急救包
- `#page-study` — 学习模式
- `#page-campaign` — 战役模式
- `#page-free` — 自由模式
- `#page-speed` — 速答模式
- `#page-battle-lobby` — 对战大厅

**后果**: 这些页面仅依赖通用 `.page` / `.page-content` 样式，缺少特定页面的布局调整（如背景色、特殊内边距、自定义 header）。虽然功能可用，但视觉一致性较差。

**注意**: 这些页面通过 `style` 属性或引擎内联样式进行部分补偿，但非最佳实践。

---

## P3 — 中低优先级问题（Medium/Low）

### 20. 8 个页面 CSS 覆盖薄弱

**页面及规则数**:
- `#page-study`, `#page-quiz`, `#page-battle` — 仅有通用 `.page` 样
