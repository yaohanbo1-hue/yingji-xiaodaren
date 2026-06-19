# 应急小达人 — 游戏引擎A检查报告（Inspector_Engine_1）

**检查日期：** 2026-06-19  
**检查引擎：** BlindBoxEngine、QuizEngine、BattleEngine、FreeModeEngine、CardsEngine  
**目标文件：** `game.js`（主引擎文件）、`index.html`（页面容器）、`cards.js`（卡牌数据）  
**检查维度：** 引擎初始化、渲染函数、HTML容器、导航调用、数据依赖、事件绑定

---

## 1. 盲盒引擎（BlindBoxEngine）检查结果

### 1.1 引擎定位
- **文件位置：** `game.js`（第 218,269 字符附近）
- **引擎大小：** 约 3,947 字符

### 1.2 方法清单
| 方法名 | 存在 | 说明 |
|--------|------|------|
| `init()` | ❌ 不存在 | 引擎没有标准的 `init()` 入口 |
| `open(type, container)` | ✅ | 核心开箱方法，处理卡牌抽取逻辑 |
| `canOpen(type)` | ✅ | 检查是否满足开箱条件（金币、每日限制等） |
| `_roll(pool, pity)` | ✅ | 保底机制，计算稀有度 |
| `_animate(card, rarity, container)` | ✅ | 渲染开箱动画 overlay |
| `_render()` | ❌ | 不存在 |
| `_showQuestion()` | ❌ | 不存在 |

### 1.3 页面容器检查
- **`page-gacha`（抽卡页）**：HTML 中存在，但标注为 **"占位"** 页面。
- 页面中按钮的 `onclick` 仅做缩放动画（`this.style.transform='scale(1.5)'`），**没有调用 `BlindBoxEngine`**。
- 实际 `BlindBoxEngine.open('daily')` 在 **menu 页面** 中通过按钮直接调用。

### 1.4 导航调用检查
- **❌ 没有 `PageManager.navigate()` 调用。** 盲盒功能直接在 menu 页面触发，不切换页面，而是创建 DOM overlay 覆盖层。

### 1.5 数据依赖检查
- `ALL_CARDS`（来自 `cards.js`）：✅ 存在
- `GameState`：✅ 存在
- `Modal`：✅ 存在
- `AudioManager`：✅ 存在

### 1.6 事件绑定检查
- **HTML 绑定：** `onclick="BlindBoxEngine.open('daily')"`（menu 页面）
- 绑定正确，目标方法存在。

### 1.7 发现的问题

#### 🔴 P1 — 关键：AudioManager 声音 ID 不存在
**位置：** `BlindBoxEngine._animate()` 内部  
**问题：** 代码调用 `AudioManager.play("achievement")`，但 `AudioManager.play()` 的 switch-case 中 **没有定义 `"achievement"`** 类型。  
**后果：** 声音无法播放，静默失败（不报错，但无音效）。  
**修复建议：** 将 `"achievement"` 替换为已支持的类型（如 `"success"` 或 `"fanfare"`），或在 `AudioManager` 中补充 `"achievement"` 分支。

#### 🟡 P2 — 中：page-gacha 页面功能缺失
**位置：** `index.html` 第 1589 行  
**问题：** `page-gacha` 是**占位页面**，没有实际调用 `BlindBoxEngine`。按钮仅有缩放动画，不能真正抽卡。  
**后果：** 用户如果通过 URL 或其他方式进入 `page-gacha`，无法使用盲盒功能。  
**修复建议：** 将 `page-gacha` 中的按钮 `onclick` 绑定到 `BlindBoxEngine.open('normal')` 或 `BlindBoxEngine.open('daily')`。

#### 🟡 P3 — 中：引擎缺少 `init()` 方法
**位置：** `BlindBoxEngine` 定义  
**问题：** 引擎没有标准的 `init()` 初始化入口。虽然当前通过 `open()` 直接调用，但缺乏初始化时的事件绑定、DOM 检查等。  
**修复建议：** 添加 `init()` 方法，至少检查 `ALL_CARDS` 是否加载、初始化保底计数器等。

#### 🟢 P4 — 低：中文字符编码异常
**位置：** `BlindBoxEngine._animate()` 内部  
**问题：** 字符串中存在乱码（如 `\U0001f4e6 ͨä`）。  
**后果：** 运行时显示为乱码，影响 UI 美观。  
**修复建议：** 修复文件编码为 UTF-8，重新写入中文内容。

---

## 2. 知识卡牌引擎（CardsEngine）检查结果

### 2.1 引擎定位
- **文件位置：** 不存在任何独立的 JS 引擎文件
- `cards.js` 仅包含 **数据数组 `ALL_CARDS`**（369 张卡牌），没有引擎逻辑

### 2.2 方法清单
| 方法名 | 存在 | 说明 |
|--------|------|------|
| `init()` | ❌ | 不存在 |
| `_render()` | ❌ | 不存在 |
| `_showQuestion()` | ❌ | 不存在 |
| 任何方法 | ❌ | 不存在 |

### 2.3 页面容器检查
- `page-cards` 或 `cardsContent` 等容器 **不存在**。
- 卡牌展示功能由 `BlindBoxEngine._animate()` 或 `StudyEngine` 等其他引擎处理。

### 2.4 发现的问题

#### 🔴 P5 — 关键：CardsEngine 完全缺失
**问题：** 用户期望的知识卡牌引擎（如卡牌展示、卡牌收藏、卡牌图鉴）**完全不存在**。  
**后果：** 没有独立的卡牌浏览/管理功能。卡牌数据只能通过 `ALL_CARDS` 数组被其他引擎消费。  
**修复建议：** 新建 `CardsEngine`（或 `CodexEngine` 已存在部分功能），提供卡牌浏览、收藏查看、卡牌详情弹窗等功能。

---

## 3. 答题引擎（QuizEngine）检查结果

### 3.1 引擎定位
- **文件位置：** `game.js`（第 75,021 字符附近）
- **引擎大小：** 约 20,003 字符

### 3.2 方法清单
| 方法名 | 存在 | 说明 |
|--------|------|------|
| `init()` | ❌ | 不存在标准的 `init()` |
| `startRandom(count=10)` | ✅ | 启动随机答题模式 |
| `startByDisaster(disaster)` | ✅ | 按灾害类型启动 |
| `startSpeed(count)` | ✅ | 启动速答模式 |
| `showQuestion()` | ✅ | 显示当前题目（注意：不是 `_showQuestion`） |
| `selectOption(i)` | ✅ | 用户选择选项 |
| `next()` | ✅ | 下一题 |
| `useHint()` | ✅ | 使用提示道具 |
| `useDouble()` | ✅ | 使用双倍金币道具 |
| `_resetState(options)` | ✅ | 重置状态（内部方法） |
| `_initUI()` | ✅ | 初始化 UI（内部方法） |
| `_el(id)` | ✅ | 获取 DOM 元素（含 battle mode 映射） |
| `_showExplanation()` | ✅ | 显示解析 |
| `_gameOver()` | ✅ | 游戏结束处理 |
| `_render()` | ❌ | 不存在 |
| `_showQuestion()` | ❌ | 不存在（是 `showQuestion()` 不是 `_showQuestion`） |

### 3.3 页面容器检查
- `page-quiz`：✅ 存在
- `quizArea`、`quizCard`、`quizQuestion`、`quizOptions`、`quizResult`：✅ 均存在
- `survivalHud`、`hpBarFill`、`hudHpValue`：✅ 存在（生存模式 HUD）

### 3.4 导航调用检查
- `PageManager.navigate("quiz")`：✅ 正确（在 `startRandom` 等方法中）
- `PageManager.navigate("menu")`：✅ 正确（在 `quit` 和 `_gameOver` 中）
- `PageManager.navigate("campaign")`：✅ 正确（在特定模式下）

### 3.5 数据依赖检查
- `ALL_CARDS`：✅ 存在
- `GameState`：✅ 存在
- `AdaptiveDifficulty`：✅ 存在（有 fallback 逻辑）
- `AudioManager`：✅ 存在
- `Modal`：✅ 存在
- `LevelEngine`：✅ 存在（有安全包裹）

### 3.6 事件绑定检查
- HTML 绑定：`onclick="QuizEngine.startSpeed(10)"` ✅
- HTML 绑定：`onclick="QuizEngine.next()"` ✅
- HTML 绑定：`onclick="QuizEngine.selectOption(${i})"` ✅（动态生成）
- HTML 绑定：`onclick="QuizEngine.useHint()"` ✅（动态生成）
- HTML 绑定：`onclick="QuizEngine.useDouble()"` ✅（动态生成）

### 3.7 发现的问题

#### 🟡 P6 — 中：引擎缺少 `init()` 方法
**问题：** 没有标准的 `init()` 入口，依赖 `startRandom()` 等启动方法来隐式初始化。  
**修复建议：** 添加 `init()` 方法，统一初始化 UI、状态变量、事件监听等。

#### 🟢 P7 — 低：内部方法 `_resetState` 被外部引擎调用
**位置：** `BattleEngine.init()`  
**问题：** `BattleEngine.init()` 直接调用 `QuizEngine._resetState({...})`，访问了 QuizEngine 的私有方法。  
**后果：** 耦合度高，`_resetState` 签名变更会导致 BattleEngine 崩溃。  
**修复建议：** 将 `_resetState` 改为公共方法，或提供 `QuizEngine.initBattleMode(cards)` 公共接口。

---

## 4. 防灾擂台引擎（BattleEngine）检查结果

### 4.1 引擎定位
- **文件位置：** `game.js`（第 39,820 字符附近）
- **引擎大小：** 约 9,437 字符

### 4.2 方法清单
| 方法名 | 存在 | 说明 |
|--------|------|------|
| `init()` | ✅ | 初始化并进入 battle 页面 |
| `spawnBoss(boss)` | ✅ | 生成 Boss |
| `attack()` | ✅ | 玩家攻击 |
| `playerHit()` | ✅ | 玩家受击 |
| `winBattle()` | ✅ | 胜利处理 |
| `loseBattle()` | ✅ | 失败处理 |
| `updateUI()` | ✅ | 更新 UI |
| `ultimateAttack()` | ✅ | 必杀技（HTML 绑定） |
| `playAttackEffect(damage, isCrit)` | ✅ | 播放攻击特效 |
| `_render()` | ❌ | 不存在 |
| `_showQuestion()` | ❌ | 不存在 |

### 4.3 页面容器检查
- `page-battle`：✅ 存在
- `battle-stage`：✅ 存在
- `bossAvatar`、`bossHpBar`、`bossHpText`：✅ 存在
- `playerHpBar`、`playerHpText`：✅ 存在
- `energyBar`、`battleStreak`、`battleUltBtn`：✅ 存在

### 4.4 导航调用检查
- `PageManager.navigate("battle")`：✅ 正确（在 `init()` 中）
- `PageManager.navigate("menu")`：✅ 正确（在 `winBattle` / `loseBattle` 中）

### 4.5 数据依赖检查
- `ALL_CARDS`：✅ 存在
- `GameState`：✅ 存在
- `QuizEngine`：✅ 存在（直接调用 `_resetState`）
- `BGMEngine`：✅ 存在（有 `typeof !== 'undefined'` 安全检查）
- `VisualFX`：✅ 存在（有安全检查）
- `screenShake`：✅ 存在（在 `juice.js` 中定义，且已加载）
- `showFloatingText`：✅ 存在（在 `juice.js` 中定义）
- `AudioManager`：✅ 存在
- `Modal`：✅ 存在
- `LevelEngine`：✅ 存在（有安全包裹）

### 4.6 事件绑定检查
- HTML 绑定：`onclick="BattleEngine.ultimateAttack()"` ✅（在 `battleUltBtn` 上）
- 按钮状态：`class="hidden"` 默认隐藏，能量满时显示。

### 4.7 发现的问题

#### 🟢 P8 — 低：`BGMEngine.playBattleBgm()` 依赖未定义方法（已安全处理）
**位置：** `BattleEngine.init()`  
**问题：** 调用 `BGMEngine.playBattleBgm()`，但 `BGMEngine` 定义在 `game.js` 中，且代码被 `"undefined"!=typeof BGMEngine` 包裹。  
**结果：** 实际上不会报错，因为 `BGMEngine` 存在且 `playBattleBgm` 被定义（在 `bgm.js` 或 `bgm-enhanced.js` 中）。  
**结论：** 不是问题，安全设计。

#### 🟢 P9 — 低：`page-battle` 中 "下一题" 按钮调用 `QuizEngine.next()` 而非 `BattleEngine.next()`
**位置：** `index.html` 第 1767 行  
**问题：** `<button id="battleQuizNextBtn" onclick="QuizEngine.next()">下一题 →</button>`  
**分析：** 在 battle 模式下，答题逻辑确实由 `QuizEngine` 处理，`BattleEngine` 负责战斗逻辑。因此点击"下一题"调用 `QuizEngine.next()` 是**设计意图**，不是 bug。  
**结论：** 不是问题，耦合设计合理。

---

## 5. 自由模式引擎（FreeModeEngine）检查结果

### 5.1 引擎定位
- **文件位置：** 不存在于任何 JS 文件中
- 仅在 `game.js` 的 **头部注释** 中提及："`FreeModeEngine`"

### 5.2 方法清单
| 方法名 | 存在 | 说明 |
|--------|------|------|
| 所有方法 | ❌ | 完全不存在 |

### 5.3 页面容器检查
- `page-free`：✅ 存在（自由模式预览页）
- 但页面中按钮绑定的是 `StudyEngine.start()` 而非 `FreeModeEngine`

### 5.4 发现的问题

#### 🔴 P10 — 关键：FreeModeEngine 完全缺失
**问题：** 引擎完全不存在，`page-free` 页面由 `StudyEngine` 代理处理。  
**后果：** 没有独立的自由模式引擎。自由模式实际上是学习模式的别名。  
**修复建议：** 确认是否确实需要独立的 `FreeModeEngine`，或者将 `StudyEngine` 重命名以反映其双重职责。

---

## 6. 问题汇总与优先级

| 优先级 | 问题 ID | 引擎 | 问题描述 | 修复建议 |
|--------|---------|------|----------|----------|
| 🔴 P1 | BlindBoxEngine | AudioManager `"achievement"` 声音 ID 不存在 | 替换为已支持的类型或补充定义 |
| 🔴 P5 | CardsEngine | 引擎完全缺失 | 新建 CardsEngine 或确认由其他引擎代理 |
| 🔴 P10 | FreeModeEngine | 引擎完全缺失 | 确认需求，新建引擎或统一由 StudyEngine 处理 |
| 🟡 P2 | BlindBoxEngine | page-gacha 占位页面无实际功能 | 绑定按钮到 `BlindBoxEngine.open()` |
| 🟡 P3 | BlindBoxEngine | 缺少 `init()` 方法 | 添加初始化入口 |
| 🟡 P6 | QuizEngine | 缺少 `init()` 方法 | 添加初始化入口 |
| 🟡 P7 | QuizEngine | 内部方法 `_resetState` 被外部调用 | 提供公共接口 |
| 🟢 P4 | BlindBoxEngine | 中文字符编码异常 | 修复文件编码 |
| 🟢 P8 | BattleEngine | BGMEngine 调用（实际安全） | 无需修复 |
| 🟢 P9 | BattleEngine | 下一题按钮调用 QuizEngine（设计意图） | 无需修复 |

---

## 7. 总体评估

| 引擎 | 状态 | 说明 |
|------|------|------|
| **BlindBoxEngine** | ⚠️ 可用但有缺陷 | 核心功能可用，但存在声音 ID 缺失、页面占位、编码问题 |
| **QuizEngine** | ✅ 基本可用 | 功能完整，但缺少标准 `init()`，内部方法暴露给外部 |
| **BattleEngine** | ✅ 可用 | 功能完整，导航正确，数据依赖安全 |
| **FreeModeEngine** | ❌ 缺失 | 完全不存在，由 StudyEngine 代理 |
| **CardsEngine** | ❌ 缺失 | 完全不存在，仅数据文件 |

**最严重问题：** `CardsEngine` 和 `FreeModeEngine` 完全缺失，且 `BlindBoxEngine._animate` 中引用了不存在的 AudioManager 声音类型 `"achievement"`。

---

*报告生成完毕 — Inspector_Engine_1*
