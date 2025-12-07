// assets/js/auth.js
// Controle de sessão, login e navbar dinâmica

// Base da AUTH API
const AUTH_BASE = `${CONFIG.AUTH_API}/auth`;

// ----------------------------
// SESSÃO
// ----------------------------
function salvarSessao(dadosUsuario) {
    // esperado: { id, nome, email, token }
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

// ----------------------------
// LOGIN
// ----------------------------
async function realizarLogin(email, senha) {
    const resp = await fetch(`${AUTH_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha })
    });

    // ✅ 404 → usuário novo (não existe)
    if (resp.status === 404) {
        return { tipo: "novo" };
    }

    // ✅ 409 → precisa completar cadastro
    if (resp.status === 409) {
        return { tipo: "precisa_completar" };
    }

    if (!resp.ok) {
        return null;
    }

    const dados = await resp.json();
    salvarSessao(dados);

    return { tipo: "ok", dados };
}

// ----------------------------
// COMPLETAR CADASTRO
// ----------------------------
async function completarCadastro(email, nome, senha) {
    const resp = await fetch(`${AUTH_BASE}/completar`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, nome, senha })
    });

    if (!resp.ok) {
        return null;
    }

    const dados = await resp.json();
    salvarSessao(dados);
    return dados;
}

// ----------------------------
// EXIGIR LOGIN (para páginas protegidas)
// ----------------------------
function exigirLogin() {
    const usuario = obterUsuario();

    if (!usuario || !usuario.token) {
        alert("Sua sessão expirou ou você não está logado. Faça login novamente.");
        window.location.href = "login.html";
        return false;
    }
    return true;
}

// ----------------------------
// NAVBAR DINÂMICA
// ----------------------------
function atualizarNavbar() {
    const usuario = obterUsuario();
    const nav = document.querySelector(".nav");
    if (!nav) return;

    const path = window.location.pathname;

    // limpa navbar
    nav.innerHTML = "";

    // Sempre visíveis
    nav.innerHTML += `
        <a href="home.html" class="${path.endsWith("home.html") ? "active" : ""}">Home</a>
        <a href="validar_certificado.html" class="${path.endsWith("validar_certificado.html") ? "active" : ""}">Validar Certificado</a>
    `;

    if (usuario && usuario.token) {
        // Usuário logado → mostra opções privadas
        nav.innerHTML += `
            <a href="minhas_inscricoes.html" class="${path.endsWith("minhas_inscricoes.html") ? "active" : ""}">Minhas Inscrições</a>
            <a href="#" id="btnLogout">Sair</a>
        `;
    } else {
        // Visitante
        nav.innerHTML += `
            <a href="login.html" class="${path.endsWith("login.html") ? "active" : ""}">Login</a>
            <a href="cadastro.html" class="${path.endsWith("cadastro.html") ? "active" : ""}">Criar Conta</a>
        `;
    }

    // Ação do botão de logout
    const btnLogout = document.getElementById("btnLogout");
    if (btnLogout) {
        btnLogout.onclick = (e) => {
            e.preventDefault();
            logout();
        };
    }
}

// Aplica navbar dinâmica em todas as páginas
document.addEventListener("DOMContentLoaded", atualizarNavbar);
