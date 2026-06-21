## Bug检查Agent_3 报告 — 跨模块交互与全局状态管理

> **检查日期**: 2026-06-21  
> **检查范围**: game-engines.js, game-core.js, index.html, archive/Modal.js, archive/QuizEngine.js, archive/PageManager.js  
> **检查项**: 全局状态冲突、模块生命周期、状态持久化、全局事件、跨模块数据流、控制台错误

---

### 一、发现的问题（按严重程度）

#### 🔴 严重问题

**1. [严重] QuizEngine普通答题模式完成时不增加金币和经验**
- **位置**: `game-engines.js` QuizEngine.showResult() (约第716行起)
- **问题**: `showResult()` 中只更新了 `stats`（gamesPlayed、correct、wrong、totalEarned、highestScore、maxStreak），但没有调用 `GameState.addCoins()` 或 `GameState.addExp()` 来增加用户实际的金币余额和经验值。
- **影响**: 用户答完题目后，统计数字更新但金币和经验不增加，导致用户无法获得答题奖励。
- **证据**:
  ```javascript
  showResult(){
    // 只更新了 stats，没有 addCoins/addExp
    GameState._data.stats.gamesPlayed++;
    GameState._data.stats.correct += this.correct;
    GameState._data.stats.wrong += this.wrong;
    GameState._data.stats.totalEarned += this.score; // 只是统计，不是实际加金币
    // ... 缺少 GameState.addCoins(this.score) 和 GameState.addExp(...)
  }
  ```

**2. [严重] 多个模块直接修改 `GameState._data`，绕过封装方法，存在竞态条件**
- **位置**: 遍布 `game-engines.js` 多处
- **问题**: 以下模块直接操作 `GameState._data.coins += ...` 或 `GameState._data.xxx = ...`，而不是通过 `GameState.addCoins()` / `GameState.set()` 方法：
  - **BattleEngine**: `GameState._data.coins += totalCoins` (击败Boss)
  - **BattleEngine**: `GameState._data.bossDefeated++` / `GameState._data.battleWins++`
  - **KnowledgeRaceEngine**: `GameState._data.coins += ...` / `GameState._data.battleLosses++`
  - **MemoryCardEngine**: `GameState._data.coins += ...`
  - **PrecisionEngine**: `GameState._data.coins += ...`
  - **TimeEscapeEngine**: `GameState._data.coins += ...`
  - **DisasterQuizGame**: `GameState._data.coins += ...` / `GameState._data.correct += ...`
  - **GachaEngine**: `GameState._data.stats.gachaPlayed++` 后直接 `GameState.save()`
- **影响**: 如果两个操作同时执行（如答题同时触发成就），直接修改 `_data` 再调用 `save()` 可能导致数据覆盖丢失。例如：模块A读取 `_data.coins` → 模块B读取 `_data.coins` → 模块A写回+10 → 模块B写回+20（基于旧值），结果只加了20而不是30。

**3. [严重] GameState.save() 在多处高频调用，localStorage 写入可能失败但无重试机制**
- **位置**: `game-engines.js` 中几乎每个用户操作后都调用 `GameState.save()`
- **问题**: 
  - `addCoins()` → `save()`
  - `addExp()` → `save()`
  - `addCard()` → `save()`
  - 盲盒开启 → `save()`
  - 答题每题正确 → `save()`（在 `_handleCorrect` 中，如果获得新卡片就 `save()`）
  - 签到 → `save()`
  - 日记保存 → `save()`
- **影响**: 
  - 高频 localStorage 写入可能导致性能问题（尤其在低端设备）。
  - 如果某次写入失败（如存储配额超限），`SafeStorage` monkey-patch 只打印了错误但没有重试或回滚机制，数据可能丢失。
  - 没有写入队列或防抖，短时间内多次 save 会覆盖彼此。

**4. [严重] 页面切换时定时器未清理，导致内存泄漏和状态混乱**
- **位置**: 多个游戏引擎
- **问题**:
  - **QuizEngine**: `timerInterval` 在 `showResult()` 中会 `clearTimer()`，但如果用户直接点击返回菜单（通过 `PageManager.navigate("menu")`），不会触发清理。
  - **DisasterQuizGame**: `_timer` 在 `answer()` 中会清理，但页面切换时不会自动清理。
  - **TimedChallengeEngine**: `_timer` 在 `gameOver()` 中清理，但页面切换时不会清理。
  - **TimeEscapeEngine**: `timer` 在 `_gameOver()` 中清理，但页面切换时不会清理。
  - **KnowledgeRaceEngine**: `timer` 在 `_gameOver()` 中清理，但页面切换时不会清理。
  - **ReactionEngine**: `targetTimeout` 在 `_hit()` 后会重新设置，但页面切换时不会清理。
  - **BattleEngine**: `VisualFX.startBattleParticles()` 启动的粒子效果在页面切换时没有被 `VisualFX.stopBattleParticles()` 清理。
- **影响**: 用户在不同游戏间切换时，旧的定时器继续运行，可能导致：
  - 内存泄漏
  - 控制台错误（DOM 元素已不存在但定时器仍在尝试更新）
  - 游戏状态混乱（如旧游戏的计时器继续倒计时）

**5. [严重] 动态添加的 DOM 事件监听器和覆盖层未被清理**
- **位置**: `CardDropEngine.dropCard()`、`JuiceEngine.screenFlash()`、`CoinRainEngine._spawnCoin()`、`Certificate.show()` 等
- **问题**:
  - `CardDropEngine` 创建覆盖层 (`card-drop-overlay`) 并添加 click 事件监听器，但只在点击时移除，如果用户通过页面切换离开，覆盖层会一直留在 DOM 中。
  - `JuiceEngine.screenFlash()` 创建 flash 覆盖层，设置 setTimeout 移除，但如果页面切换，setTimeout 仍然执行。
  - `CoinRainEngine._spawnCoin()` 创建的硬币元素在收集时移除，但如果页面切换，setTimeout 仍然会执行移除操作。
  - `Modal._closeBtn` 的 `onmouseenter`/`onmouseleave` 使用内联事件处理，但没有统一的移除机制。
- **影响**: 内存泄漏，DOM 中累积大量不可见的元素。

---

#### 🟡 警告问题

**6. [警告] GameState 的 `_ensureDefaults()` 浅拷贝问题**
- **位置**: `game-engines.js` GameState._ensureDefaults() (约第372行起)
- **问题**: 
  ```javascript
  this._data.stats = Object.assign({}, this._defaults.stats, this._data.stats);
  ```
  虽然 `Object.assign` 对第一层做了浅拷贝，但 `this._data.stats` 中如果已有嵌套对象（如 `kitTypesCompleted` 数组），仍然共享引用。如果后续某个模块修改了 `this._data.stats.kitTypesCompleted.push(...)`，这不会影响 `this._defaults.stats.kitTypesCompleted`，但如果有其他浅拷贝场景可能会出问题。
- **影响**: 低。目前没有发现直接导致问题的场景，但设计上有隐患。

**7. [警告] 全局错误处理器重复定义风险**
- **位置**: `game-core.js` 第86行 和 `game-engines.js` 中可能还有其他位置
- **问题**:
  ```javascript
  window.addEventListener('error', (e) => { ... });
  window.addEventListener('unhandledrejection', (e) => { ... });
  ```
  在 `game-core.js` 中定义了全局错误处理器。如果其他模块（如 `ai-tutor-v55.js`、`ai-float-v55.js`）也定义了类似的监听器，错误会被多次处理。
- **影响**: 错误日志重复输出，可能干扰调试。但不会造成功能错误。

**8. [警告] `beforeunload` / `unload` 事件未注册，页面刷新可能丢失未保存数据**
- **位置**: 整个项目
- **问题**: 没有找到任何 `beforeunload` 或 `unload` 事件监听器来确保页面关闭前保存数据。
- **影响**: 如果用户正在游戏中刷新页面，且 `GameState.save()` 最近的一次调用没有成功，数据可能丢失。虽然 `autoSave` 设置默认为 true，且 `save()` 在大多数操作后都被调用，但缺少最后一道保险。

**9. [警告] CheckinEngine 和 CalendarEngine 的签到逻辑不一致**
- **位置**: `CheckinEngine.checkin()` 和 `CalendarEngine.checkin()`
- **问题**: `CalendarEngine.render()` 中有 `onclick="CalendarEngine.checkin()"`，但 `CalendarEngine` 本身没有定义 `checkin` 方法。这意味着点击日历页面的签到按钮时，调用的是 `CheckinEngine.checkin()`（因为全局同名）。虽然这在 JavaScript 中不会报错（如果 `CalendarEngine` 没有 `checkin` 属性，会尝试解析为全局变量），但这是一种隐式依赖，代码结构不清晰。
- **影响**: 低。目前功能正常，但可维护性差。

**10. [警告] DiaryEngine.getStreak() 日期计算有边界问题**
- **位置**: `game-engines.js` DiaryEngine.getStreak() (约第281行起)
- **问题**:
  ```javascript
  if(!((new Date(curr)-new Date(prev))/864e5<=1))break;streak++
  ```
  使用 `864e5` (86400000ms = 24小时) 来判断是否连续。但如果用户在某天23:59写日记，第二天00:01再写，时间差小于24小时，但跨了两天。或者相反，在同一天的12:00和隔一天的11:00写，时间差刚好超过24小时，但实际上只隔了一天。
- **影响**: 日记连续天数计算可能不准确。应使用日期字符串比较（如 `(new Date(curr)).toDateString() !== (new Date(prev + 86400000)).toDateString()`）。

---

#### 🟢 建议问题

**11. [建议] `GameState.get()` 和 `GameState.set()` 使用不一致**
- **位置**: 遍布项目
- **问题**: 有些模块使用 `GameState.get("coins")`，有些直接 `GameState._data.coins`。建议统一使用封装方法，便于后续添加变更监听、日志记录等。

**12. [建议] `importData()` 无版本校验**
- **位置**: `SettingsEngine.importData()` (在 `game-engines.js` 末尾)
- **问题**: 导入数据时直接 `GameState._data = data`，然后 `save()`，没有校验数据版本（`GameState._version`），也没有调用 `_ensureDefaults()`。
- **影响**: 如果用户导入旧版本数据，可能导致新字段缺失，引发后续错误。虽然 `_ensureDefaults()` 在 `init()` 中会被调用，但导入数据后没有立即触发。

**13. [建议] 全局状态变更缺少事件通知机制**
- **问题**: 当 `GameState._data` 发生变化时，没有发布-订阅机制通知其他模块。例如，金币变化时，UI 需要手动更新（目前 `_updateUI()` 在 `save()` 中被调用，但依赖 `save()` 被调用）。
- **建议**: 实现简单的 EventEmitter 模式，让状态变更自动触发 UI 更新。

**14. [建议] 模块间没有明确的依赖声明**
- **问题**: `BattleEngine` 直接依赖 `QuizEngine`、`VisualFX`、`BGMEngine` 等，但这些依赖没有前置校验。如果加载顺序改变，可能导致运行时错误。
- **建议**: 使用 `GameRegistry` 来注册和获取模块，而不是直接引用全局变量。

---

### 二、跨模块数据流原子性检查

#### 1. 答对题目后金币增加、经验增加、升级触发
- **QuizEngine._handleCorrect()**: 答对时只增加 `this.score`（本地变量），不立即增加 `GameState._data.coins` 或 `exp`。
- **QuizEngine.showResult()**: 也只更新 `stats`，没有增加金币或经验。
- **结论**: ❌ **非原子性** — 实际上普通答题模式完全不奖励金币和经验，这是一个功能缺失的 Bug。
- **BattleEngine.attack() + defeatBoss()**: 击败Boss时直接 `GameState._data.coins += totalCoins` 并 `GameState.save()`，同时 `LevelEngine.addXP(xpReward)`。虽然不是原子操作，但至少在同一个代码块中连续执行，中间失败概率低。

#### 2. 盲盒开启后，卡牌加入、成就检查、金币消耗
- **BlindBoxEngine.open()**: 
  1. `GameState.spendCoins(t.cost)` → 内部调用 `GameState.save()`
  2. 更新 `blindboxPity`、`blindboxHistory`
  3. `GameState.addCard(card.id)` → 内部调用 `GameState.save()`
  4. `GameState.addExp(10 + 15 * rarityIdx)` → 内部调用 `GameState.save()`
  5. 再次 `GameState.save()` (在 open() 末尾)
- **结论**: ⚠️ **存在多次 save() 调用**，虽然每次操作是顺序执行的，但如果中间某步失败，数据可能处于不一致状态（如金币已扣但卡牌未加）。

#### 3. 签到触发时，连续天数计算、奖励发放、日记记录
- **CheckinEngine.checkin()**:
  1. 检查 `canCheckin()`（基于 `lastCheckin`）
  2. 计算连续天数（更新 `checkinStreak`）
  3. 更新 `lastCheckin`
  4. `GameState.addCoins(reward)` → `save()`
  5. 更新 `checkinDates` 数组
  6. `GameState.save()`
- **结论**: ⚠️ 第4步和第5步之间没有保护，如果 `addCoins` 成功但 `checkinDates` 更新失败（虽然不太可能发生，因为都是内存操作），签到记录和金币可能不一致。但整体来看，这是一个代码块内执行，问题较小。

---

### 三、模块生命周期管理检查

| 模块 | 定时器 | 事件监听器 | 页面切换清理 |
|------|--------|-----------|-------------|
| QuizEngine | `timerInterval` | 选项点击 (onclick) | ❌ 无清理回调 |
| DisasterQuizGame | `_timer` | 选项点击 (oncl
