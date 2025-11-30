// api certificados
const CERT_API = "http://localhost:8000/certificados";

// pegar idEvento pela url
function getEventoId() {
    const p = new URLSearchParams(location.search);
    return p.get("idEvento");
}

// emitir certificado
async function emitirCertificado(data) {
    const resp = await fetch(`${CERT_API}/gerar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    return resp.json();
}

// validar certificado
async function validarCertificado(codigo) {
    const resp = await fetch(`${CERT_API}/validar/${codigo}`);
    return resp.json();
}

// pegar código pela url
function getCodigoCertificado() {
    const p = new URLSearchParams(location.search);
    return p.get("codigo");
}

document.addEventListener("DOMContentLoaded", async () => {

    // tela emitir certificado
    if (location.pathname.includes("certificado.html")) {

        const user = obterUsuario();
        const eventoId = getEventoId();
        const input = document.getElementById("eventoId");
        const btn = document.getElementById("btnGerar");

        if (!user || !eventoId) {
            alert("Dados inválidos.");
            location.href = "home.html";
            return;
        }

        input.value = eventoId;

        btn.onclick = async () => {
            const r = await emitirCertificado({
                idEvento: eventoId,
                email: user.email
            });

            if (r?.codigo) {
                location.href = `certificado_resultado.html?codigo=${r.codigo}`;
            } else {
                alert(r?.mensagem ?? "Erro ao emitir certificado.");
            }
        };
    }

    // tela resultado certificado
    if (location.pathname.includes("certificado_resultado.html")) {

        const codigo = getCodigoCertificado();
        const box = document.getElementById("certInfo");
        const btnVoltar = document.getElementById("btnVoltar");

        if (!codigo) {
            box.innerHTML = "<p>Código inválido.</p>";
            return;
        }

        const data = await validarCertificado(codigo);

        if (!data?.valido) {
            box.innerHTML = `<p>Certificado inválido.</p><p>Código: ${codigo}</p>`;
            return;
        }

        box.innerHTML = `
            <h3>${data.participante}</h3>
            <p><strong>Evento:</strong> ${data.evento}</p>
            <p><strong>Data:</strong> ${data.dataEvento}</p>
            <p><strong>Código:</strong> ${codigo}</p>
            <p><strong>Status:</strong> VÁLIDO</p>
        `;

        btnVoltar.onclick = () => location.href = "minhas_inscricoes.html";
    }
});
