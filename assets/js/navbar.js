function atualizarNavbar() {
    const usuario = obterUsuario();
    const nav = document.querySelector(".nav");

    if (!nav) return;

    nav.innerHTML = ""; 
    nav.innerHTML += `<a href="home.html">Home</a>`;
    nav.innerHTML += `<a href="validar_certificado.html">Validar Certificado</a>`;

    if (usuario && usuario.token) {
        nav.innerHTML += `<a href="minhas_inscricoes.html">Minhas Inscrições</a>`;
        nav.innerHTML += `<a href="#" id="btnLogout">Sair</a>`;
    } else {
        nav.innerHTML += `<a href="login.html">Login</a>`;
        nav.innerHTML += `<a href="cadastro.html">Criar Conta</a>`;
    }

    const btnLogout = document.getElementById("btnLogout");
    if (btnLogout) {
        btnLogout.onclick = () => logout();
    }
}

document.addEventListener("DOMContentLoaded", atualizarNavbar);
