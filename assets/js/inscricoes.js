const INSCRICOES_API = "http://localhost:8082/eventos";

async function inscreverUsuario(eventoId, userEmail) {
    const resp = await fetch(`${INSCRICOES_API}/${eventoId}/inscrever`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail })
    });

    return resp.json();
}

async function carregarMinhasInscricoes(id) {
    const resp = await fetch(`${INSCRICOES_API}/inscricoes/${id}`);
    return resp.json();
}
