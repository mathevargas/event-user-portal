CONFIG.AUTH_API
CONFIG.EVENTS_API
CONFIG.CERTIFICATES_API

async function apiRequest(url, method = "GET", body = null, auth = false) {
    const options = { method, headers: { "Content-Type": "application/json" } };

    if (body) options.body = JSON.stringify(body);

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
