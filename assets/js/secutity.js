// assets/js/security.js
// Proteção simples de páginas que exigem usuário logado

document.addEventListener("DOMContentLoaded", () => {
    const path = window.location.pathname;

    // Páginas que exigem login
    const paginasProtegidas = [
        "minhas_inscricoes.html",
        "certificado.html",
        "certificado_resultado.html"
        // home e evento_detalhes ficam públicos (só escondemos botões)
    ];

    const precisaLogin = paginasProtegidas.some(p => path.endsWith(p));

    if (precisaLogin) {
        const ok = exigirLogin();
        if (!ok) {
            // exigirLogin já redireciona
            return;
        }
    }
});

// Função de exigência de login
function exigirLogin() {
    const usuario = obterUsuario();
    if (!usuario || !usuario.token) {
        alert("Sua sessão expirou. Faça login novamente.");
        location.href = "login.html"; // Redireciona para a página de login
        return false;
    }
    return true;
}

// Função para obter usuário
function obterUsuario() {
    const usuario = localStorage.getItem("usuario");
    return usuario ? JSON.parse(usuario) : null;
}
