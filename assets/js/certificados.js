// assets/js/certificados.js
// Integração com Certificates API (emitir e validar)

const CERT_API = `${CONFIG.CERTIFICATES_API}/certificados`;

// ----------------------------
// HEADER AUTENTICAÇÃO
// ----------------------------
function getCertHeaders() {
    const usuario = obterUsuario();
    const headers = { "Content-Type": "application/json" };

    if (usuario && usuario.token) {
        headers["Authorization"] = `Bearer ${usuario.token}`;
    }
    return headers;
}

// ----------------------------
// EMITIR CERTIFICADO (login necessário)
// espera que a API retorne { codigo, ... }
// ----------------------------
async function emitirCertificado(payload) {
    if (!exigirLogin()) return null;

    const r = await fetch(`${CERT_API}/gerar`, {
        method: "POST",
        headers: getCertHeaders(),
        body: JSON.stringify(payload)
    });

    if (!r.ok) {
        return null;
    }

    return r.json();
}

// ----------------------------
// VALIDAR CERTIFICADO (público)
// ----------------------------
async function validarCertificado(codigo) {
    const r = await fetch(`${CERT_API}/validar/${codigo}`);
    if (!r.ok) return null;
    return r.json();
}

// ----------------------------
// DOM: páginas relacionadas a certificados
// ----------------------------
document.addEventListener("DOMContentLoaded", () => {
    const path = location.pathname;

    // Emitir certificado (link a partir de "Minhas Inscrições")
    if (path.endsWith("certificado.html")) {
        if (!exigirLogin()) return;

        const usuario = obterUsuario();
        const idEvento = new URLSearchParams(location.search).get("idEvento");
        const inputEvento = document.getElementById("eventoId");
        const btnGerar = document.getElementById("btnGerar");

        if (inputEvento) inputEvento.value = idEvento ?? "";

        if (btnGerar) {
            btnGerar.onclick = async () => {
                const resp = await emitirCertificado({
                    idEvento,
                    email: usuario.email
                });

                if (!resp || !resp.codigo) {
                    alert("Erro ao gerar certificado.");
                    return;
                }

                window.location.href = `certificado_resultado.html?codigo=${resp.codigo}`;
            };
        }
    }

    // Tela de resultado do certificado
    if (path.endsWith("certificado_resultado.html")) {
        const codigo = new URLSearchParams(location.search).get("codigo");
        const box = document.getElementById("certInfo");

        if (!codigo) {
            if (box) box.innerHTML = "<p>Código de certificado não informado.</p>";
            return;
        }

        validarCertificado(codigo).then(data => {
            if (!data || data.status !== "valido") {
                box.innerHTML = "<p>Certificado inválido.</p>";
                return;
            }

            box.innerHTML = `
                <h3>${data.nome}</h3>
                <p><strong>Evento:</strong> ${data.evento}</p>
                <p><strong>Data de emissão:</strong> ${data.data_emissao}</p>
                <p><strong>Código:</strong> ${codigo}</p>
                <p><strong>Status:</strong> VÁLIDO</p>
            `;
        });
    }

    // Tela pública de validação manual
    if (path.endsWith("validar_certificado.html")) {
        const input = document.getElementById("codigo");
        const btn = document.getElementById("btnValidar");
        const div = document.getElementById("resultado");

        if (btn) {
            btn.onclick = async () => {
                const codigo = input.value.trim();
                if (!codigo) {
                    alert("Informe o código.");
                    return;
                }

                const data = await validarCertificado(codigo);

                if (!data || data.status !== "valido") {
                    div.innerHTML = "<p>Certificado inválido.</p>";
                    return;
                }

                div.innerHTML = `
                    <h3>${data.nome}</h3>
                    <p><strong>Evento:</strong> ${data.evento}</p>
                    <p><strong>Data:</strong> ${data.data_emissao}</p>
                    <p><strong>Status:</strong> VÁLIDO</p>
                `;
            };
        }
    }
});
