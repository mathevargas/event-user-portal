const CACHE_NAME = "portal-eventos-v2";

const APP_SHELL = [
  "./",
  "./manifest.webmanifest",

  "./assets/css/style.css",

  "./assets/js/config.js",
  "./assets/js/auth.js",
  "./assets/js/security.js",
  "./assets/js/eventos.js",
  "./assets/js/certificados.js",
  "./assets/js/ui.js",
  "./assets/js/pwa.js",

  "./assets/js/offline_db.js",
  "./assets/js/portaria.js",

  "./pages/home.html",
  "./pages/login.html",
  "./pages/cadastro.html",
  "./pages/evento_detalhes.html",
  "./pages/minhas_inscricoes.html",
  "./pages/certificado.html",
  "./pages/certificado_resultado.html",
  "./pages/validar_certificado.html",
  "./pages/completar_cadastro.html",
  "./pages/portaria.html",
];

function isApiRequest(req) {
  try {
    const url = new URL(req.url);
    return ["8081", "8082", "8001", "8002"].includes(url.port);
  } catch {
    return false;
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== CACHE_NAME)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  if (isApiRequest(req)) {
    event.respondWith(fetch(req));
    return;
  }

  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() =>
        caches.match("./pages/home.html")
      )
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;

      return fetch(req).then((resp) => {
        const copy = resp.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        return resp;
      });
    })
  );
});
