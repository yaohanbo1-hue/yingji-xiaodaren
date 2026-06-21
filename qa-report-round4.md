# 「应急小达人」第四轮 QA 验证报告

> **验证时间**：2026-06-21  
> **验证范围**：10 项已修复 Bug + 5 项未修复 Bug  
> **验证方式**：逐文件源码读取 + 正则搜索 + 逻辑分析

---

## 一、已修复 Bug 验证结果

| # | Bug 项 | 文件 | 验证结果 | 说明 |
|---|--------|------|----------|------|
| 1 | 补全缺失的 `</style>` 标签 | `index.html` | ✅ **通过** | 检测到 7 处 `</style>` 闭合标签，无遗漏 |
| 2 | 移除硬编码 API Key | `ai-tutor-llm-v55.js` | ✅ **通过** | `_apiKey: null`，注释说明已移至后端代理 |
| 3 | 添加 `tips` 数组 | `loading.js` | ✅ **通过** | 第 16 行定义了 8 条加载提示语数组 |
| 4 | Modal._bindEvents 防重复绑定 | `game-engines.js` | ✅ **通过** | 第 552-553 行有 `_eventsBound` 保护逻辑 |
| 5 | addRipple 防重复绑定 | `liquid-glass.js` | ✅ **通过** | 第 867-868 行有 `dataset.rippleBound` 保护 |
| 6 | cache.addAll 逐资源容错 | `sw-v55.js` | ✅ **通过** | 第 84-89 行使用 `cache.add(url).catch(...)` 逐资源容错 |
| 7 | allEngines 去除重复 | `game-engines.js` | ✅ **通过** | `TimeEscapeEngine` 和 `PrecisionEngine` 在 `allEngines` 中各只出现一次 |
| 8 | 新增 engine-cleanup.js | `engine-cleanup.js` | ⚠️ **部分失败** | 文件存在且逻辑正确，但 **`index.html` 未引入该文件**，修复无法生效 |
| 9 | 添加 XSS 转义 | `wrong-book.js` | ⚠️ **部分失败** | `printWrongBook()` 使用 `_e()` 转义，但 `renderPage()` 和 `_showReviewQuestion()` 仍直接拼接 `innerHTML` 未转义 |
| 10 | AchievementEngine daily_7 去重 | `game-engines.js` | ✅ **通过** | 只有 `daily_7` 一个 ID，其余为 `daily_7_weekly`、`daily_7_v2`，属不同成就 |

### 已修复 Bug 统计：7 通过 / 2 部分失败 / 1 需关注

---

## 二、关键问题详解

### 🔴 问题 1：engine-cleanup.js 未加载

`index.html` 中搜索 `engine-cleanup` 和 `html-escape` 均**无结果**。虽然文件已创建，但未被引入，导致：
- 定时器泄漏防护不生效
- PageManager.navigate 的 hook 未执行
- 所有引擎的定时器在页面切换时不会被自动清理

**修复建议**：在 `index.html` 的 `<script>` 标签区域添加：
```html
<script src="engine-cleanup.js"></script>
<script src="html-escape.js"></script>
```

### 🟡 问题 2：wrong-book.js XSS 修复不完整

`printWrongBook()` 中确实使用 `_e()` 转义了用户输入（第 286 行），但以下函数**未使用转义**：

- `renderPage()` 第 259 行：`' + item.question + '` 直接拼接
- `renderPage()` 第 261 行：`' + item.correctAnswer + '` 直接拼接
- `renderPage()` 第 264 行：`' + item.explanation + '` 直接拼接
- `_showReviewQuestion()` 第 344 行：`' + item.question + '` 直接拼接

**风险**：如果用户输入包含恶意脚本（如 `<script>alert('xss')</script>`），在错题本页面展示时会直接执行。

---

## 三、剩余未修复 Bug 清单

| # | Bug 项 | 严重程度 | 当前状态 | 影响范围 |
|---|--------|----------|----------|----------|
| 1 | **GameState.save() 无防抖** | 🔴 高 | 确认存在 | 频繁触发 localStorage 写入，性能损耗 |
| 2 | **洗牌算法使用 `Math.random() - 0.5`** | 🟡 中 | 大量存在（10+ 处） | 分布不均匀，有偏洗牌 |
| 3 | **innerHTML 直接插入用户输入** | 🔴 高 | 87 处 | XSS 注入风险 |
| 4 | **VisualFX resize 监听器不可移除** | 🟡 中 | 确认存在 | 内存泄漏，监听器累积 |
| 5 | **AudioContext 未处理浏览器自动暂停** | 🟡 中 | 确认存在 | 首次加载时 BGM 可能无法播放 |

### 详细分析

#### 1. GameState.save() 无防抖

```javascript
save(){
  try{
    localStorage.setItem("disasterGachaState",JSON.stringify(this._data))
  }catch(e){}
  this._updateUI()
}
```

- **问题**：每次调用直接同步写入 localStorage，游戏操作频繁（答题、金币变动、连击等）时会触发大量写入
- **影响**：主线程阻塞、写入放大、localStorage 性能瓶颈（约 5MB 限制）
- **建议**：添加 `setTimeout` 防抖，延迟 300-500ms 合并写入

#### 2. 有偏洗牌算法

以下引擎仍使用 `Math.random() - 0.5` 排序：

| 引擎 | 位置 |
|------|------|
| BattleEngine | `cards.sort(()=>Math.random()-.5)` |
| KnowledgeRaceEngine | `cards.sort(function(){return Math.random()-.5})` |
| PrecisionEngine | `cards.sort(function(){return Math.random()-.5})` |
| QuizEngine | 含 `Math.random()-.5` |
| MemoryCardEngine | `pairs.sort(function(){return Math.random()-.5})` |
| StoryAdventureEngine | `cards.sort(function(){return Math.random()-.5})` |
| StoryChallengeEngine | `cards.sort(function(){return Math.random()-.5})` |
| StudyEngine | `cards.sort(function(){return Math.random()-.5})` |
| TimeEscapeEngine | `cards.sort(function(){return Math.random()-.5})` |
| PKEngine | `cards.sort(()=>Math.random()-.5)` |
| AdaptiveDifficulty | `shuffle=arr=>[...arr].sort(()=>Math.random()-.5)` |

> ⚠️ `Math.random() - 0.5` 排序不是均匀洗牌，某些排列概率更高。应使用 Fisher-Yates 算法。

> ✅ 已正确实现：`DailyChallengeEngine._generateDaily()` 使用了 Fisher-Yates 洗牌，可作为参考。

#### 3. innerHTML 直接插入用户输入（87 处）

`game-engines.js` 中检测到 **87 处** `.innerHTML =` 使用。大量拼接了动态数据，包括：
- 用户输入的玩家名 (`playerName`)
- 题目内容 (`card.zh.q`, `item.question`)
- 选项文本 (`opt.text`, `card.zh.opts`)
- 错题本内容 (`item.question`, `item.correctAnswer`)
- 排行榜名字 (`entry.name`)

**建议**：统一使用 `_e()` 转义函数，或在拼接时进行 HTML 实体编码。

#### 4. VisualFX resize 监听器不可移除

`startBattleParticles()` 中定义的是**局部变量**：
```javascript
var _vfxResizeHandler = function(){ ... };
window.addEventListener("resize", _vfxResizeHandler);
```

但 `stopBattleParticles()` 中检查的是**实例属性**：
```javascript
this._resizeHandler && window.removeEventListener("resize", this._resizeHandler);
this._resizeHandler = null;
```

**问题**：局部变量 `_vfxResizeHandler` 永远不会赋值给 `this._resizeHandler`，所以 `removeEventListener` 永远不会执行。每次进入战斗页面都会新增一个 resize 监听器，造成内存泄漏。

**修复建议**：将 `var _vfxResizeHandler` 改为 `this._resizeHandler = function(){ ... }`。

#### 5. AudioContext 未处理浏览器自动暂停

`bgm.js` 的 `init()` 创建 AudioContext 时未检查状态：
```javascript
init(){
  this.ctx || (this.ctx = new (window.AudioContext || window.webkitAudioContext));
  ...
}
```

Chrome 66+ 要求用户交互后才能启动 AudioContext。如果浏览器自动暂停了 AudioContext，BGM 将无法播放。代码中没有任何地方检查 `this.ctx.state === 'suspended'` 并调用 `resume()`。

> `index.html` 第 2718 行和 2728 行有 `BGMEngineV2.resume()` 调用，但 `bgm.js` 使用的是旧的 `BGMEngine`，没有这些处理。

---

## 四、整体评估

| 指标 | 评分 | 说明 |
|------|------|------|
| 已修复 Bug 实际生效率 | 70% | 7/10 完全生效，2 项部分失败，1 项依赖文件未加载 |
| 代码安全性 | 5/10 | innerHTML 滥用（87 处），XSS 防护覆盖不全 |
| 性能优化 | 5/10 | GameState.save 无防抖，resize 监听器泄漏，洗牌算法有偏 |
| 代码健壮性 | 6/10 | 部分修复已生效，但核心问题（XSS、洗牌、防抖）仍未解决 |
| 架构质量 | 7/10 | engine-cleanup.js 设计正确但未集成，模块化较好 |

### 整体质量评分：6.5 / 10

---

## 五、建议

### 是否建议继续第五轮修复？

**建议：是**，但优先级如下：

#### 🔴 P0（必须修复）
1. **在 `index.html` 中引入 `engine-cleanup.js` 和 `html-escape.js`**
2. **为 `GameState.save()` 添加防抖**（300-500ms）
3. **统一 innerHTML 拼接使用 `_e()` 转义**（至少覆盖用户输入点）

#### 🟡 P1（建议修复）
4. **修复 VisualFX resize 监听器**（`this._resizeHandler` 赋值）
5. **将 `Math.random()-.5` 洗牌替换为 Fisher-Yates**（至少覆盖核心引擎）
6. **在 `bgm.js` 中添加 AudioContext resume 处理**

#### 🟢 P2（可选优化）
7. 完善 `wrong-book.js` 的 XSS 转义覆盖
8. 代码审查报告中其他低优先级建议

---

> **报告结论**：第四轮修复已解决部分问题，但存在**"修了但未加载"**和**"修了但不完整"**的两类问题。建议进行第五轮修复，重点解决 P0 级别问题，预计可将项目质量评分提升至 **8/10**。
