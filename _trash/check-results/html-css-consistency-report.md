# HTML/CSS 一致性检查报告

## 检查任务
**任务名称**: `check-html-css-consistency`  
**项目**: 应急小达人（防灾教育互动游戏）  
**检查范围**: `index.html` + 根目录下所有 `.css` 文件

---

## 总体统计

| 指标 | 数值 |
|------|------|
| 分析文件 | `index.html` + 29 个 CSS 文件 |
| HTML 中不重复类名 | **288** 个 |
| CSS 中不重复类选择器 | **625** 个 |
| 双方一致类名 | **194** 个 |
| HTML 引用但 CSS 未定义 | **94** 个 |
| CSS 定义但 HTML 未引用 | **431** 个 |
| HTML 类名一致率 | **67.4%** |

---

## Top 30 类名引用频率与定义状态

| 排名 | 类名 | HTML 引用次数 | CSS 中定义 |
|------|------|--------------|-----------|
| 1 | `btn` | 63 | ✅ 是 |
| 2 | `page` | 51 | ✅ 是 |
| 3 | `page-content` | 50 | ✅ 是 |
| 4 | `back-float` | 50 | ✅ 是 |
| 5 | `mode-btn` | 37 | ✅ 是 |
| 6 | `mode-icon` | 37 | ✅ 是 |
| 7 | `mode-name` | 37 | ✅ 是 |
| 8 | `mode-desc` | 37 | ✅ 是 |
| 9 | `mode-badge` | 24 | ✅ 是 |
| 10 | `hidden` | 22 | ✅ 是 |
| 11 | `preview-header` | 21 | ✅ 是 |
| 12 | `preview-icon` | 21 | ✅ 是 |
| 13 | `preview-title` | 21 | ✅ 是 |
| 14 | `preview-desc` | 21 | ✅ 是 |
| 15 | `game-header` | 18 | ✅ 是 |
| 16 | `mode-label` | 18 | ✅ 是 |
| 17 | `feature-item` | 17 | ✅ 是 |
| 18 | `feature-icon` | 17 | ❌ **否** |
| 19 | `feature-text` | 17 | ❌ **否** |
| 20 | `feature-status` | 17 | ❌ **否** |
| 21 | `feature-ready` | 12 | ❌ **否** |
| 22 | `codex-filter-btn` | 11 | ❌ **否** |
| 23 | `settings-card` | 11 | ✅ 是 |
| 24 | `settings-card-left` | 11 | ✅ 是 |
| 25 | `settings-card-icon` | 11 | ✅ 是 |
| 26 | `settings-card-info` | 11 | ✅ 是 |
| 27 | `settings-card-name` | 11 | ✅ 是 |
| 28 | `settings-card-desc` | 11 | ✅ 是 |
| 29 | `settings-card-right` | 11 | ✅ 是 |
| 30 | `game-container` | 11 | ❌ **否** |

> **说明**: Top 30 中 **6 个类名**（`feature-icon`、`feature-text`、`feature-status`、`feature-ready`、`codex-filter-btn`、`game-container`）在 HTML 中高频引用，但在 CSS 和 JS 中均未找到定义。

---

## 🔴 高风险不一致：HTML 引用但 CSS 未定义（且 JS 未动态引用）

以下类名在 `index.html` 中被引用，但在所有 CSS 文件和 JS 文件（字符串匹配）中均未找到定义。这些可能是**拼写错误**、**未实现的样式**或**遗留代码**。

| 类名 | HTML 引用次数 | 风险等级 | 建议 |
|------|-------------|---------|------|
| `feature-status` | 17 | ⚠️ **高** | 高频引用，检查是否为 `feature-item` 的子元素样式缺失 |
| `feature-text` | 17 | ⚠️ **高** | 同上，可能为 `feature-item` 的文本样式 |
| `feature-icon` | 17 | ⚠️ **高** | 同上，可能为 `feature-item` 的图标样式 |
| `feature-ready` | 12 | ⚠️ **高** | 可能为 `feature-item` 的就绪状态样式 |
| `game-container` | 11 | ⚠️ **高** | 游戏容器类名，检查是否应为 `game-content` 或其他已定义类名 |
| `codex-filter-btn` | 11 | ⚠️ **高** | 图鉴过滤按钮，可能实现为内联样式或 JS 动态设置 |
| `cursor-pointer` | 8 | ⚠️ 中 | 类似 Tailwind 工具类，可能应使用 `cursor: pointer` 内联或添加 CSS 定义 |
| `btn-lg` | 6 | ⚠️ 中 | 大型按钮变体，可能应补充 CSS 或改为现有类名 |
| `hud-label` | 4 | ⚠️ 中 | HUD 标签，可能缺少样式定义 |
| `feature-list` | 4 | ⚠️ 中 | 功能列表容器，可能缺少样式 |
| `quiz-q` | 4 | ⚠️ 中 | 题目文本样式，可能缺少定义 |
| `quiz-explanation` | 3 | ⚠️ 中 | 解析说明样式，可能缺少定义 |
| `hud-item` | 3 | ⚠️ 中 | HUD 项，可能缺少样式 |
| `avatar-name` | 2 | ⚠️ 低 | 角色名称 |
| `hp-text` | 2 | ⚠️ 低 | HP 文本 |
| `battle-side` | 2 | ⚠️ 低 | 对战方 |
| `exp-scenario` | 2 | ⚠️ 低 | 实验场景 |
| `avatar` | 2 | ⚠️ 低 | 头像 |
| `pk-name-group` | 2 | ⚠️ 低 | PK 名称组 |
| `study-icon` | 2 | ⚠️ 低 | 学习图标 |
| `study-nav-btn` | 2 | ⚠️ 低 | 学习导航按钮 |
| `exp-card` | 2 | ⚠️ 低 | 实验卡片 |
| `mode-badge-new` | 2 | ⚠️ 低 | 新徽章 |
| `pk-setting` | 2 | ⚠️ 低 | PK 设置 |
| `pk-name-icon` | 2 | ⚠️ 低 | PK 名称图标 |
| `pk-name-input` | 2 | ⚠️ 低 | PK 名称输入框 |
| `study-divider` | 2 | ⚠️ 低 | 学习分隔线 |
| `study-label` | 2 | ⚠️ 低 | 学习标签 |
| `w-full` | 2 | ⚠️ 低 | 宽度100%（类似 Tailwind） |

---

## 🟡 CSS 中定义但 HTML 未引用（潜在冗余 / 动态注入）

CSS 中定义了 **431** 个类名在 `index.html` 中未直接引用。部分示例：

- `achievement-card`、`achievement-icon`、`achievement-name`、...
- `action-btn`、`action-btn-primary`、`action-btn-secondary`、...
- `ai-avatar`、`ai-badge`、`ai-fab`、`ai-float-panel`、...
- `add`、`btn-lg`、`card-header`、`card-body`、...

> **注意**: 这些类名可能通过 JavaScript 动态注入到 DOM 中（如 `classList.add()`、`.className = ...` 等），本检查仅通过字符串匹配无法完全确认。但 **431 个冗余类名** 数量较高，建议清理确认。

---

## 检查方法说明

1. **HTML 类名提取**: 使用正则 `class="..."` 提取 `index.html` 中所有 `class` 属性值，拆分并去重。
2. **CSS 选择器提取**: 使用正则 `\.([a-zA-Z_-][a-zA-Z0-9_-]*)` 提取所有 `.className` 形式的类选择器。
3. **JS 动态引用检查**: 对 HTML 独有类名在所有 `.js` 文件中进行字符串匹配，判断是否为 JS 动态注入。
4. **限制**: 未覆盖通过 CSS 变量、Tailwind 类名、或 JS 以非字符串方式引用的类名。

---

## 结论与建议

| 问题 | 数量 | 建议 |
|------|------|------|
| HTML 引用但 CSS 未定义（无 JS 引用） | 94 | 优先修复高频类名（如 `feature-icon`、`feature-text`、`game-container`），确认是否为拼写错误或样式缺失 |
| CSS 定义但 HTML 未引用 | 431 | 逐一确认是否为 JS 动态注入；若确认无使用，可清理以减小 CSS 体积 |
| 整体一致率 | 67.4% | 建议将一致率提升至 **90%** 以上，清理冗余和未定义类名 |

---

*报告生成时间: 2026-07-03*
