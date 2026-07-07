// ===== 应急小达人 Service Worker =====
// 离线缓存策略：Cache First, Network Fallback

const CACHE_NAME = 'yingji-xiaodaren-v109';
const STATIC_ASSETS = [
  './',
  './index.html',
  './favicon.svg',
  './manifest.json',
  './critical.css',
  './css/all.min.css',
  './js/app.min.js'
];

// 安装：缓存核心资源（容错：任一资源失败不影响整体）
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return Promise.all(
        STATIC_ASSETS.map(function(url) {
          return cache.add(url).catch(function(err) {
            console.log('[SW] 跳过缓存失败:', url);
          });
        })
      );
    }).then(function() {
      return self.skipWaiting();
    }).catch(function(err) {
      console.log('[SW] 安装失败:', err);
    })
  );
});

// 激活：清理旧缓存
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(name) {
          return name !== CACHE_NAME;
        }).map(function(name) {
          return caches.delete(name);
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// 拦截请求：Cache First (Stale-While-Revalidate) 策略
self.addEventListener('fetch', function(event) {
  const request = event.request;
  
  // 只处理 GET 请求
  if (request.method !== 'GET') return;
  
  // 跳过跨域和第三方请求
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // 缓存键保留查询参数（含 ?v=xx），使版本号真正生效、避免新旧版本混用同一缓存。
  // 注意：必须保留 ?v=xx（即不使用 ignoreSearch），否则版本号失效、旧缓存（含可能截断的
  // 旧 bundle）会被永久服务，导致 "Unexpected end of input" 这类解析错误。
  const cacheRequest = request;

  event.respondWith(
    // 关键：只在本版本缓存（CACHE_NAME）内查找/写入，绝不跨缓存搜索。
    // 旧版本缓存（如 v91）即使残留被截断的 bundle，也绝不会被服务，彻底杜绝
    // "Unexpected end of input" 这类因旧坏缓存导致的解析错误。
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.match(cacheRequest).then(function(cachedResponse) {
        var networkFetch = fetch(request).then(function(networkResponse) {
          if (networkResponse && networkResponse.ok) {
            cache.put(cacheRequest, networkResponse.clone());
          }
          return networkResponse;
        });

        // 缓存优先：有缓存先返回缓存，后台静默更新
        if (cachedResponse) {
          event.waitUntil(networkFetch.catch(function() {}));
          return cachedResponse;
        }

        // 无缓存时等待网络
        return networkFetch.catch(function() {
          if (request.mode === 'navigate') {
            return cache.match('./index.html');
          }
          // 非导航资源加载失败时返回空响应，避免页面崩溃
          return new Response('', { status: 200, headers: { 'Content-Type': 'text/plain' } });
        });
      });
    })
  );
});

// 后台同步（可选）
self.addEventListener('sync', function(event) {
  if (event.tag === 'sync-data') {
    event.waitUntil(Promise.resolve());
  }
});
