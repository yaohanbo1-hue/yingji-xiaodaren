# 「应急小达人」数据完整性检查报告

> **检查任务**: `check-data-integrity`  
> **检查时间**: 2026-06-15  
> **检查文件**: `cards.js`, `scenarios.js`, `kit_data.js`, `real-cases.js`  

---

## 一、总体汇总

| 文件 | 数据条目数 | 错误数 | 警告数 | 状态 |
|------|-----------|--------|--------|------|
| `cards.js` | 369 张卡牌 | 110 | 0 | ⚠️ 有问题 |
| `scenarios.js` | 29 个情景 | 0 | 0 | ✅ 正常 |
| `kit_data.js` | 5 个应急包 / 50 个物品 | 0 | 0 | ✅ 正常 |
| `real-cases.js` | 8 个真实案例 | 0 | 0 | ✅ 正常 |
| **合计** | — | **110** | **0** | — |

---

## 二、Cards.js 详细检查

### 2.1 数据概览

- **总卡牌数**: 369 张
- **无重复 ID**: ✅ 全部唯一
- **无答案索引越界**: ✅ 所有 `ans` 索引都在 `opts` 长度范围内
- **无空字段**: ✅ 无空字符串或空数组

### 2.2 发现的问题

#### 🔴 错误 1：字段名拼写错误（1 张）

| 位置 | 问题描述 | 影响 |
|------|---------|------|
| `card[32]` (id=`sn_03`) | 字段名写成了 `intermediate`，而非预期的 `difficulty`。值是 `"intermediate"`，但键名错误导致 `difficulty` 字段缺失。 | 游戏读取 `difficulty` 时会得到 `undefined`，可能影响难度分级和筛选逻辑。 |

**修复建议**: 将 `intermediate: "intermediate"` 改为 `difficulty: "intermediate"`。

#### 🔴 错误 2：批量卡牌缺少 `icon` 和 `category`（109 张）

| 位置范围 | ID 范围 | 缺失字段 | 数量 |
|----------|---------|---------|------|
| `card[260]` ~ `card[368]` | `2001` ~ `2109` | `icon`, `category` | 109 张 |

**分析**: 这批编号为 2001-2109 的卡片具有完整的中英文问答内容（`zh.q`, `zh.opts`, `zh.ans`, `zh.exp`），但缺少 `icon`（图标）和 `category`（分类）两个字段。在游戏中，这会导致：
- 卡牌列表中无法显示图标（显示空白或默认占位符）
- 分类筛选功能无法正确归类这些卡牌
- 卡牌详情页可能因缺少 `icon` 而布局异常

**修复建议**: 为这批 109 张卡牌补充 `icon`（emoji）和 `category`（如 `knowledge`、`response` 等）。

#### 🟡 提示：装备卡字段模式差异（20 张）—— 设计如此，非错误

| 位置范围 | ID 范围 | 说明 |
|----------|---------|------|
| `card[50]` ~ `card[69]` | `equip_helmet` ~ `equip_dustproof` | 装备卡使用 `zh.desc` / `zh.effect` / `zh.usage` 替代了 `zh.q` / `zh.opts` / `zh.ans` / `zh.exp`。这是装备卡的特殊数据模式，非错误。 |

> ⚠️ 但需确认：游戏逻辑中是否存在假设"所有卡牌都有 `zh.q` / `zh.opts`" 的代码，如果有，则装备卡在这些逻辑路径上会触发异常。建议检查 `game-engines.js` 中 `QuizEngine` 等模块是否做了类型分支判断。

---

## 三、Scenarios.js 详细检查

### 3.1 数据概览

- **总情景数**: 29 个（覆盖 `flood`, `earthquake`, `typhoon`, `fire`, `lightning`, `blizzard`, `landslide`, `drought`, `wildfire`, `volcano`, `tsunami`, `sandstorm` 等灾害类型）
- **无重复 ID**: ✅
- **无缺失字段**: ✅ 所有情景都有 `id`, `title`, `setting`, `desc`, `choices`
- **每个情景都有正确答案**: ✅ 29/29 的情景中至少有一个 `correct: true` 的选项
- **选项文本无空值**: ✅ 所有 `choices[].text` 均有内容

### 3.2 结论

✅ `scenarios.js` 数据完整，无问题。

---

## 四、Kit_data.js 详细检查

### 4.1 数据概览

- **应急包数量**: 5 个（地震、洪水、台风、山火、...）
- **物品总数**: 50 个
- **无缺失字段**: ✅ 所有应急包都有 `id`, `name`, `icon`, `time`, `slots`, `items`
- **无缺失物品字段**: ✅ 所有物品都有 `name`, `icon`, `correct`, `tip`
- **分类一致性**: ✅ 所有物品的分类均有效（注：当前物品未显式设置 `category` 字段，但 `correct` 布尔值已足以区分"应选"和"不应选"物品）

### 4.2 结论

✅ `kit_data.js` 数据完整，无问题。

---

## 五、Real-cases.js 详细检查

### 5.1 数据概览

- **案例总数**: 8 个
- **无重复 ID**: ✅
- **无缺失字段**: ✅ 所有案例都有 `id`, `title`, `date`, `icon`, `type`, `magnitude`, `impact`, `source`, `timeline`, `scenario`, `knowledge`
- **情景子结构完整**: ✅ `scenario.setting`, `scenario.desc`, `scenario.choices` 均存在
- **每个案例都有正确答案**: ✅ 8/8 的案例中至少有一个 `correct: true` 的选项
- **时间线完整**: ✅ `timeline[].time` 和 `timeline[].event` 均存在
- **知识总结无空值**: ✅ `knowledge[]` 数组中无空字符串

### 5.2 案例列表

| ID | 标题 | 日期 | 类型 |
|----|------|------|------|
| `wenchuan` | 汶川大地震 | 2008 年 5 月 12 日 | 地震 |
| `henan_flood` | 河南特大暴雨 | 2021 年 7 月 20 日 | 洪水 |
| `australia_fire` | 澳洲丛林大火 | 2019 年 9 月 - 2020 年 2 月 | 山火 |
| `doksuri` | 台风杜苏芮 | 2023 年 7 月 28 日 | 台风 |
| `japan_tsunami` | 日本 311 海啸 | 2011 年 3 月 11 日 | 海啸 |
| `yushu_earthquake` | 玉树地震救援 | 2010 年 4 月 14 日 | 地震 |
| `liangshan_fire` | 凉山森林火灾 | 2019 年 3 月 30 日 | 山火 |
| `tangshan_earthquake` | 唐山大地震 | 1976 年 7 月 28 日 | 地震 |

### 5.3 结论

✅ `real-cases.js` 数据完整，无问题。8 个案例覆盖了地震、洪水、山火、台风、海啸等灾害类型，结构统一，数据充实。

---

## 六、修复优先级建议

| 优先级 | 问题 | 文件 | 影响范围 | 建议修复方案 |
|--------|------|------|---------|-------------|
| **P0** | `sn_03` 字段名拼写错误 | `cards.js` | 1 张卡牌 | 将 `intermediate: "intermediate"` 改为 `difficulty: "intermediate"` |
| **P1** | 109 张卡牌缺少 `icon` | `cards.js` | `2001`~`2109` | 为每张卡牌补充对应灾害类型的 emoji 图标（如地震用 `🌍`，洪水用 `🌊` 等） |
| **P1** | 109 张卡牌缺少 `category` | `cards.js` | `2001`~`2109` | 根据卡牌内容分类为 `knowledge` / `response` / `prevention` 等 |
| **P2** | 确认装备卡兼容性 | `cards.js` + `game-engines.js` | 20 张装备卡 | 检查 `QuizEngine` 等模块是否假设所有卡牌都有 `zh.q` / `zh.opts`；如有，增加类型判断分支 |

---

## 七、检查脚本

本次检查使用的脚本已保存至：
- `C:\Users\hambu\Documents\kimi\workspace\_check_data_temp.js`
- `C:\Users\hambu\Documents\kimi\workspace\_inspect_cards.js`

可重复运行以验证修复后的数据状态。
