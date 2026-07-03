// ===== 应急小达人 Service Worker =====
// 离线缓存策略：Cache First, Network Fallback

const CACHE_NAME = 'yingji-xiaodaren-v86';
const STATIC_ASSETS = [
  './',
  './index.html',
  './favicon.svg',
  './manifest.json',
  './critical.css',
  './css-variables.css',
  './all-styles-v55.css',
  './settings.css',
  './optimizer-mobile.css',
  './animation-optimize.css',
  './js/core/utils.js',
  './js/core/utils-enhanced.js',
  './js/core/game-core.js',
  './js/core/performance-patch.js',
  './js/core/optimized/ErrorBoundary.js',
  './js/core/optimized/DOMCache.js',
  './js/core/optimized/EventDelegate.js',
  './cards.js',
  './scenarios.js',
  './kit_data.js',
  './game-engines.js',
  './game.js',
  './loading.js',
  './menu-manager.js',
  './juice.js',
  './visual-fx.js',
  './v10-interactions.js',
  './menu-enhance.js',
  './share.js',
  './i18n.js',
  './bg-themes.js',
  './liquid-glass.js',
  './optimizer-mobile.js',
  './encyclopedia_extra.js',
  './encyclopedia_final.js',
  './bg-premium.js',
  './ui-polish.js',
  './tilt3d.js',
  './sfx.js',
  './bgm-enhanced.js',
  './audio-integration.js',
  './ai-tutor-llm-v55.js',
  './ai-tutor-v55.js',
  './ai-float-v55.js',
  './certification.js',
  './cert-enhance.js',
  './disaster-sim.js',
  './disaster-particles.js',
  './real-cases.js',
  './wrong-book.js',
  './report.js',
  './voice.js',
  './guide-enhance.js',
  './accessibility.js',
  './performance.js',
  './patch-v75.js'
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

  // 缓存键保留查询参数（含 ?v=xx），使版本号真正生效、避免新旧版本混用同一缓存
  const cacheRequest = request;

  event.respondWith(
    caches.match(cacheRequest, { ignoreSearch: true }).then(function(cachedResponse) {
      var networkFetch = fetch(request).then(function(networkResponse) {
        if (networkResponse && networkResponse.ok) {
          var responseClone = networkResponse.clone();
          event.waitUntil(
            caches.open(CACHE_NAME).then(function(cache) {
              return cache.put(cacheRequest, responseClone);
            })
          );
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
          return caches.match('./index.html', { ignoreSearch: true });
        }
        // 非导航资源加载失败时返回空响应，避免页面崩溃
        return new Response('', { status: 200, headers: { 'Content-Type': 'text/plain' } });
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
