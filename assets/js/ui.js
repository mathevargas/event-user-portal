// Atualiza navbar dependendo do login
function atualizarNavbar() {
    const usuario = obterUsuario();
    const loginBtn = document.getElementById("btnLogin");
    const logoutBtn = document.getElementById("btnLogout");

    if (usuario) {
        loginBtn.style.display = "none";
        logoutBtn.style.display = "inline-block";
    } else {
        loginBtn.style.display = "inline-block";
        logoutBtn.style.display = "none";
    }
}

// Aplicar em todas páginas automaticamente
document.addEventListener("DOMContentLoaded", atualizarNavbar);
