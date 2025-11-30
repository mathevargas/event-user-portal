// URLS das APIs (ajustar depois quando estiverem na VM)
const AUTH_API = "http://localhost:8081";
const EVENTS_API = "http://localhost:8082";
const CERTIFICATES_API = "http://127.0.0.1:8000";

// Função padrão para requisições
async function apiRequest(url, method = "GET", body = null, auth = false) {
    const options = { method, headers: { "Content-Type": "application/json" } };

    if (body) options.body = JSON.stringify(body);

    // Token salvo no navegador
    const token = localStorage.getItem("token");

    if (auth && token) {
        options.headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, options);

    if (!response.ok) {
        throw new Error("Erro na requisição: " + response.status);
    }

    return await response.json();
}
