# 引擎接口一致性检查报告

> **检查范围**: `game-engines.js` 中所有引擎公共方法定义与其他 JS 文件中的引擎方法调用交叉验证
> **重点关注**: `GameState`、`PageManager`、`QuizEngine`、`BattleEngine`、`Modal`
> **检查日期**: 2026-06-15
> **文件状态**: `game-engines.js` (~373KB, 单文件包含所有引擎), `patch-v75.js` (运行时补丁)

---

## 1. 方法调用不存在于目标引擎（严重问题）

| # | 调用方 | 调用方法 | 目标引擎是否存在 | 实际定义位置 | 影响 |
|---|--------|----------|---------------|-------------|------|
| 1 | `patch-v75.js` | `GameState._save()` | ❌ 不存在 | 无 | 页面关闭时同步保存失败（`patch-v75.js` 已改用 `localStorage` 直接保存） |
| 2 | `sfx.js` | `GameState._save()` | ❌ 不存在 | 无 | 音效管理器保存失败 |
| 3 | `StatsEngine.render()` | `this._getCategoryStats()` | ❌ 不存在 | `patch-v75.js` 兜底 | 统计页面分类数据缺失 |
| 4 | `CharacterEngine.select()` | `LevelEngine.getLevel()` | ❌ 不存在 | `patch-v75.js` 兜底 | 角色解锁等级检查失败 |
| 5 | `StatsEngine.render()` | `LevelEngine.getLevel()` | ❌ 不存在 | `patch-v75.js` 兜底 | 统计页面等级显示失败 |
| 6 | `StatsEngine.render()` | `LevelEngine.getNextLevel()` | ❌ 不存在 | `patch-v75.js` 兜底 | 统计页面经验条显示失败 |
| 7 | `MemoryCardEngine._gameOver()` | `LevelEngine.addXP()` | ❌ 不存在 | `patch-v75.js` 兜底 | 记忆卡片游戏经验奖励失败 |

---

## 2. 引擎缺失定义（在 `game-engines.js` 中不存在）

| # | 引擎名称 | 调用次数 | 主要调用方 | 实际定义位置 | 风险 |
|---|---------|---------|-----------|-------------|------|
| 1 | `AudioManager` | 107+ | 几乎所有引擎 | `sfx.js` | 如果 `sfx.js` 未加载或加载顺序错误，所有音效失败 |
| 2 | `VisualFX` | 5+ | `BattleEngine`, `PageManager`, `TimeEscapeEngine`, `ComboEngine` | `patch-v75.js` | 视觉特效完全缺失 |
| 3 | `BGMEngine` | 2 | `BattleEngine.init` | `patch-v75.js` | 战斗背景音乐无法播放 |
| 4 | `TransitionEngine` | 1 | `PageManager.navigate` | `patch-v75.js` | 页面转场特效缺失 |
| 5 | `LevelEngine` | 4+ | `CharacterEngine`, `StatsEngine`, `MemoryCardEngine` | `patch-v75.js` | 等级系统完全依赖补丁 |
| 6 | `SettingsEngine` | - | `allEngines` 数组引用 | `patch-v75.js` | 设置引擎缺失 |
| 7 | `ReportEngine` | - | - | `patch-v75.js` | 报告引擎缺失 |
| 8 | `AmbientParticles` | - | `allEngines` 数组引用 | `patch-v75.js` | 环境粒子特效缺失 |
| 9 | `V10Toast` | - | `SurvivalEngine`, `ReactionGameV2` | `patch-v75.js` | Toast 提示缺失（但 `game-engines.js` 中 `SurvivalEngine` 调用了 `V10Toast.success/error`） |
| 10 | `GuideEnhancer` | - | - | `patch-v75.js` | 引导增强缺失 |

> **注意**: `allEngines` 数组（第 1005 行）和 `_engineMap` 对象（第 1009 行）中引用了上述缺失引擎的变量名。如果 `game-engines.js` 加载时这些变量未定义，会导致 `ReferenceError`。

---

## 3. 参数不匹配问题

| # | 调用方 | 方法 | 参数 | 引擎定义 | 问题 |
|---|--------|------|------|---------|------|
| 1 | `BattleEngine.spawnBoss()` | `QuizEngine._initUI({showTimer:!0,hpBar:!0})` | `hpBar` | `game-engines.js` 中映射到 `survivalHud` | `archive/QuizEngine.js` 映射到 `quizHpBar`，ID 可能不一致 |
| 2 | `PageManager._cleanupEngines()` | `MemoryCardEngine.timer` | 直接访问 `timer` | 其他引擎检查 `cleanup()` 方法 | 清理逻辑不一致，MemoryCardEngine 没有 `cleanup()` 检查 |
| 3 | `CalendarEngine` | `checkIn()` / `checkin()` | 命名不一致 | 两者互为别名：`checkIn(){CheckinEngine.checkin()}, checkin:function(){return this.checkIn()}` | 冗余但功能正常 |

---

## 4. GameState._data 裸访问风险

**问题描述**: 大量引擎直接读写 `GameState._data.xxx`，而不是通过 `GameState.get()` / `GameState.set()` API。

**高风险调用点**:
- `GameState._data.coins` - 被 `CoinRainEngine`, `GachaEngine`, `BlindBoxEngine` 等直接读写
- `GameState._data.stats` - 被几乎所有游戏引擎直接访问
- `GameState._data.cards` - 被 `CardDropEngine`, `CardFragmentEngine` 等直接访问
- `GameState._data.checkinDates` - 被 `CalendarEngine`, `CheckinEngine` 直接访问
- `GameState._data.dailyTasks` - 被 `DailyTaskEngine` 直接访问

**风险**: 如果 `GameState._data` 为 `null`（未初始化），所有直接访问会导致运行时错误。虽然 `GameState.init()` 在启动时调用，但代码中存在防御性检查不足的情况。

---

## 5. 其他接口问题

| # | 问题 | 位置 | 描述 |
|---|------|------|------|
| 1 | `UniversalSystemViewer.pets` 导航错误 | `game-engines.js:992` | 导航到 `pets` 但页面 ID 为 `pet`，`patch-v75.js` 已修复 |
| 2 | `ComboEngine._fireMilestone` 缺少错误边界 | `game-engines.js` | 调用 `showSpectacleText` 和 `showConfetti` 前未检查是否存在，`patch-v75.js` 已包装修复 |
| 3 | `DailyTaskEngine` 任务检查逻辑缺陷 | `game-engines.js` | `open1box` 和 `boss1` 任务的检查函数始终返回 `true`（硬编码），`patch-v75.js` 已修复为基于实际统计数据的检查 |
| 4 | `BattleEngine` 的 boss 随机选择 | `archive/BattleEngine.js` | 原代码 `Math.floor(4*Math.random())` 永远选不到第5个boss（灾害魔王），`game-engines.js` 已修复为 `Math.floor(Math.random() * this.bosses.length)` |
| 5 | `Modal.show()` 自动调用 `init()` | `game-engines.js` | 如果 DOM 中缺少 `modalOverlay` 或 `modalContent` 元素，`init()` 会失败 |
| 6 | `PageManager._refreshPage` 的 toolbar 检查 | `game-engines.js` | 检查 `document.querySelector(".menu-toolbar")` 但只在部分页面显示，可能返回 null |
| 7 | `GameState.save()` 返回值未处理 | 多处 | `save()` 返回 `true`/`false`，但调用方通常不处理返回值 |
| 8 | `GameState` 的 `beforeunload` 事件 | `game-engines.js:378` | 使用 `GameState.save()` 而非 `GameState._save()`，但 `patch-v75.js` 试图修复 `_save` 并添加了直接 localStorage 保存 |
| 9 | `patch-v75.js` 冗余兜底 | `patch-v75.js` | `QuizEngine.startSpeed()`, `TutorialEngine.reset()`, `GameState.get()`, `GameState.reset()` 等已在 `game-engines.js` 中定义，补丁中的兜底永远不会执行 |
| 10 | `V10Toast` 调用 | `SurvivalEngine`, `ReactionGameV2` | `game-engines.js` 中 `SurvivalEngine` 和 `ReactionGameV2` 调用了 `V10Toast.success()` 和 `V10Toast.error()`，但 `V10Toast` 在 `game-engines.js` 中未定义，仅在 `patch-v75.js` 中定义 |

---

## 6. 问题汇总统计

| 类别 | 数量 | 严重程度 |
|------|------|---------|
| 方法调用不存在 | 7 | 🔴 高 |
| 引擎缺失定义 | 10 | 🔴 高 |
| 参数/命名不一致 | 3 | 🟡 中 |
| GameState._data 裸访问 | 大量 | 🟡 中 |
| 其他接口问题 | 10 | 🟡 中 |

---

## 7. 修复建议

### 优先级 1（立即修复）
1. **将 `GameState._save()` 调用改为 `GameState.save()`** - 在 `patch-v75.js` 和 `sfx.js` 中
2. **将缺失的引擎定义合并到 `game-engines.js`** - `AudioManager`, `VisualFX`, `BGMEngine`, `TransitionEngine`, `LevelEngine`, `SettingsEngine`, `V10Toast` 等
3. **为 `StatsEngine` 添加 `_getCategoryStats()` 方法** - 在 `game-engines.js` 中定义

### 优先级 2（尽快修复）
4. **统一 `GameState._data` 访问方式** - 所有直接访问改为通过 `get()` / `set()` API
5. **统一 `PageManager._cleanupEngines` 的清理逻辑** - 所有引擎统一使用 `cleanup()` 方法
6. **移除 `CalendarEngine` 的冗余命名** - 统一使用 `checkIn()` 或 `checkin()`
7. **检查 `QuizEngine._initUI` 的 DOM ID 映射** - 确认 `survivalHud` vs `quizHpBar`

### 优先级 3（后续优化）
8. **移除 `patch-v75.js` 的冗余兜底** - 将必要的兜底合并到 `game-engines.js`，移除已不需要的兜底（如 `QuizEngine.startSpeed`, `TutorialEngine.reset`, `GameState.get` 等）
9. **添加引擎依赖检查工具** - 在启动时验证所有引擎是否已定义
10. **确保 `allEngines` 数组中所有引用的引擎在 `game-engines.js` 中都有定义** - 避免 `ReferenceError`

---

## 8. 结论

`game-engines.js` 是一个单文件巨型引擎仓库，包含所有游戏引擎的对象字面量定义。但由于重构过程中的遗漏，**大量引擎方法调用指向不存在的目标**，而这些问题目前被 `patch-v75.js` 运行时补丁和 `sfx.js` 兜底修复。

**核心问题**:
- `game-engines.js` 缺少 **10 个引擎**的完整定义（`AudioManager`, `VisualFX`, `BGMEngine`, `TransitionEngine`, `LevelEngine`, `SettingsEngine`, `ReportEngine`, `AmbientParticles`, `V10Toast`, `GuideEnhancer`）
- **7 个方法调用**指向不存在的目标方法（`GameState._save`, `StatsEngine._getCategoryStats`, `LevelEngine.getLevel`, `LevelEngine.getNextLevel`, `LevelEngine.addXP`）
- `allEngines` 数组（第 1005 行）和 `_engineMap` 对象（第 1009 行）引用了未在 `game-engines.js` 中定义的引擎变量，如果加载顺序错误会导致 `ReferenceError`
- 大量代码直接访问 `GameState._data`，缺乏封装

**建议**:
- 将 `patch-v75.js` 的兜底代码合并到 `game-engines.js` 中，消除运行时依赖
- 统一 `GameState` 的访问方式，增强数据封装
- 建立引擎接口测试，防止类似问题再次发生
- 确保 `allEngines` 和 `_engineMap` 中引用的所有引擎都在 `game-engines.js` 中有定义
