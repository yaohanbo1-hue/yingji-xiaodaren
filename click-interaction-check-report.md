# 「应急小达人」点击交互问题检查报告

> 检查范围：`index.html` 内联事件、`all-styles-v55.css` 触摸目标、`optimizer-mobile.js` 触摸优化、`accessibility.js` 无障碍交互
> 检查日期：2026-06-15

---

## 一、问题汇总（按严重程度排序）

| 编号 | 问题 | 严重程度 | 文件位置 | 修复建议 |
|------|------|----------|----------|----------|
| 1 | `feature-item` 有 `onclick` 但无 `role="button"`、`tabindex="0"` 和 `aria-label` | 🔴 高 | `index.html:483` 等4处 | 添加 `role="button"` `tabindex="0"` 和 `aria-label` |
| 2 | `menu-section-title` 有 `onclick` 但无 `role="button"` `tabindex="0"` | 🔴 高 | `index.html:241` 等2处 | 同上 |
| 3 | `study-card` 有 `onclick` 但无 `role="button"` `tabindex="0"` | 🔴 高 | `index.html:1025` | 同上，添加 `aria-label="点击翻转卡片"` |
| 4 | `settings-card` 有 `onclick` 但无 `role="button"` `tabindex="0"` | 🔴 高 | `index.html:824` 等6处 | 同上，按需添加 `aria-label` |
| 5 | 盲盒图标 `onclick` 内联样式操作，无角色属性 | 🟡 中 | `index.html:1005` | 添加 `role="button"` `tabindex="0"` `aria-label="抽取盲盒"` |
| 6 | `themeModal` 背景点击关闭使用全局 `event` 变量（不推荐） | 🟡 中 | `index.html:1715` | 改用 `event` 参数显式传递 |
| 7 | 动态生成的答题选项（`SurvivalEngine`、`TimedChallengeEngine`）缺少防抖/防重复触发 | 🟡 中 | `game-engines.js` 多处 | 答完后立即设置 `pointer-events: none` 或移除 `onclick` |
| 8 | `optimizer-mobile.js` 在 `document` 上重复添加 `touchstart` 事件（无去重检查） | 🟡 中 | `optimizer-mobile.js:278` 等 | 添加 `._swipeInitialized` 标志位避免重复绑定 |
| 9 | 触摸反馈的 `touch-active` 类在 `touchend` 时全文档移除，性能略差 | 🟢 低 | `accessibility.js:183` | 改为仅移除 `e.target.closest` 匹配的元素 |
| 10 | 部分 `min-width` 在 `max-width: 480px` 下缩小到 40px，低于 WCAG 44px 标准 | 🟢 低 | `all-styles-v55.css:251` | 确保所有按钮最小触摸目标 >= 44px |

---

## 二、详细检查过程

### 2.1 onclick 事件检查

#### 检查结果：共发现 130+ 个 `onclick` 内联事件

**✅ 良好实践（已正确实现）：**
- `mode-btn` 类元素：全部具备 `role="button"` `tabindex="0"` `aria-label` ✅
- `back-float` 类按钮：使用 `<button>` 标签，天然可访问 ✅
- `codex-filter-btn` 类按钮：使用 `<button>` 标签 ✅
- `tool-btn` 类按钮：使用 `<button>` 标签 ✅
- `btn-primary` / `btn-secondary` 类：使用 `<button>` 标签 ✅
- `PageManager.navigate` 有 300ms 导航锁，防止重复点击 ✅
- `Modal` 有 `_locked` 属性，防止重复提交 ✅
- `AITutorFloat` / `ai-tutor-v55.js` 有 `_askingLock` 防止重复提交 ✅

**❌ 问题发现：**

```html
<!-- index.html:483 - 无 role/tabindex/aria-label -->
<div class="feature-item cursor-pointer" onclick="ScenarioEngine.start()">
  ...
</div>

<!-- index.html:241 - 无 role/tabindex -->
<h2 class="menu-section-title learn-title" onclick="MenuManager.toggleCategory('learn')">
  📚 学习中心<span class="collapse-arrow">▼</span>
</h2>

<!-- index.html:1025 - 无 role/tabindex -->
<div class="study-card" id="studyCard" onclick="StudyEngine.flip()">
  ...
</div>

<!-- index.html:824 - 无 role/tabindex -->
<div class="settings-card" onclick="document.getElementById('themeModal').style.display='flex'">
  ...
</div>

<!-- index.html:1005 - 无 role/tabindex -->
<div style="font-size:5rem;cursor:pointer;..." onclick="this.style.transform='scale(1.5)';setTimeout(...)">
  🎁
</div>
```

#### 修复方案：

```html
<!-- 修复前 -->
<div class="feature-item cursor-pointer" onclick="ScenarioEngine.start()">

<!-- 修复后 -->
<div class="feature-item cursor-pointer" 
     onclick="ScenarioEngine.start()" 
     role="button" 
     tabindex="0"
     aria-label="开始情景模拟：洪水来袭">
```

```html
<!-- 修复前 -->
<div class="study-card" id="studyCard" onclick="StudyEngine.flip()">

<!-- 修复后 -->
<div class="study-card" id="studyCard" 
     onclick="StudyEngine.flip()" 
     role="button" 
     tabindex="0"
     aria-label="点击翻转卡片查看答案">
```

### 2.2 触摸设备检查

#### ✅ 已正确实现的触摸优化：

| 优化项 | 文件位置 | 说明 |
|--------|----------|------|
| `touch-action: manipulation` | `optimizer-mobile.css:12` | 消除 300ms 点击延迟 |
| `passive: true` touchstart | `accessibility.js:174` | 被动事件监听，不阻塞滚动 |
| 防止双击缩放 | `accessibility.js:191` | 检测 300ms 内的两次 touchend 并 `preventDefault` |
| 触摸设备 CSS 类 | `accessibility.js:201` | `document.body.classList.add('touch-device')` |
| 禁用 hover 粘滞 | `all-styles-v55.css:7979` | `@media (hover: none)` 清除 hover 变换效果 |
| 最小触摸目标 | `all-styles-v55.css:133` | `.touch-device` 下 `min-height: 48px` `min-width: 48px` |
| 快速触摸反馈 | `optimizer-mobile.js:407` | `touchstart` 时添加 `touch-active` 类 |
| 滑动手势返回 | `optimizer-mobile.js:271` | 左边缘右滑返回上一页 |

#### ⚠️ 需改进的触摸优化：

**问题 A：`optimizer-mobile.js` 事件监听器可能重复绑定**

```javascript
// optimizer-mobile.js:278 - 无重复绑定检查
document.addEventListener('touchstart', function(e) { ... }, { passive: true });
```

**修复建议：**
```javascript
if (document._swipeInitialized) return;
document._swipeInitialized = true;
```

**问题 B：触摸反馈全文档扫描性能**

```javascript
// accessibility.js:183 - 每次 touchend 都全文档扫描
document.addEventListener('touchend', function(e) {
  document.querySelectorAll('.touch-active').forEach(function(el) {
    el.classList.remove('touch-active');
  });
}, { passive: true });
```

**修复建议：**
```javascript
document.addEventListener('touchend', function(e) {
  const target = e.target.closest('.touch-active');
  if (target) target.classList.remove('touch-active');
}, { passive: true });
```

### 2.3 防误触检查

#### ✅ 已正确实现的防误触机制：

| 机制 | 文件位置 | 说明 |
|------|----------|------|
| 导航防抖 | `game-engines.js:689` | `PageManager._navigateTimer` 300ms 锁定 |
| 模态框锁定 | `game-engines.js:554` | `Modal._locked` 防止重复点击关闭 |
| AI 提问锁 | `ai-float-v55.js:446` | `AITutorFloat._askingLock` 3秒解锁 |
| AI 提问锁 | `ai-tutor-v55.js:579` | `ai-tutor-v55.js` 的 `_askingLock` |
| 页面过渡锁 | `v10-interactions.js:52` | `V10PageTransition._isTransitioning` |
| 答题禁用 | `game-engines.js` 多处 | `QuizEngine` 答完后设置 `o.onclick = null` |

#### ⚠️ 需改进的防误触：

**问题：动态生成的答题选项缺少防抖保护**

```javascript
// game-engines.js - 部分引擎内联生成 onclick 后没有即时防重复机制
// SurvivalEngine, TimedChallengeEngine 等生成选项时：
optsHtml = '<div class="option-btn" onclick="SurvivalEngine.answer('+i+')">...'
```

虽然这些引擎在 `answer()` 内部会检查 `_active` 状态，但存在极短的时间窗口可以重复触发。

**修复建议：** 在 `answer()` 开头立即添加 `pointer-events: none` 或设置 `onclick = null`。

### 2.4 点击区域检查（WCAG 标准）

#### ✅ 符合标准：

```css
/* all-styles-v55.css:133 - 48px 是 Apple HIG 推荐值，超过 WCAG 44px 最低标准 */
.touch-device .mode-btn,
.touch-device .menu-cat-btn,
.touch-device .tool-btn,
.touch-device .quiz-opt,
.touch-device .choice-btn {
  min-height: 48px; /* Apple HIG 推荐最小触摸目标 */
  min-width: 48px;
}
```

#### ⚠️ 边界情况：

```css
/* all-styles-v55.css:251 - 在 <=480px 屏幕下缩小到 40px，低于 WCAG 44px 标准 */
@media (max-width: 480px) {
  .tool-btn {
    min-width: 40px !important;  /* ❌ 低于 44px */
    ...
  }
}
```

**修复建议：** 将 `min-width: 40px` 改为 `min-width: 44px` 或 `48px`。

---

## 三、修复优先级与代码片段

### 🔴 高优先级（影响无障碍访问）

**修复 1：feature-item 添加可访问属性**

```html
<!-- index.html:483-506 四处 feature-item 统一修复 -->
<div class="feature-item cursor-pointer" 
     onclick="ScenarioEngine.start()"
     role="button"
     tabindex="0"
     aria-label="开始情景模拟：洪水来袭">
```

**修复 2：menu-section-title 添加可访问属性**

```html
<!-- index.html:241 -->
<h2 class="menu-section-title learn-title" 
    onclick="MenuManager.toggleCategory('learn')"
    role="button"
    tabindex="0"
    aria-label="展开/折叠学习中心">
  📚 学习中心<span class="collapse-arrow">▼</span>
</h2>

<!-- index.html:340 同理 -->
<h2 class="menu-section-title battle-title" 
    onclick="MenuManager.toggleCategory('battle')"
    role="button"
    tabindex="0"
    aria-label="展开/折叠闯关挑战">
  ⚔️ 闯关挑战<span class="collapse-arrow">▼</span>
</h2>
```

**修复 3：study-card 添加可访问属性**

```html
<!-- index.html:1025 -->
<div class="study-card" id="studyCard" 
     onclick="StudyEngine.flip()"
     role="button"
     tabindex="0"
     aria-label="点击翻转卡片查看答案">
```

**修复 4：settings-card 添加可访问属性**

```html
<!-- index.html:824 等6处 -->
<div class="settings-card" 
     onclick="document.getElementById('themeModal').style.display='flex'"
     role="button"
     tabindex="0"
     aria-label="选择主题">
```

### 🟡 中优先级（影响交互质量）

**修复 5：盲盒图标添加可访问属性**

```html
<!-- index.html:1005 -->
<div role="button"
     tabindex="0"
     aria-label="抽取盲盒"
     style="font-size:5rem;cursor:pointer;transition:transform 0.3s cubic-bezier(0.175,0.885,0.32,1.275);filter:drop-shadow(0 0 30px rgba(0,212,255,0.3));animation:logoFloat 2s ease-in-out infinite"
     onclick="this.style.transform='scale(1.5)';setTimeout(()=>this.style.transform='scale(1)',500)">
  🎁
</div>
```

**修复 6：themeModal 事件处理改进**

```html
<!-- index.html:1715 - 将 event 改为显式参数 -->
<div id="themeModal" 
     style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:10000;align-items:center;justify-content:center;backdrop-filter:blur(8px)"
     onclick="(function(e){if(e.target===this){this.style.display='none'}}).call(this, event)">
```

或者更好的方式：提取为独立函数：
```javascript
function closeThemeModal(e) {
  if (e.target === e.currentTarget) {
    document.getElementById('themeModal').style.display = 'none';
  }
}
```
```html
<div id="themeModal" ... onclick="closeThemeModal(event)">
```

**修复 7：动态答题选项添加防重复触发**

在 `SurvivalEngine.answer()` 和 `TimedChallengeEngine.answer()` 开头添加：

```javascript
answer(idx) {
  if (!this._active) return;
  // 防重复触发
  if (this._answered) return;
  this._answered = true;
  // ... 原有逻辑
}
```

### 🟢 低优先级（性能优化）

**修复 8：触摸反馈优化**

```javascript
// accessibility.js:183 - 替换为
if (target.classList.contains('touch-active')) {
  target.classList.remove('touch-active');
}
```

**修复 9：最小触摸目标修复**

```css
/* all-styles-v55.css:251 */
@media (max-width: 480px) {
  .tool-btn {
    min-width: 48px !important;  /* 从 40px 改为 48px */
    ...
  }
}
```

---

## 四、已验证的良好实践

以下交互优化已经正确实现，无需修改：

| 实践 | 状态 | 说明 |
|------|------|------|
| 300ms 导航锁 | ✅ 已正确 | `PageManager._navigateTimer` |
| 触摸延迟消除 | ✅ 已正确 | `touch-action: manipulation` + passive touchstart |
| 双击缩放防止 | ✅ 已正确 | `accessibility.js:191` 300ms 检测 |
| hover 粘滞修复 | ✅ 已正确 | `@media (hover: none)` 清除 hover |
| 最小触摸目标 | ✅ 基本正确 | 48px 标准（480px 以下有 40px 例外） |
| 滑动手势返回 | ✅ 已正确 | `optimizer-mobile.js:271` 左边缘右滑 |
| 快速触摸反馈 | ✅ 已正确 | `touch-active` 类 |
| 模态框点击穿透 | ✅ 已正确 | `event.target === this` 检测 |
| AI 提问防重复 | ✅ 已正确 | `_askingLock` 机制 |
| disabled 按钮保护 | ✅ 已正确 | `GachaEngine`、`RouletteEngine` 等内部二次检查 |

---

## 五、总结

本次检查共发现 **10 项** 需要改进的点击交互问题：

- 🔴 **高优先级 4 项**：`feature-item`、`menu-section-title`、`study-card`、`settings-card` 缺少 `role`/`tabindex`/`aria-label`，影响键盘和屏幕阅读器用户
- 🟡 **中优先级 3 项**：盲盒图标可访问性、`themeModal` 事件参数、动态答题选项防重复触发
- 🟢 **低优先级 3 项**：触摸反馈性能、最小触摸目标 40px→48px、事件监听器重复绑定

**整体评价：** 项目的点击交互基础做得较好（导航锁、触摸优化、防重复提交等），但**无障碍访问属性（ARIA）覆盖不完整**，部分可点击的 `<div>` 元素缺少 `role` 和 `tabindex`，这会影响键盘导航和屏幕阅读器的使用体验。
