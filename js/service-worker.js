// service-worker.js
self.addEventListener('fetch', function (event) {
    event.respondWith(async function () {
        let headers = new Headers()
        headers.append("Cross-Origin-Opener-Policy", "same-origin");
        headers.append("Cross-Origin-Embedder-Policy", "require-corp");        
        return fetch(event.request, {headers: headers})
    }());
});

