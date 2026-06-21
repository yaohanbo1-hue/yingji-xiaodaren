# 应急小达人 — 最终 QA 扫描报告

> 扫描时间：2026-06-19  
> 扫描范围：`C:/Users/hambu/Documents/kimi/workspace`（源代码，排除 `archive/`、`reports/`、`yingji-xiaodaren/` 重复目录）  
> 扫描项：localStorage 前缀统一性、innerHTML XSS 风险、依赖加载顺序、未定义变量、新引入 Bug

---

## 一、localStorage 键名前缀不统一（Low）—— 仍存在

| 键名 | 所在模块 | 前缀 |
|------|----------|------|
| `disasterGachaState` | GameState | `disaster` |
| `disasterSeason` | SeasonEngine | `disaster` |
| `disasterHQ_language` | i18n | `disasterHQ` |
| `disaster_hq_loading_shown` | loading | `disaster_hq` |
| `disaster_hq_voice_enabled` | voice | `disaster_hq` |
| `disaster_hq_voice_rate` | voice | `disaster_hq` |
| `disaster_hq_voice_pitch` | voice | `disaster_hq` |
| `aiTutorData` | ai-tutor | `aiTutor` |
| `certificationData` | certification | `certification` |
| `bg_theme` | bg-themes | `bg_theme` |
| `tutorialDone` | TutorialEngine | `tutorial` |

**说明**：  
`game-core.js` 已添加 `SafeStorage` monkey-patch，对 `localStorage.setItem/getItem/removeItem` 做了 try-catch 运行时保护，因此**功能上不会崩溃**。但键名前缀仍不统一，属于代码规范层面的 Low 级别问题。

---

## 二、innerHTML 直接插入用户输入（Medium）—— 仍有遗漏

### Bug 1：PKEngine 结果页未转义玩家昵称（XSS）
- **文件**：`game-engines.js`（PKEngine.endGame）
- **行号**：约 666 行（压缩在一行内，通过正则提取）
- **问题代码**：
  ```js
  document.getElementById("pkResultPlayers").innerHTML = `
    <div class="stat-label">${this.p1Name}</div>
    ...
    <div class="stat-label">${this.p2Name}</div>
  `;
  ```
- **风险**：`p1Name` / `p2Name` 直接来自用户输入框：
  ```js
  this.p1Name = document.getElementById("pkName1").value || "玩家1";
  this.p2Name = document.getElementById("pkName2").value || "玩家2";
  ```
  如果用户在输入框中填入 `<script>alert('xss')</script>`，该脚本将在结果页渲染时直接执行。
- **严重程度**：**Medium**（需要用户主动输入，但实际存在 XSS 漏洞）
- **修复建议**：使用 `escapeHtml()` 对 `p1Name` 和 `p2Name` 进行转义后再插入 innerHTML。

### Bug 2：AI 导师对话气泡未转义 LLM 返回内容（XSS）
- **文件**：`ai-tutor-v55.js`
- **行号**：525、539
- **问题代码**：
  ```js
  bubble.innerHTML = displayText.replace(/\n/g, '<br>');
  // 以及
  bubble.innerHTML = text.replace(/\n/g, '<br>');
  ```
- **风险**：`text` 变量来自 LLM API（`BailianAPI.chat`）返回的内容。如果 LLM 返回包含 `<script>` 或其他 HTML 标签的文本，将直接渲染并执行。虽然项目主要部署为本地静态页面，但一旦配置了 API Key，该风险即生效。
- **严重程度**：**Medium**
- **修复建议**：在设置 innerHTML 前，对 `text` / `displayText` 使用 `escapeHtml()` 进行转义。

### 说明：Modal.show 的 desc 参数
- **文件**：`game-engines.js`（Modal.show，第 565 行）
- **问题**：`this._descEl.innerHTML = desc;` 使用 innerHTML 渲染描述内容。
- **当前状态**：经扫描，所有 `Modal.show` 调用均传入**硬编码字符串或系统数据**（如卡牌名称、Boss 名称、金币数），**没有直接传入用户输入**。因此当前不构成 XSS，但这是一个潜在的架构风险点。建议未来统一为 `innerHTML` 仅用于受信任的模板，用户输入使用 `textContent` 或先转义。

---

## 三、html-escape.js 存在但未被使用（Low）

- **文件**：`html-escape.js`
- **问题**：项目中已定义 `escapeHtml()` 函数，但经扫描，**没有任何 `.js` 文件调用它**。
- **加载顺序**：`html-escape.js` 在 `game-engines.js` 之后加载（第 2485 行），即使被调用也处于较后位置。
- **建议**：对 Bug 1 和 Bug 2 的修复中直接使用 `escapeHtml()`。

---

## 四、游戏启动与依赖加载检查

### 脚本文件完整性
- **结果**：`index.html` 引用的 45 个 `<script>` 文件和 32 个 `<link>` 文件**全部存在**。
- **加载顺序**：
  1. `game-core.js`（SafeStorage monkey-patch）→ 2. `game-engines.js`（所有引擎）→ 3. `game.js`（主入口）→ 4. 其他功能模块
  - 该顺序合理，`game-core.js` 先加载可为后续所有 localStorage 调用提供保护。

### 潜在兼容性问题
- `game-engines.js` 中使用了**可选链操作符 `?.`**（如 `opts[idx]?.classList.add("wrong")`）。
- `index.html` 声称兼容 Safari 13+，但 `?.` 需要 **Safari 13.1+**。在 Safari 13.0 中会导致语法错误。
- **严重程度**：Low（Safari 13.0 用户极少，且属于兼容性而非功能缺陷）

---

## 五、新引入 Bug 检查

- 未发现明显的新引入功能性 Bug。
- `SafeStorage` monkey-patch 的引入是有效的运行时保护，不影响现有代码逻辑。

---

## 六、总结

| # | Bug 描述 | 文件 | 严重程度 | 状态 |
|---|---------|------|---------|------|
| 1 | localStorage 键名前缀不统一 | 多文件 | Low | 仍存在（规范问题） |
| 2 | PKEngine 结果页 innerHTML 插入未转义用户昵称 | `game-engines.js` | **Medium** | **存在，需修复** |
| 3 | AI 导师气泡 innerHTML 插入未转义 LLM 内容 | `ai-tutor-v55.js` | **Medium** | **存在，需修复** |
| 4 | `escapeHtml()` 存在但未被任何文件调用 | `html-escape.js` | Low | 需整合使用 |
| 5 | 可选链 `?.` 在 Safari 13.0 不兼容 | `game-engines.js` | Low | 兼容性边缘风险 |

---

## 七、最终判断

**不建议直接标记为“完成”**。

虽然游戏可以正常启动、所有文件齐全、依赖加载顺序正确，且 `localStorage` 有运行时保护，但**存在 2 处 Medium 级别的 XSS 漏洞**（PKEngine 用户昵称、AI 导师 LLM 返回内容）。这两个问题都可通过调用已存在的 `escapeHtml()` 函数快速修复，建议修复后再进行最终完成确认。

---

*扫描工具：静态代码分析 + 正则匹配 + 文件完整性检查*  
*排除目录：`archive/`、`reports/`、`yingji-xiaodaren/`（重复副本）*
