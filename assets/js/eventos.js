// ======================================
// eventos.js — Eventos, inscrições, home
// ======================================

const EVENTS_API = `${CONFIG.EVENTS_API}/eventos`;

function getAuthHeaders(json = true) {
    const usuario = obterUsuario();
    const headers = {};

    if (json) headers["Content-Type"] = "application/json";
    if (usuario && usuario.token) {
        headers["Authorization"] = `Bearer ${usuario.token}`;
    }
    return headers;
}

// LISTAR EVENTOS
async function carregarEventos() {
    const r = await fetch(EVENTS_API);
    if (!r.ok) return [];
    return r.json();
}

// EVENTO POR ID
async function carregarEventoPorId(id) {
    const r = await fetch(`${EVENTS_API}/${id}`);
    if (!r.ok) return null;
    return r.json();
}

// INSCREVER
async function inscreverUsuario(eventoId, email) {
    if (!exigirLogin()) return null;
    const r = await fetch(`${EVENTS_API}/${eventoId}/inscrever`, {
        method: "POST",
        headers: getAuthHeaders(true),
        body: JSON.stringify({ email })
    });
    return r.json();
}

// CANCELAR INSCRIÇÃO
async function cancelarInscricao(eventoId, email) {
    const r = await fetch(`${EVENTS_API}/${eventoId}/cancelar?email=${email}`, {
        method: "DELETE",
        headers: getAuthHeaders(false)
    });
    return r.json();
}

// MINHAS INSCRIÇÕES
async function carregarMinhasInscricoes(email) {
    if (!exigirLogin()) return [];
    const r = await fetch(`${EVENTS_API}/inscricoes/${email}`, {
        headers: getAuthHeaders(false)
    });
    if (!r.ok) return [];
    return r.json();
}

// RENDER HOME
async function renderHome() {
    if (!location.pathname.endsWith("home.html")) return;

    const lista = document.getElementById("listaEventos");
    if (!lista) return;

    const eventos = await carregarEventos();

    if (!eventos.length) {
        lista.innerHTML = "<p style='text-align:center;margin-top:30px;'>Nenhum evento disponível.</p>";
        return;
    }

    lista.innerHTML = eventos.map(e => `
        <div class="event-card">
            <h3>${e.titulo}</h3>
            <p><strong>Data:</strong> ${new Date(e.data).toLocaleString()}</p>
            <p><strong>Local:</strong> ${e.local}</p>
            <div class="event-actions">
                <a href="evento_detalhes.html?id=${e.id}" class="btn-outline">Detalhes</a>
            </div>
        </div>
    `).join("");
}

// RENDER DETALHES
async function renderEventoDetalhes() {
    if (!location.pathname.includes("evento_detalhes")) return;

    const id = new URLSearchParams(location.search).get("id");
    const box = document.getElementById("eventoCard");
    const btnInscrever = document.getElementById("btnInscrever");
    const btnCancelar = document.getElementById("btnCancelar");

    const evento = await carregarEventoPorId(id);
    if (!evento) {
        box.innerHTML = "<p>Erro ao carregar evento.</p>";
        return;
    }

    box.innerHTML = `
        <h3>${evento.titulo}</h3>
        <p><strong>Data:</strong> ${new Date(evento.data).toLocaleString()}</p>
        <p><strong>Local:</strong> ${evento.local}</p>
        <p><strong>Descrição:</strong> ${evento.descricao ?? "-"}</p>
        <p><strong>Status:</strong> ${evento.status}</p>
    `;

    const usuario = obterUsuario();
    if (!usuario) {
        btnInscrever.style.display = "none";
        btnCancelar.style.display = "none";
        return;
    }

    const minhas = await carregarMinhasInscricoes(usuario.email);
    const ja = minhas.some(i => i.idEvento == id);

    btnInscrever.style.display = evento.status === "ATIVO" && !ja ? "block" : "none";
    btnCancelar.style.display = ja ? "block" : "none";

    btnInscrever.onclick = async () => {
        const r = await inscreverUsuario(id, usuario.email);
        alert(r.mensagem ?? "Inscrição realizada!");
        location.href = "minhas_inscricoes.html";
    };

    btnCancelar.onclick = async () => {
        if (!confirm("Deseja cancelar sua inscrição?")) return;
        const r = await cancelarInscricao(id, usuario.email);
        alert(r.mensagem ?? "Cancelado.");
        location.reload();
    };
}

// RENDER MINHAS INSCRIÇÕES
async function renderMinhasInscricoes() {
    if (!location.pathname.includes("minhas_inscricoes")) return;
    if (!exigirLogin()) return;

    const usuario = obterUsuario();
    const lista = await carregarMinhasInscricoes(usuario.email);
    const box = document.getElementById("listaInscricoes");

    if (!lista.length) {
        box.innerHTML = "<p style='text-align:center;'>Você ainda não tem inscrições.</p>";
        return;
    }

    box.innerHTML = lista.map(i => `
        <div class="event-card">
            <h3>${i.eventoTitulo}</h3>
            <p><strong>Data:</strong> ${new Date(i.dataEvento).toLocaleString()}</p>
            <p><strong>Status:</strong> ${i.status}</p>
            <div class="event-actions">
                ${i.status === "PRESENTE" ? `<a class="btn-full" href="certificado.html?idEvento=${i.idEvento}">Certificado</a>` : ""}
                <button class="btn-danger" onclick="cancelarInscricao('${i.idEvento}','${usuario.email}')">Cancelar</button>
            </div>
        </div>
    `).join("");
}

document.addEventListener("DOMContentLoaded", () => {
    renderHome();
    renderEventoDetalhes();
    renderMinhasInscricoes();
});
