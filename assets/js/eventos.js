const EVENTS_API = CONFIG.EVENTS_API;

console.log("📌 EVENTS_API = ", EVENTS_API);

function upper(v) {
  return String(v || "").trim().toUpperCase();
}

function podeCancelarInscricao(insc) {
  const st = upper(insc?.status);
  return !!insc && st !== "CANCELADO" && st !== "PRESENTE";
}

function podeInscrever(evento, insc) {
  const evSt = upper(evento?.status);  
  const inSt = upper(insc?.status);     
  if (evSt !== "ATIVO") return false;
  return !insc || inSt === "CANCELADO";
}

function withBust(url) {
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}t=${Date.now()}`;
}

function getAuthHeaders(json = true) {
  const usuario = obterUsuario?.();
  const headers = {};
  if (json) headers["Content-Type"] = "application/json";
  if (usuario?.token) headers["Authorization"] = `Bearer ${usuario.token}`;
  return headers;
}

async function fetchJsonRaw(url, options = {}) {
  const r = await fetch(withBust(url), {
    cache: "no-store",
    ...options
  });

  const raw = await r.text().catch(() => "");
  let data = null;
  if (raw) {
    try { data = JSON.parse(raw); } catch { data = null; }
  }
  return { ok: r.ok, status: r.status, raw, data };
}

async function carregarEventos() {
  console.log("🔄 Carregando eventos...");
  console.log("🌐 GET:", `${EVENTS_API}/eventos`);

  try {
    const resp = await fetchJsonRaw(`${EVENTS_API}/eventos`);
    console.log("📥 Status carregarEventos:", resp.status);
    console.log("📥 RAW /eventos =", resp.raw);

    const data = resp.ok && Array.isArray(resp.data) ? resp.data : [];
    console.log("📦 Eventos recebidos:", data);
    return data;
  } catch (e) {
    console.error("❌ Erro ao carregar eventos:", e);
    return [];
  }
}

async function carregarEventoPorId(id) {
  console.log(`🔍 Carregando evento ID=${id}`);

  try {
    const resp = await fetchJsonRaw(`${EVENTS_API}/eventos/${id}`);
    console.log("📥 Status carregarEventoPorId:", resp.status);

    if (!resp.ok) {
      console.warn("⚠️ Evento não encontrado");
      return null;
    }

    console.log("📦 Evento:", resp.data);
    return resp.data;
  } catch (e) {
    console.error("❌ Erro ao buscar evento:", e);
    return null;
  }
}

async function inscreverUsuario(eventoId) {
  console.log("🚀 Inscrevendo no evento", eventoId);

  if (!exigirLogin?.()) return null;

  const usuario = obterUsuario();
  console.log("👤 Usuario logado:", usuario);

  try {
    const r = await fetch(withBust(`${EVENTS_API}/inscricoes`), {
      method: "POST",
      headers: getAuthHeaders(true),
      body: JSON.stringify({
        eventoId: Number(eventoId),
        usuarioId: Number(usuario.id),
      }),
      cache: "no-store",
    });

    console.log("📥 Status inscrever:", r.status);

    const raw = await r.text().catch(() => "");
    let data = {};
    try { data = raw ? JSON.parse(raw) : {}; } catch { data = {}; }

    console.log("📥 RAW inscrever =", raw);
    console.log("📦 Resposta inscrever:", data);

    return { ok: r.ok, status: r.status, data };
  } catch (e) {
    console.error("❌ Erro ao inscrever:", e);
    return null;
  }
}

async function cancelarInscricao(idInscricao) {
  console.log("🛑 Cancelando inscrição", idInscricao);

  try {
    const r = await fetch(withBust(`${EVENTS_API}/inscricoes/${idInscricao}`), {
      method: "DELETE",
      headers: getAuthHeaders(false),
      cache: "no-store",
    });
    console.log("📥 Status cancelar:", r.status);
    return r.ok;
  } catch (e) {
    console.error("❌ Erro ao cancelar inscrição:", e);
    return false;
  }
}

async function carregarMinhasInscricoes(idUsuario) {
  console.log("📌 Buscando inscrições do usuario:", idUsuario);

  try {
    const resp = await fetchJsonRaw(`${EVENTS_API}/inscricoes/usuario/${idUsuario}`, {
      headers: getAuthHeaders(false),
    });

    console.log("📥 Status minhas inscrições:", resp.status);
    console.log("📥 RAW minhas inscrições =", resp.raw);

    const data = resp.ok && Array.isArray(resp.data) ? resp.data : [];
    console.log("📦 Inscrições recebidas:", data);
    return data;
  } catch (e) {
    console.error("❌ Erro ao buscar minhas inscrições:", e);
    return [];
  }
}

async function renderHome() {
  const lista = document.getElementById("listaEventos");
  if (!lista) return;

  console.log("🏠 Renderizando HOME...");

  const eventos = await carregarEventos();

  if (!eventos.length) {
    lista.innerHTML = "<p style='text-align:center;margin-top:30px;'>Nenhum evento disponível.</p>";
    return;
  }

  lista.innerHTML = eventos.map(e => `
    <div class="event-card">
      <h3>${e.titulo}</h3>
      <p><strong>ID:</strong> ${e.id}</p>
      <p><strong>Data:</strong> ${new Date(e.data).toLocaleString()}</p>
      <p><strong>Status:</strong> ${e.status}</p>
      <div class="event-actions">
        <a href="evento_detalhes.html?id=${e.id}" class="btn-outline">Ver Detalhes</a>
      </div>
    </div>
  `).join("");
}

async function renderEventoDetalhes() {
  if (!location.pathname.includes("evento_detalhes.html")) return;

  console.log("📄 Render detalhes do evento...");

  const id = new URLSearchParams(location.search).get("id");
  console.log("🔍 ID do evento:", id);

  const box = document.getElementById("eventoCard");
  const btnInscrever = document.getElementById("btnInscrever");
  const btnCancelar = document.getElementById("btnCancelar");

  if (btnCancelar) btnCancelar.style.display = "none"; // nunca no detalhe

  const usuario = obterUsuario();
  console.log("👤 Usuario detectado:", usuario);

  const evento = await carregarEventoPorId(id);
  if (!evento) {
    if (box) box.innerHTML = "<p>Erro ao carregar evento.</p>";
    return;
  }

  if (box) {
    box.innerHTML = `
      <h3>${evento.titulo}</h3>
      <p><strong>ID:</strong> ${evento.id}</p>
      <p><strong>Data:</strong> ${new Date(evento.data).toLocaleString()}</p>
      <p><strong>Local:</strong> ${evento.local}</p>
      <p><strong>Descrição:</strong> ${evento.descricao ?? "-"}</p>
      <p><strong>Status:</strong> ${evento.status}</p>
    `;
  }

  if (!usuario) {
    if (btnInscrever) btnInscrever.style.display = "none";
    return;
  }

  const minhas = await carregarMinhasInscricoes(usuario.id);
  const inscricao = minhas.find(i => String(i.eventoId) === String(id));
  console.log("📌 Inscrição encontrada:", inscricao);

  if (btnInscrever) btnInscrever.style.display = podeInscrever(evento, inscricao) ? "block" : "none";

  if (btnInscrever) {
    btnInscrever.onclick = async () => {
      const resp = await inscreverUsuario(id);
      if (!resp) return alert("Erro ao inscrever. Veja o console.");
      if (!resp.ok) return alert(resp.data?.mensagem || resp.data?.detail || "Falha ao inscrever.");

      alert(resp.data?.mensagem || "Inscrição realizada!");
      window.location.href = `minhas_inscricoes.html?t=${Date.now()}`;
    };
  }
}

async function renderMinhasInscricoes() {
  if (!location.pathname.includes("minhas_inscricoes.html")) return;

  console.log("📃 Render Minhas Inscrições...");

  if (!exigirLogin?.()) return;

  const usuario = obterUsuario();
  const lista = await carregarMinhasInscricoes(usuario.id);

  const box = document.getElementById("listaInscricoes");
  if (!box) return;

  if (!lista.length) {
    box.innerHTML = "<p style='text-align:center;'>Você ainda não tem inscrições.</p>";
    return;
  }

  const eventos = await carregarEventos();

  box.innerHTML = lista.map(i => {
    const evento = eventos.find(e => e.id == i.eventoId);
    const st = upper(i.status);

    const btnCert = (st === "PRESENTE")
      ? `<a class="btn-full" href="certificado.html?idEvento=${i.eventoId}">Certificado</a>`
      : "";

    const btnCancel = podeCancelarInscricao(i)
      ? `<button class="btn-danger" onclick="handleCancelarInscricao('${i.id}')">Cancelar</button>`
      : "";

    return `
      <div class="event-card">
        <h3>${evento?.titulo ?? "Evento não encontrado"}</h3>
        <p><strong>ID:</strong> ${i.eventoId}</p>
        <p><strong>Data:</strong> ${evento ? new Date(evento.data).toLocaleString() : "-"}</p>
        <p><strong>Status:</strong> ${st}</p>
        <div class="event-actions">
          ${btnCert}
          ${btnCancel}
        </div>
      </div>
    `;
  }).join("");
}

async function handleCancelarInscricao(idInscricao) {
  if (!confirm("Deseja cancelar sua inscrição?")) return;

  const ok = await cancelarInscricao(idInscricao);
  if (!ok) return alert("Erro ao cancelar a inscrição.");

  alert("Inscrição cancelada!");
  window.location.href = `minhas_inscricoes.html?t=${Date.now()}`;
}

document.addEventListener("DOMContentLoaded", () => {
  try { if (typeof atualizarNavbar === "function") atualizarNavbar(); } catch {}

  renderHome();
  renderEventoDetalhes();
  renderMinhasInscricoes();
});
