# 「应急小达人」逻辑检查报告 —— 分数计算与进度系统

**检查日期:** 2026-07-03  
**检查文件:** `game-engines.js`, `patch-v75.js`  
**游戏版本:** v86 (GitHub Pages)  
**检查范围:** QuizEngine / GameState.addExp / GameState.addCoins / GameState.spendCoins / DailyTaskEngine / 各模式得分公式

---

## 执行摘要

| 级别 | 数量 | 说明 |
|------|------|------|
| 🔴 P1 致命 | 5 | 运行时 TypeError、金币溢出、等级系统双轨制冲突 |
| 🟠 P2 严重 | 6 | 每日任务逻辑错误、统计口径错误、重复领取漏洞 |
| 🟡 P3 中等 | 4 | 得分公式不一致、难度系数缺失、状态同步风险 |
| 🟢 P4 提示 | 3 | 代码风格/设计建议 |

---

## 🔴 P1 致命问题

### P1-1. `GameState.addCoins()` — 金币上限 `MAX_COINS` 完全失效（金币溢出）

**位置:** `game-engines.js:376`（GameState 对象内）

**代码:**
```javascript
addCoins(amount){
    const MAX_COINS=999999999;
    this._data.coins=Math.min((this._data.coins||0)+amount,MAX_COINS);  // ① 先 capped
    if(!this._data)return;                                               // ② null 检查太晚
    this._data.coins=(this._data.coins||0)+amount,                       // ③ 覆盖①，cap 失效！
    this._data.stats.totalEarned=(this._data.stats.totalEarned||0)+Math.max(0,amount),
    this.saveDebounced()
}
```

**问题:**
1. 第③行 **无条件覆盖** 了第①行的 `Math.min` 结果，导致 `MAX_COINS` 形同虚设。玩家理论上可突破上限。
2. `if(!this._data)return` 放在第①行之后——若 `_data` 为 `null`，第①行本身就会抛出 `TypeError: Cannot read property 'coins' of null`。
3. `totalEarned` 只累加正数，但没有与 `addExp` 联动。

**修复建议:**
```javascript
addCoins(amount){
    if(!this._data) return;
    const MAX_COINS=999999999;
    this._data.coins = Math.min((this._data.coins||0)+amount, MAX_COINS);
    this._data.stats.totalEarned = (this._data.stats.totalEarned||0) + Math.max(0, amount);
    this.saveDebounced();
}
```

---

### P1-2. `LevelEngine.addXP()` 被调用但该方法不存在 — 运行时 TypeError

**位置:** `game-engines.js:QuizEngine._handleCorrect()`  
**触发条件:** 正常答题模式答对任意一题

**代码:**
```javascript
void 0!==LevelEngine&&LevelEngine.addXP(Math.floor(10+5*comboMultiplier),"答题正确")
```

**问题:**
- `patch-v75.js` 为 `LevelEngine` 提供了 **补丁对象**，仅包含 `getLevel()` / `getNextLevel()`。
- `LevelEngine.addXP` 为 `undefined`，`undefined(...)` 会抛出 `TypeError: LevelEngine.addXP is not a function`。
- 虽然 `ErrorBoundary` 可能兜底，但会导致：
  - 答对后的经验奖励逻辑中断
  - 连击后的视觉反馈（CoinRain、CardDrop 等）可能无法执行

**同样出现在:** `KnowledgeRaceEngine._gameOver()` — `LevelEngine.addXP(xp)` 也存在此问题。

**修复建议:** 在 `patch-v75.js` 的 `LevelEngine` 补丁中添加：
```javascript
addXP(xp, reason){
    GameState.addExp(xp);
}
```

---

### P1-3. `CardDropEngine.tryDrop()` 被调用但该方法不存在 — 运行时 TypeError

**位置:** `game-engines.js:QuizEngine._handleCorrect()`

**代码:**
```javascript
void 0!==CardDropEngine&&CardDropEngine.tryDrop(ComboEngine.combo)
```

**问题:**
- `CardDropEngine` 存在（定义了 `rollCard`、`dropCard`、`RARITY`），但 **没有 `tryDrop` 方法**。
- 同样会在答对题目时触发 `TypeError`。

**修复建议:** 添加 `tryDrop(combo)` 方法或移除该调用。

---

### P1-4. `AchievementEngine.checkAll()` 被调用但该方法不存在 — 运行时 TypeError

**位置:** `game-engines.js:QuizEngine.showResult()`

**代码:**
```javascript
AchievementEngine.checkAll()
```

**问题:**
- `AchievementEngine` 在 `game-engines.js` 中仅定义了 `_definitions` 数组（成就列表），**没有任何方法**。
- 游戏结束时调用 `checkAll()` 会抛出 `TypeError`。

**修复建议:** 实现 `AchievementEngine.checkAll()` 或移除该调用。

---

### P1-5. `GameState.addExp()` 与 `LevelEngine` 的等级经验曲线 **完全不一致**（双轨制）

**GameState.addExp 公式:**
```javascript
var needed = 100 * this._data.level;  // Lv.1→2: 100, Lv.2→3: 200, Lv.3→4: 300...
```

**LevelEngine（patch-v75.js）经验曲线:**
| 等级 | 所需 XP |
|------|--------|
| 2 | 150 |
| 3 | 400 |
| 4 | 800 |
| 5 | 1,400 |
| 6 | 2,200 |
| 7 | 3,200 |
| 8 | 4,500 |
| 9 | 6,000 |
| 10 | 8,000 |

**问题:**
- 游戏内部使用 `GameState.addExp()` 升级（比如盲盒加经验、碎片合成加经验、强化加经验）。
- 但 UI 显示等级时调用 `LevelEngine.getLevel()`（如 `StatsEngine.render()`、`CharacterEngine.select()`）。
- **结果:** 玩家可能在 `GameState` 中已经达到 Lv.5（需 100+200+300+400=1000 XP），但 `LevelEngine` 显示还是 Lv.4（需 800 XP）。
- 这种双轨制会导致角色解锁、称号显示、统计页面全部出现不一致。

**修复建议:** 统一使用 `LevelEngine` 的经验表，删除 `GameState.addExp()` 中的硬编码 `100*level`，改为查询 `LevelEngine.LEVELS`。

---

## 🟠 P2 严重问题

### P2-1. `totalEarned` 统计口径错误 — 把「得分」当成「金币收入」累加

**位置:** `game-engines.js:QuizEngine.showResult()`

**代码:**
```javascript
GameState._data.stats.totalEarned=(GameState._data.stats.totalEarned||0)+this.score
```

**问题:**
- `totalEarned` 字段语义是「累计获得金币」，但这里把 **quiz 得分**（如 300 分、500 分）直接累加进去了。
- 正常模式下答题 **不奖励金币**（只有 `CoinRainEngine` 的视觉硬币可点击获得 +1 金币），所以 `totalEarned` 会虚高。
- 正确的做法应该是累加本次实际获得的金币，而非 quiz 分数。

---

### P2-2. `DailyTaskEngine` 每日任务检查的是**全历史累计数据**，而非当日进度

**位置:** `game-engines.js:272` (DailyTaskEngine)

**代码:**
```javascript
TASK_TEMPLATES:[
  {id:"answer10", check:function(s){return(s.correct||0)>=10}, ...},
  {id:"combo5",   check:function(s){return(s.maxStreak||0)>=5}, ...},
  {id:"play3mode",check:function(s){return(s.gamesPlayed||0)>=3}, ...},
  ...
]
```

**问题:**
- `s` 是 `GameState._data.stats`（全历史累计统计）。
- 如果玩家昨天已经答对了 100 题，今天打开游戏时，`answer10` 任务立即被标记为 `done`。
- 任务名是「答对 10 题」，但检查逻辑是「累计答对 10 题」，失去了每日挑战的意义。

**同样影响:** `combo5`（最高连击全历史）、`play3mode`（游戏次数全历史）。

**修复建议:** 引入「每日统计」对象，如 `dailyStats:{correct:0, maxStreak:0, gamesPlayed:0, ...}`，并在 `init()` 时归零。

---

### P2-3. `DailyTaskEngine.claim()` 没有「已领取」状态，可重复领奖

**位置:** `game-engines.js:272`

**代码:**
```javascript
claim(taskId){
    this.check();
    for(var dt=GameState._data.dailyTasks||{tasks:[]},i=0;i<dt.tasks.length;i++)
    if(dt.tasks[i].id===taskId&&dt.tasks[i].done)
        return GameState.addCoins(dt.tasks[i].reward),void Modal.show(...)
}
```

**问题:**
- 任务对象只有 `done: true/false`，没有 `claimed: true/false`。
- 每次调用 `claim()` 只要 `done===true` 就会发金币。如果按钮或调用链路被触发多次，玩家可重复领取同一任务奖励。

**修复建议:** 添加 `claimed` 字段，领取后置 `claimed=true`。

---

### P2-4. `KnowledgeRaceEngine._gameOver()` 直接修改 `GameState._data.coins`，绕过 `addCoins()`

**代码:**
```javascript
var coins=Math.floor(.5*this.score),xp=Math.floor(.3*this.score);
GameState._data.coins=(GameState._data.coins||0)+coins,
void 0!==LevelEngine&&LevelEngine.addXP(xp),
"function"==typeof GameState.save&&GameState.save()
```

**问题:**
- 直接操作 `GameState._data.coins`，跳过 `addCoins()` 的 `totalEarned` 累加和 `MAX_COINS` 上限（虽然 `MAX_COINS` 本身也失效）。
- 同样调用了不存在的 `LevelEngine.addXP()`。

---

### P2-5. `DisasterQuizGame._finish()` 和 `SurvivalEngine.gameOver()` 使用 `GameState.set()` 直接写 coins，绕过 `addCoins()`

**问题:** 多处引擎直接读写 `GameState._data.coins` 或 `GameState.set('coins', ...)`，导致 `totalEarned` 统计缺失，金币来源不可追踪。

**涉及文件:**
- `DisasterQuizGame._finish()` — `GameState.set('coins', ...)`
- `SurvivalEngine.gameOver()` — `GameState.set('survivalBest', ...)`  
  （虽然 `survivalBest` 是合理的，但 `coins` 直接写入也存在于其他引擎中）

---

### P2-6. `GameState.addCoins()` 的 `saveDebounced()` 可能丢失快速连续操作

**代码:** `saveDebounced()` 使用 200ms 防抖：
```javascript
saveDebounced(){if(this._saveTimer)clearTimeout(this._saveTimer);this._saveTimer=setTimeout(()=>{this.save();this._saveTimer=null},200)}
```

**问题:** 如果玩家在短时间内连续触发金币/经验变化（如连点 coin rain），200ms 防抖可能导致最后一次数据未及时写入。不过 `beforeunload` 补丁已兜底，风险较低。

---

## 🟡 P3 中等问题

### P3-1. 正常模式与战斗模式得分公式不一致

| 模式 | 基础分 | 时间 bonus | 连击 bonus | 难度加成 | 套装加成 | 稀有度加成 |
|------|--------|-----------|-----------|----------|----------|------------|
| 正常模式 (`_handleCorrect`) | 10 | `1.5×timeLeft` | `2×min(streak-1,5)` | ❌ 无 | `ComboEngine` 乘数 | `CardSynergy` 加成 |
| 战斗模式 (`_resolveBattle`) | 10 | ❌ 无 | `5×(streak-1)` | ❌ 无 | ❌ 无 | ❌ 无 |

**问题:**
- 用户任务要求检查「每题 10 分基础、3连击 1.5x、时间 bonus 剩余时间×2、难度加成 medium 1.2x / hard 1.5x」。
- **实际代码中：**
  - 时间 bonus 是 `1.5×timeLeft`（不是 2×）
  - 连击加成不是全局乘数，而是基础分里的 `2×min(streak-1,5)`， capped at +10
  - **难度加成完全不存在**（没有 `medium 1.2x`、`hard 1.5x`）
  - 连击的全局乘数来自 `ComboEngine`，其档位是：3→1.5x, 5→2x, 8→2.5x, 10→3x, 15→4x, 20→5x

- 战斗模式得分公式过于简陋，与正常模式差距大，可能导致玩家发现两种模式得分效率差异过大。

---

### P3-2. `ComboEngine` 与 `QuizEngine.streak` 是两套独立的连击状态

**问题:**
- `QuizEngine` 自己维护 `this.streak`。
- `ComboEngine` 自己维护 `this.combo`。
- 两者在正确/错误时分别增减，理论上会同步，但：**如果有其他引擎直接调用 `ComboEngine.miss()` 或 `ComboEngine.hit()` 而不经过 `QuizEngine`，两者就会 diverge。**
- 建议由 `QuizEngine` 统一作为 streak 权威源，`ComboEngine` 只负责视觉/乘数计算。

---

### P3-3. `spendCoins()` 没有后置负数兜底

**代码:**
```javascript
spendCoins(amount){
    if(!this._data)return!1;
    return!(this._data.coins<amount||(this._data.coins-=amount,this.saveDebounced(),0))
}
```

**问题:**
- 虽然前置条件 `this._data.coins < amount` 阻止了负值，但若其他代码直接修改 `this._data.coins`（如 P2-4、P2-5 所述），仍可能导致负值。
- 建议添加 `this._data.coins = Math.max(0, this._data.coins)` 作为兜底。

---

### P3-4. 正常模式下答对不自动奖励金币

**问题:**
- `QuizEngine._handleCorrect()` 只增加 `this.score`（局内得分），**不调用 `GameState.addCoins()`**。
- 金币收益完全依赖 `CoinRainEngine.rain()` 产生的可点击粒子（每点 +1 金币）。
- 如果玩家不点击金币雨，一局答题可能获得 0 金币。
- 这不符合多数玩家「答对得金币」的直觉，建议至少自动奖励 `gained/10` 金币。

---

## 🟢 P4 提示/设计建议

### P4-1. 等级上限 `MAX_LEVEL=999` 在 `GameState.addExp()` 中过高

- `LevelEngine` 补丁只定义到 Lv.10，但 `addExp()` 的 `while` 循环允许升到 999 级。
- 两者上限不一致，若玩家经验积累过多，会出现 `GameState.level=50` 但 `LevelEngine` 只显示到 10 的断层。

### P4-2. `GameState._keys` 数组中缺少部分实际使用字段的兜底

- `_keys` 中定义了 `weeklyChallenges` 等字段，但 `_defaults` 中 `weeklyChallenges` 的默认值是 `{week:null,completed:0}`。
- 某些字段（如 `titles`、`activeTitle`）在 `_defaults` 中存在，但 `importSave()` 的校验逻辑中没有覆盖，可能导致旧存档导入时缺失。

### P4-3. `QuizEngine._handleCorrect` 中的 `card.id` 卡片收集逻辑

```javascript
GameState._data.cards.includes(card.id)||(GameState._data.cards.push(card.id),GameState.save(),...)
```

- 每次答对都检查并尝试添加卡片，如果卡片已存在，不做任何事。
- 这是合理的「答题解锁卡片」机制，但注意：如果卡片来自 `ALL_CARDS` 的 `id` 是数字或字符串，需确保类型一致（`includes` 使用严格相等 `===`）。

---

## 得分公式速查表

### 正常模式（QuizEngine._handleCorrect）
```javascript
baseGained = 10 + Math.floor(1.5 * timeLeft) + 2 * Math.min(streak - 1, 5)
totalMultiplier = comboMultiplier * (1 + synergyBonus + rarityBonus)
gained = Math.floor(baseGained * totalMultiplier)
```
- `comboMultiplier`: 1→1x, 3→1.5x, 5→2x, 8→2.5x, 10→3x, 15→4x, 20→5x
- `synergyBonus`: 0 或 0.3（套装完整）
- `rarityBonus`: 0 / 0.05 / 0.1 / 0.15 / 0.2 / 0.3
- 双倍积分卡：`score += 2 * gained`

### 战斗模式（QuizEngine._resolveBattle）
```javascript
score += 10 + 5 * (streak - 1)
```
- 无时间 bonus、无连击乘数、无难度加成。

### 生存模式（SurvivalEngine.answer）
```javascript
bonus = 5 * difficulty + (streak > 3 ? 10 : 0)
score += bonus
```
- `difficulty` 从 1 开始递增。

### 知识竞速（KnowledgeRaceEngine.answer）
```javascript
score += 10 + Math.floor(timeLeft / 10)
```

### 30秒限时（TimedChallengeEngine.answer）
```javascript
score += 10  // 固定
```

### 闪电问答（DisasterQuizGame.answer）
```javascript
score += Math.max(10, 20 + 4 * timeLeft)
```
- `timeLeft` 初始为 5，递减。

---

## 修复优先级建议

| 优先级 | 问题 | 影响 |
|--------|------|------|
| 立即 | P1-1 `addCoins` cap 失效 | 金币溢出 |
| 立即 | P1-2 / P1-3 / P1-4 缺失方法 | 运行时崩溃，答对/结束流程中断 |
| 立即 | P1-5 等级双轨制 | 角色解锁、统计页显示不一致 |
| 高 | P2-2 每日任务累计统计 | 每日任务第一天后永远自动完成 |
| 高 | P2-3 任务重复领奖 | 可被薅羊毛 |
| 高 | P2-1 totalEarned 口径错误 | 统计数据失真 |
| 中 | P3-1 难度加成缺失 | 与需求文档不符 |
| 中 | P3-4 正常模式无自动金币 | 玩家收益体验差 |
| 低 | P4-1 等级上限不一致 | 长期体验问题 |

---

*本报告由 logic-check-scoring 子代理生成。*
