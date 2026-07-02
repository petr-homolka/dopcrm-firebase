/* Doprovázení CRM – service worker (offline app shell)
   Strategie: stale-while-revalidate. Po první návštěvě běží i offline.
   Verzi cache zvedni při zásadní změně (jinak se runtime cache obnoví sama). */
const CACHE = 'dop-crm-v1';
const CORE = [
  'prehled.html','pestouni.html','deti.html','ostatni.html','kalendar.html',
  'ukoly.html','dokumenty.html','hub.html','nastaveni.html','login.html',
  'manifest.webmanifest','icon-192.png','icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE).catch(()=>{})).then(()=>self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return; // cizí origin (mapy, avataři) neřešíme
  e.respondWith(
    caches.open(CACHE).then(async cache => {
      const cached = await cache.match(req, { ignoreSearch: false });
      const network = fetch(req).then(res => {
        if (res && res.status === 200 && res.type === 'basic') cache.put(req, res.clone());
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
