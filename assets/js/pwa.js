(function () {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", async () => {
    try {
      const swUrl = new URL("../sw.js", window.location.href).toString();

      const reg = await navigator.serviceWorker.register(swUrl);
      console.log("✅ Service Worker registrado:", swUrl);

      reg.update().catch(() => {});

      reg.addEventListener("updatefound", () => {
        const installing = reg.installing;
        if (!installing) return;

        installing.addEventListener("statechange", () => {
          if (installing.state === "installed") {
            if (navigator.serviceWorker.controller) {
              console.log("🔄 Novo SW instalado, ativando...");
              installing.postMessage({ type: "SKIP_WAITING" });
            }
          }
        });
      });

      navigator.serviceWorker.addEventListener("controllerchange", () => {
        console.log("♻️ SW atualizado, recarregando...");
        window.location.reload();
      });
    } catch (e) {
      console.warn("⚠ Não foi possível registrar o Service Worker:", e);
    }
  });
})();
