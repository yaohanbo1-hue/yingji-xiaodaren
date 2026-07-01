# 引擎检查报告：6个之前空白页面的初始化/启动逻辑

## 检查日期
当前代码状态（`game-engines.js` 最新版本）

---

## 执行摘要

| 页面 | 引擎 | init/start | 页面激活自动调用 | 状态 |
|------|------|-----------|----------------|------|
| `page-firstaid` | `FirstAidEngine` | `render()` (无 `init`) | ✅ 有 `_refreshPage` 处理 | ⚠️ **有缺陷** |
| `page-survival` | `SurvivalEngine` | `init()` + `render()` | ✅ 有 `_refreshPage` 处理 | ✅ 正常 |
| `page-bossrush` | `BossRushEngine` | `init()` + `render()` | ✅ 有 `_refreshPage` 处理 | ✅ 正常 |
| `page-timed` | `TimedChallengeEngine` | `init()` + `render()` | ✅ 有 `_refreshPage` 处理 | ✅ 正常 |
| `page-eggs` | `EasterEggEngine` | `render()` (无 `init`) | ✅ 有 `_refreshPage` 处理 | ✅ 正常 |
| `page-memory-card` | `MemoryCardEngine` | `init()` + `_render()` | ✅ 有 `_refreshPage` 处理 | ⚠️ 有隐患 |

---

## 1. FirstAidEngine（急救模拟器）

### 引擎类名
`FirstAidEngine`（定义在 `game-engines.js:350`）

### 方法清单
- `render()` — ✅ 存在（副作用方法，直接设置 DOM）
- `start(scenarioId)` — ✅ 存在（启动答题流程）
- `answer(idx)` — ✅ 存在
- `init()` — ❌ **不存在**
- `gameOver()` — ❌ 不存在

### 页面激活时的自动调用
`PageManager._refreshPage`（`game-engines.js:689`）中已添加：

```javascript
"firstaid" === pageId && void 0 !== FirstAidEngine && (
  document.getElementById("firstAidContainer") && (
    document.getElementById("firstAidContainer").innerHTML = FirstAidEngine.render()
  )
)
```

### 发现的问题 ⚠️

**`render()` 是副作用方法，不返回 HTML 字符串，但 `_refreshPage` 将其返回值赋给 `innerHTML`。**

`FirstAidEngine.render()` 的实现（`game-engines.js:350` 末尾）：
```javascript
render() {
  if (this.active && this.currentScenario) {
    console.log("[FirstAid] 正在答题中，跳过菜单渲染");
    return;
  }
  var container = document.getElementById("firstAidContainer");
  if (!container) return;
  var html = '<div style="padding:16px"><h3>🩺 急救模拟器</h3>';
  // ... 构建场景列表 ...
  container.innerHTML = html + '</div>';  // ← 副作用：直接设置 DOM
  // ← 没有 return 语句，函数返回 undefined
}
```

当 `_refreshPage` 执行时：
1. `FirstAidEngine.render()` 被调用，先正确设置了 `firstAidContainer.innerHTML`（渲染出急救场景列表）
2. `render()` 返回 `undefined`
3. `_refreshPage` 继续执行 `firstAidContainer.innerHTML = undefined`
4. `innerHTML` 被 JavaScript 强制转换为字符串 `"undefined"`，覆盖掉了正确内容

**结果：页面可能显示 "undefined" 文本，或者表现为空白/异常。**

### 修复建议

**方案 A（推荐）：修改 `FirstAidEngine.render()` 为纯函数，返回 HTML 字符串。**

在 `game-engines.js:350` 的 `FirstAidEngine` 定义中，将 `render()` 方法改为：
```javascript
render() {
  if (this.active && this.currentScenario) {
    console.log("[FirstAid] 正在答题中，跳过菜单渲染");
    return '';  // 返回空字符串
  }
  var html = '<div style="padding:16px"><h3>🩺 急救模拟器</h3>';
  html += '<div style="color:rgba(255,255,255,0.7);margin:12px 0">选择场景学习急救知识，答对所有步骤获得奖励</div>';
  for (var id in this.SCENARIOS) {
    var s = this.SCENARIOS[id];
    html += '<div class="nav-card" onclick="FirstAidEngine.start(' + JSON.stringify(id) + ')" ...>';
    // ... 保留原有 HTML 构建逻辑 ...
    html += '</div>';
  }
  return html + '</div>';  // ← 返回 HTML 字符串，不直接操作 DOM
}
```

同时，`index.html` 中的 `mode-btn` 入口也使用了相同模式：
```html
onclick="PageManager.navigate('firstaid');setTimeout(function(){
  var el=document.getElementById('firstAidContainer');
  if(el) el.innerHTML=FirstAidEngine.render()
},100)"
```
也需要修改为 `FirstAidEngine.render()` 返回字符串后才能正常工作。

**方案 B（快速修复）：修改 `_refreshPage` 中的调用方式。**

在 `game-engines.js:689` 的 `_refreshPage` 中，将：
```javascript
document.getElementById("firstAidContainer").innerHTML = FirstAidEngine.render()
```
改为：
```javascript
FirstAidEngine.render()  // 直接调用，不赋值
```

同时修改 `index.html` 中的 mode-btn 入口：
```html
onclick="PageManager.navigate('firstaid');setTimeout(function(){
  FirstAidEngine.render()
},100)"
```

---

## 2. SurvivalEngine（生存挑战）

### 引擎类名
`SurvivalEngine`（`game-engines.js:923`）

### 方法清单
- `init()` — ✅ 存在
- `render()` — ✅ 存在（副作用方法，直接设置 DOM）
- `nextQuestion()` — ✅ 存在
- `answer(idx)` — ✅ 存在
- `gameOver()` — ✅ 存在

### 页面激活时的自动调用
`PageManager._refreshPage` 中：
```javascript
"survival" === pageId && void 0 !== SurvivalEngine && (SurvivalEngine.init())
```

### 逻辑分析
`init()` 内部调用：
1. `PageManager.navigate("survival")` — 此时 `_currentPage` 已是 `"survival"`，直接返回，无副作用
2. `this.render()` — 渲染生存模式 HUD 到 `survivalContent`
3. `this.nextQuestion()` — 生成第一道题目到 `survivalQuiz`

### 状态：✅ **正常**
`init()` 被 `_refreshPage` 直接调用，流程正确，无循环或返回值问题。

---

## 3. BossRushEngine（Boss挑战）

### 引擎类名
`BossRushEngine`（`game-engines.js:90`）

### 方法清单
- `init()` — ✅ 存在
- `startBoss()` — ✅ 存在
- `render()` — ✅ 存在（副作用方法）
- `nextQuestion()` — ✅ 存在
- `answer(idx)` — ✅ 存在
- `victory()` — ✅ 存在

### 页面激活时的自动调用
`PageManager._refreshPage` 中：
```javascript
"bossrush" === pageId && void 0 !== BossRushEngine && (BossRushEngine.init())
```

### 逻辑分析
`init()` → `startBoss()` → `render()` + `nextQuestion()`，流程正确。

### 状态：✅ **正常**

---

## 4. TimedChallengeEngine（限时挑战）

### 引擎类名
`TimedChallengeEngine`（`game-engines.js:962`）

### 方法清单
- `init()` — ✅ 存在
- `render()` — ✅ 存在（副作用方法）
- `nextQuestion()` — ✅ 存在
- `updateTimer()` — ✅ 存在
- `cleanup()` — ✅ 存在（清理计时器）
- `gameOver()` — ✅ 存在

### 页面激活时的自动调用
`PageManager._refreshPage` 中：
```javascript
"timed" === pageId && void 0 !== TimedChallengeEngine && (TimedChallengeEngine.init())
```

### 逻辑分析
`init()` → `render()` + `setInterval` + `nextQuestion()`，流程正确。`cleanup()` 已在 `_cleanupEngines` 中被调用，无计时器泄漏。

### 状态：✅ **正常**

---

## 5. EasterEggEngine（彩蛋探索）

### 引擎类名
`EasterEggEngine`（`game-engines.js:324`）

### 方法清单
- `render()` — ✅ 存在（**纯函数，返回 HTML 字符串**）
- `isFound(eggId)` — ✅ 存在
- `found(eggId)` — ✅ 存在
- `init()` — ❌ 不存在（不需要）

### 页面激活时的自动调用
`PageManager._refreshPage` 中：
```javascript
"eggs" === pageId && void 0 !== EasterEggEngine && (
  document.getElementById("eggs-content") && (
    document.getElementById("eggs-content").innerHTML = EasterEggEngine.render()
  )
)
```

### 逻辑分析
`EasterEggEngine.render()` 正确返回 HTML 字符串，赋值给 `innerHTML` 完全正确。

### 状态：✅ **正常**

---

## 6. MemoryCardEngine（记忆卡片）

### 引擎类名
`MemoryCardEngine`（`game-engines.js:482`）

### 方法清单
- `init()` — ✅ 存在
- `_generateCards()` — ✅ 存在
- `_render()` — ✅ 存在（内部方法，副作用）
- `_flip(idx)` — ✅ 存在
- `_checkMatch()` — ✅ 存在
- `_startTimer()` — ✅ 存在
- `_gameOver(won)` — ✅ 存在（内部清理 timer）

### 页面激活时的自动调用
`PageManager._refreshPage` 中：
```javascript
"memory-card" === pageId && void 0 !== MemoryCardEngine && (MemoryCardEngine.init())
```

### 逻辑分析
`init()` → `PageManager.navigate("memory-card")`（当前页已为此，直接返回）→ `_generateCards()` → `_render()` → `_startTimer()`。流程正确。

### 发现的问题 ⚠️

**`_cleanupEngines` 中未清理 `MemoryCardEngine` 的 timer。**

`PageManager._cleanupEngines()`（`game-engines.js:689`）中未包含 `MemoryCardEngine` 的清理逻辑：

```javascript
_cleanupEngines() {
  "undefined" != typeof KnowledgeRaceEngine && KnowledgeRaceEngine.cleanup && KnowledgeRaceEngine.cleanup();
  "undefined" != typeof TimeEscapeEngine && TimeEscapeEngine.cleanup && TimeEscapeEngine.cleanup();
  "undefined" != typeof DisasterQuizGame && DisasterQuizGame.cleanup && DisasterQuizGame.cleanup();
  "undefined" != typeof KitEngine && KitEngine.clearTimer && KitEngine.clearTimer();
  "undefined" != typeof TimedChallengeEngine && TimedChallengeEngine.cleanup && TimedChallengeEngine.cleanup();
  "undefined" != typeof ReactionEngine && ReactionEngine.cleanup && ReactionEngine.cleanup();
  "undefined" != typeof ComboEngine && ComboEngine.cleanup && ComboEngine.cleanup();
  "undefined" != typeof CoinRainEngine && CoinRainEngine.clear && CoinRainEngine.clear();
  "undefined" != typeof BGMEngine && BGMEngine.stop && BGMEngine.stop()
}
```

缺少：`MemoryCardEngine` 的 timer 清理。如果用户从 memory-card 页面切出时游戏尚未结束（例如通过返回按钮），`MemoryCardEngine.timer` 会继续运行。

### 修复建议

在 `game-engines.js:689` 的 `_cleanupEngines` 方法中添加：
```javascript
"undefined" != typeof MemoryCardEngine && MemoryCardEngine.timer && (
  clearInterval(MemoryCardEngine.timer), MemoryCardEngine.timer = null, MemoryCardEngine.active = false
);
```

---

## PageManager._refreshPage 完整自动调用清单

以下是从 `_refreshPage` 中提取的、与6个引擎相关的自动调用逻辑（已确认全部存在）：

```javascript
"firstaid" === pageId && void 0 !== FirstAidEngine && (
  document.getElementById("firstAidContainer") && (
    document.getElementById("firstAidContainer").innerHTML = FirstAidEngine.render()
  )
),
"survival" === pageId && void 0 !== SurvivalEngine && (SurvivalEngine.init()),
"bossrush" === pageId && void 0 !== BossRushEngine && (BossRushEngine.init()),
"timed" === pageId && void 0 !== TimedChallengeEngine && (TimedChallengeEngine.init()),
"eggs" === pageId && void 0 !== EasterEggEngine && (
  document.getElementById("eggs-content") && (
    document.getElementById("eggs-content").innerHTML = EasterEggEngine.render()
  )
),
"memory-card" === pageId && void 0 !== MemoryCardEngine && (MemoryCardEngine.init())
```

---

## 汇总：已修复 vs 仍有问题

| 引擎 | 空白原因（旧） | 当前修复状态 | 是否仍有 bug |
|------|--------------|------------|-----------|
| **FirstAidEngine** | `_refreshPage` 未调用引擎 | ✅ 已添加 `_refreshPage` 调用 | ⚠️ **返回值问题导致内容被覆盖** |
| **SurvivalEngine** | `_refreshPage` 未调用引擎 | ✅ 已添加 `init()` 调用 | ✅ 正常 |
| **BossRushEngine** | `_refreshPage` 未调用引擎 | ✅ 已添加 `init()` 调用 | ✅ 正常 |
| **TimedChallengeEngine** | `_refreshPage` 未调用引擎 | ✅ 已添加 `init()` 调用 | ✅ 正常 |
| **EasterEggEngine** | `_refreshPage` 未调用引擎 | ✅ 已添加 `render()` 调用 | ✅ 正常 |
| **MemoryCardEngine** | `_refreshPage` 未调用引擎 | ✅ 已添加 `init()` 调用 | ⚠️ **timer 泄漏隐患** |

---

## 修复优先级建议

1. **P1 — FirstAidEngine.render() 返回值问题**：影响急救模拟器页面内容显示，建议优先修复。
2. **P2 — MemoryCardEngine timer 泄漏**：影响内存和潜在 DOM 操作异常，建议在下次迭代中修复。
3. **其余4个引擎（survival/bossrush/timed/eggs）**：初始化逻辑已正确，无需额外修复。
