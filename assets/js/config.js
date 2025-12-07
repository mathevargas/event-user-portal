// assets/js/config.js
// OBJETO CORRETO QUE TODAS AS TELAS USAM

window.CONFIG = {
    AUTH_API: "http://localhost:8081",      // Auth API (Java)
    EVENTS_API: "http://localhost:8082",    // Events API (Java)
    CERTIFICATES_API: "http://localhost:8003", // Certificates API (FastAPI)
    EMAIL_API: "http://localhost:8004",     // Email API (FastAPI)
    GATE_API: "http://localhost:8080"       // Gate API (Java + SQLite)
};
