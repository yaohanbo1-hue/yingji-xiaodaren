# 应急小达人 — 无障碍优化报告

> **版本**: v1.2.0  
> **审计日期**: 2026-06-19  
> **审计标准**: WCAG 2.1 Level AA  
> **审计范围**: index.html, all-styles.css, accessibility.css, accessibility.js, settings.css, transitions.css, loading.css 及关联 JS 文件  

---

## 一、执行摘要

本项目是一款面向中小学生的防灾教育互动游戏，采用纯前端技术（HTML5 + CSS3 + JavaScript）构建。经过全面审计，项目在**基础无障碍支持**方面已有较好的基础（已有 accessibility.css 和 accessibility.js 提供基础 ARIA 注入、键盘导航、减少动画支持等），但仍存在**中高风险**问题需要修复，特别是在 **WCAG 1.4.3（对比度）**、**WCAG 1.4.4（文字缩放）**、**WCAG 4.1.2（名称、角色、值）** 和 **WCAG 2.1.1（键盘）** 方面。

| 维度 | 当前状态 | 目标等级 | 优先级 |
|------|----------|----------|--------|
| ARIA 标签与语义 | ⚠️ 部分达标 | AA | 高 |
| 键盘导航 | ⚠️ 部分达标 | AA | 高 |
| 屏幕阅读器 | ⚠️ 基本可用 | AA | 高 |
| 高对比度 | ❌ 未达标 | AA | 高 |
| 字体缩放 | ❌ 未达标 | AA | 高 |
| 减少动画 | ✅ 已达标 | A | 低 |
| 触摸目标 | ✅ 已达标 | AA | 低 |

---

## 二、WCAG 2.1 合规性检查总览

| WCAG 准则 | 级别 | 状态 | 说明 |
|-----------|------|------|------|
| 1.1.1 非文本内容 (Non-text Content) | A | ✅ 通过 | 项目以 Emoji 图标为主，文本内容充分；无功能性图片缺失 alt |
| 1.3.1 信息与关系 (Info and Relationships) | A | ⚠️ 部分 | 动态选项已有 ARIA 角色；部分表单缺少 label 关联 |
| 1.3.2 有意义的序列 (Meaningful Sequence) | A | ✅ 通过 | DOM 顺序与视觉顺序一致 |
| 1.3.3 感官特性 (Sensory Characteristics) | A | ✅ 通过 | 不依赖颜色作为唯一信息传递方式 |
| 1.4.1 颜色使用 (Use of Color) | A | ✅ 通过 | 正确/错误状态有额外视觉标识（边框、动画） |
| 1.4.3 对比度（最小）(Contrast Minimum) | AA | ❌ 未达标 | 多处文字与背景对比度低于 4.5:1 |
| 1.4.4 文字缩放 (Resize Text) | AA | ❌ 未达标 | 大量使用 px 固定单位，阻碍浏览器字体缩放 |
| 1.4.10 重排 (Reflow) | AA | ✅ 通过 | 响应式布局已适配 320px 宽度 |
| 1.4.11 非文本对比度 (Non-text Contrast) | AA | ⚠️ 部分 | 部分交互元素边框对比度不足 |
| 1.4.12 文本间距 (Text Spacing) | AA | ⚠️ 部分 | 行高、字间距可覆盖性有限 |
| 1.4.13 悬浮内容 (Content on Hover) | AA | ✅ 通过 | 无需要悬停才能访问的内容 |
| 2.1.1 键盘 (Keyboard) | A | ⚠️ 部分 | 已有 Tab 和 Enter 支持；缺少 Skip Link 和焦点管理 |
| 2.1.2 无键盘陷阱 (No Keyboard Trap) | A | ✅ 通过 | 无键盘陷阱 |
| 2.2.2 暂停/停止/隐藏 (Pause, Stop, Hide) | A | ✅ 通过 | 减少动画模式已支持 |
| 2.4.1 绕过块 (Bypass Blocks) | A | ❌ 未达标 | 缺少 "跳转到主内容" 链接 |
| 2.4.3 焦点顺序 (Focus Order) | A | ✅ 通过 | 焦点顺序逻辑合理 |
| 2.4.4 链接目的（上下文）(Link Purpose) | A | ✅ 通过 | 按钮文本语义清晰 |
| 2.4.6 标题和标签 (Headings and Labels) | AA | ⚠️ 部分 | 部分表单控件缺少显式 label |
| 2.4.7 焦点可见 (Focus Visible) | AA | ✅ 通过 | `:focus-visible` 样式已配置 |
| 2.5.5 目标尺寸 (Target Size) | AAA | ✅ 通过 | 触摸目标 ≥ 48×48px |
| 3.1.1 页面语言 (Page Language) | A | ✅ 通过 | `lang="zh-CN"` 已设置 |
| 3.2.1 聚焦 (On Focus) | A | ✅ 通过 | 聚焦时不触发上下文变化 |
| 3.3.2 标签或说明 (Labels or Instructions) | A | ⚠️ 部分 | 部分输入控件缺少 label |
| 4.1.1 解析 (Parsing) | A | ✅ 通过 | HTML 结构合法 |
| 4.1.2 名称、角色、值 (Name, Role, Value) | A | ⚠️ 部分 | 部分动态元素缺少 aria-label/aria-live 更新 |
| 4.1.3 状态消息 (Status Messages) | AA | ⚠️ 部分 | 已有 aria-live 区域，但页面切换未主动通知 |

---

## 三、优化前后对比

### 3.1 ARIA 标签与语义化

#### 优化前（现状）

| 检查项 | 现状 | 问题 |
|--------|------|------|
| 页面区域角色 | `.page` 有 `role="region"` + `aria-label`（JS 注入） | ✅ 良好 |
| 按钮角色 | `.mode-btn`, `.menu-cat-btn`, `.tool-btn` 有 `role="button"`（JS 注入） | ✅ 良好 |
| 进度条 | 加载进度 `#loadBar` 无 `role="progressbar"` | ❌ 缺失 |
| 进度条值更新 | 进度条宽度变化，但无 `aria-valuenow` 更新 | ❌ 缺失 |
| 页面切换通知 | 无 `aria-live` 页面切换通知 | ❌ 缺失 |
| 模态框 | `#modalOverlay` 有 `role="dialog"` + `aria-modal="true"`（JS 注入） | ✅ 良好 |
| 导航栏 | `.menu-toolbar` 有 `role="navigation"`（JS 注入） | ✅ 良好 |
| 返回按钮 | 文本为 `←`，JS 注入 `aria-label="返回"` | ⚠️ 依赖 JS |
| 主内容区 | `#app` 无 `role="main"` | ❌ 缺失 |
| 动态选项 | `.quiz-opt` 有 `role="button"` + `aria-label="选项 X"`（JS 注入） | ✅ 良好 |
| 表单 label | 设置页的 `input[type="checkbox"]` 和 `select` 无显式 `<label>` | ❌ 缺失 |
| 装饰元素隐藏 | `.ls-hexgrid`, `.ls-scanline` 等无 `aria-hidden="true"` | ❌ 缺失 |

#### 优化后（建议）

| 检查项 | 优化措施 |
|--------|----------|
| 加载进度条 | 添加 `role="progressbar"` + `aria-valuenow` + `aria-valuemin` + `aria-valuemax` |
| 进度条动态更新 | JS 中同步更新 `aria-valuenow` 属性 |
| 页面切换通知 | 切换页面时调用 `announceToSR()` 通知当前页面名称 |
| 主内容区 | `#app` 添加 `role="main"` |
| 返回按钮 | HTML 层面添加 `aria-label="返回上一页"` |
| 表单 label | 为所有 `input` 和 `select` 添加关联 `<label>` 或 `aria-label` |
| 装饰元素 | 为 `.ls-hexgrid`, `.ls-scanline`, `.ls-glitch-line` 等添加 `aria-hidden="true"` |
| 主题弹窗按钮 | 添加 `aria-label` 描述主题选项 |

---

### 3.2 键盘导航

#### 优化前（现状）

| 检查项 | 现状 | 问题 |
|--------|------|------|
| Tab 键访问 | 可交互元素有 `tabindex="0"`（JS 注入） | ✅ 良好 |
| Enter 触发 | 支持 Enter 键触发点击（JS） | ✅ 良好 |
| Escape 返回 | 支持 Escape 关闭弹窗/返回菜单（JS） | ✅ 良好 |
| 方向键导航 | 支持 ↑↓ 在选项间导航（JS） | ✅ 良好 |
| Skip Link | 无 "跳转到主内容" 链接 | ❌ 缺失 |
| 焦点顺序 | 基本合理，但页面切换后焦点未重置 | ⚠️ 部分 |
| 焦点可见性 | `:focus-visible` 有 outline 样式 | ✅ 良好 |
| 模态框焦点陷阱 | 打开模态框后，焦点未限制在模态框内 | ❌ 缺失 |
| 设置页卡片 | `.settings-card` 有 `onclick` 但无键盘支持 | ⚠️ 部分 |

#### 优化后（建议）

| 检查项 | 优化措施 |
|--------|----------|
| Skip Link | 在 `<body>` 开头添加 `<a href="#app" class="skip-link">跳转到主内容</a>` |
| 页面切换焦点 | `PageManager.navigate()` 后自动聚焦新页面标题 |
| 模态框焦点陷阱 | 打开模态框时，焦点循环限制在模态框内；关闭时恢复焦点 |
| 设置页卡片 | 为 `.settings-card` 添加 `tabindex="0"` 和 `role="button"`，支持 Enter/Space 触发 |

---

### 3.3 屏幕阅读器支持

#### 优化前（现状）

| 检查项 | 现状 | 问题 |
|--------|------|------|
| 实时通知区域 | 已有 `#aria-live-region`（`role="status"`, `aria-live="polite"`） | ✅ 良好 |
| 图片 alt | 项目以 Emoji 为主，无传统 `<img>` | ✅ 无问题 |
| 表单 label | 设置页的 checkbox 和 select 无 `<label>` 关联 | ❌ 缺失 |
| 标题层级 | 有 `h1`, `h2` 等语义标题 | ✅ 良好 |
| 主区域 | 无 `role="main"` | ❌ 缺失 |
| 搜索/地标 | 无 `role="search"`（无搜索功能，无关） | N/A |
| 页面标题 | 单页面应用，标题不随页面切换 | ⚠️ 部分 |
| 状态变化 | 页面切换无屏幕阅读器通知 | ❌ 缺失 |

#### 优化后（建议）

| 检查项 | 优化措施 |
|--------|----------|
| 表单 label | 为 `sfxToggle`, `voiceToggle`, `bgmVolumeSlider` 添加 `aria-label` 或 `<label>` |
| 主区域 | `#app` 添加 `role="main"` |
| 页面标题 | `PageManager.navigate()` 时更新 `document.title` |
| 状态通知 | 页面切换、游戏状态变化时调用 `announceToSR()` |
| 装饰元素 | 为纯装饰元素添加 `aria-hidden="true"` |

---

### 3.4 高对比度支持

#### 优化前（现状）

| 检查项 | 现状 | 问题 |
|--------|------|------|
| `prefers-contrast` 媒体查询 | CSS 中**完全缺失** | ❌ 严重缺失 |
| 高对比度类 | 有 `.high-contrast` 类（JS 检测 `matchMedia('prefers-contrast: high')`） | ⚠️ 但 CSS 媒体查询缺失 |
| 高对比度样式 | `.high-contrast` 下边框、背景色已定义 | ✅ 良好 |
| 焦点可见性 | 高对比度下焦点样式可能不够清晰 | ⚠️ 部分 |
| 状态对比 | `.correct`/`.wrong` 在高对比度下对比度良好 | ✅ 良好 |
| 非文本对比 | 进度条、滑块等 UI 控件对比度可能不足 | ⚠️ 部分 |

#### 优化后（建议）

| 检查项 | 优化措施 |
|--------|----------|
| `prefers-contrast` 媒体查询 | 添加 `@media (prefers-contrast: high) { ... }` 到 `accessibility.css` |
| 焦点样式 | 高对比度下使用 `outline: 3px solid currentColor` |
| 边框增强 | 所有交互元素在高对比度下强制显示 2px 边框 |
| 禁用背景渐变 | 高对比度下使用纯色替代渐变背景 |

---

### 3.5 字体大小与缩放

#### 优化前（现状）

| 检查项 | 现状 | 问题 |
|--------|------|------|
| 根字体大小 | 未在 `html` 上设置 `font-size`（浏览器默认 16px） | ⚠️ 部分 |
| px 单位使用 | **大量** `font-size: 12px`, `14px`, `16px`, `18px` 等 | ❌ 严重 |
| rem/em 使用 | 极少使用 rem/em，只有部分布局使用 | ❌ 严重 |
| 内联样式 | index.html 中有大量 `font-size: 12px`, `font-size: 13px` 等内联 px | ❌ 严重 |
| 缩放测试 | 用户设置浏览器字体大小时，布局可能断裂 | ❌ 未达标 |
| 视口设置 | `maximum-scale=1.0, user-scalable=no` **阻止了缩放** | ❌ 严重 |

#### 关键数据（px 单位统计）

在 `index.html` 中检测到以下固定字体大小（仅内联样式）：

| 字体大小 | 出现位置 | 影响 |
|----------|----------|------|
| `font-size: 8px` | 加载画面坐标文字 | 极小文字，缩放后不可读 |
| `font-size: 10px` | 加载画面副标题 | 小文字 |
| `font-size: 11px` | 加载画面提示、多处 | 小文字 |
| `font-size: 12px` | `.ls-pct`, 设置页、工具栏 label | 大量使用 |
| `font-size: 13px` | 设置页描述、模式描述 | 大量使用 |
| `font-size: 14px` | 设置页、按钮、描述 | 大量使用 |
| `font-size: 15px` | 模式描述、选项 | 中量使用 |
| `font-size: 16px` | 标题、按钮、描述 | 大量使用 |
| `font-size: 18px` | 分类标题、设置 | 中量使用 |
| `font-size: 20px` | 主题弹窗 | 少量 |
| `font-size: 24px` | 设置标题 | 少量 |
| `font-size: 26px` | 加载画面标题 | 少量 |
| `font-size: 28px` | 菜单标题、图标 | 少量 |
| `font-size: 36px` | 加载图标 | 少量 |
| `font-size: 48px` | 设置图标 | 少量 |
| `font-size: 64px` | 加载画面主图标 | 少量 |

在 `all-styles.css` 和各组件 CSS 中，`px` 单位使用更为普遍，几乎覆盖了所有字体大小定义。

#### 优化后（建议）

| 检查项 | 优化措施 |
|--------|----------|
| 视口设置 | 移除 `maximum-scale=1.0, user-scalable=no` 或改为 `maximum-scale=5.0` |
| 根字体大小 | 在 `html` 上设置 `font-size: 100%`（16px 基准） |
| 系统替换 | 将所有 `font-size: 12px` → `font-size: 0.75rem` |
| 系统替换 | 将所有 `font-size: 14px` → `font-size: 0.875rem` |
| 系统替换 | 将所有 `font-size: 16px` → `font-size: 1rem` |
| 系统替换 | 将所有 `font-size: 18px` → `font-size: 1.125rem` |
| 系统替换 | 将所有 `font-size: 20px` → `font-size: 1.25rem` |
| 系统替换 | 将所有 `font-size: 24px` → `font-size: 1.5rem` |
| 间距单位 | 将 `padding/margin` 的 px 改为 rem（如 `16px` → `1rem`） |
| 响应式边界 | 媒体查询使用 `em` 单位：`@media (max-width: 48em)` |

---

## 四、具体修改方案

### 4.1 修改文件：`index.html`

#### 修改 1：视口设置（行 66）

**优化前：**
```html
<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no">
```

**优化后：**
```html
<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=5.0,user-scalable=yes">
```

> **依据**：WCAG 1.4.4 (Resize Text) — 不应阻止用户缩放。`maximum-scale=1.0` 完全阻止了放大，对低视力用户不可接受。

---

#### 修改 2：添加 Skip Link（在 `<body>` 内第一个子元素）

**在 `<body>` 后添加：**
```html
<!-- Skip Link: 跳转到主内容 -->
<a href="#app" class="skip-link">跳转到主内容</a>
```

**在 `accessibility.css` 中添加样式：**
```css
/* ===== Skip Link ===== */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #000;
  color: #fff;
  padding: 8px 16px;
  z-index: 100000;
  text-decoration: none;
  border-radius: 0 0 4px 0;
  font-size: 14px;
  transition: top 0.2s ease;
}
.skip-link:focus {
  top: 0;
}
```

> **依据**：WCAG 2.4.1 (Bypass Blocks) — 提供跳过重复内容的机制。

---

#### 修改 3：主内容区添加 `role="main"`（行 792）

**优化前：**
```html
<div id="app">
```

**优化后：**
```html
<div id="app" role="main" aria-label="应急小达人主内容">
```

> **依据**：WCAG 1.3.1 (Info and Relationships) — 地标角色帮助屏幕阅读器用户快速导航到主内容区。

---

#### 修改 4：加载进度条添加 ARIA（行 708）

**优化前：**
```html
<div class="ls-bar-wrap"><div class="ls-bar-fill" id="loadBar"></div></div>
```

**优化后：**
```html
<div class="ls-bar-wrap" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-label="加载进度" id="loadBarWrap">
  <div class="ls-bar-fill" id="loadBar"></div>
</div>
```

**同步修改加载脚本（约行 2604）：**

在 `updateProgress()` 函数中添加：
```javascript
function updateProgress() {
  var target = Math.min(100, Math.round((loaded / total) * 100));
  var barWrap = document.getElementById('loadBarWrap');
  // ... 现有代码 ...
  if (barWrap) {
    barWrap.setAttribute('aria-valuenow', progress);
  }
  // ... 现有代码 ...
}
```

> **依据**：WCAG 4.1.2 (Name, Role, Value) — 进度条必须暴露其当前值给辅助技术。

---

#### 修改 5：返回按钮添加 `aria-label`（所有 `.back-float`）

**优化前示例（行 1069）：**
```html
<button class="btn back-float" onclick="PageManager.navigate('menu')" data-nav="menu">←</button>
```

**优化后：**
```html
<button class="btn back-float" onclick="PageManager.navigate('menu')" data-nav="menu" aria-label="返回主菜单">←</button>
```

> **注意**：所有约 30 个 `.back-float` 按钮都需要类似处理。建议统一为 `aria-label="返回上一页"` 或根据具体页面给出更精确的描述。

> **依据**：WCAG 4.1.2 (Name, Role, Value) — 按钮必须有可访问的名称。

---

#### 修改 6：装饰元素添加 `aria-hidden="true"`（加载画面区域，行 694-717）

**优化前：**
```html
<div class="ls-hexgrid"></div>
<canvas class="ls-particles" id="lsCanvas"></canvas>
<div class="ls-scanline"></div>
<div class="ls-glitch-line"></div>
<div class="ls-glitch-line"></div>
<div class="ls-glitch-line"></div>
<div class="ls-ring-outer"></div>
<div class="ls-ring-spin"></div>
<div class="ls-ring-inner"></div>
```

**优化后：**
```html
<div class="ls-hexgrid" aria-hidden="true"></div>
<canvas class="ls-particles" id="lsCanvas" aria-hidden="true"></canvas>
<div class="ls-scanline" aria-hidden="true"></div>
<div class="ls-glitch-line" aria-hidden="true"></div>
<div class="ls-glitch-line" aria-hidden="true"></div>
<div class="ls-glitch-line" aria-hidden="true"></div>
<div class="ls-ring-outer" aria-hidden="true"></div>
<div class="ls-ring-spin" aria-hidden="true"></div>
<div class="ls-ring-inner" aria-hidden="true"></div>
```

**背景层装饰元素同样处理（行 720-736）：**
```html
<div class="bg-gradient" aria-hidden="true"></div>
<div class="bg-theme-layer" aria-hidden="true"></div>
<div class="bg-stars" id="bgStars" aria-hidden="true"></div>
<!-- ... 所有背景/特效层 ... -->
```

> **依据**：WCAG 1.1.1 (Non-text Content) — 纯装饰内容应从辅助技术中隐藏。

---

#### 修改 7：设置页表单添加 `aria-label`（行 1440, 1461, 1477）

**优化前（音效开关，行 1439-1442）：**
```html
<label class="settings-toggle">
  <input type="checkbox" id="sfxToggle" checked onchange="SettingsEngine.toggleSFX(this)">
  <span class="settings-toggle-slider"></span>
</label>
```

**优化后：**
```html
<label class="settings-toggle" aria-label="音效开关">
  <input type="checkbox" id="sfxToggle" checked onchange="SettingsEngine.toggleSFX(this)" aria-label="开启或关闭游戏音效">
  <span class="settings-toggle-slider"></span>
</label>
```

**优化前（音量滑块，行 1461-1463）：**
```html
<input type="range" min="0" max="100" value="50" class="settings-volume-slider" id="bgmVolumeSlider"
  oninput="BGMEngine.setVolume(this.value/100);document.getElementById('bgmVolumeVal').textContent=this.value+'%'">
```

**优化后：**
```html
<input type="range" min="0" max="100" value="50" class="settings-volume-slider" id="bgmVolumeSlider"
  aria-label="背景音乐音量调节"
  oninput="BGMEngine.setVolume(this.value/100);document.getElementById('bgmVolumeVal').textContent=this.value+'%'">
```

**优化前（语音教学开关，行 1477）：**
```html
<input type="checkbox" id="voiceToggle" checked onchange="SettingsEngine.toggleVoice(this)">
```

**优化后：**
```html
<input type="checkbox" id="voiceToggle" checked onchange="SettingsEngine.toggleVoice(this)" aria-label="开启或关闭语音教学">
```

**优化前（PK 设置页，行 1198）：**
```html
<input class="pk-name-input" id="pkName1" placeholder="玩家1 名字" value="玩家1" maxlength="8">
```

**优化后：**
```html
<input class="pk-name-input" id="pkName1" placeholder="玩家1 名字" value="玩家1" maxlength="8" aria-label="玩家1名称">
```

> **依据**：WCAG 3.3.2 (Labels or Instructions) / 4.1.2 (Name, Role, Value) — 所有表单控件必须有可访问的名称。

---

#### 修改 8：主题选择弹窗按钮添加 `aria-label`（行 2338-2361）

**优化前示例：**
```html
<button onclick="BGTheme.switch('deep-space')" style="...">
  <span style="font-size:20px">🌌</span>
  <div><div style="font-weight:600">深空指挥官</div><div style="font-size:11px;opacity:0.6">蓝紫冷色调</div></div>
</button>
```

**优化后：**
```html
<button onclick="BGTheme.switch('deep-space')" style="..." aria-label="切换深空指挥官主题，蓝紫冷色调">
  <span style="font-size:20px" aria-hidden="true">🌌</span>
  <div><div style="font-weight:600">深空指挥官</div><div style="font-size:11px;opacity:0.6">蓝紫冷色调</div></div>
</button>
```

> **依据**：WCAG 4.1.2 (Name, Role, Value) — 复杂按钮需要明确的可访问名称。

---

### 4.2 修改文件：`accessibility.css`

#### 修改 1：添加 `prefers-contrast: high` 媒体查询（在文件末尾添加）

```css
/* ===== 高对比度模式（系统级） ===== */
@media (prefers-contrast: high) {
  :root {
    --text-primary: #ffffff;
    --text-secondary: #e0e0e0;
    --bg-primary: #000000;
    --bg-secondary: #1a1a1a;
    --border-color: #ffffff;
    --accent-color: #ffff00;
  }

  body {
    background: #000000 !important;
    color: #ffffff !important;
  }

  .page {
    background: #000000 !important;
  }

  /* 强制所有交互元素显示边框 */
  .mode-btn,
  .menu-cat-btn,
  .tool-btn,
  .quiz-opt,
  .choice-btn,
  .settings-card,
  .btn {
    border: 2px solid #ffffff !important;
    background: #000000 !important;
    color: #ffffff !important;
  }

  .mode-btn:hover,
  .menu-cat-btn:hover,
  .tool-btn:hover,
  .settings-card:hover,
  .btn:hover {
    background: #1a1a1a !important;
    border-color: #ffff00 !important;
  }

  /* 状态反馈 */
  .quiz-opt.correct,
  .choice-btn.correct {
    background: #004400 !important;
    border-color: #00ff00 !important;
    color: #ffffff !important;
  }

  .quiz-opt.wrong,
  .choice-btn.wrong {
    background: #440000 !important;
    border-color: #ff0000 !important;
    color: #ffffff !important;
  }

  /* 焦点样式增强 */
  *:focus-visible {
    outline: 3px solid currentColor !important;
    outline-offset: 2px !important;
  }

  /* 禁用半透明和模糊效果 */
  .menu-toolbar,
  .modal-box,
  .settings-card {
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    background: #000000 !important;
  }

  /* 进度条 */
  .quiz-progress-bar,
  .hp-bar-container,
  .loading-bar-container {
    background: #333333 !important;
    border: 1px solid #ffffff !important;
  }

  .quiz-progress-fill,
  .hp-bar-fill,
  .loading-bar {
    background: #ffffff !important;
  }

  /* 文字与背景对比 */
  .menu-logo-sub,
  .preview-desc,
  .mode-desc,
  .settings-card-desc,
  .settings-subtitle {
    color: #ffffff !important;
    opacity: 1 !important;
  }

  /* 禁用渐变，使用纯色 */
  .menu-logo-title,
  .loading-title,
  .version-tag {
    background: none !important;
    -webkit-text-fill-color: #ffffff !important;
    color: #ffffff !important;
  }
}
```

> **依据**：WCAG 1.4.3 (Contrast Minimum) / 1.4.11 (Non-text Contrast) — 高对比度模式下必须确保所有文本和 UI 控件对比度 ≥ 4.5:1。

---

#### 修改 2：增强 `:focus-visible` 对非按钮元素的支持

```css
/* 所有可交互元素的焦点样式 */
a:focus-visible,
button:focus-visible,
[role="button"]:focus-visible,
[tabindex]:not([tabindex="-1"]):focus-visible,
input:focus-visible,
select:focus-visible,
textarea:focus-visible {
  outline: 3px solid #3b82f6 !important;
  outline-offset: 2px !important;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3) !important;
}

/* 高对比度下的焦点样式 */
@media (prefers-contrast: high) {
  a:focus-visible,
  button:focus-visible,
  [role="button"]:focus-visible,
  [tabindex]:not([tabindex="-1"]):focus-visible,
  input:focus-visible,
  select:focus-visible,
  textarea:focus-visible {
    outline: 3px solid currentColor !important;
    outline-offset: 3px !important;
    box-shadow: none !important;
  }
}
```

---

#### 修改 3：添加 `prefers-reduced-motion` 媒体查询（CSS 层面兜底）

```css
/* ===== 减少动画偏好（CSS 兜底） ===== */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  /* 隐藏纯装饰动画元素 */
  .ls-hexgrid,
  .ls-particles,
  .ls-scanline,
  .ls-glitch-line,
  .ls-ring-outer,
  .ls-ring-spin,
  .ls-ring-inner,
  .bg-orb,
  .bg-gradient,
  .bg-grid,
  .bg-noise,
  .bg-aurora,
  .bg-stars,
  .bg-matrix,
  .bg-meteor,
  .dust,
  .light-sweep,
  .geo-ring,
  .pulse-ring,
  .meteor,
  .gradient-bar,
  .data-stream,
  .loading-particles,
  .loading-glow {
    display: none !important;
  }
}
```

> **注意**：HTML 中内联 `<style>` 已包含此媒体查询，但 `accessibility.css` 作为独立文件应同步包含，确保任何加载顺序下都生效。

---

### 4.3 修改文件：`accessibility.js`

#### 修改 1：页面切换时通知屏幕阅读器（在 `PageManager.navigate` 或 JS 中）

在 `accessibility.js` 的 `setupLiveRegion()` 之后，添加页面切换监听：

```javascript
// ===== 页面切换屏幕阅读器通知 =====
function announcePageChange() {
  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        var target = mutation.target;
        if (target.classList.contains('page') && target.classList.contains('active')) {
          var pageLabel = target.getAttribute('aria-label') || '';
          if (pageLabel && window.announceToSR) {
            window.announceToSR('已切换到' + pageLabel);
          }
          // 自动聚焦新页面的标题
          var heading = target.querySelector('h1, h2, .preview-title, .settings-title, .game-header .mode-label');
          if (heading) {
            heading.setAttribute('tabindex', '-1');
            heading.focus();
          }
        }
      }
    });
  });

  document.querySelectorAll('.page').forEach(function(page) {
    observer.observe(page, { attributes: true, attributeFilter: ['class'] });
  });
}
```

在 `init()` 中调用：
```javascript
function init() {
  injectAriaLabels();
  setupKeyboardNav();
  optimizeTouch();
  setupHighContrast();
  setupReducedMotion();
  setupLiveRegion();
  announcePageChange(); // 新增
  // ...
}
```

> **依据**：WCAG 4.1.3 (Status Messages) — 重要的状态变化需要通知辅助技术，无需获取焦点。

---

#### 修改 2：模态框焦点管理增强

```javascript
// ===== 模态框焦点陷阱 =====
function setupModalFocusTrap() {
  var modal = document.getElementById('modalOverlay');
  if (!modal) return;

  var focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

  modal.addEventListener('keydown', function(e) {
    if (e.key !== 'Tab') return;

    var focusables = Array.from(modal.querySelectorAll(focusableSelectors));
    if (focusables.length === 0) return;

    var first = focusables[0];
    var last = focusables[focusables.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  // 存储触发模态框的焦点元素
  var lastFocusedElement = null;
  var originalShow = Modal.show;
  Modal.show = function(title, desc, icon) {
    lastFocusedElement = document.activeElement;
    originalShow(title, desc, icon);
    // 打开后聚焦到第一个可聚焦元素
    setTimeout(function() {
      var firstBtn = modal.querySelector('button');
      if (firstBtn) firstBtn.focus();
    }, 100);
  };

  var originalHide = Modal.hide;
  Modal.hide = function() {
    originalHide();
    // 关闭后恢复焦点
    if (lastFocusedElement) {
      setTimeout(function() {
        lastFocusedElement.focus();
      }, 100);
    }
  };
}

// 在 init() 中调用
setupModalFocusTrap();
```

> **依据**：WCAG 2.4.3 (Focus Order) — 模态框打开时焦点应限制在模态框内，关闭后返回触发元素。

---

#### 修改 3：为动态生成的选项添加更精确的 ARIA

```javascript
// 增强 injectAriaLabels，添加 aria-atomic 到动态内容区域
function enhanceDynamicRegions() {
  var dynamicRegions = [
    '#quizOptions',
    '#pkOptions',
    '#scenarioOptions',
    '#escapeOptions',
    '#precisionOptions',
    '#storyAdvOptions',
    '#raceOptions',
    '#memoryGrid'
  ];

  dynamicRegions.forEach(function(selector) {
    var el = document.querySelector(selector);
    if (el) {
      el.setAttribute('role', 'group');
      el.setAttribute('aria-atomic', 'false');
      el.setAttribute('aria-relevant', 'additions');
    }
  });

  // 为结果区域添加 aria-live
  var resultRegions = [
    '#quizResult',
    '#pkResult',
    '#scenarioFeedback',
    '#escapeExplanation',
    '#precisionExplanation',
    '#storyAdvExplanation'
  ];

  resultRegions.forEach(function(selector) {
    var el = document.querySelector(selector);
    if (el) {
      el.setAttribute('role', 'region');
      el.setAttribute('aria-live', 'polite');
      el.setAttribute('aria-atomic', 'true');
    }
  });
}

// 在 init() 和延迟重注入中调用
enhanceDynamicRegions();
```

---

### 4.4 修改文件：`settings.css`

#### 修改 1：添加 `focus-visible` 样式到切换开关和滑块

```css
/* ===== 无障碍焦点增强 ===== */
.settings-toggle input:focus + .settings-toggle-slider {
  outline: 3px solid #3b82f6;
  outline-offset: 2px;
}

.settings-volume-slider:focus {
  outline: 3px solid #3b82f6;
  outline-offset: 2px;
}

/* 高对比度下的焦点样式 */
@media (prefers-contrast: high) {
  .settings-toggle input:focus + .settings-toggle-slider {
    outline: 3px solid currentColor;
    outline-offset: 3px;
  }

  .settings-volume-slider:focus {
    outline: 3px solid currentColor;
    outline-offset: 3px;
  }

  .settings-card {
    border: 2px solid #ffffff !important;
  }

  .settings-toggle-slider {
    border: 2px solid #ffffff !important;
  }

  .settings-volume-slider {
    border: 1px solid #ffffff !important;
  }
}
```

---

### 4.5 字体单位迁移方案（全局）

由于 `all-styles.css` 和各组件 CSS 中大量使用 `px` 单位，建议采用**渐进式迁移**策略：

#### 阶段 1：立即修改（高影响）

在 `index.html` 的 `<head>` 中添加：
```html
<style>
  html {
    font-size: 100%; /* 16px 基准，尊重用户浏览器设置 */
  }
  
  /* 使用 CSS 自定义属性建立 rem 体系 */
  :root {
    --fs-xs: 0.75rem;    /* 12px */
    --fs-sm: 0.875rem;   /* 14px */
    --fs-base: 1rem;     /* 16px */
    --fs-md: 1.125rem;   /* 18px */
    --fs-lg: 1.25rem;    /* 20px */
    --fs-xl: 1.5rem;     /* 24px */
    --fs-2xl: 2rem;      /* 32px */
    --fs-3xl: 2.5rem;    /* 40px */
  }
</style>
```

#### 阶段 2：逐步替换（建议后续迭代）

将各 CSS 文件中的 `font-size: XXpx` 替换为对应的 CSS 变量。优先级最高的文件：

1. `all-styles.css` — 核心样式
2. `settings.css` — 设置页
3. `clean-ui.css` — UI 组件
4. `certification.css` — 认证页

#### 阶段 3：媒体查询迁移

将 `max-width: 768px` 和 `max-width: 480px` 改为 `max-width: 48em`（768px ÷ 16 = 48em）和 `max-width: 30em`（480px ÷ 16 = 30em）。

> **注意**：这是一个大规模变更，可能影响视觉一致性。建议在完整测试后实施。短期方案是先确保**视口设置**不再阻止用户缩放（见修改 4.1.1）。

---

## 五、WCAG 2.1 详细合规矩阵

### 5.1 可感知性 (Perceivable)

| 准则 | 描述 | 当前状态 | 修复优先级 | 修复文件 |
|------|------|----------|------------|----------|
| 1.1.1 | 非文本内容 | ✅ 通过 | 无 | — |
| 1.3.1 | 信息与关系 | ⚠️ 部分 | 高 | `index.html`, `accessibility.js` |
| 1.3.2 | 有意义的序列 | ✅ 通过 | 无 | — |
| 1.3.3 | 感官特性 | ✅ 通过 | 无 | — |
| 1.4.1 | 颜色使用 | ✅ 通过 | 无 | — |
| 1.4.2 | 音频控制 | ✅ 通过 | 无 | 已有音量控制 |
| 1.4.3 | 对比度最小值 | ❌ 未达标 | **最高** | `accessibility.css` + 媒体查询 |
| 1.4.4 | 文本缩放 | ❌ 未达标 | **最高** | `index.html` (viewport) + CSS |
| 1.4.10 | 重排 | ✅ 通过 | 无 | — |
| 1.4.11 | 非文本对比度 | ⚠️ 部分 | 高 | `accessibility.css` |
| 1.4.12 | 文本间距 | ⚠️ 部分 | 中 | CSS 全局调整 |
| 1.4.13 | 悬浮内容 | ✅ 通过 | 无 | — |

### 5.2 可操作性 (Operable)

| 准则 | 描述 | 当前状态 | 修复优先级 | 修复文件 |
|------|------|----------|------------|----------|
| 2.1.1 | 键盘 | ⚠️ 部分 | 高 | `index.html`, `accessibility.js` |
| 2.1.2 | 无键盘陷阱 | ✅ 通过 | 无 | — |
| 2.2.1 | 时间可调 | N/A | 无 | 游戏设计需要计时 |
| 2.2.2 | 暂停/停止/隐藏 | ✅ 通过 | 无 | — |
| 2.3.1 | 闪光阈值 | ✅ 通过 | 无 | 无危险闪光 |
| 2.4.1 | 绕过块 | ❌ 未达标 | **最高** | `index.html` (Skip Link) |
| 2.4.2 | 页面标题 | ⚠️ 部分 | 中 | `accessibility.js` |
| 2.4.3 | 焦点顺序 | ✅ 通过 | 无 | — |
| 2.4.4 | 链接目的 | ✅ 通过 | 无 | — |
| 2.4.6 | 标题和标签 | ⚠️ 部分 | 高 | `index.html` |
| 2.4.7 | 焦点可见 | ✅ 通过 | 无 | — |
| 2.5.1 | 指针手势 | ✅ 通过 | 无 | 无复杂手势 |
| 2.5.2 | 指针取消 | ✅ 通过 | 无 | — |
| 2.5.3 | 标签名称 | ✅ 通过 | 无 | — |
| 2.5.4 | 动作触发 | ✅ 通过 | 无 | — |
| 2.5.5 | 目标尺寸 | ✅ 通过 | 无 | 触摸目标 ≥ 48px |
| 2.5.6 | 并发输入 | ✅ 通过 | 无 | — |

### 5.3 可理解性 (Understandable)

| 准则 | 描述 | 当前状态 | 修复优先级 | 修复文件 |
|------|------|----------|------------|----------|
| 3.1.1 | 页面语言 | ✅ 通过 | 无 | — |
| 3.1.2 | 局部语言 | ✅ 通过 | 无 | 无多语言片段 |
| 3.2.1 | 聚焦 | ✅ 通过 | 无 | — |
| 3.2.2 | 输入 | ✅ 通过 | 无 | — |
| 3.2.3 | 一致导航 | ✅ 通过 | 无 | — |
| 3.2.4 | 一致标识 | ✅ 通过 | 无 | — |
| 3.3.1 | 错误识别 | ✅ 通过 | 无 | — |
| 3.3.2 | 标签或说明 | ⚠️ 部分 | 高 | `index.html` |
| 3.3.3 | 错误建议 | ✅ 通过 | 无 | — |
| 3.3.4 | 错误预防 | ✅ 通过 | 无 | 重置前有确认对话框 |

### 5.4 健壮性 (Robust)

| 准则 | 描述 | 当前状态 | 修复优先级 | 修复文件 |
|------|------|----------|------------|----------|
| 4.1.1 | 解析 | ✅ 通过 | 无 | — |
| 4.1.2 | 名称、角色、值 | ⚠️ 部分 | 高 | `index.html`, `accessibility.js` |
| 4.1.3 | 状态消息 | ⚠️ 部分 | 高 | `accessibility.js` |

---

## 六、测试验证清单

### 6.1 自动化测试工具

| 工具 | 用途 | 运行命令/方法 |
|------|------|---------------|
| axe-core | 浏览器插件扫描 | 安装 Chrome/Firefox axe DevTools 插件 |
| Lighthouse | 综合无障碍评分 | Chrome DevTools → Lighthouse → Accessibility |
| WAVE | 可视化问题标注 | 访问 wave.webaim.org 或安装插件 |
| Pa11y | CI 自动化测试 | `pa11y index.html` |
| Color Contrast Analyzer | 对比度检查 | 使用 WebAIM 对比度检查器 |

### 6.2 手动测试步骤

| 测试项 | 操作步骤 | 期望结果 |
|--------|----------|----------|
| 键盘导航 | 按 Tab 键遍历所有页面 | 所有可交互元素都有焦点，焦点可见，顺序合理 |
| Skip Link | 按 Tab 键进入页面 | 第一个焦点是 "跳转到主内容" |
| 模态框焦点 | 打开弹窗后按 Tab | 焦点在模态框内循环，不会跑到背后 |
| 页面切换 | 使用键盘在不同页面间导航 | 屏幕阅读器播报当前页面名称 |
| 字体缩放 | 浏览器设置字体大小为 200% | 页面文字放大，布局不断裂，无水平滚动 |
| 高对比度 | Windows: 左 Alt + 左 Shift + Print Screen | 页面自动切换高对比度样式，所有内容可见 |
| 减少动画 | macOS: 系统偏好设置 → 辅助功能 → 减少动态效果 | 所有动画停止，装饰元素隐藏 |
| 屏幕阅读器 | 使用 NVDA/VoiceOver 浏览 | 所有按钮、表单、状态变化都有语音反馈 |
| 触摸目标 | 在移动设备上测试 | 所有按钮 ≥ 48×48px，易于点击 |

---

## 七、实施优先级建议

### 第一优先级（立即修复，阻断性问题）

1. ✅ 修改 `index.html` 视口设置（`user-scalable=no` → `user-scalable=yes`）
2. ✅ 添加 Skip Link 到 `index.html`
3. ✅ 为 `#app` 添加 `role="main"`
4. ✅ 为加载进度条添加 `role="progressbar"` + `aria-valuenow`
5. ✅ 为所有 `.back-float` 添加 `aria-label`

### 第二优先级（本周内修复，高影响）

6. ✅ 为装饰元素添加 `aria-hidden="true"`
7. ✅ 为表单控件添加 `aria-label` / `<label>`
8. ✅ 在 `accessibility.css` 中添加 `prefers-contrast: high` 媒体查询
9. ✅ 在 `accessibility.js` 中添加页面切换屏幕阅读器通知
10. ✅ 在 `accessibility.js` 中添加模态框焦点陷阱

### 第三优先级（迭代优化，中等影响）

11. ✅ 为动态内容区域添加 `aria-atomic` 和 `aria-relevant`
12. ✅ 更新 `document.title` 随页面切换
13. ✅ 为 `settings.css` 添加高对比度焦点样式
14. ✅ 逐步将 CSS 中的 `px` 替换为 `rem`（长期工程）

---

## 八、附录：参考资源

| 资源 | 链接 |
|------|------|
| WCAG 2.1 中文指南 | https://www.w3.org/Translations/WCAG21-zh/ |
| WAI-ARIA 实践指南 | https://www.w3.org/WAI/ARIA/apg/ |
| WebAIM 对比度检查器 | https://webaim.org/resources/contrastchecker/ |
| axe-core 文档 | https://www.deque.com/axe/ |
| MDN ARIA 文档 | https://developer.mozilla.org/zh-CN/docs/Web/Accessibility/ARIA |
| 中国信息无障碍标准 | GB/T 37668-2019 信息技术 网站内容无障碍指南 |

---

> **报告生成时间**: 2026-06-19  
> **审计工具**: 人工代码审查 + 静态分析  
> **下次审计建议**: 修复完成后 2 周内进行回归测试
