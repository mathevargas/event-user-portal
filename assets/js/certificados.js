const CERT_API = `${CONFIG.CERTIFICATES_API}/certificados`;

function getCertHeaders() {
  const usuario = obterUsuario?.();
  const headers = { "Content-Type": "application/json" };

  if (usuario?.token) {
    const t = usuario.token.startsWith("Bearer ") ? usuario.token : `Bearer ${usuario.token}`;
    headers["Authorization"] = t;
  }
  return headers;
}

function extrairCodigoDoHeader(contentDisposition) {
  if (!contentDisposition) return null;

  const m = /certificado_([a-f0-9]{8,})\.pdf/i.exec(contentDisposition);
  if (m?.[1]) return m[1];

  const m2 = /filename="?([^"]+)"?/i.exec(contentDisposition);
  if (m2?.[1]) {
    const m3 = /certificado_([a-f0-9]{8,})\.pdf/i.exec(m2[1]);
    if (m3?.[1]) return m3[1];
  }

  return null;
}

function baixarPdfNoBrowser(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || "certificado.pdf";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

async function buscarNomeUsuarioPorEmail(email) {
  try {
    const headers = {};
    const usuario = obterUsuario?.();
    if (usuario?.token) headers["Authorization"] = usuario.token.startsWith("Bearer ") ? usuario.token : `Bearer ${usuario.token}`;

    const r = await fetch(
      `${CONFIG.AUTH_API}/usuarios/por-email?email=${encodeURIComponent(email)}&t=${Date.now()}`,
      { headers, cache: "no-store" }
    );
    if (!r.ok) return null;
    const u = await r.json();
    return (u?.nome || "").trim() || null;
  } catch {
    return null;
  }
}

async function buscarTituloEvento(idEvento) {
  try {
    const headers = {};
    const usuario = obterUsuario?.();
    if (usuario?.token) headers["Authorization"] = usuario.token.startsWith("Bearer ") ? usuario.token : `Bearer ${usuario.token}`;

    const r = await fetch(`${CONFIG.EVENTS_API}/eventos/${Number(idEvento)}?t=${Date.now()}`, {
      headers,
      cache: "no-store",
    });
    if (!r.ok) return null;
    const ev = await r.json();
    return (ev?.titulo || ev?.nome || "").trim() || null;
  } catch {
    return null;
  }
}

async function montarPayloadCertificado(idEvento, email) {
  const [nome, evento] = await Promise.all([
    buscarNomeUsuarioPorEmail(email),
    buscarTituloEvento(idEvento),
  ]);

  return {
    nome: nome || email,
    evento: evento || `Evento ${Number(idEvento)}`,
    idEvento: Number(idEvento),
    email,
  };
}

async function emitirCertificado(payload) {
  if (!exigirLogin()) return null;

  try {
    const r = await fetch(`${CERT_API}/gerar-pdf?t=${Date.now()}`, {
      method: "POST",
      headers: getCertHeaders(),
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!r.ok) {
      let msg = "";
      try {
        const j = await r.json();
        msg = j?.detail ? JSON.stringify(j.detail) : JSON.stringify(j);
      } catch {
        msg = await r.text().catch(() => "");
      }
      console.error("❌ Erro emitirCertificado:", r.status, msg);
      return { ok: false, status: r.status, erro: msg };
    }

    const cd = r.headers.get("content-disposition") || r.headers.get("Content-Disposition");
    const codigoHeader = extrairCodigoDoHeader(cd);

    const codigoX = r.headers.get("x-certificado-codigo") || r.headers.get("X-Certificado-Codigo");

    const ct = (r.headers.get("content-type") || "").toLowerCase();
    if (ct.includes("application/pdf")) {
      const blob = await r.blob();
      const filename = cd ? (cd.match(/filename="?([^"]+)"?/i)?.[1] || "") : "";
      const codigo = codigoX || codigoHeader || null;

      baixarPdfNoBrowser(blob, filename || (codigo ? `certificado_${codigo}.pdf` : "certificado.pdf"));
      return { ok: true, codigo };
    }

    const txt = await r.text().catch(() => "");
    try {
      const j = JSON.parse(txt);
      return { ok: true, codigo: j?.codigo || codigoX || codigoHeader || null };
    } catch {
      return { ok: true, codigo: codigoX || codigoHeader || null };
    }
  } catch (e) {
    console.error("❌ Erro emitirCertificado:", e);
    return null;
  }
}

async function validarCertificado(codigo) {
  try {
    const r = await fetch(`${CERT_API}/validar/${codigo}?t=${Date.now()}`, { cache: "no-store" });
    return r.ok ? await r.json() : null;
  } catch {
    return null;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const path = location.pathname;

  if (path.endsWith("certificado.html")) {
    if (!exigirLogin()) return;

    const usuario = obterUsuario();
    const idEvento = new URLSearchParams(location.search).get("idEvento");
    const inputEvento = document.getElementById("eventoId");
    const btnGerar = document.getElementById("btnGerar");

    if (inputEvento) inputEvento.value = idEvento ?? "";

    if (btnGerar) {
      btnGerar.onclick = async () => {
        if (!idEvento) {
          alert("Evento inválido!");
          return;
        }

        const payload = await montarPayloadCertificado(idEvento, usuario.email);

        const resp = await emitirCertificado(payload);

        if (!resp || resp.ok !== true) {
          alert("Erro ao gerar certificado! Veja o console.");
          return;
        }

        if (!resp.codigo) {
          alert("PDF gerado e baixado, mas não consegui obter o código do certificado (header não veio).");
          return;
        }

        window.location.href = `certificado_resultado.html?codigo=${resp.codigo}`;
      };
    }
  }

  if (path.endsWith("certificado_resultado.html")) {
    const codigo = new URLSearchParams(location.search).get("codigo");
    const box = document.getElementById("certInfo");

    if (!codigo) {
      if (box) box.innerHTML = "<p>Código de certificado não informado.</p>";
      return;
    }

    validarCertificado(codigo).then((data) => {
      if (!box) return;

      if (!data || data.status !== "valido") {
        box.innerHTML = "<p>Certificado inválido.</p>";
        return;
      }

      box.innerHTML = `
        <h3>${data.nome}</h3>
        <p><strong>Evento:</strong> ${data.evento}</p>
        <p><strong>Data de emissão:</strong> ${data.data_emissao}</p>
        <p><strong>Código:</strong> ${codigo}</p>
        <p><strong>Status:</strong> VÁLIDO ✔️</p>
      `;
    });
  }

  if (path.endsWith("validar_certificado.html")) {
    const input = document.getElementById("codigo");
    const btn = document.getElementById("btnValidar");
    const div = document.getElementById("resultado");

    if (btn) {
      btn.onclick = async () => {
        const codigo = (input?.value || "").trim();
        if (!codigo) {
          alert("Informe o código.");
          return;
        }

        const data = await validarCertificado(codigo);

        if (!div) return;

        if (!data || data.status !== "valido") {
          div.innerHTML = "<p>❌ Certificado inválido.</p>";
          return;
        }

        div.innerHTML = `
          <h3>${data.nome}</h3>
          <p><strong>Evento:</strong> ${data.evento}</p>
          <p><strong>Data:</strong> ${data.data_emissao}</p>
          <p><strong>Status:</strong> ✔️ VÁLIDO</p>
        `;
      };
    }
  }
});
