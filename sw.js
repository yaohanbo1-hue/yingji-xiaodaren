// ===== 应急小达人 Service Worker =====
// 离线缓存策略：Cache First, Network Fallback

const CACHE_NAME = 'yingji-xiaodaren-v2';
const STATIC_ASSETS = [
  './',
  './index.html',
  './favicon.svg',
  './manifest.json',
  './all-styles.css',
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
  './ai-tutor.js',
  './ai-tutor-llm.js',
  './ai-float.js',
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
  './menu-manager.js'
];

// 安装：缓存核心资源
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(STATIC_ASSETS);
    }).then(function() {
      return self.skipWaiting();
    }).catch(function(err) {
      console.log('[SW] 缓存失败（部分资源可能不存在）:', err);
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

// 拦截请求：Network First 策略（优先获取最新资源）
self.addEventListener('fetch', function(event) {
  const request = event.request;
  
  // 只处理 GET 请求
  if (request.method !== 'GET') return;
  
  // 跳过跨域和第三方请求
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(request).then(function(networkResponse) {
      if (networkResponse && networkResponse.status === 200) {
        var responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(request, responseClone);
        });
      }
      return networkResponse;
    }).catch(function() {
      return caches.match(request).then(function(response) {
        if (response) return response;
        // 离线且无缓存时返回离线页面
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
