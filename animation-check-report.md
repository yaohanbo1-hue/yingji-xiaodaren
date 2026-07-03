# 🔍 应急小达人 — 动画效果检查报告 (animation-check)

**检查时间**: 2026-06-14  
**检查范围**: `all-styles-v55.css`, `disaster-sim.js`, `visual-fx.js`, `performance.js`  
**检查维度**: @keyframes 动画、transform/opacity 性能优化、transition 使用、requestAnimationFrame 管理

---

## 一、问题汇总表

| 编号 | 问题描述 | 严重度 | 涉及文件 | 代码位置 |
|------|----------|--------|----------|----------|
| A-1 | **59 个无限循环装饰动画**同时运行，浪费 GPU/CPU | 🔴 高 | `all-styles-v55.css` | 多处 |
| A-2 | `performance.js` RAF 拦截器**完全无效**，帧率限制不工作 | 🔴 高 | `performance.js` | L160-178 |
| A-3 | `reduced-motion` 对 `.ai-fab` 等元素的动画**无效** | 🟡 中 | `all-styles-v55.css` | L300, L321 等 |
| A-4 | 2 处 `transition: all` 导致不必要的属性重计算 | 🟡 中 | `all-styles-v55.css` | L8022, L8059 |
| A-5 | 多处使用 `width/height/left` transition 导致**重排** | 🟡 中 | `all-styles-v55.css` | L2595, L4684, L5926 等 |
| A-6 | `will-change` 使用不足（仅 3 处），大量动画元素未优化 | 🟢 低 | `all-styles-v55.css` | L6263, L7135 等 |
| A-7 | `visual-fx.js` 部分 RAF 没有 cancel 引用（goldRain 等） | 🟢 低 | `visual-fx.js` | 多处 |
| A-8 | 一处 transition 同时动画 5 个属性，混合 GPU/非 GPU 属性 | 🟢 低 | `all-styles-v55.css` | L7131 |

---

## 二、详细问题分析

### A-1. 59 个无限循环装饰动画同时运行 [🔴 高]

**问题描述**:
CSS 中有 **59 个** `animation: ... infinite` 的装饰性动画在默认状态下运行。包括：
- 背景氛围动画：`bgShift`(40s), `orbFloat1-4`(25-40s), `auroraWave`(8s), `starTwinkle`(4s), `dustRise1-8`(10-16s)
- 装饰元素动画：`meteorFall`(8-12s), `geoSpin`(30-80s), `pulseExpand`(6-8s), `barFlow`(12-18s)
- UI 脉冲动画：`ai-fab-pulse`(3s), `pulse-ring`(2s), `dotPulse`(1.5s), `badgePulse`(2s), `titlePulse`(2.5s), `tagPulse`(2s)

这些动画在 `.low-perf-mode` 和 `.reduced-motion` 下被禁用，但**默认情况下所有设备都会运行**。在低端设备或移动设备上，即使单个动画消耗很低，59 个同时运行的累积效应仍可能导致 GPU 占用过高、电池消耗加速。

**代码示例**:
```css
/* L1656-1683: 4 个背景光球同时漂浮 */
.bg-orb-1 { animation: orbFloat1 30s ease-in-out infinite; }
.bg-orb-2 { animation: orbFloat2 40s ease-in-out infinite; }
.bg-orb-3 { animation: orbFloat3 35s ease-in-out infinite; }
.bg-orb-4 { animation: orbFloat4 25s ease-in-out infinite; }
```

**修复建议**:
1. 默认减少背景装饰动画数量（如只保留 2 个光球，降低粒子密度）
2. 根据设备性能动态启用/禁用装饰动画：
```javascript
// 在 performance.js 的 _detectPerformance 中增加
if (this._lowPerfMode) {
  document.querySelectorAll('.bg-orb, .bg-gradient, .bg-grid, .bg-noise')
    .forEach(el => el.style.animation = 'none');
}
```
3. 将长周期装饰动画（如 `geoSpin` 80s）改用纯 CSS 渐变/静态图片替代

---

### A-2. performance.js RAF 拦截器完全无效 [🔴 高]

**问题描述**:
`performance.js` 尝试通过拦截 `requestAnimationFrame` 实现帧率限制（30fps 模式），但由于实现方式存在根本缺陷，**节流完全不起作用**。

**问题代码** (performance.js L160-178):
```javascript
var originalRAF = window.requestAnimationFrame;
var lastTimeMap = new Map();

window.requestAnimationFrame = function(callback) {
  return originalRAF(function(timestamp) {
    var lastTime = lastTimeMap.get(callback) || 0;
    if (timestamp - lastTime >= self._frameInterval) {
      lastTimeMap.set(callback, timestamp);
      callback(timestamp);
    } else {
      window.requestAnimationFrame(callback);  // ❌ 递归进入拦截器
    }
  });
};
```

**根本缺陷**:
1. `disaster-sim.js` 和 `visual-fx.js` 中每次 RAF 都创建新的箭头函数 `() => this._animate()`，所以 `lastTimeMap.get(callback)` 每次都返回 `undefined`
2. `timestamp - 0 >= frameInterval` 在第一次执行时总是 true（timestamp 从页面加载开始计数），因此**回调永远不会被跳过**
3. 当 else 分支调用 `window.requestAnimationFrame(callback)` 时，会递归进入拦截器创建新的 closure，而不是直接调用 `originalRAF`

**修复方案**:
```javascript
_throttleCanvases() {
  if (this._fps >= 60) return;
  
  var self = this;
  var originalRAF = window.requestAnimationFrame;
  var lastTime = 0;  // 使用全局时间戳而非 Map
  
  window.requestAnimationFrame = function(callback) {
    return originalRAF(function(timestamp) {
      if (timestamp - lastTime >= self._frameInterval) {
        lastTime = timestamp;
        callback(timestamp);
      } else {
        // 直接调用 originalRAF 避免重复包装
        originalRAF(arguments.callee);
      }
    });
  };
}
```

或者更好的方案：不在全局拦截 RAF，而是在 Canvas 渲染循环中自行节流。

---

### A-3. reduced-motion 对 .ai-fab 等元素无效 [🟡 中]

**问题描述**:
CSS 特异性问题导致 `.reduced-motion` 对 `.ai-fab` 等元素的动画覆盖失败。

- `.reduced-motion * { animation-duration: 0.01ms !important; }` 特异性: **(0,1,0)**
- `.ai-fab { animation: ai-fab-pulse 3s ease-in-out infinite !important; }` 特异性: **(0,1,0)**

两者特异性相同，但 `.ai-fab` 在 CSS 文件中**后定义**，所以它的 `!important` 会覆盖 `.reduced-motion` 的规则。这意味着在减少动画模式下，AI 浮动按钮的脉冲动画仍然以 3s 无限循环运行。

**受影响的元素**（`animation: ... !important` 且后定义于 `.reduced-motion *`）：
- `.ai-fab` → `ai-fab-pulse` 3s infinite
- `.ai-fab-badge` → `ai-fab-badge-pulse` 2s infinite
- `.ai-msg` → `ai-msg-fade-in` 0.3s

**修复方案**:
在 `.reduced-motion` 区域增加显式覆盖：
```css
.reduced-motion .ai-fab,
.reduced-motion .ai-fab-badge,
.reduced-motion .ai-msg {
  animation: none !important;
}
```

或者将 `.reduced-motion *` 规则移到 CSS 文件**末尾**，确保它覆盖所有前面的 `!important`。

---

### A-4. transition: all 导致不必要的属性重计算 [🟡 中]

**问题位置**:

| 行号 | 选择器 | 代码 |
|------|--------|------|
| L8022 | `.calendar-day` | `transition: all 0.2s ease !important;` |
| L8059 | `.minigame-card` | `transition: all 0.3s ease !important;` |

**问题描述**:
`transition: all` 会让浏览器监听**所有 CSS 属性**的变化，当 `background`、`border-color` 等属性变化时都会触发 transition 计算，增加不必要的重绘开销。

**修复方案**:
```css
/* 原代码 */
.calendar-day {
  transition: all 0.2s ease !important;
}

/* 修复后 */
.calendar-day {
  transition: background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease !important;
}

/* 原代码 */
.minigame-card {
  transition: all 0.3s ease !important;
}

/* 修复后 */
.minigame-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease !important;
}
```

---

### A-5. 多处 width/height/left transition 导致重排 [🟡 中]

**问题描述**:
`width`、`height`、`left` 等属性的 transition 会触发**浏览器重排（reflow）**，在动画过程中需要重新计算布局树，性能开销远大于 `transform` 和 `opacity`。

**问题位置**:

| 行号 | 选择器 | 问题属性 | 建议替代方案 |
|------|--------|----------|-------------|
| L575 | `.ai-mastery-bar-fill` | `transition: width 0.5s ease` | 使用 `transform: scaleX()` + `transform-origin: left` |
| L2595 | `.progress-bar` | `transition: width 0.5s ease` | 同上 |
| L4684 | `.xp-bar-fill` | `transition: width 0.1s ease` | `transform: scaleX()` |
| L5926 | `.mastery-bar` | `width, height, opacity, transform` | 移除 `width/height` transition，保留 `transform, opacity` |
| L6437 | `.menu-toolbar .tool-btn::before` | `transition: width 0.6s` | 使用 `transform: scaleX()` |
| L7317 | `.bar-fill` | `transition: width 0.5s` | `transform: scaleX()` |
| L7335 | `.stat-bar-fill` | `transition: width 0.3s linear` | `transform: scaleX()` |
| L7400 | `.slider-thumb` | `transition: left 0.6s` | `transform: translateX()` |
| L7448 | `.progress-fill` | `transition: width 0.5s ease` | `transform: scaleX()` |
| L7623 | `.menu-bar-fill` | `transition: width 0.5s` | `transform: scaleX()` |
| L4866 | `.accordion-content` | `transition: max-height 0.4s` | `max-height` 虽比重排轻，但仍建议改用 `grid-template-rows` 或 `scaleY` |

**修复示例**（进度条）:
```css
/* 原代码 */
.progress-bar {
  width: 0%;
  transition: width 0.5s ease;
}

/* 修复后 */
.progress-bar {
  width: 100%;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.5s ease;
}
/* JS 中通过修改 transform: scaleX(0.75) 替代 width: 75% */
```

---

### A-6. will-change 使用不足 [🟢 低]

**问题描述**:
`will-change` 是提示浏览器提前创建合成层的关键属性，可以显著提升 `transform` 和 `opacity` 动画的流畅度。当前 CSS 中仅有 **3 处**使用：

| 行号 | 选择器 | 属性 |
|------|--------|------|
| L6263 | `.page` | `will-change: opacity, transform;` |
| L7135 | `.quiz-opt, .scenario-opt` | `will-change: transform, box-shadow;` |

但 CSS 中有大量使用 `transform`/`opacity` 动画的元素没有设置 `will-change`，如：
- `.ai-fab` (scale hover + infinite pulse)
- `.ai-float-panel` (slide-in)
- `.mode-btn` (scale on active)
- `.correct-pulse` / `.wrong-shake` (keyframes)
- `.stat-card` (translateY hover)
- `.bg-orb-1` 到 `.bg-orb-4` (infinite float)

**修复建议**:
对频繁动画的元素添加 `will-change`（但避免滥用，仅在动画前添加，动画后移除）：
```css
.ai-fab,
.ai-float-panel,
.mode-btn,
.correct-pulse,
.wrong-shake,
.stat-card,
.bg-orb {
  will-change: transform, opacity;
}
```

或者在动画类中动态添加：
```css
.animating {
  will-change: transform, opacity;
}
```

---

### A-7. visual-fx.js 部分 RAF 没有 cancel 引用 [🟢 低]

**问题描述**:
`visual-fx.js` 中部分动画使用 RAF 循环但没有存储引用，无法在外部取消。

**具体问题**:

1. **`goldRain` 函数** (L~): 使用 `requestAnimationFrame(function animate(now){...})` 递归，但没有存储 RAF ID：
```javascript
requestAnimationFrame(function animate(now){
  var dt = Math.min((now-startTime)/16.67, 3);
  particles.forEach(function(p){
    // ... 物理模拟 ...
  });
  alive ? requestAnimationFrame(animate) : particles.forEach(/* cleanup */);
});
```
问题：如果用户快速切换页面，goldRain 的 RAF 循环会继续运行直到 setTimeout 的 fallback 清理（2.1s 后）。

2. **`_burstParticles` / `celebrationBurst` 等**：使用 RAF 触发单次 CSS transition，但 RAF 本身没有 cancel 引用。不过这些是一次性动画（< 1s），影响较小。

**修复建议**:
对 goldRain 等 RAF 循环存储 ID：
```javascript
var rafId = null;
function animate(now) { ... alive ? rafId = requestAnimationFrame(animate) : cleanup(); }
rafId = requestAnimationFrame(animate);

// 暴露取消方法
VisualFX.goldRainCancel = function() {
  if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
};
```

---

### A-8. 一处 transition 同时动画 5 个属性 [🟢 低]

**问题位置**: `all-styles-v55.css` L7131

```css
.quiz-opt, .scenario-opt {
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
              opacity 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
              box-shadow 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
              background-color 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
              border-color 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  will-change: transform, box-shadow;  /* 只提示了 2 个属性 */
}
```

**问题描述**:
同时动画 5 个属性，其中 `transform` 和 `opacity` 是 GPU 加速的，但 `box-shadow`、`background-color`、`border-color` 不是 GPU 加速属性。浏览器需要同时处理合成层和绘制层，可能导致掉帧。

**修复建议**:
将非 GPU 属性的动画效果移到 GPU 属性上：
```css
.quiz-opt, .scenario-opt {
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
              opacity 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  will-change: transform, opacity;
}

/* box-shadow 效果用伪元素 + opacity 替代 */
.quiz-opt::after {
  content: '';
  position: absolute;
  inset: 0;
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.2);
  opacity: 0;
  transition: opacity 0.4s;
  pointer-events: none;
}
.quiz-opt:hover::after { opacity: 1; }
```

---

## 三、良好实践（值得保留）

| 项目 | 说明 | 位置 |
|------|------|------|
| ✅ `reduced-motion` 类 | 已提供减少动画模式，覆盖 `animation-duration`/`transition-duration` | L108-125 |
| ✅ `low-perf-mode` 类 | 已提供低性能模式，禁用背景装饰 | L163-187 |
| ✅ `.page` 使用 `will-change` | 页面切换动画已优化 | L6263 |
| ✅ `disaster-sim.js` RAF 清理 | `cleanup()` 正确取消 RAF 和事件监听 | L113-130 |
| ✅ `stopBattleParticles` | 正确取消 RAF 和移除 DOM | visual-fx.js |
| ✅ 使用 `transform` 优先 | 大多数动画使用 `transform`/`opacity` 而非 `top`/`left` | 多处 |
| ✅ `cubic-bezier(0.4, 0, 0.2, 1)` | 使用标准的 Material Design 缓动曲线 | 多处 |
| ✅ 动画时间合理 | 没有 < 0.2s 的闪烁动画或 > 5s 的等待动画（装饰性除外） | 全局 |
| ✅ `disaster-sim.js` 隐藏暂停 | `_animate()` 检查 `document.hidden` 暂停渲染 | L277 |

---

## 四、修复优先级建议

| 优先级 | 问题 | 预期收益 |
|--------|------|----------|
| **P0** | 修复 A-2 `performance.js` RAF 拦截器 | 低性能设备帧率限制生效，节省 30-50% CPU |
| **P0** | 修复 A-3 `reduced-motion` 特异性 | 无障碍合规，尊重用户减少动画偏好 |
| **P1** | 减少 A-1 默认 infinite 动画数量 | 低端设备 GPU 占用显著降低 |
| **P1** | 修复 A-4 `transition: all` | 减少不必要的 transition 计算开销 |
| **P1** | 修复 A-5 `width/height/left` transition | 消除重排，提升动画流畅度 |
| **P2** | 增加 A-6 `will-change` 覆盖 | 浏览器可提前创建合成层，减少 jank |
| **P2** | 修复 A-7 visual-fx RAF 引用 | 页面切换时及时释放 RAF 资源 |
| **P3** | 优化 A-8 混合属性 transition | 统一使用 GPU 加速属性 |

---

*报告由 animation-check 子任务生成，提交给主 Orchestrator 进行修复调度。*
