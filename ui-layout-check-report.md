# 应急小达人 UI 布局检查报告（ui-layout-check）

> 检查时间：2026-07-03 14:34:25  
> 检查文件：`index.html`（2091 行）、`all-styles-v55.css`（8082 行）及关联样式文件  
> 检查维度：内联样式、CSS 排版、模态框定位、响应式、z-index 层级

---

## 一、问题汇总表

| 优先级 | 类别 | 问题 | 位置 | 影响 |
|--------|------|------|------|------|
| 🔴 高 | 内联样式 | 大量 `font-size: XXpx`（65+ 处），无法随浏览器缩放 | `index.html` 多处 | 小屏幕/大字体设置下文字不可缩放 |
| 🔴 高 | viewport | `maximum-scale=1.0, user-scalable=no` 禁止缩放 | `index.html:6` | 可访问性合规问题（WCAG） |
| 🟡 中 | 内联样式 | `feature-icon` 使用 `font-size: 36px` 固定值 | `index.html:1065` 等 | 小屏幕上 emoji 可能过大 |
| 🟡 中 | 内联样式 | `memoryGrid` 使用 `grid-template-columns: repeat(4, 1fr)` + `max-width: 400px` | `index.html:1483` | 320px 屏幕每格仅约 71px，触摸目标偏小 |
| 🟡 中 | CSS 排版 | `.settings-card-name/desc` 使用 `line-height: 1.4` | `all-styles-v55.css:5864, 5869` | 中文行距偏紧，可能轻微重叠 |
| 🟡 中 | CSS 排版 | `.case-card-info p` 使用 `white-space: nowrap` + `text-overflow: ellipsis` | `all-styles-v55.css:5312-5314` | 长标题被截断，用户看不到完整内容 |
| 🟡 中 | 模态框 | `.modal-content` 的 `transform` 动画缺少 `will-change` | `all-styles-v55.css:6333-6345` | 动画性能未优化，低端设备可能卡顿 |
| 🟡 中 | z-index | `guide-tooltip` z-index: 100000 > `modal-overlay` z-index: 9998 | `all-styles-v55.css:4189, 6316` | 新手引导可能覆盖弹窗内容 |
| 🟢 低 | 内联样式 | 多个 `max-width: 500px` 限制内容宽度 | `index.html:634` 等 | 内容在 320px 屏幕上可能留白过多 |
| 🟢 低 | CSS 排版 | 多处 `overflow: hidden` 需确认是否截断 | `all-styles-v55.css` 30+ 处 | 需逐一验证，当前未发现明显截断 |
| 🟢 低 | 响应式 | 缺少 `@media (max-width: 320px)` 断点 | `all-styles-v55.css` | 超小屏幕（如 iPhone SE 1代）适配不足 |
| ✅ 无 | 内联样式 | 未发现负 margin / 负 padding | `index.html` | — |
| ✅ 无 | 模态框 | `modal-overlay` 使用 `position: fixed + inset: 0 + flex` 居中 | `all-styles-v55.css:6313` | 定位正确 |
| ✅ 无 | 模态框 | `themeModal` 使用 `position: fixed + flex` 居中 | `index.html:1715` | 定位正确 |
| ✅ 无 | CSS 排版 | 负 margin 仅用于 `.sr-only` 和 tooltip 箭头 | `all-styles-v55.css:195, 4227` | 标准做法，非错误 |

---

## 二、详细分析与修复建议

### 2.1 内联样式 `font-size: px` 问题（🔴 高）

**问题描述**：`index.html` 中存在 65+ 处内联 `style="font-size: XXpx"`，直接写死像素值。这会导致：
- 用户在浏览器/系统设置中调大字体时，这些元素无法跟随缩放
- 违反了 WCAG 1.4.4（文字可缩放至 200%）的要求

**典型位置**：
```html
<!-- 模式徽章 -->
<span class="mode-badge" style="...font-size:11px;">🎁 免费</span>        <!-- index.html:244 -->
<span class="feature-icon" style="font-size:36px;">👾</span>              <!-- index.html:1065 -->
<div id="escapeTimer" style="font-size:28px;color:#FF006E;font-weight:900;">60</div>  <!-- index.html:1399 -->
<div style="font-size:12px;color:rgba(255,255,255,0.4);">智能分析 · 个性推荐</div>     <!-- index.html:1527 -->
```

**修复建议**：
1. 将内联字体大小迁移到 CSS 类，使用 `rem` 单位（基于 `:root` 的 `font-size`）
2. 或改用 `clamp()` 实现流体排版：
   ```css
   .feature-icon { font-size: clamp(1.5rem, 5vw, 2.25rem); }  /* 替代 36px */
   .timer-display { font-size: clamp(1.5rem, 4vw, 1.75rem); }  /* 替代 28px */
   .badge-label { font-size: clamp(0.65rem, 1.5vw, 0.75rem); } /* 替代 11px */
   ```
3. 紧急度：高，建议在下一次样式迭代中统一处理。

---

### 2.2 viewport 禁止缩放（🔴 高）

**问题描述**：
```html
<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no,viewport-fit=cover">
```

`maximum-scale=1.0` 和 `user-scalable=no` 完全阻止用户缩放，对视力障碍用户不友好，违反 WCAG 1.4.4。

**修复建议**：
```html
<meta name="viewport" content="width=device-width,initial-scale=1.0,viewport-fit=cover">
```

> 注：此问题已在之前检查中发现，当前版本仍未修复。

---

### 2.3 `memoryGrid` 触摸目标过小（🟡 中）

**问题描述**：
```html
<div id="memoryGrid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;max-width:400px;margin:0 auto;"></div>
```

在 320px 宽屏幕上（如 iPhone SE 1代）：
- 可用宽度 ≈ 320px - 24px (页面边距) = 296px
- 每格宽度 ≈ (296 - 36) / 4 = 65px
- 65px < 44px (WCAG 最小触摸目标) × 1.5 = 66px 推荐值

**修复建议**：
1. 在 `@media (max-width: 360px)` 下改为 `repeat(3, 1fr)` 或增大 gap
2. 或设置 `min-width: 72px` 保证每个卡片最小尺寸

---

### 2.4 中文行距偏紧（🟡 中）

**问题描述**：
```css
.settings-card-name { font-size: 14px; line-height: 1.4; }  /* all-styles-v55.css:5861-5864 */
.settings-card-desc { font-size: 12px; line-height: 1.4; }  /* all-styles-v55.css:5866-5869 */
```

中文排版推荐行高为 1.5–1.8，`1.4` 在字号较大或字体较粗时可能导致行间距不足，视觉上有重叠感。

**修复建议**：
```css
.settings-card-name { line-height: 1.5; }
.settings-card-desc { line-height: 1.5; }
```

同样建议检查 `all-styles-v55.css:2041, 5124, 7864` 等处的 `line-height: 1.4`。

---

### 2.5 `.case-card-info p` 文字截断（🟡 中）

**问题描述**：
```css
.case-card-info p {
  font-size: 12px;
  color: rgba(148, 163, 184, 0.6);
  margin: 0;
  white-space: nowrap;      /* 禁止换行 */
  overflow: hidden;          /* 隐藏溢出 */
  text-overflow: ellipsis;  /* 显示省略号 */
}
```

`.case-card-info` 有 `flex: 1; min-width: 0`，在 flex 容器中正确收缩，但 `white-space: nowrap` 意味着任何稍长的灾害名称（如"火山爆发应急指南"）都会被截断为"火山爆发应急..."，用户无法看到完整内容。

**修复建议**：
1. 允许换行：移除 `white-space: nowrap`，改用 `line-clamp: 2` 限制两行
   ```css
   .case-card-info p {
     display: -webkit-box;
     -webkit-line-clamp: 2;
     -webkit-box-orient: vertical;
     overflow: hidden;
   }
   ```
2. 或添加 `title` 属性显示完整内容

---

### 2.6 模态框动画缺少 `will-change`（🟡 中）

**问题描述**：`.modal-content` 使用了 `transform: scale(0.85) translateY(30px)` 的入场动画，但没有 `will-change` 提示浏览器优化：

```css
.modal-content {
  transition: transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.35s ease;
}
.modal-overlay.active .modal-content {
  animation: modalElasticIn 0.45s ... forwards;
}
```

**修复建议**：
```css
.modal-content {
  will-change: transform, opacity;  /* 添加动画优化 */
  transition: transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.35s ease;
}
/* 动画结束后移除 will-change 避免内存占用 */
.modal-overlay.active .modal-content {
  animation: modalElasticIn 0.45s ... forwards;
}
```

---

### 2.7 z-index 层级冲突风险（🟡 中）

**问题描述**：当前 z-index 层级体系：

| 元素 | z-index | 来源 |
|------|---------|------|
| `guide-tooltip` | 100000 | `all-styles-v55.css:4189` |
| `guide-highlight` | 99999 | `all-styles-v55.css:4149` |
| `guide-overlay` | 50 | `all-styles-v55.css:4140` |
| `modal-overlay` | 9998 | `all-styles-v55.css:6316` |
| `ai-fab` | 9998 | `ai-float.css:285` |
| `ai-float-panel` | 9997 | `ai-float.css:331` |
| `mascotBubble` | 50 | `index.html:1765` |

**风险**：`guide-tooltip` (100000) 和 `guide-highlight` (99999) 的层级远高于 `modal-overlay` (9998)。如果在新手引导过程中弹出模态框（如设置确认弹窗），引导提示会覆盖在模态框之上，导致用户无法与模态框交互。

**修复建议**：
1. 将 `guide-tooltip` 和 `guide-highlight` 的 z-index 限制在 `modal-overlay` 之下（如 9990）
2. 或者，在打开任何模态框时自动暂停/隐藏新手引导

---

### 2.8 缺少 320px 超小屏幕断点（🟢 低）

**问题描述**：CSS 中已有 `@media (max-width: 768px)`、`@media (max-width: 480px)`、`@media (max-width: 420px)`，但没有针对 320px 宽度（如 iPhone SE 1代、部分安卓低端机）的专门优化。

**修复建议**：
```css
@media (max-width: 360px) {
  .menu-grid { grid-template-columns: 1fr !important; }
  .mode-btn { padding: 10px; }
  .feature-icon { font-size: 28px; } /* 缩小 36px 的图标 */
  .pk-name-input { max-width: 120px; }
}
```

---

### 2.9 `max-width: 500px` 在极小屏幕上的留白（🟢 低）

**问题描述**：多个游戏页面容器使用 `max-width: 500px; width: 100%; margin: 0 auto;`，在 320px 屏幕上内容宽度为 320px，但居中对齐意味着两侧各约 0px 边距（因为小于 500px），实际上并不造成问题。但如果父容器有 padding，内容区域可能更窄。

**评估**：此问题影响较低，因为 `width: 100%` 已确保响应式适配，`max-width` 只是限制在大屏幕上的最大宽度。但在 320px 屏幕上，如果两侧有边距，内容可能显得过窄。

---

## 三、已确认无问题的项目

| 检查项 | 结论 | 依据 |
|--------|------|------|
| 负 margin / 负 padding | ✅ 无问题 | `index.html` 无负值；CSS 中负值仅用于标准 `.sr-only` 和 tooltip 箭头 |
| `position: fixed` 缺少 z-index | ✅ 无问题 | 所有 fixed 元素均有 z-index |
| 模态框居中定位 | ✅ 正确 | `modal-overlay` 使用 `flex` 居中；`themeModal` 使用 `flex` 居中 |
| `transform` 居中 | ✅ 无需使用 | 所有模态框使用 `flex` 居中，比 `transform: translate(-50%, -50%)` 更可靠 |
| 移动端断点 | ✅ 存在 | 有 768px、480px、420px 断点 |
| 触摸目标优化 | ✅ 部分存在 | `accessibility.css` 已为 `.touch-device` 设置 `min-height: 48px` |

---

## 四、修复优先级建议

1. **立即修复（本次迭代）**：
   - 移除 `user-scalable=no` 和 `maximum-scale=1.0`（`index.html:6`）
   - 将 `guide-tooltip` z-index 从 100000 降至 9990 以下（`all-styles-v55.css:4189`）
   - 为 `.modal-content` 添加 `will-change: transform, opacity`（`all-styles-v55.css:6333`）

2. **下次样式迭代**：
   - 将内联 `font-size: px` 迁移到 CSS 类，改用 `rem` 或 `clamp()`
   - 修复 `.settings-card-name/desc` 的 `line-height: 1.4` → `1.5`
   - 优化 `.case-card-info p` 的换行策略
   - 为 `memoryGrid` 添加 `@media (max-width: 360px)` 适配

3. **长期关注**：
   - 补充 `@media (max-width: 320px)` 断点
   - 检查 30+ 处 `overflow: hidden` 是否有内容截断

---

*报告生成完毕。如需进一步检查 `click-interaction-check`、`animation-check`、`responsive-check` 或 `visual-glitch-check`，请继续分配任务。*
