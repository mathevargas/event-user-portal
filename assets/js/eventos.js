// CONFIG API
const EVENTS_API = "http://localhost:8082/eventos";

// GET LISTA DE EVENTOS
async function carregarEventos() {
    try {
        const resp = await fetch(`${EVENTS_API}`);
        if (!resp.ok) return [];
        return await resp.json();
    } catch (err) {
        return [];
    }
}

// GET EVENTO POR ID
async function carregarEventoPorId(id) {
    try {
        const resp = await fetch(`${EVENTS_API}/${id}`);
        if (!resp.ok) return null;
        return await resp.json();
    } catch (err) {
        return null;
    }
}

// POST INSCRIÇÃO
async function inscreverUsuario(eventoId, email) {
    try {
        const resp = await fetch(`${EVENTS_API}/${eventoId}/inscrever`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });
        return await resp.json();
    } catch (err) {
        return { sucesso: false, mensagem: "erro" };
    }
}

// GET MINHAS INSCRIÇÕES
async function carregarMinhasInscricoes(email) {
    try {
        const resp = await fetch(`${EVENTS_API}/inscricoes/${email}`);
        if (!resp.ok) return [];
        return await resp.json();
    } catch (err) {
        return [];
    }
}

// PEGAR ID PELA URL
function getEventoId() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

// HOME
async function renderHome() {
    if (!location.pathname.includes("home")) return;

    const box = document.getElementById("listaEventos");
    const eventos = await carregarEventos();

    if (!eventos.length) {
        box.innerHTML = "<p style='text-align:center;margin-top:30px;'>Nenhum evento disponível.</p>";
        return;
    }

    box.innerHTML = eventos.map(e => `
        <div class="event-card">
            <h3>${e.titulo}</h3>
            <p><strong>Data:</strong> ${e.dataHora}</p>
            <p><strong>Local:</strong> ${e.local}</p>
            <div class="event-actions">
                <a href="evento_detalhes.html?id=${e.id}" class="btn-outline">Detalhes</a>
            </div>
        </div>
    `).join("");
}

// DETALHES
async function renderEventoDetalhes() {
    if (!location.pathname.includes("evento_detalhes")) return;

    const eventoId = getEventoId();
    const box = document.getElementById("eventoCard");
    const btn = document.getElementById("btnInscrever");
    const usuario = obterUsuario();

    if (!eventoId) {
        box.innerHTML = "<p>Evento inválido.</p>";
        btn.style.display = "none";
        return;
    }

    const evento = await carregarEventoPorId(eventoId);

    if (!evento) {
        box.innerHTML = "<p>Erro ao carregar evento.</p>";
        btn.style.display = "none";
        return;
    }

    box.innerHTML = `
        <h3>${evento.titulo}</h3>
        <p><strong>Data:</strong> ${evento.dataHora}</p>
        <p><strong>Local:</strong> ${evento.local}</p>
        <p><strong>Descrição:</strong> ${evento.descricao ?? "-"}</p>
    `;

    btn.onclick = async () => {
        if (!usuario) {
            alert("Faça login");
            location.href = "login.html";
            return;
        }

        const r = await inscreverUsuario(eventoId, usuario.email);

        if (!r || r.sucesso === false) {
            alert(r.mensagem ?? "Erro ao inscrever.");
            return;
        }

        location.href = "minhas_inscricoes.html";
    };
}

// MINHAS INSCRIÇÕES
async function renderMinhasInscricoes() {
    if (!location.pathname.includes("minhas_inscricoes")) return;

    const usuario = obterUsuario();
    const box = document.getElementById("listaInscricoes");

    if (!usuario) {
        box.innerHTML = "<p>Faça login.</p>";
        return;
    }

    const lista = await carregarMinhasInscricoes(usuario.email);

    if (!lista || !lista.length) {
        box.innerHTML = "<p>Nenhuma inscrição.</p>";
        return;
    }

    box.innerHTML = lista.map(i => `
        <div class="event-card">
            <h3>${i.eventoTitulo}</h3>
            <p><strong>Data:</strong> ${i.dataEvento}</p>
            <p><strong>Status:</strong> ${i.status}</p>
            <div class="event-actions">
                ${i.status === "PRESENTE"
                    ? `<a href="certificado.html?idEvento=${i.idEvento}" class="btn-full">Certificado</a>`
                    : ""}
            </div>
        </div>
    `).join("");
}

// AUTO
document.addEventListener("DOMContentLoaded", () => {
    renderHome();
    renderEventoDetalhes();
    renderMinhasInscricoes();
});
