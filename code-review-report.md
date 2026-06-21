# 应急小达人 游戏代码审查报告

> **审查日期**: 2026-06-21  
> **审查范围**: 项目根目录下所有 `.js` / `.html` / `.css` 文件  
> **审查重点**: Bug、性能、安全、内存泄漏、兼容性  
> **代码质量评分**: **6.5 / 10**

---

## 一、严重级别 Bug（Critical）

### C1. 阿里云百炼 API Key 硬编码泄露
| 项目 | 详情 |
|------|------|
| **文件** | `ai-tutor-llm-v55.js` |
| **行号** | 第 8 行 |
| **Bug 描述** | API Key `sk-sp-D.ILXLI.CXh6...` 以明文形式直接嵌入前端 JavaScript 代码中。任何访问该页面的用户都可在浏览器开发者工具中直接查看并盗刷该 Key。 |
| **风险** | 攻击者可直接调用阿里云百炼 API，造成费用损失、服务滥用、数据泄露。 |
| **修复建议** | 立即撤销该 API Key 并重新生成。将 AI 对话功能迁移至后端代理（Cloudflare Worker / Serverless Function），由后端转发请求并隐藏 Key。前端只与自有后端通信。 |

```javascript
// 修复方案（后端代理示例）
// 前端
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: userMessage })
});

// 后端 (Cloudflare Worker / Node.js)
const API_KEY = process.env.BAILIAN_API_KEY; // 环境变量，不暴露给前端
```

### C2. Service Worker 缓存策略缺陷导致版本更新不生效
| 项目 | 详情 |
|------|------|
| **文件** | `sw-v55.js` |
| **行号** | 第 122-132 行 |
| **Bug 描述** | `cacheRequest` 通过 `new Request(url.pathname)` 去掉了查询参数，但 `index.html` 中所有资源链接都带有 `?v=57` 版本号。当新版本发布时（如 `?v=58`），SW 仍会返回旧缓存（`v=57`），因为缓存键是 `url.pathname`。用户可能永远看不到更新。 |
| **风险** | 用户浏览器长期缓存旧版本，新功能、Bug 修复无法触达用户。 |
| **修复建议** | 方案 A：修改缓存键为带完整 URL（含查询参数）的 `request`；方案 B：每次发布时递增 `CACHE_NAME`（如 `yingji-xiaodaren-v56`），并确保 `activate` 中清理旧缓存。推荐方案 B。 |

```javascript
// 修复方案 B：每次发版更新 CACHE_NAME
const CACHE_NAME = 'yingji-xiaodaren-v58'; // 发版时必须递增！
```

---

## 二、高级别 Bug（High）

### H1. 定时器/Interval 大量泄漏，导致内存和性能持续恶化
| 项目 | 详情 |
|------|------|
| **文件** | `game-engines.js`（多处）|
| **Bug 描述** | 以下引擎创建了 `setInterval`/`setTimeout` 但未在页面切换或游戏结束时清理，导致：① 内存泄漏；② 后台定时器继续运行消耗 CPU；③ 旧页面的回调函数仍然执行，可能操作已不存在的 DOM 元素。 |
| **涉及引擎** | `DisasterQuizGame._timer`、`KnowledgeRaceEngine.timer`、`TimeEscapeEngine.timer`、`TimedChallengeEngine._timer`、`ReactionEngine.targetTimeout`、`KitEngine.timerInterval`、`MemoryCardEngine.timer`、`QuizEngine.timerInterval` |
| **修复建议** | 为每个引擎添加统一的 `cleanup()` / `destroy()` 方法，在 `PageManager.navigate()` 时调用所有活跃引擎的清理方法。示例： |

```javascript
// 每个引擎添加 destroy 方法
const KnowledgeRaceEngine = {
  // ... 现有代码 ...
  destroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.active = false;
  }
};

// PageManager.navigate 中统一清理
PageManager.navigate = function(pageId) {
  // 清理所有可能活跃的游戏引擎
  [KnowledgeRaceEngine, TimeEscapeEngine, DisasterQuizGame, 
   QuizEngine, KitEngine, MemoryCardEngine, ReactionEngine]
    .forEach(engine => { if (engine.destroy) engine.destroy(); });
  // ... 原有导航逻辑 ...
};
```

### H2. `allEngines` 数组存在重复引用
| 项目 | 详情 |
|------|------|
| **文件** | `game-engines.js` |
| **行号** | 第 1096 行 |
| **Bug 描述** | `allEngines` 数组中 `TimeEscapeEngine` 和 `PrecisionEngine` 各出现了 **两次**。这会导致 `GameRegistry.healthCheck()` 或任何遍历逻辑产生重复计算或意外行为。 |
| **修复建议** | 去重并确保每个引擎只出现一次。 |

```javascript
// 修复前（错误）
const allEngines = [..., TimeEscapeEngine, PrecisionEngine, StoryChallengeEngine, TimeEscapeEngine, PrecisionEngine, StoryAdventureEngine, GuideEngine];

// 修复后（正确）
const allEngines = [..., TimeEscapeEngine, PrecisionEngine, StoryChallengeEngine, StoryAdventureEngine, GuideEngine];
```

### H3. `window.open` + `document.write` 组合存在 XSS 和安全风险
| 项目 | 详情 |
|------|------|
| **文件** | `report.js`（443-448, 498-503）、`wrong-book.js`（284-317）、`cert-enhance.js`（254-255）|
| **Bug 描述** | 多处使用 `window.open('', '_blank')` 后调用 `document.write(html)` 写入内容。`document.write` 在现代浏览器中已被废弃，且如果 `html` 内容包含用户输入（如错题本中的用户答案、自定义昵称），可能导致 XSS 注入。 |
| **修复建议** | 使用 `Blob` + `URL.createObjectURL` 创建独立页面，或使用 `iframe` 沙箱。如果必须打印，可用 `canvas.toDataURL()` 生成图片后在新窗口展示。 |

```javascript
// 修复方案：使用 Blob 替代 document.write
const blob = new Blob([html], { type: 'text/html' });
const url = URL.createObjectURL(blob);
win.location.href = url;
// 注意：之后需要 URL.revokeObjectURL(url)
```

### H4. 洗牌算法使用 `Math.random() - 0.5` 导致不均匀分布
| 项目 | 详情 |
|------|------|
| **文件** | `game-engines.js`（数十处）|
| **Bug 描述** | 大量引擎使用 `arr.sort(() => Math.random() - 0.5)` 进行洗牌。这是经典的错误洗牌算法，其均匀性远差于 Fisher-Yates，某些排列出现的概率会偏高，导致游戏公平性受损。 |
| **涉及代码** | `BattleEngine.init`、`BlindBoxEngine.open`、`BossRushEngine.nextQuestion`、`MemoryCardEngine._generateCards`、`KnowledgeRaceEngine.init`、`DisasterQuizGame._nextQuestion` 等 |
| **修复建议** | 统一使用项目已有的 `GameUtils.shuffle`（Fisher-Yates 实现）替代所有 `sort(() => Math.random() - 0.5)`。 |

```javascript
// 修复前（错误）
const shuffled = [...arr].sort(() => Math.random() - 0.5);

// 修复后（正确）
const shuffled = GameUtils.shuffle(arr);
```

### H5. `loading.js` 中 `tips` 变量未定义导致运行时错误
| 项目 | 详情 |
|------|------|
| **文件** | `loading.js` |
| **行号** | 第 74 行 |
| **Bug 描述** | `if (progress >= 20 * (tipIndex + 1) && tipIndex < tips.length - 1)` 引用了 `tips` 变量，但整个 `loading.js` 文件中并未定义 `tips` 数组。这将导致首次访问时（无 localStorage 记录）抛出 `ReferenceError: tips is not defined`，加载动画直接崩溃。 |
| **修复建议** | 在文件顶部定义 `tips` 数组，或从 DOM 中读取提示列表。 |

```javascript
// 修复方案
const tips = [
  "正在加载防灾知识库...",
  "准备应急装备...",
  "连接防灾指挥中心...",
  "初始化灾害模拟系统...",
  "加载完成！"
];
```

---

## 三、中级别 Bug（Medium）

### M1. `innerHTML` 使用广泛，存在潜在 XSS 风险
| 项目 | 详情 |
|------|------|
| **文件** | `game-engines.js`、`ai-float-v55.js`、`certification.js`、`disaster-sim.js` 等 |
| **Bug 描述** | 超过 50 处使用 `innerHTML` 动态插入 HTML。虽然大部分内容是静态字符串，但以下场景存在风险：① `Modal.show(title, desc)` 的 `desc` 参数如果传入用户输入；② `Certificate.show()` 中 `playerName` 来自 `GameState._data.playerName` 且支持 `contentEditable` 编辑；③ `wrong-book.js` 中错题内容直接拼接 HTML。 |
| **修复建议** | 对用户可控的内容使用 `textContent` 或 `document.createTextNode` 代替 `innerHTML`。对于 `Modal.show`，提供安全的 `showText(title, text)` 变体。 |

```javascript
// 安全替代方案
function setTextSafe(el, text) {
  if (el) el.textContent = text; // 自动转义 HTML
}
```

### M2. `VisualFX.startBattleParticles()` 添加的 resize 监听器无法移除
| 项目 | 详情 |
|------|------|
| **文件** | `visual-fx.js` |
| **行号** | 第 60-100 行（截断区域）|
| **Bug 描述** | `startBattleParticles` 在内部创建了一个具名函数 `_vfxResizeHandler` 并通过 `window.addEventListener("resize", _vfxResizeHandler)` 注册。但 `_vfxResizeHandler` 是局部变量，无法从外部引用，导致 `stopBattleParticles` 无法通过 `removeEventListener` 移除该监听器。每次进入战斗页面都会泄漏一个 resize 监听器。 |
| **修复建议** | 将 `_vfxResizeHandler` 提升为 `VisualFX` 对象的属性，以便在 `stopBattleParticles` 中正确移除。 |

```javascript
// 修复方案
const VisualFX = {
  _vfxResizeHandler: null, // 提升到对象属性
  
  startBattleParticles() {
    // ... 创建 canvas ...
    this._vfxResizeHandler = () => { /* resize logic */ };
    window.addEventListener('resize', this._vfxResizeHandler);
  },
  
  stopBattleParticles() {
    if (this._vfxResizeHandler) {
      window.removeEventListener('resize', this._vfxResizeHandler);
      this._vfxResizeHandler = null;
    }
    // ... 其余清理逻辑 ...
  }
};
```

### M3. `GameState.save()` 被频繁调用，无防抖机制
| 项目 | 详情 |
|------|------|
| **文件** | `game-engines.js`（全局）|
| **Bug 描述** | 在答题、战斗、盲盒、签到等几乎每个操作后都会立即调用 `GameState.save()`，而 `save()` 内部执行 `JSON.stringify` + `localStorage.setItem`。对于 369 张卡牌和大量统计数据，序列化数据可能达到 50KB+。连续操作时（如连击、快速答题）会导致频繁的同步写入，阻塞主线程，在低端设备上造成卡顿。 |
| **修复建议** | 为 `GameState.save()` 添加防抖（debounce）机制，至少延迟 500ms 写入，并合并多次调用。 |

```javascript
// 修复方案
const GameState = {
  _saveTimer: null,
  save() {
    if (this._saveTimer) clearTimeout(this._saveTimer);
    this._saveTimer = setTimeout(() => {
      try {
        localStorage.setItem('disasterGameState', JSON.stringify(this._data));
      } catch (e) {
        console.error('Save failed:', e);
      }
      this._saveTimer = null;
    }, 500);
  }
};
```

### M4. `AchievementEngine._definitions` 存在重复 ID
| 项目 | 详情 |
|------|------|
| **文件** | `game-engines.js` |
| **行号** | 第 21 行附近 |
| **Bug 描述** | `daily_7` 成就 ID 在定义数组中出现了 **两次**（一次是"七日坚持"，一次是"周周坚持"）。使用 ID 作为唯一键进行查找或去重时，会导致后定义覆盖前定义，或逻辑混乱。 |
| **修复建议** | 将第二个 `daily_7` 改为 `daily_7b` 或 `weekly_7`，并确保所有引用同步更新。 |

### M5. `StudyEngine._el()` 多处直接调用未做空值检查
| 项目 | 详情 |
|------|------|
| **文件** | `game-engines.js` |
| **行号** | 第 885 行附近 |
| **Bug 描述** | `StudyEngine._el(id)` 是对 `document.getElementById` 的简单包装。在 `render()` 方法中，大量调用 `this._el("xxx").textContent = ...` 或 `this._el("xxx").style.width = ...`。如果对应 DOM 元素不存在（如页面未正确渲染或 ID 拼写错误），将抛出 `TypeError: Cannot set property 'textContent' of null`。 |
| **修复建议** | 统一使用 `DOMUtils.setText` 和 `DOMUtils.setHTML`（已存在于 `js/core/utils.js`），或给 `_el()` 添加空值保护。 |

```javascript
// 修复方案
_el(id) {
  const el = document.getElementById(id);
  if (!el) console.warn(`StudyEngine: element "${id}" not found`);
  return el;
}

// 在 render 中做空值保护
const el = this._el('studyQuestion');
if (el) el.textContent = zh.q || '...';
```

### M6. `bgm.js` / `bgm-enhanced.js` AudioContext 未处理浏览器自动暂停策略
| 项目 | 详情 |
|------|------|
| **文件** | `bgm.js`、`bgm-enhanced.js` |
| **Bug 描述** | `BGMEngine.init()` 创建 `AudioContext`，但现代浏览器（Chrome 66+）要求用户与页面交互后才能启动音频上下文。如果游戏尝试自动播放 BGM，`AudioContext` 会处于 `suspended` 状态，且代码未检测 `this.ctx.state` 是否为 `running`。 |
| **修复建议** | 在播放前检查 `this.ctx.state === 'suspended'`，并调用 `this.ctx.resume()`。同时确保首次播放绑定在用户交互事件（如点击）之后。 |

```javascript
// 修复方案
playSequence(pattern, bpm, loop) {
  this.init();
  if (this.ctx.state === 'suspended') {
    this.ctx.resume().catch(() => {});
  }
  // ... 原有逻辑 ...
}
```

---

## 四、低级别 Bug / 代码异味（Low）

### L1. `localStorage` 键名不统一，存在数据隔离风险
| 项目 | 详情 |
|------|------|
| **文件** | 全局 |
| **Bug 描述** | 不同模块使用不同的 localStorage 键前缀，如 `disasterGameState`、`disasterHQ_language`、`disaster_hq_loading_shown`、`disasterSeason`、`certificationData`、`aiTutorData`、`bg_theme` 等。这种分散管理增加了维护难度，也容易导致键名冲突或数据不一致。 |
| **修复建议** | 统一使用 `StorageUtils`（已定义在 `js/core/utils.js`）并增加键名前缀常量，如 `const LS_PREFIX = 'yd_'`。 |

### L2. `PageManager._refreshPage` 恢复 `pointerEvents` 逻辑不完整
| 项目 | 详情 |
|------|------|
| **文件** | `game-engines.js` |
| **行号** | 第 677 行附近 |
| **Bug 描述** | `app.style.pointerEvents = noPointerPages.indexOf(pageId) >= 0 ? "none" : ""` 当页面不在 `noPointerPages` 列表中时，将 `pointerEvents` 重置为空字符串。但空字符串并不等同于恢复默认值（`auto`），虽然在大多数浏览器中等价，但存在样式继承风险。更安全的做法是设置为 `"auto"`。 |
| **修复建议** | `app.style.pointerEvents = noPointerPages.indexOf(pageId) >= 0 ? "none" : "auto";` |

### L3. `game.js` 入口文件几乎为空，`game-core.js` 被重复加载
| 项目 | 详情 |
|------|------|
| **文件** | `game.js`、`js/core/game-core.js` |
| **Bug 描述** | `game.js` 仅包含注释和 DOMContentLoaded 监听器，实际功能为空。而 `js/core/game-core.js` 与 `game-engines.js` 中的 `GameState` 定义重复（`game-engines.js` 第 372 行也定义了 `GameState`）。如果两个文件都被加载，后加载的会覆盖先加载的，可能导致初始化状态不一致。 |
| **修复建议** | 清理 `game.js` 或将其真正作为入口点，统一引入核心模块。移除 `game-engines.js` 中重复的 `GameState` 定义，只保留 `js/core/` 或 `js/engines/` 中的一个。 |

### L4. `ComboEngine._showComboText` 每次创建新 DOM 但未复用
| 项目 | 详情 |
|------|------|
| **文件** | `game-engines.js` |
| **行号** | 第 242 行附近 |
| **Bug 描述** | 每次连击更新时都会 `document.createElement("div")` 并 `document.body.appendChild`，然后 1 秒后移除。虽然元素会被清理，但频繁创建/销毁 DOM 节点（高连击场景每秒多次）对渲染性能不利，且会触发多次重排重绘。 |
| **修复建议** | 复用单个 DOM 元素，通过修改 `textContent` 和 `className` 来更新内容，而不是反复创建新元素。 |

### L5. `parseInt` 缺少 radix 参数
| 项目 | 详情 |
|------|------|
| **文件** | `game-engines.js` 等 |
| **Bug 描述** | 部分代码使用 `parseInt(value)` 而非 `parseInt(value, 10)`。如果输入以 `0` 开头，旧浏览器可能将其解析为八进制。 |
| **修复建议** | 统一添加 `, 10` 参数。ESLint 规则 `radix` 可自动检测。 |

### L6. `navigator.vibrate` 未做权限/兼容性检查
| 项目 | 详情 |
|------|------|
| **文件** | `js/engines/Modal.js` 第 76 行 |
| **Bug 描述** | `navigator.vibrate(12)` 被直接调用，虽然前面有 `if (navigator.vibrate)` 判断，但某些浏览器（如 iOS Safari 部分版本）在 iframe 或权限受限模式下可能报错。 |
| **修复建议** | 增加 try-catch 包裹。 |

```javascript
if (navigator.vibrate) {
  try { navigator.vibrate(12); } catch (_) {}
}
```

### L7. `bg-themes.js` 监听系统主题变化未移除监听器
| 项目 | 详情 |
|------|------|
| **文件** | `bg-themes.js` |
| **行号** | 第 72-73 行 |
| **Bug 描述** | `mq.addEventListener('change', this._systemThemeListener)` 被调用，但没有对应的 `removeEventListener` 代码。如果主题引擎被重新初始化，会累积多个监听器。 |
| **修复建议** | 在主题切换或页面卸载时移除旧的监听器。 |

### L8. `index.html` 内嵌样式过多，阻塞渲染
| 项目 | 详情 |
|------|------|
| **文件** | `index.html` |
| **Bug 描述** | `index.html` 包含超过 500 行的内联 `<style>` 代码，其中大量使用了 `!important`。这导致：① HTML 文件体积过大（约 147KB）；② 样式优先级混乱，调试困难；③ 内联样式会阻塞首屏渲染。 |
| **修复建议** | 将内联样式迁移到独立的 CSS 文件，仅保留关键渲染路径（Critical CSS）在 `<head>` 中。 |

---

## 五、性能优化建议

### P1. 减少 DOM 操作频率
**问题**: 很多引擎在每次状态更新时直接操作 DOM（如 `innerHTML` 重新渲染整个列表）。  
**建议**: 对卡牌网格、排行榜、成就列表等大数据列表使用虚拟滚动（Virtual Scrolling）或 Diff 更新策略，只更新变化的节点。

### P2. 合并频繁的 CSS 样式变更
**问题**: `JuiceEngine.particleBurst` 和 `VisualFX.correctFeedback` 在短时间内创建大量 DOM 节点并设置内联样式。  
**建议**: 使用 CSS 类切换代替内联样式设置。对于粒子效果，考虑使用 Canvas 2D 或 WebGL 替代 DOM 元素，性能提升 10 倍以上。

### P3. 图片/音频资源缺少预加载
**问题**: `index.html` 预加载了 CSS 和 JS，但未预加载任何图片或音频资源。战斗音效、卡牌图片等在使用时才加载，首次触发会有延迟。  
**建议**: 对核心音效和首屏图片添加 `<link rel="preload" as="image/audio">`。

### P4. 懒加载非首屏 JS 模块
**问题**: `game-engines.js` 是一个 368KB 的巨无霸文件，包含 50+ 引擎，所有用户在首次打开时就必须完整下载并解析。  
**建议**: 将大型引擎按功能拆分为独立模块，使用 `import()` 动态导入。例如：战斗引擎、AI 导师、认证系统可在首次进入对应页面时才加载。

### P5. 使用 `requestIdleCallback` 处理非紧急任务
**问题**: `GameState.save()`、`AchievementEngine.check()` 等操作在主线程同步执行。  
**建议**: 将数据持久化、成就检查等低优先级任务放入 `requestIdleCallback` 或 `setTimeout(..., 0)` 中异步执行。

---

## 六、安全加固建议

| 优先级 | 建议 | 说明 |
|--------|------|------|
| 🔴 Critical | 移除所有硬编码 API Key | 见 C1 |
| 🔴 Critical | 添加 Content Security Policy (CSP) | 在 `<meta>` 或 HTTP Header 中配置 `default-src 'self'`、`script-src 'self'`、`style-src 'self' 'unsafe-inline'`，防止 XSS 注入 |
| 🟠 High | 对用户输入进行 HTML 转义 | 所有显示用户输入的地方（昵称、错题内容、PK 名称）使用 `textContent` 或 `DOMPurify` 净化 |
| 🟠 High | 替换 `document.write` | 见 H3 |
| 🟡 Medium | localStorage 数据加密 | 对敏感数据（如用户答题记录）使用简单的 XOR 或 AES 加密，防止本地数据被篡改刷分 |
| 🟡 Medium | 添加 Subresource Integrity (SRI) | 对外部 CDN 资源（Google Fonts）添加 `integrity` 属性，防止 CDN 劫持 |
| 🟢 Low | Service Worker 只缓存同源资源 | 当前已正确处理，但需持续监控 |

---

## 七、兼容性风险

| 风险 | 说明 | 建议 |
|------|------|------|
| `AudioContext` 兼容性 | 使用了 `window.AudioContext \|\| window.webkitAudioContext`，但未处理 iOS 的自动播放限制 | 添加用户交互后解锁音频的提示 |
| `prefers-reduced-motion` | `index.html` 已包含媒体查询，但 `game-engines.js` 中的 JavaScript 动画（如 `screenShake`、`coinRain`）未响应此偏好 | 在 JS 中检测 `matchMedia('(prefers-reduced-motion: reduce)').matches`，跳过动画 |
| `backdrop-filter` | 大量使用 `backdrop-filter: blur()`，Firefox 在部分配置下不支持 | 提供 `background: rgba()` 降级方案 |
| `grid-template-columns` | 已使用，但 Safari 12 及以下支持不完整 | 项目声明支持 Safari 13+，无需处理 |
| `viewport-fit=cover` | 已使用，对 iPhone 刘海屏适配良好 | 保持现状 |

---

## 八、总结

### 代码质量评分：6.5 / 10

| 维度 | 评分 | 说明 |
|------|------|------|
| 功能完整性 | 8/10 | 50+ 游戏模式，功能丰富 |
| 代码结构 | 5/10 | 单文件 368KB 过大，重复定义多，模块边界模糊 |
| 安全性 | 4/10 | API Key 硬编码、innerHTML 滥用、document.write 风险 |
| 性能 | 6/10 | 无防抖、频繁 DOM 操作、缺少懒加载 |
| 稳定性 | 6/10 | 大量定时器泄漏、内存泄漏风险、空指针隐患 |
| 可维护性 | 5/10 | 键名不统一、重复代码多、无类型检查 |

### 立即处理清单（按优先级排序）
1. **撤销并重置阿里云 API Key**（C1）
2. **修复 Service Worker 缓存版本问题**（C2）
3. **统一清理所有引擎的定时器泄漏**（H1）
4. **修复 `allEngines` 重复引用**（H2）
5. **修复 `loading.js` 未定义 `tips` 变量**（H5）
6. **修复洗牌算法为 Fisher-Yates**（H4）
7. **为 `GameState.save()` 添加防抖**（M3）
8. **修复 `VisualFX` resize 监听器泄漏**（M2）
9. **对用户输入进行 HTML 转义**（M1）
10. **拆分 `game-engines.js` 为按需加载模块**（P4）
