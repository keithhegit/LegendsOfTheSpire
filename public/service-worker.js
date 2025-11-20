const CACHE_NAME = 'legends-spire-v0.8.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// 安装Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// 激活Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 拦截网络请求
self.addEventListener('fetch', (event) => {
  // 跳过非HTTP/HTTPS请求（如chrome-extension、data:等）
  const url = new URL(event.request.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return; // 直接返回，不处理
  }
  
  // 跳过跨域请求（避免CORS问题）
  if (url.origin !== self.location.origin && !url.href.startsWith('https://ddragon.leagueoflegends.com')) {
    return fetch(event.request); // 直接fetch，不缓存
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 如果在缓存中找到，返回缓存版本
        if (response) {
          return response;
        }
        // 否则从网络获取
        return fetch(event.request).then((response) => {
          // 检查响应是否有效
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          // 只缓存同源请求
          if (url.origin === self.location.origin) {
            // 克隆响应
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache).catch(err => {
                  console.log('Cache put failed:', err);
                });
              });
          }
          return response;
        });
      })
      .catch(() => {
        // 如果网络请求失败，直接fetch，不返回离线页面
        return fetch(event.request);
      })
  );
});

