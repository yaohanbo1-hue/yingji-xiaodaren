# 应急小达人 —— 响应式布局检查报告

> **检查类型**: responsive-check  
> **检查文件**: `index.html`, `all-styles-v55.css`  
> **检查时间**: 2026-07-03 14:37:12  
> **检查人**: UI/UX 检查修复专家（子代理）

---

## 一、Viewport Meta 检查

| 检查项 | 状态 | 说明 |
|--------|------|------|
| `width=device-width` |  | `index.html:6` 存在 |
| `initial-scale=1.0` |  | `index.html:6` 存在 |
| `maximum-scale=1.0` |  | `index.html:6` 存在，**应移除** |
| `user-scalable=no` |  | `index.html:6` 存在，**应移除** |
| `viewport-fit=cover` |  | 存在，刘海屏适配正确 |

### 问题 1：缩放限制影响无障碍访问
- **位置**: `index.html:6`
- **现状**: `content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no,viewport-fit=cover"`
- **影响**: `maximum-scale=1.0` + `user-scalable=no` 禁止用户缩放，违反 WCAG 1.4.4（文本应可缩放至200%而不需辅助技术）。低视力用户无法放大内容阅读。
- **修复建议**:
  ```html
  <!-- 修改前 -->
  <meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no,viewport-fit=cover">
  <!-- 修改后 -->
  <meta name="viewport" content="width=device-width,initial-scale=1.0,viewport-fit=cover">
  ```

---

## 二、媒体查询检查

| 断点 | 数量 | 用途 |
|------|------|------|
| `@media (max-width: 768px)` | 7 处 | 平板/大手机横屏 |
| `@media (max-width: 480px)` | 9 处 | 主流手机 |
| `@media (max-width: 420px)` | 1 处 | 小屏手机（选项按钮） |
| `@media print` | 2 处 | 打印优化 |
| `@media (prefers-reduced-motion: reduce)` | 2 处 | 减少动画偏好 |
| `@media (hover: none)` | 1 处 | 触摸设备 hover 粘滞修复 |

### 问题 2：缺少 320px 超小屏断点
- **影响**: iPhone SE (375px)、折叠手机外屏（~320-360px）等窄屏设备没有专门适配。部分布局在 320px~420px 区间可能溢出或挤压。
- **修复建议**: 添加超小屏断点或检查现有 480px 规则在 320px 下的表现：
  ```css
  @media (max-width: 360px) {
    .menu-cat-btn { font-size: 0.85em; padding: 12px 14px; }
    .game-header { font-size: 1em !important; }
  }
  ```

### 问题 3：缺少移动优先（min-width）断点设计
- **影响**: 所有媒体查询均为 `max-width` 单向断点，采用桌面优先降级的策略。代码中大量 `!important` 与 `max-width` 覆盖叠加，导致 CSS 特异性复杂，维护困难。
- **修复建议**: 新项目建议采用移动优先（`min-width` 递增），但现有项目可通过重构逐步迁移。当前短期建议：确保 480px 规则覆盖所有窄屏场景。

### 问题 4：缺少高对比度和暗色模式媒体查询
- **位置**: `all-styles-v55.css` 全文件
- **影响**: 没有 `prefers-contrast: high` 或 `prefers-color-scheme: dark` 媒体查询，无法满足用户系统级偏好。
- **修复建议**:
  ```css
  @media (prefers-contrast: high) {
    .quiz-opt, .scenario-opt { border-width: 2px; }
  }
  @media (prefers-color-scheme: dark) {
    /* 如当前已有暗色主题，可与之联动 */
  }
  ```

---

## 三、弹性布局（Flex/Grid）检查

### 3.1 Flex 布局检查

- **使用 `flex-wrap: wrap` 的位置**（共 5 处）:
  | 位置 | 选择器 | 状态 |
  |------|--------|------|
  | 517 | `.ai-quick-actions` |  |
  | 979 | `.weak-tags` |  |
  | 1275 | `.terminal-suggestions` |  |
  | 2225 | `.cert-actions` |  |
  | 6149 | `.share-actions` |  |

- **未使用 `flex-wrap: wrap` 的 Flex 容器**: 大量 `display: flex` 容器（约 120+ 处）未设置 `flex-wrap: wrap`，在窄屏下如果子元素宽度之和超出视口，将导致水平溢出。

### 问题 5：大量 Flex 容器缺少 `flex-wrap: wrap`
- **影响**: 典型风险区域：
  - 菜单工具栏（`.menu-toolbar`）包含多个按钮，在小屏下可能挤压超出边界
  - 证书操作区（`.cert-actions`）在已有 `wrap` 之外的区域
  - 弹窗操作按钮（`.modal-actions`）如果按钮数量多，小屏下会溢出
- **修复建议**: 对以下容器添加 `flex-wrap: wrap`：
  ```css
  .menu-toolbar, .modal-actions, .quiz-header-actions,
  .settings-actions, .share-actions { flex-wrap: wrap; }
  ```

### 3.2 Grid 布局检查

- **使用 `minmax()` 的 Grid**（正确使用，共 10 处）:
  | 位置 | 选择器 | 配置 |
  |------|--------|------|
  | 4422 | `.codex-grid` 等 | `repeat(auto-fill, minmax(120px, 1fr))` |
  | 4451 | `.collection-grid` | `minmax(280px, 1fr)` |
  | 4501 | `.achievement-grid` | `minmax(200px, 1fr)` |
  | 4595 | 响应式 `.codex-grid` | `minmax(100px, 1fr)` |
  | 6649 | `.ranking-grid` | `minmax(250px, 1fr)` |
  | 6728 | `.leaderboard-grid` | `minmax(220px, 1fr)` |
  | 6809 | `.character-grid` | `minmax(150px, 1fr)` |
  | 6861 | `.badge-grid` | `minmax(200px, 1fr)` |
  | 6920 | `#page-achievements` | `minmax(200px, 1fr)` |
  | 8047 | `.shop-grid` | `minmax(280px, 1fr)` |

- **固定列数且无响应式的 Grid**:
  | 位置 | 选择器 | 配置 | 问题 |
  |------|--------|------|------|
  | 792 | `.ai-stats-grid` | `repeat(3, 1fr)` | 小屏下 3 列挤压 |
  | 875 | `.ai-action-grid` | `repeat(3, 1fr)` | 小屏下 3 列挤压 |
  | 1303 | `.ai-config-grid` | `1fr 1fr` | 尚可 |
  | 2458 | `.sim-selector` | `repeat(2, 1fr)` | 有 480px 覆盖为 1fr |
  | 3533 | `.sim-actions` | `repeat(2, 1fr)` | 有 480px 覆盖为 1fr |
  | 3642 | `.sim-history-grid` | `repeat(2, 1fr)` | 小屏下可能挤压 |

### 问题 6：部分 Grid 缺少小屏下的列数调整
- **位置**: `all-styles-v55.css` 792、875、1303、3642 行附近
- **影响**: `.ai-stats-grid` 使用 `repeat(3, 1fr)`，在 320px 宽屏下每列仅剩约 100px，内容可能溢出或换行异常。`.ai-action-grid` 同理。
- **修复建议**:
  ```css
  @media (max-width: 480px) {
    .ai-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
    .ai-action-grid { grid-template-columns: repeat(2, 1fr) !important; }
  }
  @media (max-width: 360px) {
    .ai-stats-grid { grid-template-columns: 1fr !important; }
    .ai-action-grid { grid-template-columns: 1fr !important; }
  }
  ```

---

## 四、字体与流体排版检查

### 4.1 `font-size` 使用统计

- 全文件共 **252 处** `font-size` 声明
- 使用 `clamp()` 实现流体排版：**仅 2 处**
  - 3185: `.title-glow` — `clamp(1.4rem, 4vw, 2rem)` 
  - 3197: `.title-section` — `clamp(1rem, 2.5vw, 1.3rem)`
- 使用固定 `px` 单位：**约 90% 以上**
- 使用 `em`/`rem` 单位：**少量**

### 问题 7：极少使用流体排版，大量固定 px 字体
- **影响**: 在 320px~768px 之间，字体不会平滑缩放，只能通过离散的媒体查询跳变。用户体验不够连贯，且维护成本高。
- **修复建议**: 对标题、核心按钮等逐步采用 `clamp()`：
  ```css
  .game-header { font-size: clamp(1.2rem, 3vw, 1.8rem) !important; }
  .quiz-opt { font-size: clamp(13px, 3.5vw, 16px); }
  .mode-btn { font-size: clamp(14px, 2.5vw, 18px); }
  ```

### 问题 8：极小字号（9px）可读性差
- **位置**: `all-styles-v55.css:250`
- **现状**: `.tool-btn { font-size: 9px !important; }`
- **影响**: 9px 字体在移动端几乎无法阅读，低于 WCAG 建议的最小 12px 可读字号。即使用户缩放被限制（问题 1），这个问题更严重。
- **修复建议**:
  ```css
  @media (max-width: 768px) {
    .tool-btn { font-size: 11px !important; min-width: 48px !important; }
  }
  @media (max-width: 480px) {
    .tool-btn { font-size: 10px !important; } /* 最低 10px，配合图标理解 */
  }
  ```

---

## 五、固定宽度与溢出风险

### 问题 9：多处固定像素宽度在移动端可能溢出

| 位置 | 选择器 | 固定宽度 | 风险 |
|------|--------|----------|------|
| 329 | `.ai-float-panel` | `width: 380px !important` | **高** — 在 <380px 屏幕溢出 |
| 1651 | `.cert-modal` | `width: 700px` | **高** — 无 `max-width: 100%` |
| 1660 | `.cert-modal` (大) | `width: 550px` | **高** |
| 1669 | `.cert-modal` (中) | `width: 450px` | **中** — 480px 断点勉强覆盖 |
| 495 | `.ai-float-panel` | `max-width: 280px` | 尚可 |
| 511 | `.ai-float-panel` | `max-width: 280px` | 尚可 |

- **修复建议**:
  ```css
  .ai-float-panel {
    width: 380px !important;
    max-width: calc(100vw - 24px) !important; /* 添加防溢出 */
  }
  .cert-modal {
    width: 700px;
    max-width: 95vw; /* 添加视口限制 */
  }
  ```

---

## 六、Position: Fixed 与层级检查

- 全文件共 **20+ 处** `position: fixed`
- 大部分都正确设置了 `z-index`，但层级体系较混乱：
  - `z-index: 100000`（`.guide-tooltip`）最高
  - `z-index: 99999`（`.guide-overlay`、`.guide-highlight`）次之
  - `z-index: 9999`（`#loadingScreen`、`.combo-celebration`）
  - `z-index: 9998`（`.ai-fab`、`.share-btn-float`、`.modal-overlay`）
  - 背景元素使用 `z-index: -1 ~ -10`

### 问题 10：z-index 层级跳跃大，存在潜在冲突
- **影响**: 没有使用 CSS 变量管理 z-index，9999 与 100000 之间差距过大，后续新增元素容易插错层级。当前 `.ai-fab`（9998）与 `.modal-overlay`（9998）同级，如果同时出现可能遮挡关系不确定。
- **修复建议**: 引入 z-index 分级系统：
  ```css
  :root {
    --z-bg: -1;
    --z-content: 1;
    --z-sticky: 10;
    --z-float: 100;
    --z-modal: 1000;
    --z-overlay: 1001;
    --z-tooltip: 1002;
    --z-loading: 1003;
  }
  ```

---

## 七、其他发现

### 7.1 缺少 `touch-action: manipulation`
- **位置**: 全文件未找到
- **影响**: 在旧版浏览器（如部分安卓 WebView）中，点击按钮可能有 300ms 延迟，导致交互迟钝。
- **修复建议**:
  ```css
  button, a, .btn, .mode-btn, .quiz-opt {
    touch-action: manipulation;
  }
  ```

### 7.2 `overflow-x: hidden` 可能截断内容
- **位置**: `all-styles-v55.css:7067`
- **选择器**: 某个容器（需确认具体作用域）
- **影响**: 如果子元素有负 margin 或定位偏移，内容会被截断。用户无法横向滚动查看溢出内容。
- **建议**: 确认这是必要的设计决策，还是遗留代码。如果是后者，改为 `overflow-x: auto` 或移除。

### 7.3 Safe Area 适配良好
- **位置**: 多处使用 `env(safe-area-inset-bottom, 0px)`
- **评价**: 正面发现。iPhone 刘海屏、灵动岛设备的底部安全区适配已做，值得肯定。

---

## 八、问题汇总与优先级

| 编号 | 问题 | 严重度 | 文件 | 行号 | 修复建议 |
|------|------|--------|------|------|----------|
| 1 | Viewport 禁止缩放 |  | `index.html` | 6 | 移除 `maximum-scale=1.0, user-scalable=no` |
| 2 | 缺少 320px 断点 |  | `all-styles-v55.css` | — | 添加 `@media (max-width: 360px)` |
| 3 | 缺少 `min-width` 移动优先断点 |  | `all-styles-v55.css` | — | 长期重构，短期确保 480px 覆盖 |
| 4 | 缺少高对比度/暗色模式媒体查询 |  | `all-styles-v55.css` | — | 添加 `prefers-contrast` / `prefers-color-scheme` |
| 5 | 大量 Flex 缺 `flex-wrap: wrap` |  | `all-styles-v55.css` | 120+ | 对工具栏、操作区添加 `flex-wrap: wrap` |
| 6 | 部分 Grid 缺少小屏列数调整 |  | `all-styles-v55.css` | 792, 875, 3642 | 在 480px/360px 下改为 2 列或 1 列 |
| 7 | 极少使用 `clamp()` 流体排版 |  | `all-styles-v55.css` | 252 处 | 核心标题、按钮逐步改用 `clamp()` |
| 8 | `.tool-btn` 使用 9px 极小字号 |  | `all-styles-v55.css` | 250 | 最低使用 10px，配合图标 |
| 9 | 固定宽度（380px/700px）可能溢出 |  | `all-styles-v55.css` | 329, 1651 | 添加 `max-width: 95vw` / `calc(100vw - X)` |
| 10 | z-index 层级管理混乱 |  | `all-styles-v55.css` | 20+ | 引入 CSS 变量分级管理 |
| 11 | 缺少 `touch-action: manipulation` |  | `all-styles-v55.css` | — | 为交互元素添加 |
| 12 | `overflow-x: hidden` 可能截断 |  | `all-styles-v55.css` | 7067 | 确认必要性，或改为 `auto` |

> **严重度说明**:  = 高（影响核心功能/无障碍）， = 中（影响体验）， = 低（建议优化）

---

## 九、修复优先级建议

### 立即修复（P0 — 影响无障碍/功能）
1. **问题 1**: 移除 `user-scalable=no` 和 `maximum-scale=1.0`（`index.html:6`）
2. **问题 9**: 为 `.ai-float-panel`（380px）和 `.cert-modal`（700px）添加 `max-width: 95vw`（`all-styles-v55.css:329, 1651`）
3. **问题 8**: 将 `.tool-btn` 的 `9px` 提升至最低 `10px`（`all-styles-v55.css:250`）

### 短期修复（P1 — 影响体验）
4. **问题 5**: 为菜单工具栏、模态操作区添加 `flex-wrap: wrap`
5. **问题 6**: 为 `.ai-stats-grid`、`.ai-action-grid` 添加小屏列数调整
6. **问题 2**: 添加 `@media (max-width: 360px)` 断点处理超小屏
7. **问题 11**: 添加 `touch-action: manipulation` 消除 300ms 延迟

### 长期优化（P2 — 代码质量）
8. **问题 7**: 核心标题、按钮逐步改用 `clamp()` 流体排版
9. **问题 10**: 引入 CSS 变量统一管理 z-index
10. **问题 3/4**: 重构为移动优先断点，添加无障碍媒体查询
11. **问题 12**: 审查 `overflow-x: hidden` 的必要性

---

*报告结束。本检查基于 `index.html` 和 `all-styles-v55.css` 的静态代码分析，建议结合 WebBridge 实际设备验证确认问题。*
