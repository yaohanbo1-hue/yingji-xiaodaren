# Inspector_GameCore 检查报告

**检查对象**: `game.js` 核心引擎  
**检查时间**: 2026-06-14  
**检查者**: Inspector_GameCore  
**文件大小**: 349,395 字节 (~341 KB)  
**文件行数**: 27 行（高度压缩的单行 JS）  

---

## 1. 语法检查

| 检查项 | 结果 | 说明 |
|--------|------|------|
| `node -c game.js` | ✅ 通过 | 无语法错误 |
| 大括号 `{}` 平衡 | ✅ 平衡 | 差值: 0 |
| 圆括号 `()` 平衡 | ✅ 平衡 | 差值: 0 |
| 方括号 `[]` 平衡 | ✅ 平衡 | 差值: 0 |

---

## 2. `_refreshPage` 函数完整内容分析

### 2.1 函数结构概览

```javascript
_refreshPage(pageId) {
  var toolbar = document.querySelector(".menu-toolbar");
  if (toolbar) {
    var showToolbarPages = [...]; // 28 个页面
    toolbar.style.display = showToolbarPages.indexOf(pageId) >= 0 ? "flex" : "none";
    // 设置 active 按钮高亮
  }
  var app = document.getElementById("app");
  var noPointerPages = [...]; // 12 个页面
  app && (app.style.pointerEvents = noPointerPages.indexOf(pageId) >= 0 ? "none" : "");
  
  // BGM 引擎调用
  "undefined" != typeof BGMEngine && (...);
  
  // 各页面条件引擎调用（19 个）
  "firstaid" === pageId && void 0 !== FirstAidEngine && FirstAidEngine.render();
  void 0 !== StoryEngine && StoryEngine._renderChapterSelect();  // ⚠️ 无条件调用！
  "time-escape" === pageId && void 0 !== TimeEscapeEngine && (...);
  // ... 更多页面
}
```

### 2.2 `showToolbarPages` 数组检查

**包含 28 个页面**：

```
menu, codex, achievements, stats, leaderboard, character, shop, settings,
pet, guide, diary, museum, firstaid, workshop, gacha, music, eggs, base,
knowledge-race, reaction, memory-card, campaign, story-adventure,
supplydrop, precision, time-escape, study, story
```

| 检查结果 | 状态 |
|----------|------|
| 所有 28 个页面在 `index.html` 中均有对应 `id="page-xxx"` | ✅ 通过 |

### 2.3 `noPointerPages` 数组检查

**包含 12 个页面**：

```
battle, quiz, free, speed, pk, survival, bossrush, daily, timed,
time-escape, disasterquiz, kit
```

| 检查结果 | 状态 |
|----------|------|
| 所有 12 个页面在 `index.html` 中均有对应 `id="page-xxx"` | ✅ 通过 |

### 2.4 页面分类重复检查

| 页面 | 问题 | 说明 |
|------|------|------|
| `time-escape` | ⚠️ **重复出现** | 同时存在于 `showToolbarPages` 和 `noPointerPages` 中 |

- 切换到 `time-escape` 时，`toolbar` 会显示，同时 `app` 的 `pointerEvents` 被设为 `none`
- 如果 `toolbar` 是 `#app` 的子元素，则按钮无法点击；如果是同级元素，则行为可能不一致
- **建议**: 明确 `time-escape` 是否应显示工具栏，若不显示则从 `showToolbarPages` 中移除

### 2.5 引擎调用完整性检查

`_refreshPage` 中根据页面条件调用的引擎：

| 页面 | 引擎 | 调用方法 | 状态 |
|------|------|----------|------|
| `firstaid` | `FirstAidEngine` | `.render()` | ✅ |
| `time-escape` | `TimeEscapeEngine` | `.init()` + `._showQuestion()` | ✅ |
| `precision` | `PrecisionEngine` | `.init()` + `._showQuestion()` | ✅ |
| `music` | `MusicEngine` | `.render()` | ✅ |
| `eggs` | `EggEngine` | `.render()` | ✅ |
| `base` | `BaseEngine` | `.render()` | ✅ |
| `museum` | `DisasterMuseumEngine` | `.render()` | ✅ |
| `stats` | `StatsEngine` | `.render()` | ✅ |
| `achievements` | `AchievementEngine` | `.renderList()` | ✅ |
| `codex` | `CodexEngine` | `.render()` | ✅ |
| `shop` | `ShopEngine` | `.render()` | ✅ |
| `leaderboard` | `LeaderboardEngine` | `.render()` | ✅ |
| `character` | `CharacterEngine` | `.render()` | ✅ |
| `minigame` | `MiniGameEngine` | `.renderMenu()` | ✅ |
| `calendar` | `CalendarEngine` | `.render()` | ✅ |
| `encyclopedia` | `EncyclopediaEngine` | `.render()` | ✅ |
| `daily` | `DailyChallengeEngine` | `.render()` | ✅ |
| `settings` | `SettingsEngine` | `.render()` | ✅ |
| `story` | `StoryEngine` | `.startChapter(0)` | ✅ |

### 2.6 HTML 中存在但 `_refreshPage` 未处理的页面

以下 12 个页面在 `index.html` 中有定义，但既不在 `showToolbarPages` 也不在 `noPointerPages` 中，**意味着切换到这些页面时 toolbar 会隐藏且 pointerEvents 保持默认**：

```
ai-tutor, battle-lobby, certification, disaster-sim, encyclopedia,
real-cases, report, report-detail, scenario, wrong-book, minigame,
calendar
```

**注**: `encyclopedia`, `calendar`, `minigame` 虽然不在两个数组中，但 `_refreshPage` 内有对应的引擎调用。这意味着这些页面切换时会正确触发引擎，但 toolbar 不会显示。

---

## 3. 引擎名称拼写一致性检查

### 3.1 🔴 严重：同一引擎存在两种拼写

| 拼写 A | 引用次数 | 拼写 B | 引用次数 | 问题 |
|--------|----------|--------|----------|------|
| `TimedEscapeEngine` | 5 | `TimeEscapeEngine` | 5 | **同一引擎两种拼写** |
| `PrecisionStrikeEngine` | 6 | `PrecisionEngine` | 6 | **同一引擎两种拼写** |

**分析**：
- `_refreshPage` 中使用的是 `TimeEscapeEngine` 和 `PrecisionEngine`
- 但在代码的其他位置（如 `TimedChallengeEngine` 相关逻辑）使用了 `TimedEscapeEngine` 和 `PrecisionStrikeEngine`
- 如果游戏同时定义了这两个名称，则会导致状态不一致；如果只定义了一个，则另一个引用会静默失败（因为使用了 `void 0 !== ...` 保护）

**修复建议**：
1. 统一命名：`TimeEscapeEngine` ↔ `TimedEscapeEngine` 选择一个
2. 统一命名：`PrecisionEngine` ↔ `PrecisionStrikeEngine` 选择一个
3. 检查 `index.html` 中对应元素的 id 是否与引擎名称匹配

### 3.2 引擎引用统计表（_refreshPage 中）

| 引擎 | 在 _refreshPage 中调用次数 |
|------|---------------------------|
| `FirstAidEngine` | 1 |
| `StoryEngine` | 2 ⚠️ |
| `TimeEscapeEngine` | 1 |
| `PrecisionEngine` | 1 |
| `MusicEngine` | 1 |
| `EggEngine` | 1 |
| `BaseEngine` | 1 |
| `DisasterMuseumEngine` | 1 |
| `StatsEngine` | 1 |
| `AchievementEngine` | 1 |
| `CodexEngine` | 1 |
| `ShopEngine` | 1 |
| `LeaderboardEngine` | 1 |
| `CharacterEngine` | 1 |
| `MiniGameEngine` | 1 |
| `CalendarEngine` | 1 |
| `EncyclopediaEngine` | 1 |
| `DailyChallengeEngine` | 1 |
| `SettingsEngine` | 1 |
| `PageManager` | 1（事件委托） |

### 3.3 全局引擎引用统计（全文件）

| 引擎 | 总引用次数 | 定义状态 |
|------|-----------|----------|
| `AudioManager` | 113 | ✅ 在 game.js 中定义 |
| `PageManager` | 58 | ✅ 在 game.js 中定义 |
| `LevelEngine` | 32 | ✅ 在 game.js 中定义 |
| `QuizEngine` | 31 | ✅ 在 game.js 中定义 |
| `ShopEngine` | 16 | ✅ 在 game.js 中定义 |
| `AchievementEngine` | 16 | ✅ 在 game.js 中定义 |
| `BGMEngine` | 14 | ⚠️ 未在 game.js 中定义（外部文件） |
| `EncyclopediaEngine` | 14 | ✅ 在 game.js 中定义 |
| `MiniGameEngine` | 14 | ✅ 在 game.js 中定义 |
| `BattleEngine` | 12 | ✅ 在 game.js 中定义 |
| `CharacterEngine` | 12 | ✅ 在 game.js 中定义 |
| `ThemeEngine` | 11 | ✅ 在 game.js 中定义 |
| `StoryChallengeEngine` | 9 | ✅ 在 game.js 中定义 |
| `CalendarEngine` | 9 | ✅ 在 game.js 中定义 |
| `StoryEngine` | 9 | ⚠️ 未在 game.js 中定义（外部文件） |
| `BaseEngine` | 8 | ✅ 在 game.js 中定义 |
| `CodexEngine` | 8 | ✅ 在 game.js 中定义 |
| `SettingsEngine` | 8 | ✅ 在 game.js 中定义 |
| `FirstAidEngine` | 8 | ⚠️ 未在 game.js 中定义（外部文件） |
| `LeaderboardEngine` | 7 | ✅ 在 game.js 中定义 |
| `DisasterMuseumEngine` | 7 | ✅ 在 game.js 中定义 |
| `StatsEngine` | 7 | ✅ 在 game.js 中定义 |
| `PrecisionEngine` | 6 | ⚠️ 未在 game.js 中定义（外部文件） |
| `PrecisionStrikeEngine` | 6 | ⚠️ 未在 game.js 中定义（可能拼写错误） |
| `DailyChallengeEngine` | 6 | ✅ 在 game.js 中定义 |
| `PetEngine` | 6 | ✅ 在 game.js 中定义 |
| `OutfitEngine` | 6 | ✅ 在 game.js 中定义 |
| `MusicEngine` | 6 | ✅ 在 game.js 中定义 |
| `StudyEngine` | 6 | ✅ 在 game.js 中定义 |
| `TimedEscapeEngine` | 5 | ⚠️ 未在 game.js 中定义（可能拼写错误） |
| `TimeEscapeEngine` | 5 | ⚠️ 未在 game.js 中定义（外部文件） |
| `ScenarioEngine` | 5 | ✅ 在 game.js 中定义 |
| `KitEngine` | 5 | ✅ 在 game.js 中定义 |
| `TutorialEngine` | 5 | ✅ 在 game.js 中定义 |
| `PKEngine` | 4 | ✅ 在 game.js 中定义 |
| `SurvivalEngine` | 4 | ✅ 在 game.js 中定义 |
| `BossRushEngine` | 4 | ✅ 在 game.js 中定义 |
| `GachaEngine` | 4 | ✅ 在 game.js 中定义 |
| `TimedChallengeEngine` | 4 | ✅ 在 game.js 中定义 |
| `EggEngine` | 3 | ✅ 在 game.js 中定义 |
| `TransitionEngine` | 3 | ⚠️ 未在 game.js 中定义（外部文件） |
| `GuideEngine` | 3 | ✅ 在 game.js 中定义 |
| `StoryAdventureEngine` | 3 | ✅ 在 game.js 中定义 |
| `ReactionEngine` | 3 | ✅ 在 game.js 中定义 |
| `BlindBoxEngine` | 3 | ✅ 在 game.js 中定义 |
| `CheckinEngine` | 3 | ✅ 在 game.js 中定义 |
| `MemoryCardEngine` | 2 | ✅ 在 game.js 中定义 |
| `KnowledgeRaceEngine` | 2 | ✅ 在 game.js 中定义 |
| `CampaignEngine` | 1 | ❌ **未定义**（在 game.js 中无定义） |
| `SpeedChallengeEngine` | 1 | ❌ **未定义**（在 game.js 中无定义） |
| `FreeModeEngine` | 1 | ❌ **未定义**（在 game.js 中无定义） |
| `VolumeEngine` | 1 | ❌ **未定义**（在 game.js 中无定义） |
| `AudioEngine` | 2 | ❌ **未定义**（在 game.js 中无定义） |
| `MapEngine` | 2 | ❌ **未定义**（在 game.js 中无定义） |
| `AITutorEngine` | 8 | ❌ **未定义**（在 game.js 中无定义） |

---

## 4. PageManager 检查

### 4.1 `navigate` 函数

```javascript
navigate(pageId) {
  try {
    if (void 0 !== Modal && Modal.hide(),
        AudioManager.play("whoosh"),
        "undefined" != typeof VisualFX)
      return void VisualFX.diagonalTransition(() => { ... });
    
    void 0 !== TransitionEngine && TransitionEngine.flash(150);
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    const target = document.getElementById(`page-${pageId}`);
    target && target.classList.add("active");
    this._currentPage = pageId;
    this._refreshPage(pageId);
  } catch (e) {}
}
```

| 检查项 | 状态 | 说明 |
|--------|------|------|
| 页面切换时移除所有 `.active` | ✅ | `document.querySelectorAll(".page").forEach(...)` |
| 为目标页面添加 `.active` | ✅ | `target.classList.add("active")` |
| 更新 `_currentPage` | ✅ | `this._currentPage = pageId` |
| 调用 `_refreshPage` | ✅ | 已调用 |
| 异常处理 | ⚠️ | `catch (e) {}` 为空捕获，静默吞掉所有错误 |

### 4.2 `show` / `hide` 函数

PageManager 没有显式的 `show` 和 `hide` 方法，页面显示/隐藏是通过添加/移除 `active` 类实现的。`navigate` 函数已正确处理了这一点。

---

## 5. 全局变量定义检查

### 5.1 在 game.js 中定义的全局对象

```
Modal, PageManager, AudioManager, ThemeEngine, JuiceEngine,
I18nEngine, GameState, AdaptiveDifficulty, CardSynergy,
BattleEngine, TutorialEngine, EncyclopediaEngine
```

以及模块清单中列出的约 50+ 个引擎（通过 `const XxxEngine = {...}` 定义）。

### 5.2 ⚠️ 可能未定义但在 game.js 中被引用的变量

以下变量在 `game.js` 中被引用，但在**本文件内**没有定义（可能依赖外部文件或拼写错误）：

| 变量 | 引用次数 | 风险级别 | 说明 |
|------|----------|----------|------|
| `AITutorEngine` | 8 | 🔴 高 | 未定义，可能导致 `ai-tutor` 页面功能异常 |
| `CampaignEngine` | 1 | 🔴 高 | 未定义 |
| `SpeedChallengeEngine` | 1 | 🔴 高 | 未定义 |
| `FreeModeEngine` | 1 | 🔴 高 | 未定义 |
| `VolumeEngine` | 1 | 🔴 高 | 未定义 |
| `AudioEngine` | 2 | 🟡 中 | 未定义（可能应为 `AudioManager`） |
| `MapEngine` | 2 | 🟡 中 | 未定义 |
| `BGMEngine` | 14 | 🟢 低 | 在 `bgm.js` 或 `bgm-enhanced.js` 中定义 |
| `StoryEngine` | 9 | 🟢 低 | 在 `story.js` 或 `story-adventure.js` 中定义 |
| `FirstAidEngine` | 8 | 🟢 低 | 在 `firstaid.js` 中定义 |
| `TransitionEngine` | 3 | 🟢 低 | 在 `transitions.css` 或 `transitions.js` 中定义 |
| `PrecisionEngine` | 6 | 🟢 低 | 在 `precision.js` 中定义 |
| `TimeEscapeEngine` | 5 | 🟢 低 | 在 `time-escape.js` 中定义 |

### 5.3 `Modal` 与 `PageManager` 定义检查

| 变量 | 状态 | 说明 |
|------|------|------|
| `Modal` | ✅ 已定义 | `const Modal = {...}` 在文件开头 |
| `PageManager` | ✅ 已定义 | `PageManager = {...}` 在文件开头 |
| `AudioManager` | ✅ 已定义 | `const AudioManager = {...}` 紧跟 PageManager 之后 |
| `GameState` | ✅ 已定义 | 在文件中定义 |

---

## 6. 发现的问题汇总（按优先级分类）

### 🔴 P0 — 严重问题（必须修复）

#### 问题 1: `StoryEngine` 被无条件调用

**位置**: `_refreshPage` 函数内  
**代码**:
```javascript
void 0 !== StoryEngine && StoryEngine._renderChapterSelect();
```

**问题描述**: 这行代码**没有页面条件判断**，意味着**每次页面切换**都会调用 `StoryEngine._renderChapterSelect()`，而不是仅在切换到 `story` 页面时调用。这会导致：
- 不必要的 DOM 操作
- 可能覆盖其他页面的状态
- 性能浪费

**修复建议**:
```javascript
"story" === pageId && void 0 !== StoryEngine && StoryEngine._renderChapterSelect();
```
或删除此行（因为下方已有 `story` 页面的处理逻辑）。

#### 问题 2: 引擎名称拼写不一致

**问题描述**: 同一逻辑引擎存在两种拼写，导致代码维护和状态同步困难。

| 页面 | 引擎名称 A | 引擎名称 B | 影响 |
|------|-----------|-----------|------|
| time-escape | `TimeEscapeEngine` | `TimedEscapeEngine` | 两个独立的对象引用 |
| precision | `PrecisionEngine` | `PrecisionStrikeEngine` | 两个独立的对象引用 |

**修复建议**: 统一使用一个名称，全局替换另一个。

#### 问题 3: 多个引擎完全未定义

| 引擎 | 影响 |
|------|------|
| `AITutorEngine` | `ai-tutor` 页面功能异常（8 处引用） |
| `CampaignEngine` | `campaign` 页面功能异常 |
| `SpeedChallengeEngine` | `speed` 挑战功能异常 |
| `FreeModeEngine` | 自由模式功能异常 |
| `VolumeEngine` | 音量控制功能异常 |
| `AudioEngine` | 音频功能异常（2 处引用，可能应为 `AudioManager`） |
| `MapEngine` | 地图功能异常（2 处引用） |

**修复建议**: 
- 如果这些引擎应在 `game.js` 中定义，补充定义
- 如果是外部文件，确保加载顺序正确
- `AudioEngine` 应检查是否应为 `AudioManager`

---

### 🟡 P1 — 中等问题（建议修复）

#### 问题 4: `time-escape` 页面重复分类

**问题描述**: `time-escape` 同时存在于 `showToolbarPages` 和 `noPointerPages` 中，导致页面切换时 toolbar 显示但 `app` 元素不接受指针事件。如果 toolbar 是 `#app` 的子元素，则用户无法点击工具栏按钮。

**修复建议**: 确认设计意图，从 `showToolbarPages` 或 `noPointerPages` 中移除其一。

#### 问题 5: 多个 HTML 页面未在 `_refreshPage` 中处理

**以下页面没有对应的引擎初始化或特殊处理**：

```
ai-tutor, battle-lobby, certification, disaster-sim, real-cases,
report, report-detail, scenario, wrong-book
```

这些页面切换到后不会有任何引擎初始化调用，可能导致页面状态不正确。

**修复建议**: 为需要的页面添加引擎调用，或确认这些页面是否不需要特殊处理。

#### 问题 6: `navigate` 的 `catch` 块为空

```javascript
try { ... } catch (e) {}
```

**问题描述**: 所有异常被静默吞掉，调试时无法定位问题。

**修复建议**:
```javascript
catch (e) {
  console.error("PageManager.navigate error:", e);
}
```

---

### 🟢 P2 — 轻微问题（可选修复）

#### 问题 7: 模块清单版本号不一致

- 文件注释写 `@version 1.1.0`
- 文件标题写 `v1.2.0`

**修复建议**: 统一版本号为 `v1.2.0`（或实际版本）。

#### 问题 8: 一些引擎引用次数极低

| 引擎 | 引用次数 | 说明 |
|------|----------|------|
| `CampaignEngine` | 1 | 可能是未完成的模块 |
| `SpeedChallengeEngine` | 1 | 可能是未完成的模块 |
| `FreeModeEngine` | 1 | 可能是未完成的模块 |
| `VolumeEngine` | 1 | 可能是未完成的模块 |

---

## 7. 修复建议清单

### 立即修复（P0）

1. **修正 `StoryEngine` 无条件调用**：
   ```javascript
   // 删除此行或添加条件
   // "story" === pageId && void 0 !== StoryEngine && StoryEngine._renderChapterSelect();
   ```

2. **统一引擎拼写**：
   - 确定 `TimeEscapeEngine` vs `TimedEscapeEngine` 的正确名称
   - 确定 `PrecisionEngine` vs `PrecisionStrikeEngine` 的正确名称
   - 全局替换错误的拼写

3. **补充未定义引擎**：
   - 在 `game.js` 中补充 `AITutorEngine`, `CampaignEngine`, `SpeedChallengeEngine`, `FreeModeEngine`, `VolumeEngine` 的占位定义
   - 或确认这些引擎是否在外部文件中定义并确保加载顺序正确

### 建议修复（P1）

4. **处理 `time-escape` 页面分类重复**
5. **为 `navigate` 添加错误日志**
6. **为缺失处理的页面补充引擎调用**

### 可选优化（P2）

7. **统一版本号注释**
8. **代码格式化**（当前为单行 350KB，可读性极差）

---

## 8. 附录：_refreshPage 原始文本

> 注：以下为从 game.js 中提取的 `_refreshPage` 函数完整文本（已格式化），包含后续的 `AudioManager` 定义和事件委托代码：

```javascript
_refreshPage(pageId) {
  var toolbar = document.querySelector(".menu-toolbar");
  if (toolbar) {
    var showToolbarPages = [
      "menu","codex","achievements","stats","leaderboard",
      "character","shop","settings","pet","guide","diary",
      "museum","firstaid","workshop","gacha","music","eggs",
      "base","knowledge-race","reaction","memory-card","campaign",
      "story-adventure","supplydrop","precision","time-escape","study","story"
    ];
    toolbar.style.display = showToolbarPages.indexOf(pageId) >= 0 ? "flex" : "none";
    var toolbarBtns = document.querySelectorAll(".menu-toolbar .tool-btn");
    toolbarBtns.forEach(btn => btn.classList.remove("active"));
    var activeBtn = document.querySelector('.menu-toolbar .tool-btn[data-nav="'+pageId+'"]');
    activeBtn && activeBtn.classList.add("active");
  }
  var app = document.getElementById("app");
  var noPointerPages = [
    "battle","quiz","free","speed","pk","survival","bossrush",
    "daily","timed","time-escape","disasterquiz","kit"
  ];
  app && (app.style.pointerEvents = noPointerPages.indexOf(pageId) >= 0 ? "none" : ""),
  
  "undefined" != typeof BGMEngine && (
    "menu" === pageId ? BGMEngine.playMenuBgm() : 
    "encyclopedia" !== pageId && "scenario" !== pageId || BGMEngine.playScenarioBgm()
  ),
  
  "firstaid" === pageId && void 0 !== FirstAidEngine && FirstAidEngine.render(),
  void 0 !== StoryEngine && StoryEngine._renderChapterSelect(),  // ⚠️ 无条件调用
  "time-escape" === pageId && void 0 !== TimeEscapeEngine && (
    TimeEscapeEngine.init(), TimeEscapeEngine._showQuestion()
  ),
  "precision" === pageId && void 0 !== PrecisionEngine && (
    PrecisionEngine.init(), PrecisionEngine._showQuestion()
  ),
  "music" === pageId && void 0 !== MusicEngine && (
    document.getElementById("music-content") && 
    (document.getElementById("music-content").innerHTML = MusicEngine.render())
  ),
  "eggs" === pageId && void 0 !== EggEngine && (
    document.getElementById("eggs-content") && 
    (document.getElementById("eggs-content").innerHTML = EggEngine.render())
  ),
  "base" === pageId && void 0 !== BaseEngine && (
    document.getElementById("base-content") && 
    (document.getElementById("base-content").innerHTML = BaseEngine.render())
  ),
  "museum" === pageId && void 0 !== DisasterMuseumEngine && (
    document.getElementById("museum-content") && 
    (document.getElementById("museum-content").innerHTML = DisasterMuseumEngine.render())
  ),
  "stats" === pageId && void 0 !== StatsEngine && StatsEngine.render(),
  "achievements" === pageId && void 0 !== AchievementEngine && AchievementEngine.renderList(),
  "codex" === pageId && void 0 !== CodexEngine && CodexEngine.render(),
  "shop" === pageId && void 0 !== ShopEngine && ShopEngine.render(),
  "leaderboard" === pageId && void 0 !== LeaderboardEngine && LeaderboardEngine.render(),
  "character" === pageId && void 0 !== CharacterEngine && CharacterEngine.render(),
  "minigame" === pageId && void 0 !== MiniGameEngine && MiniGameEngine.renderMenu(),
  "calendar" === pageId && void 0 !== CalendarEngine && CalendarEngine.render(),
  "encyclopedia" === pageId && void 0 !== EncyclopediaEngine && EncyclopediaEngine.render(),
  "daily" === pageId && void 0 !== DailyChallengeEngine && DailyChallengeEngine.render(),
  "settings" === pageId && void 0 !== SettingsEngine && SettingsEngine.render && SettingsEngine.render(),
  "story" === pageId && void 0 !== StoryEngine && StoryEngine.startChapter(0)
}
```

---

*报告生成完毕 — Inspector_GameCore*
