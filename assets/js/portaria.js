async function portariaInit() {
  atualizarStatusRede();
  window.addEventListener("online", atualizarStatusRede);
  window.addEventListener("offline", atualizarStatusRede);

  await carregarEventosParaSelects();
  await recarregarSelectsParticipantes();
  await renderPendencias();

  try {
    if (navigator.onLine && typeof exigirPorteiro === "function" && exigirPorteiro()) {
      const u = obterUsuario?.();
      if (u?.token) {
        await baixarUsuariosServidor(u.token);
        await recarregarSelectsParticipantes();
      }
    }
  } catch {}

  const btnAddParticipante = document.getElementById("btnAddParticipante");
  const btnAddInscricao = document.getElementById("btnAddInscricao");
  const btnAddPresenca = document.getElementById("btnAddPresenca");
  const btnSync = document.getElementById("btnSync");

  if (btnAddParticipante) btnAddParticipante.onclick = salvarParticipanteOffline;
  if (btnAddInscricao) btnAddInscricao.onclick = salvarInscricaoOffline;
  if (btnAddPresenca) btnAddPresenca.onclick = salvarPresencaOffline;
  if (btnSync) btnSync.onclick = syncTudo;
}

function atualizarStatusRede() {
  const el = document.getElementById("statusRede");
  if (!el) return;
  el.innerHTML = navigator.onLine
    ? "🟢 Online — pode sincronizar"
    : "🔴 Offline — registrando em cache";
}

async function carregarEventosParaSelects() {
  let eventos = [];
  try {
    if (navigator.onLine) {
      const r = await fetch(`${CONFIG.EVENTS_API}/eventos?t=${Date.now()}`, { cache: "no-store" });
      if (r.ok) eventos = await r.json();

      for (const ev of eventos) {
        try {
          await dbPut("eventos_cache", {
            id: ev.id,
            titulo: ev.titulo,
            data: ev.data ?? null,
            status: ev.status ?? null
          });
        } catch {}
      }
    }
  } catch {}

  if (!eventos.length) {
    try { eventos = await dbGetAll("eventos_cache"); } catch { eventos = []; }
  }

  const s1 = document.getElementById("selEvento");
  const s2 = document.getElementById("selEvento2");
  if (!s1 || !s2) return;

  const opts = (eventos || [])
    .map(ev => `<option value="${ev.id}">${ev.titulo ?? ("Evento " + ev.id)}</option>`)
    .join("");

  s1.innerHTML = opts;
  s2.innerHTML = opts;
}

async function recarregarSelectsParticipantes() {
  let participantes = [];
  try { participantes = await dbGetAll("participantes"); } catch { participantes = []; }

  participantes.sort((a, b) =>
    ((a.nome || a.email || "")).localeCompare((b.nome || b.email || ""), "pt-BR")
  );

  const sel1 = document.getElementById("selParticipante");
  const sel2 = document.getElementById("selParticipante2");

  const opts = participantes
    .map(p => `<option value="${p.localId}">${(p.nome && p.nome.trim()) ? p.nome : "(sem nome)"} — ${p.email}</option>`)
    .join("");

  if (sel1) sel1.innerHTML = opts;
  if (sel2) sel2.innerHTML = opts;
}

async function salvarParticipanteOffline() {
  const nome = document.getElementById("p_nome").value.trim();
  const email = document.getElementById("p_email").value.trim();

  if (!email) {
    alert("E-mail é obrigatório");
    return;
  }

  const existente = await dbGetByIndex("participantes", "email", email).catch(() => null);
  if (existente) {
    alert("Esse e-mail já está salvo offline.");
    return;
  }

  const localId = uuidv4();

  await dbPut("participantes", {
    localId,
    nome: nome || "",
    email,
    servidorId: null,
    criadoEm: Date.now()
  });

  await dbPut("pendencias", {
    id: uuidv4(),
    tipo: "usuario",
    localUsuarioId: localId,
    payload: { nome: nome || "", email },
    criadoEm: Date.now()
  });

  document.getElementById("p_nome").value = "";
  document.getElementById("p_email").value = "";

  await recarregarSelectsParticipantes();
  await renderPendencias();
  alert("✅ Cadastro salvo offline.");
}

async function salvarInscricaoOffline() {
  const localUsuarioId = document.getElementById("selParticipante").value;
  const eventoId = Number(document.getElementById("selEvento").value);

  if (!localUsuarioId || !eventoId) {
    alert("Selecione participante e evento");
    return;
  }

  await dbPut("pendencias", {
    id: uuidv4(),
    tipo: "inscricao",
    localUsuarioId,
    payload: { eventoId },
    criadoEm: Date.now()
  });

  await renderPendencias();
  alert("✅ Inscrição salva offline.");
}

async function salvarPresencaOffline() {
  const localUsuarioId = document.getElementById("selParticipante2").value;
  const eventoId = Number(document.getElementById("selEvento2").value);

  if (!localUsuarioId || !eventoId) {
    alert("Selecione participante e evento");
    return;
  }

  await dbPut("pendencias", {
    id: uuidv4(),
    tipo: "presenca",
    localUsuarioId,
    payload: { eventoId },
    criadoEm: Date.now()
  });

  await renderPendencias();
  alert("✅ Presença salva offline.");
}

async function renderPendencias() {
  const box = document.getElementById("pendenciasBox");
  if (!box) return;

  const pend = await dbGetAll("pendencias").catch(() => []);
  if (!pend.length) {
    box.innerHTML = "<p>Nenhuma pendência 🎉</p>";
    return;
  }

  const linhas = pend
    .sort((a, b) => (a.criadoEm || 0) - (b.criadoEm || 0))
    .map(p => `<div style="padding:6px 0;border-bottom:1px solid #eee;">
      <strong>${p.tipo}</strong> — ${new Date(p.criadoEm).toLocaleString()}
    </div>`)
    .join("");

  box.innerHTML = `<p>Total pendente: <strong>${pend.length}</strong></p>${linhas}`;
}

async function baixarUsuariosServidor(token) {
  const bearer = token?.startsWith("Bearer ") ? token : `Bearer ${token}`;

  const url = `${CONFIG.AUTH_API}/usuarios?t=${Date.now()}`;

  try {
    const r = await fetch(url, {
      method: "GET",
      headers: { "Authorization": bearer },
      cache: "no-store"
    });

    if (r.status === 404 || r.status === 405) {
      console.warn("⚠ AUTH não tem GET /usuarios (listagem). Precisa criar esse endpoint no backend.");
      return;
    }

    if (!r.ok) {
      const txt = await r.text().catch(() => "");
      console.warn("⚠ Falha ao puxar usuários do servidor:", r.status, txt);
      return;
    }

    const lista = await r.json().catch(() => null);
    if (!Array.isArray(lista)) {
      console.warn("⚠ Resposta inesperada em GET /usuarios (não é array).");
      return;
    }

    for (const u of lista) {
      const email = (u?.email || "").trim();
      if (!email) continue;

      const nome = (u?.nome || "").trim();
      const idServidor = u?.id ?? u?.usuarioId ?? null;

      const existente = await dbGetByIndex("participantes", "email", email).catch(() => null);
      if (existente) {
        if (idServidor != null) existente.servidorId = idServidor;
        if (nome) existente.nome = nome;
        await dbPut("participantes", existente).catch(() => {});
      } else {
        await dbPut("participantes", {
          localId: uuidv4(),
          nome: nome || "",
          email,
          servidorId: idServidor ?? null,
          criadoEm: Date.now()
        }).catch(() => {});
      }
    }
  } catch (e) {
    console.warn("⚠ Erro ao puxar usuários do servidor:", e);
  }
}

async function syncTudo() {
  if (!navigator.onLine) {
    alert("Sem internet. Ligue a rede para sincronizar.");
    return;
  }

  if (!exigirPorteiro()) return;

  const usuarioSessao = obterUsuario();
  const token = usuarioSessao?.token;
  if (!token) {
    alert("Sem token. Faça login novamente.");
    return;
  }

  await baixarUsuariosServidor(token);
  await recarregarSelectsParticipantes();

  const pend = await dbGetAll("pendencias").catch(() => []);
  const pendUsuarios = pend.filter(p => p.tipo === "usuario");

  if (pendUsuarios.length) {
    const payload = pendUsuarios.map(p => p.payload);

    const r = await fetch(`${CONFIG.AUTH_API}/usuarios/offline/lote?t=${Date.now()}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token.startsWith("Bearer ") ? token : `Bearer ${token}`
      },
      body: JSON.stringify(payload),
      cache: "no-store"
    });

    if (!r.ok) {
      const t = await r.text().catch(() => "");
      alert("Falha ao sincronizar usuários: " + t);
      return;
    }

    const criados = await r.json(); 
    for (const u of criados) {
      const p = await dbGetByIndex("participantes", "email", u.email).catch(() => null);
      if (p) {
        p.servidorId = u.id;
        if (u.nome) p.nome = u.nome;
        await dbPut("participantes", p).catch(() => {});
      }
    }

    for (const p of pendUsuarios) {
      await dbDelete("pendencias", p.id).catch(() => {});
    }
  }

  const participantes = await dbGetAll("participantes").catch(() => []);
  const byLocal = {};
  for (const p of participantes) byLocal[p.localId] = p;

  const pendAgora = await dbGetAll("pendencias").catch(() => []);
  const pendInscr = pendAgora.filter(p => p.tipo === "inscricao");
  const pendPres = pendAgora.filter(p => p.tipo === "presenca");

  const inscricoes = [];
  for (const p of pendInscr) {
    const participante = byLocal[p.localUsuarioId];
    if (!participante?.servidorId) {
      alert("Ainda falta sincronizar usuário antes da inscrição: " + (participante?.email || p.localUsuarioId));
      return;
    }
    inscricoes.push({
      eventoId: Number(p.payload.eventoId),
      usuarioId: Number(participante.servidorId),
      emailUsuario: participante.email,
      clientUuid: p.id
    });
  }

  const presencas = [];
  for (const p of pendPres) {
    const participante = byLocal[p.localUsuarioId];
    if (!participante?.servidorId) {
      alert("Ainda falta sincronizar usuário antes da presença: " + (participante?.email || p.localUsuarioId));
      return;
    }
    presencas.push({
      eventoId: Number(p.payload.eventoId),
      usuarioId: Number(participante.servidorId),
      emailUsuario: participante.email,
      clientUuid: p.id
    });
  }

  if (inscricoes.length || presencas.length) {
    const r = await fetch(`${CONFIG.EVENTS_API}/offline/sync?t=${Date.now()}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token.startsWith("Bearer ") ? token : `Bearer ${token}`
      },
      body: JSON.stringify({ inscricoes, presencas }),
      cache: "no-store"
    });

    if (!r.ok) {
      const t = await r.text().catch(() => "");
      alert("Falha ao sincronizar na Events (/offline/sync): " + t);
      return;
    }

    for (const p of pendInscr) await dbDelete("pendencias", p.id).catch(() => {});
    for (const p of pendPres) await dbDelete("pendencias", p.id).catch(() => {});
  }

  await baixarUsuariosServidor(token);
  await recarregarSelectsParticipantes();
  await renderPendencias();

  alert("✅ Sincronização concluída!");
}
