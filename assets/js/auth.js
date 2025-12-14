const AUTH_BASE = `${CONFIG.AUTH_API}/auth`;

function salvarSessao(dadosUsuario) {
  localStorage.setItem("usuario", JSON.stringify(dadosUsuario));
}

function obterUsuario() {
  const raw = localStorage.getItem("usuario");
  return raw ? JSON.parse(raw) : null;
}

function limparSessao() {
  localStorage.removeItem("usuario");
}

function logout() {
  limparSessao();
  window.location.href = "login.html";
}

function authHeaderIfAny() {
  const u = obterUsuario();
  const h = {};
  if (u?.token) h["Authorization"] = u.token.startsWith("Bearer ") ? u.token : `Bearer ${u.token}`;
  return h;
}

function parseJwt(token) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function obterRole() {
  const u = obterUsuario();
  if (!u?.token) return null;

  if (u.role) return u.role;
  if (u.perfil) return u.perfil;

  const payload = parseJwt(u.token);
  return payload?.role || payload?.perfil || null;
}

function isPorteiroOuAdmin() {
  const role = obterRole();
  return role === "ADMIN" || role === "PORTEIRO";
}

function isPorteiroOnly() {
  return obterRole() === "PORTEIRO";
}

async function realizarLogin(email, senha) {
  try {
    const resp = await fetch(`${AUTH_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
      cache: "no-store",
    });

    if (resp.status === 404) return { tipo: "novo" };

    if (!resp.ok) {
      const txt = await resp.text().catch(() => "");
      const lower = (txt || "").toLowerCase();

      if (
        resp.status === 409 ||
        lower.includes("ativ") ||
        lower.includes("sem senha") ||
        lower.includes("ainda não") ||
        lower.includes("completar")
      ) {
        return { tipo: "precisa_completar" };
      }

      return null;
    }

    const dados = await resp.json();
    salvarSessao(dados);
    return { tipo: "ok", dados };
  } catch {
    return null;
  }
}

async function completarCadastro(email, nome, senha) {
  try {
    if (!email) return null;

    const r1 = await fetch(`${CONFIG.AUTH_API}/usuarios/por-email?email=${encodeURIComponent(email)}`, {
      headers: {
        ...authHeaderIfAny(),
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
      },
      cache: "no-store",
    });

    if (!r1.ok) return null;

    const u = await r1.json();
    if (!u?.id) return null;

    const r2 = await fetch(`${CONFIG.AUTH_API}/usuarios/${u.id}/completar`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...authHeaderIfAny(),
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
      },
      body: JSON.stringify({ nome, senha }),
      cache: "no-store",
    });

    if (!r2.ok) return null;

    const loginResp = await realizarLogin(email, senha);
    if (!loginResp || loginResp.tipo !== "ok") return null;

    return loginResp.dados;
  } catch {
    return null;
  }
}

function exigirLogin() {
  const usuario = obterUsuario();
  if (!usuario || !usuario.token) {
    alert("Sua sessão expirou ou você não está logado.");
    window.location.href = "login.html";
    return false;
  }
  return true;
}

function exigirPorteiro() {
  if (!exigirLogin()) return false;
  if (!isPorteiroOuAdmin()) {
    alert("Acesso negado: somente ADMIN/PORTEIRO.");
    window.location.href = "home.html";
    return false;
  }
  return true;
}

function atualizarNavbar() {
  const usuario = obterUsuario();
  const nav = document.querySelector(".nav");
  if (!nav) return;

  const path = window.location.pathname;

  const link = (href, label) =>
    `<a href="${href}" class="${path.endsWith("/" + href) || path.endsWith(href) ? "active" : ""}">${label}</a>`;

  nav.innerHTML = "";

  if (usuario?.token && isPorteiroOnly()) {
    nav.innerHTML += link("portaria.html", "Portaria");
    nav.innerHTML += `<a href="#" id="btnLogout">Sair</a>`;
  } else {
    nav.innerHTML += link("home.html", "Home");
    nav.innerHTML += link("validar_certificado.html", "Validar Certificado");

    if (usuario?.token) {
      nav.innerHTML += link("minhas_inscricoes.html", "Minhas Inscrições");
      nav.innerHTML += link("certificado.html", "Certificados");

      if (isPorteiroOuAdmin()) {
        nav.innerHTML += link("portaria.html", "Portaria");
      }

      nav.innerHTML += `<a href="#" id="btnLogout">Sair</a>`;
    } else {
      nav.innerHTML += link("login.html", "Login");
      nav.innerHTML += link("cadastro.html", "Criar Conta");
    }
  }

  const btnLogout = document.getElementById("btnLogout");
  if (btnLogout) {
    btnLogout.onclick = (e) => {
      e.preventDefault();
      logout();
    };
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const u = obterUsuario();
  const path = window.location.pathname.toLowerCase();

  if (u?.token && isPorteiroOnly()) {
    const permitido =
      path.endsWith("portaria.html") ||
      path.endsWith("login.html") ||
      path.endsWith("completar_cadastro.html");

    if (!permitido) {
      window.location.href = "portaria.html";
      return;
    }
  }

  atualizarNavbar();
});
