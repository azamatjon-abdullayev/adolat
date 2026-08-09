const CACHE_NAME = "adolat-v2";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./sw.js",
    "./manifest.json"
];

// O'rnatish
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(FILES_TO_CACHE))
            .then(() => self.skipWaiting())
    );
});

// Eski cache'larni o'chirish
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            )
        ).then(() => self.clients.claim())
    );
});

// So'rovlar
self.addEventListener("fetch", event => {
    const request = event.request;

    // API so'rovlarini cache qilmaymiz
    if (
        request.url.includes("/api/") ||
        request.url.includes("onrender.com")
    ) {
        return;
    }

    event.respondWith(
        fetch(request)
            .catch(() => caches.match(request))
    );
});
