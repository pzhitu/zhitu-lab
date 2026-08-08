/* ==========================================================================
   Phycat Blog - Service Worker
   策略：安装时预缓存“外壳”（CSS/JS/主题/元数据）；
   页面网络优先、失败回退缓存；静态资源缓存优先、未命中再网络并缓存。
   ========================================================================== */
var CACHE = 'phycat-blog-v1';
var PRECACHE = [
  './index.html',
  './assets/site.css',
  './assets/app.js',
  './assets/site-meta.js',
  './assets/studio.css',
  './assets/studio.js',
  './assets/studio-static.js',
  './assets/search-index.js'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(PRECACHE); }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== location.origin) return;

  // 页面：网络优先，失败回退缓存
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
        return res;
      }).catch(function () {
        return caches.match(req).then(function (hit) { return hit || caches.match('./index.html'); });
      })
    );
    return;
  }

  // 静态资源：缓存优先，未命中再网络并缓存
  e.respondWith(
    caches.match(req).then(function (hit) {
      return hit || fetch(req).then(function (res) {
        if (res.ok) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      });
    })
  );
});
