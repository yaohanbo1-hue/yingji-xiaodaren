# Service Worker 检查报告 — 应急小达人

**检查文件**: `sw.js` | `index.html` (SW 注册段)  
**检查时间**: 2026-06-16  
**检查专家**: Inspector_SW  
**项目版本**: v50

---

## 一、SW 配置分析

### 1.1 CACHE_NAME
```js
const CACHE_NAME = 'yingji-xiaodaren-v50';
```
- ✅ 名称正确，与 `index.html` 中 `<meta name="version" content="v50">` 一致
- ✅ 采用版本号命名，更新缓存时不会与其他版本冲突

### 1.2 缓存策略
| 文件注释 | 实际代码 | 结论 |
|---------|---------|------|
| 第2行: "Cache First, Network Fallback" | `fetch` 使用 `fetch(request)` 优先，失败才回退缓存 | ❌ **注释与代码不一致** |
| 第104行: "Network First 策略" | 同上 | ✅ 与代码一致 |

**实际策略**: **Network First**（先请求网络，失败回退缓存）

### 1.3 激活策略（activate）
```js
caches.keys().then(...).filter(name !== CACHE_NAME).map(caches.delete)
```
- ✅ 旧缓存会被正确清理
- ⚠️ 清理范围过宽：会删除**所有**非当前名称的缓存，包括其他应用/SW 的缓存

### 1.4 资源列表（STATIC_ASSETS）

与项目目录实际文件对比：

| 文件 | 在目录中 | 在 STATIC_ASSETS | 状态 |
|------|---------|------------------|------|
| `index.html` | ✅ | ✅ | OK |
| `sw.js` | ✅ | ❌ | 缺失 |
| `favicon.svg` | ✅ | ✅ | OK |
| `manifest.json` | ✅ | ✅ | OK |
| `all-styles.css` | ✅ | ✅ | OK |
| `v5-glass-3d.css` | ✅ | ✅ | OK |
| `clean-ui.css` | ✅ | ✅ | OK |
| `bg-premium.css` | ✅ | ✅ | OK |
| `menu-premium.css` | ✅ | ✅ | OK |
| `fx-effects.css` | ✅ | ✅ | OK |
| `ai-tutor.css` | ✅ | ✅ | OK |
| `certification.css` | ✅ | ✅ | OK |
| `disaster-sim.css` | ✅ | ✅ | OK |
| `real-cases.css` | ✅ | ❌ | **缺失** |
| `fix-click.css` | ✅ | ✅ | OK |
| `transitions.css` | ✅ | ✅ | OK |
| `accessibility.css` | ✅ | ✅ | OK |
| `wrong-book.css` | ✅ | ✅ | OK |
| `loading.css` | ✅ | ✅ | OK |
| `guide-enhance.css` | ✅ | ✅ | OK |
| `cert-enhance.css` | ✅ | ✅ | OK |
| `menu-enhance.css` | ✅ | ✅ | OK |
| `share.css` | ✅ | ✅ | OK |
| `i18n.css` | ✅ | ✅ | OK |
| `layout-fix.css` | ✅ | ✅ | OK |
| `ai-float.css` | ✅ | ✅ | OK |
| `ui-ultimate.css` | ✅ | ✅ | OK |
| `settings.css` | ✅ | ✅ | OK |
| `bg-themes.css` | ✅ | ✅ | OK |
| `game.js` | ✅ | ✅ | OK |
| `cards.js` | ✅ | ✅ | OK |
| `scenarios.js` | ✅ | ✅ | OK |
| `kit_data.js` | ✅ | ✅ | OK |
| `juice.js` | ✅ | ✅ | OK |
| `visual-fx.js` | ✅ | ✅ | OK |
| `bgm.js` | ✅ | ✅ | OK |
| `v10-interactions.js` | ✅ | ✅ | OK |
| `encyclopedia_extra.js` | ✅ | ✅ | OK |
| `encyclopedia_final.js` | ✅ | ✅ | OK |
| `bg-premium.js` | ✅ | ✅ | OK |
| `ui-polish.js` | ✅ | ✅ | OK |
| `tilt3d.js` | ✅ | ✅ | OK |
| `ai-tutor.js` | ✅ | ✅ | OK |
| `ai-tutor-llm.js` | ✅ | ✅ | OK |
| `ai-float.js` | ✅ | ✅ | OK |
| `certification.js` | ✅ | ✅ | OK |
| `disaster-sim.js` | ✅ | ✅ | OK |
| `real-cases.js` | ✅ | ✅ | OK |
| `sfx.js` | ✅ | ✅ | OK |
| `bgm-enhanced.js` | ✅ | ✅ | OK |
| `audio-integration.js` | ✅ | ✅ | OK |
| `accessibility.js` | ✅ | ✅ | OK |
| `performance.js` | ✅ | ✅ | OK |
| `wrong-book.js` | ✅ | ✅ | OK |
| `report.js` | ✅ | ✅ | OK |
| `voice.js` | ✅ | ✅ | OK |
| `guide-enhance.js` | ✅ | ✅ | OK |
| `cert-enhance.js` | ✅ | ✅ | OK |
| `disaster-particles.js` | ✅ | ✅ | OK |
| `menu-enhance.js` | ✅ | ✅ | OK |
| `share.js` | ✅ | ✅ | OK |
| `i18n.js` | ✅ | ✅ | OK |
| `liquid-glass.js` | ✅ | ✅ | OK |
| `bg-themes.js` | ✅ | ✅ (重复) | 重复 |
| `fix-click.js` | ✅ | ✅ (重复) | 重复 |
| `menu-manager.js` | ✅ | ✅ | OK |
| `loading.js` | ✅ | ❌ | **缺失** |
| `cache-clear.html` | ✅ | ❌ | 缺失（非核心） |

**缺失文件**：`real-cases.css`、`loading.js`  
**重复文件**：`bg-themes.js`（第69行）、`fix-click.js`（第70行）

### 1.5 index.html 中的 SW 注册
```js
navigator.serviceWorker.register('sw.js')
```
- ✅ 在 `load` 事件后注册，避免阻塞首屏
- ✅ 监听 `updatefound` 检测新版本
- ⚠️ 检测到新版本后仅 `console.log`，**无用户提示/自动刷新**

---

## 二、发现的问题（按优先级分类）

### 🔴 Critical（严重）

#### C1. 缓存 URL 不匹配 — 查询参数导致离线失效
**位置**: `sw.js` 第5-71行 + `index.html` 第482-508行

**问题描述**:  
`index.html` 中所有 CSS/JS 引用都带 `?v=50` 查询参数，例如：
```html
<link rel="stylesheet" href="all-styles.css?v=50">
<script src="fix-click.js?v=50" defer></script>
```

但 `sw.js` 的 `STATIC_ASSETS` 中缓存的是不带查询参数的原始 URL：
```js
'./all-styles.css',
'./fix-click.js'
```

浏览器视 `all-styles.css?v=50` 和 `all-styles.css` 为**不同 URL**。  
**离线时所有带 `?v=50` 的资源请求都无法命中缓存**，导致页面样式和脚本全部 404，**完全不可用**。

**影响**: 离线模式下页面完全崩溃。

---

#### C2. Network First 策略导致离线首屏体验极差
**位置**: `sw.js` 第104-134行

**问题描述**:  
当前 `fetch` 使用 **Network First** 策略：
```js
event.respondWith(
  fetch(request).then(...).catch(() => caches.match(request))
);
```

对于纯静态资源（CSS/JS），Network First 意味着：
1. 每次刷新都先走网络，延迟明显
2. 网络慢时页面加载时间显著增加
3. 弱网环境下频繁失败后才回退缓存

而项目注释第2行明确说目标是 "Cache First, Network Fallback"，**目标与实现背道而驰**。

**影响**: 离线或弱网环境下用户体验极差，缓存优势未发挥。

---

### 🟠 High（高）

#### H1. 注释与代码策略不一致
**位置**: `sw.js` 第2行 vs 第104行

```js
// 离线缓存策略：Cache First, Network Fallback   ← 第2行
// 拦截请求：Network First 策略（优先获取最新资源） ← 第104行
```

两行注释自相矛盾，导致维护者无法确定设计意图。

---

#### H2. 关键资源缺失导致离线功能不完整
**位置**: `sw.js` 第5-71行

- `real-cases.css` 存在但未被缓存 → 真实案例页面离线时无样式
- `loading.js` 存在但未被缓存 → 加载动画逻辑离线时可能异常

---

#### H3. 缓存状态码检查过于严格
**位置**: `sw.js` 第117行

```js
if (networkResponse && networkResponse.status === 200) {
```

问题：只缓存 `status === 200` 的响应，忽略了其他成功的 HTTP 状态：
- `204 No Content` — 某些 API 可能返回
- `301/302` — 重定向响应
- 304 Not Modified — 缓存刷新时常见

应该使用 `networkResponse.ok`（涵盖 200-299 范围）。

---

#### H4. 缓存更新未等待完成
**位置**: `sw.js` 第119-121行

```js
caches.open(CACHE_NAME).then(function(cache) {
  cache.put(request, responseClone);
});
```

`cache.put()` 没有返回或包装在 `event.waitUntil()` 中。如果用户快速关闭页面/切换标签，缓存写入可能中断，导致缓存不完整。

---

### 🟡 Medium（中）

#### M1. 新版本检测后无用户提示/自动刷新
**位置**: `index.html` 第2541-2548行

```js
if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
  console.log('[SW] 新版本可用，刷新页面后生效');
}
```

仅打印日志，**用户完全不知道有新版本**。建议增加：
- 页面顶部提示条
- 或自动 `window.location.reload()` 刷新

---

#### M2. activate 清理过于激进
**位置**: `sw.js` 第88-102行

```js
return name !== CACHE_NAME;  // 删除所有非当前缓存
```

如果用户在同一域名下访问了其他使用 Service Worker 的应用，其缓存也会被一并删除。建议增加前缀匹配：
```js
return name.startsWith('yingji-xiaodaren-') && name !== CACHE_NAME;
```

---

#### M3. 缓存失败时 `skipWaiting` 仍被调用
**位置**: `sw.js` 第75-85行

```js
return cache.addAll(STATIC_ASSETS);
}).then(function() {
  return self.skipWaiting();
}).catch(function(err) {
  console.log('[SW] 缓存失败...');
});
```

如果 `cache.addAll` 失败（如部分资源 404），`skipWaiting` 不会执行，但 `catch` 只打印日志，**没有重新抛出错误**。这可能导致 SW 处于"已安装但未激活"的悬停状态。

---

#### M4. 离线导航兜底可能返回 `undefined`
**位置**: `sw.js` 第128-130行

```js
if (request.mode === 'navigate') {
  return caches.match('./index.html');
}
```

如果 `./index.html` 也不在缓存中，`caches.match()` 返回 `undefined`，浏览器会显示空白页而非错误页。建议增加兜底：
```js
return caches.match('./index.html') || new Response('离线页面不可用', { status: 503 });
```

---

### 🟢 Low（低）

#### L1. CDN 资源离线不可用
**位置**: `index.html` 第109-110行、第526行

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Orbitron..." rel="stylesheet">
```

Google Fonts 在离线时无法加载，字体降级依赖 `@font-face` 的 `local()` 回退，这在 `index.html` 第529-533行已处理，属于可接受范围。

---

#### L2. `background sync` 事件为空实现
**位置**: `sw.js` 第137-141行

```js
self.addEventListener('sync', function(event) {
  if (event.tag === 'sync-data') {
    event.waitUntil(Promise.resolve());
  }
});
```

没有实际功能，建议移除或添加 TODO 注释，避免混淆。

---

#### L3. STATIC_ASSETS 包含重复项
**位置**: `sw.js` 第28行、第29行、第69行、第70行

- `bg-themes.js` 出现两次（第28行和第69行）
- `fix-click.js` 出现两次（第20行和第70行）

`cache.addAll` 对重复 URL 会尝试重复缓存，虽不会报错，但浪费时间。

---

## 三、修复建议

### 建议 1: 修正缓存 URL 匹配（Critical）

**方案 A（推荐）**: 在 `STATIC_ASSETS` 中增加带 `?v=50` 的版本，同时保留原始版本：

```js
const STATIC_ASSETS = [
  './',
  './index.html',
  './favicon.svg',
  './manifest.json',
  './all-styles.css',
  './all-styles.css?v=50',  // ← 增加
  // ... 每个资源都加带查询参数版本
];
```

**方案 B**: 在 `fetch` 处理中忽略查询参数进行匹配：

```js
// 在 fetch 事件中，对缓存匹配时去除查询参数
const cacheUrl = new URL(request.url);
cacheUrl.search = ''; // 去掉查询参数
caches.match(cacheUrl.toString())
```

> 推荐方案 B，更优雅，无需维护两份资源列表。

---

### 建议 2: 改为真正的 Cache First 策略（Critical）

```js
self.addEventListener('fetch', function(event) {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request).then(function(cachedResponse) {
      if (cachedResponse) {
        // 缓存命中，同时后台更新缓存（Stale-While-Revalidate）
        fetch(request).then(function(networkResponse) {
          if (networkResponse && networkResponse.ok) {
            caches.open(CACHE_NAME).then(function(cache) {
              cache.put(request, networkResponse.clone());
            });
          }
        }).catch(() => {}); // 静默失败
        return cachedResponse;
      }
      // 缓存未命中，走网络
      return fetch(request).then(function(networkResponse) {
        if (networkResponse && networkResponse.ok) {
          var responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(request, responseClone);
          });
        }
        return networkResponse;
      }).catch(function() {
        if (request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
```

这样实现：
- 离线时立即从缓存读取（Cache First）
- 有网络时后台静默更新缓存（Stale-While-Revalidate）
- 兼顾速度与新鲜度

---

### 建议 3: 补充缺失资源 + 去重

```js
const STATIC_ASSETS = [
  // ... 现有资源 ...
  './real-cases.css',    // ← 补充
  './loading.js',        // ← 补充
  // 移除重复的 './bg-themes.js' 和 './fix-click.js'
];
```

---

### 建议 4: 增强新版本提示

在 `index.html` 的 SW 注册段中：

```js
if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
  // 显示更新提示条
  var updateBar = document.createElement('div');
  updateBar.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:999999;background:#00d4ff;color:#000;padding:12px;text-align:center;font-weight:bold;cursor:pointer;';
  updateBar.textContent = '新版本可用，点击刷新页面';
  updateBar.onclick = function() { window.location.reload(); };
  document.body.appendChild(updateBar);
}
```

---

### 建议 5: 修正 activate 缓存清理范围

```js
cacheNames.filter(function(name) {
  return name.startsWith('yingji-xiaodaren-') && name !== CACHE_NAME;
})
```

---

### 建议 6: 修正状态码检查

```js
if (networkResponse && networkResponse.ok) {  // 替代 status === 200
```

---

### 建议 7: 确保缓存写入完成

```js
if (networkResponse && networkResponse.ok) {
  var responseClone = networkResponse.clone();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.put(request, responseClone);
    })
  );
}
```

---

## 四、总结

| 优先级 | 数量 | 主要问题 |
|--------|------|---------|
| 🔴 Critical | 2 | 缓存 URL 不匹配（离线崩溃）、Network First 策略错误 |
| 🟠 High | 4 | 注释不一致、资源缺失、状态码检查过严、缓存未等待 |
| 🟡 Medium | 4 | 无更新提示、清理过激进、安装失败处理不当、导航兜底缺失 |
| 🟢 Low | 3 | CDN 离线、空 sync 事件、资源重复 |

**最紧急修复项**：
1. 解决 `?v=50` 查询参数导致的缓存 URL 不匹配问题
2. 将 Network First 改为 Cache First（Stale-While-Revalidate）

这两项修复后，应用的离线可用性将有质的飞跃。
