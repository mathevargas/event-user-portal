// --- EVENTS API ---
const INSCRICOES_API = "http://localhost:8082/eventos";

// Inscrever usuário em evento
async function inscreverUsuario(eventoId, userEmail) {
    const resp = await fetch(`${INSCRICOES_API}/${eventoId}/inscrever`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail })
    });

    return resp.json();
}

// Buscar lista de inscrições do usuário
async function carregarMinhasInscricoes(email) {
    const resp = await fetch(`${INSCRICOES_API}/inscricoes/${email}`);
    return resp.json();
}
