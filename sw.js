/* THUG 클랜 — 앱처럼 깔기 도우미. 화면 파일(쪽·그림·글꼴)만 기기에 저장해 두고, 기록(창고 요청)은 건드리지 않는다. */
const VER = 'thug-01e0f769e73b';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png'];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VER).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VER).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return; // 창고(Supabase) 요청은 그대로 통과
  const isPage = e.request.mode === 'navigate' || u.pathname.endsWith('/') || u.pathname.endsWith('.html');
  if (isPage) {
    // 쪽은 새것 먼저, 연결이 없으면 저장해 둔 것
    e.respondWith(fetch(e.request).then((r) => { const c = r.clone(); caches.open(VER).then((s) => s.put('./index.html', c)); return r; })
      .catch(() => caches.match('./index.html')));
    return;
  }
  // 그림·글꼴은 저장해 둔 것 먼저
  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request).then((r) => {
    if (r.ok) { const c = r.clone(); caches.open(VER).then((s) => s.put(e.request, c)); }
    return r;
  })));
});
