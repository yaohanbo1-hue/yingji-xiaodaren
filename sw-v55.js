// ===== 应急小达人 Service Worker =====
// 离线缓存策略：Cache First, Network Fallback

const CACHE_NAME = 'yingji-xiaodaren-v55';
const STATIC_ASSETS = [
  './',
  './index.html',
  './favicon.svg',
  './manifest.json',
  './all-styles-v55.css',
  './v5-glass-3d.css',
  './clean-ui.css',
  './bg-premium.css',
  './menu-premium.css',
  './fx-effects.css',
  './ai-tutor.css',
  './certification.css',
  './disaster-sim.css',
  './real-cases.css',
  './fix-click.css',
  './transitions.css',
  './accessibility.css',
  './wrong-book.css',
  './loading.css',
  './loading.js',
  './guide-enhance.css',
  './cert-enhance.css',
  './menu-enhance.css',
  './share.css',
  './i18n.css',
  './layout-fix.css',
  './ai-float.css',
  './ui-ultimate.css',
  './settings.css',
  './bg-themes.css',
  './game.js',
  './cards.js',
  './scenarios.js',
  './kit_data.js',
  './juice.js',
  './visual-fx.js',
  './bgm.js',
  './v10-interactions.js',
  './encyclopedia_extra.js',
  './encyclopedia_final.js',
  './bg-premium.js',
  './ui-polish.js',
  './tilt3d.js',
  './ai-tutor-v55.js',
  './ai-tutor-llm-v55.js',
  './ai-float-v55.js',
  './certification.js',
  './disaster-sim.js',
  './real-cases.js',
  './sfx.js',
  './bgm-enhanced.js',
  './audio-integration.js',
  './accessibility.js',
  './performance.js',
  './wrong-book.js',
  './report.js',
  './voice.js',
  './guide-enhance.js',
  './cert-enhance.js',
  './disaster-particles.js',
  './menu-enhance.js',
  './share.js',
  './i18n.js',
  './liquid-glass.js',
  './bg-themes.js',
  './fix-click.js',
  './menu-manager.js',
  './game-engines.js',
  './optimizer-mobile.css',
  './optimizer-mobile.js',
  './js/core/utils.js',
  './js/core/game-core.js'
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

  // 去除查询参数用于缓存匹配（index.html 中资源带 ?v=50）
  const cacheRequest = url.search ? new Request(url.pathname) : request;

  event.respondWith(
    caches.match(cacheRequest).then(function(cachedResponse) {
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
          return caches.match('./index.html');
        }
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
