(function () {
  const defaults = {
    AUTH_API: "http://localhost:8081",
    EVENTS_API: "http://localhost:8082",
    CERTIFICATES_API: "http://localhost:8001",
    EMAIL_API: "http://localhost:8002"
  };

  let override = {};
  try {
    override = JSON.parse(localStorage.getItem("API_BASE_OVERRIDE") || "{}") || {};
  } catch {
    override = {};
  }

  window.CONFIG = { ...defaults, ...override };
})();
