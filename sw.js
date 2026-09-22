
```
const SHELL = "mindloops-shell-v3";
const AUDIO = "mindloops-audio-v1";
const SHELL_FILES = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(SHELL_FILES)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== SHELL && k !== AUDIO).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;

  if (req.url.indexOf(".mp3") !== -1) {
    e.respondWith(
      caches.open(AUDIO).then(c => c.match(req)).then(hit => hit || fetch(req))
    );
    return;
  }

  e.respondWith(
    fetch(req)
      .then(res => {
        const copy = res.clone();
        caches.open(SHELL).then(c => c.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(req).then(hit => hit || caches.match("./index.html")))
  );
});
```
