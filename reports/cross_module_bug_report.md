# 应急小达人 — 跨模块交互与全局状态管理检查报告

> **检查范围**：全局状态冲突、模块生命周期、状态持久化、全局事件、跨模块数据流原子性、代码错误
> **检查文件**：`game-engines.js`, `index.html`, `report.js`, `share.js`, `bgm.js`, `bgm-enhanced.js`, `disaster-sim.js`, `wrong-book.js`, `bg-premium.js`, `optimizer-mobile.js`, `visual-fx.js`, `performance.js`, `liquid-glass.js`
> **检查时间**：2026-06-16

---

## 🔴 严重问题（Critical）

### 1. 重复 `const` 声明导致启动崩溃

**问题详情**：
- `report.js` 与 `share.js` 均定义了全局 `const SafeStorage = {...}`
- `bgm.js` 与 `bgm-enhanced.js` 均定义了全局 `const BGMEngine = {...}`（`bgm-enhanced.js` 第 430 行存在兼容层 `const BGMEngine`）
- `index.html` 通过 `<script defer>` 同时加载了上述文件，全局作用域中 `const` 重复声明会抛出 `SyntaxError: Identifier 'XXX' has already been declared`
- **结果**：应用无法启动，白屏崩溃

**影响文件**：`report.js:14`, `share.js:14`, `bgm.js:60`, `bgm-enhanced.js:430`

**修复建议**：
- 将其中一个文件改为 `var SafeStorage = SafeStorage || {...}` 或 `if (!window.SafeStorage) { const SafeStorage = ... }`
- `bgm-enhanced.js` 的兼容层 `const BGMEngine` 应改为 `var BGMEngine = BGMEngine || BGMEngineV2` 或检查 `typeof BGMEngine === 'undefined'` 后再定义

---

### 2. PageManager.navigate 不清理引擎状态，导致全局定时器泄漏

**问题详情**：
- `PageManager.navigate(pageId)` 仅做 CSS class 切换（`document.querySelectorAll('.page').forEach(p => p.classList.remove('active'))`），**没有任何引擎生命周期清理**
- 所有带有计时器的引擎在用户切页后仍保持 `active = true`，计时器继续运行
- 受影响的引擎包括：
  - `KnowledgeRaceEngine`（`timer` setInterval, 120s 倒计时）
  - `TimeEscapeEngine`（`timer` setInterval, 60s 倒计时）
  - `DisasterQuizGame`（`_timer` setInterval, 5s 每题）
  - `KitEngine`（`timerInterval` setInterval, 30s 倒计时）
  - `TimedChallengeEngine`（`_timer` setInterval, 30s 倒计时）
  - `SurvivalEngine`（无显式 timer，但 `nextQuestion` 持续调用）
  - `ReactionEngine`（`targetTimeout` setTimeout，延迟 1.5-4.5s）
  - `PKEngine`（`timerInterval` setInterval, 10s 每题）
  - `MemoryCardEngine`（`timer` setInterval, 60s 倒计时）
- **结果**：切页后 DOM 操作目标可能不存在，导致运行时错误；计时器持续累积，内存泄漏；`active` 标志误判导致旧引擎逻辑在新页面意外触发

**影响文件**：`game-engines.js:677`（PageManager）, 各引擎文件

**修复建议**：
- 在 `PageManager.navigate` 开头增加全局引擎清理：遍历所有已知引擎，若存在 `active` 或 `timer` 则调用 `clearInterval`/`clearTimeout` 并设 `active = false`
- 或：每个引擎实现统一的 `cleanup()` 方法，切页前调用

---

### 3. GameState.save() 写放大，无事务原子性

**问题详情**：
- `GameState.save()` 内部直接调用 `localStorage.setItem('disasterGachaState', JSON.stringify(this._data))`，**无防抖、无节流、无批处理**
- 以下方法均在内部调用 `save()`：
  - `addCoins(amount)` → `save()`
  - `addExp(amount)` → `save()`
  - `addCard(cardId)` → `save()`
  - `spendCoins(amount)` → `save()`
- 一次典型答题流程（如战斗模式）可能触发：
  1. `addCoins(reward)` → save()
  2. `addExp(xp)` → save()
  3. `LevelEngine.addExp(xp)` → save()（重复！）
  4. 成就解锁 → `save()`
- **结果**：
  - 对 `localStorage` 的写入频率极高，在低端设备或 WebView 中可能卡顿
  - 无事务原子性：若 `addCoins()` 成功但后续 `addExp()` 因异常中断，数据处于不一致状态（金币已加、经验未加）
  - `localStorage` 有 5MB 限额，频繁写入增加超出风险

**影响文件**：`game-engines.js`（GameState 定义）

**修复建议**：
- 引入 `requestAnimationFrame` 或 `setTimeout` 做防抖 save（如 `save()` 后 500ms 内不再触发才真正写入）
- 或使用 `Transaction` 模式：在奖励结算时只修改 `_data` 内存对象，最后统一 `save()` 一次
- 对于批量操作，先修改内存状态，最后调用一次 `save()`

---

## 🟡 警告问题（Warning）

### 4. 事件监听器泄漏

**问题详情**：
- **`disaster-sim.js:97-104`**：在 `init()` 中 `window.addEventListener('resize', resizeHandler)` 并将引用保存到 `this._resizeHandler`，但整个生命周期中 **从未调用 `removeEventListener`**
- **`wrong-book.js:170-184`**：`_hookQuizSystem()` 在 `document` 上添加全局 `click` 监听器，使用 **匿名函数** 且永不移除。每次进入错题本模块都会重复添加（虽然代码只调用一次，但无法卸载）
- **`bg-premium.js:20`**：`window.addEventListener('resize', () => {...})` 使用 **匿名箭头函数**，无法被引用和移除
- **`optimizer-mobile.js:92, 101, 371`**：三处匿名 `resize` 监听器，同样无法移除
- **`bg-premium.js:24`** 虽有 `beforeunload` 监听器清除 `resizeTimer`（setTimeout），但无法清除 `resize` 事件本身
- **结果**：页面生命周期内监听器持续累积，每次 resize 触发时执行大量回调，性能下降

**修复建议**：
- 所有 `addEventListener` 使用命名函数或保存引用到对象属性，在模块卸载/切页时 `removeEventListener`
- `wrong-book.js` 应使用 `document.removeEventListener('click', this._hookHandler)` 在适当时机清理

---

### 5. 定时器泄漏（引擎内部）

**问题详情**：
- **`ReactionEngine._gameOver()`**（`game-engines.js:729`）中 **不清理 `this.targetTimeout`**。若用户在 `_showReady()` 设置的延迟（1.5-4.5s）内切页，`targetTimeout` 仍会触发 `_showTarget()`，修改 DOM 并设置 `this.showingTarget = true`
- **`DisasterQuizGame`**：若在 `_nextQuestion()` 创建 timer 后、用户作答前切页，timer 持续运行，到 0 时调用 `_timeUp()` 尝试操作已隐藏的 DOM
- **`QuizEngine.timerInterval`**：作为基础引擎被 `BattleEngine` 使用，`BattleEngine` 切页时无清理，timer 继续运行
- **所有引擎**的 `active` 标志在 `PageManager.navigate` 后仍保持 `true`，后续逻辑（如 `if (this.active)` 判断）无法阻止旧引擎行为

**修复建议**：
- 每个引擎在 `init()` 时记录所有 timer ID，提供 `destroy()` / `cleanup()` 方法统一清理
- `PageManager.navigate` 在切页前遍历所有引擎并调用其清理方法

---

### 6. `document.hidden` 时 `requestAnimationFrame` 仍递归

**问题详情**：
以下三个文件在动画循环中使用了相同的错误模式：

```javascript
if (document.hidden) { 
  this._animFrame = requestAnimationFrame(animate); 
  return; 
}
```

- **`disaster-sim.js:242`**：灾害模拟 Canvas 动画
- **`bg-premium.js:100`**：高级背景粒子动画
- **`liquid-glass.js:815`**：液态玻璃特效动画

**问题**：当页面不可见（如切换浏览器标签、最小化、息屏）时，上述代码 **仍继续递归调用 `requestAnimationFrame`**，导致浏览器后台持续执行 JavaScript，消耗 CPU/GPU 和电池。

**正确做法**：`document.hidden` 时应直接 `return;` 并停止递归，同时监听 `visibilitychange` 事件在页面重新可见时恢复动画。

**修复建议**：
```javascript
if (document.hidden) return;  // 直接 return，不请求下一帧
// 在页面外部监听 visibilitychange 来恢复/暂停
```

---

### 7. 空 catch 块静默吞异常

**问题详情**：
- `game-engines.js:5` `AudioManager.play()`：`try { SFXEngine[sound](...args); } catch(e) {}`
- `game-engines.js` `GameState.save()`：`try { localStorage.setItem(...); } catch(e) {}`
- `bgm-enhanced.js` 多处 `try { ... } catch(e) {}`

**问题**：所有异常被静默吞掉，开发者无法在控制台看到任何错误信息。例如：
- `localStorage` 存储配额已满（5MB 限制）时，`save()` 失败但用户毫无感知，下次刷新数据丢失
- `SFXEngine` 音频调用失败时无声无息
- 调试困难，无法定位问题根源

**修复建议**：
- 至少添加 `console.error('...', e)` 或 `console.warn('...', e)`
- 对于 `localStorage`，应在 catch 中上报错误或提示用户清理存储

---

### 8. `LevelEngine` 与 `GameState` 重复实现 `addExp`

**问题详情**：
- `GameState.addExp()`（`game-engines.js`）和 `LevelEngine.addExp()`（`game-engines.js:980`）**逻辑几乎完全一致**：都计算 `level * 100` 所需经验，都处理升级循环，都调用 `GameState.save()`
- 重复维护导致升级逻辑分散，若后期修改经验公式（如改为非线性成长），需要修改两处，容易遗漏导致不一致

**修复建议**：
- 删除 `LevelEngine.addExp()`，统一调用 `GameState.addExp()`
- 或反之：将升级逻辑完全收拢到 `LevelEngine`，`GameState` 只负责数据存储

---

## 🟢 建议改进（Suggestion）

### 9. 缺少统一的 `beforeunload` 强制保存机制

虽然 `performance.js` 有 `beforeunload` 监听器用于清理内存监控，但 **没有任何 `beforeunload` 监听器在页面关闭前强制 `GameState.save()`**。

虽然 `save()` 已频繁调用，但如果用户在两个 `save()` 之间的极小窗口（如正在计算奖励尚未写入时）直接关闭页面，理论上存在数据丢失可能。

**建议**：在 `GameState` 初始化后注册一个 `beforeunload` 监听器，确保页面关闭前最后一次 `save()`。

---

### 10. `GameState._version` 字段未使用

`GameState` 定义了 `_version: 2`，但实际版本检查和迁移逻辑硬编码在 `_ensureDefaults()` 中（写死 `2`），`_version` 字段从未被读取。

**建议**：将 `_ensureDefaults` 中的硬编码版本号改为引用 `this._version`，或移除 `_version` 字段以避免混淆。

---

### 11. 建议为所有引擎添加统一生命周期接口

当前各引擎的初始化和清理方式各不相同：
- 有的引擎有 `clearTimer()`（如 `KitEngine`）
- 有的引擎在 `_gameOver()` 中清理（如 `KnowledgeRaceEngine`）
- 有的引擎完全不清理（如 `ReactionEngine` 的 `targetTimeout`）
- 没有任何引擎在 `PageManager.navigate` 时被通知清理

**建议**：所有引擎实现统一的 `cleanup()` 接口，由 `PageManager.navigate` 在切页前调用。

---

## 总体评估

| 评估维度 | 评级 | 说明 |
|---------|------|------|
| 启动稳定性 | ❌ **高风险** | 重复 `const` 声明（SafeStorage ×2, BGMEngine ×2）会导致应用在支持严格模式的浏览器中直接白屏崩溃，这是 **最高优先级** 修复项 |
| 运行时稳定性 | ⚠️ **中高风险** | 切页不清理引擎导致大量定时器泄漏，长期使用后页面会越来越卡；`requestAnimationFrame` 后台循环进一步消耗资源 |
| 数据一致性 | ⚠️ **中风险** | `save()` 无事务、无防抖，高频写入 + 异常静默吞掉，可能导致数据不一致或 `localStorage` 超限 |
| 内存管理 | ⚠️ **中风险** | 事件监听器泄漏 + 定时器泄漏 + 匿名函数无法清理，长期运行后内存占用持续增长 |
| 可维护性 | ⚠️ **中风险** | 重复代码（`addExp`）、空 catch 块、无统一生命周期接口，增加后续维护难度 |

**优先修复顺序**：
1. **立刻修复**重复 `const` 声明（否则应用无法启动）
2. **高优先级**为 `PageManager.navigate` 添加引擎清理机制（解决定时器泄漏和后台动画循环）
3. **高优先级**为 `GameState.save()` 引入防抖/批处理（减少 localStorage 写放大）
4. **中优先级**修复事件监听器泄漏（`removeEventListener`）
5. **中优先级**为空 catch 块添加日志输出
6. **低优先级**合并重复的 `addExp` 实现、统一生命周期接口

---

*报告生成时间：2026-06-16*  
*检查Agent：Bug检查Agent_3（跨模块交互与全局状态分析）*
