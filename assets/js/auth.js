// api auth
const AUTH_API = "http://localhost:8081/auth";

// salva usuario no navegador
function salvarSessao(usuario) {
    localStorage.setItem("usuario", JSON.stringify(usuario));
}

// pega usuario logado
function obterUsuario() {
    return JSON.parse(localStorage.getItem("usuario"));
}

// logout
function logout() {
    localStorage.removeItem("usuario");
    location.href = "login.html";
}

// login normal
async function realizarLogin(email, senha) {
    const resp = await fetch(`${AUTH_API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha })
    });

    if (resp.status === 404) {
        return { tipo: "novo" };
    }

    if (resp.status === 409) {
        return { tipo: "precisa_completar" };
    }

    if (!resp.ok) return null;

    const dados = await resp.json();
    salvarSessao(dados);
    return { tipo: "ok", dados };
}

// finalizar cadastro (usuario criado rapido na gate)
async function completarCadastro(email, nome, senha) {
    const resp = await fetch(`${AUTH_API}/completar`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, nome, senha })
    });

    if (!resp.ok) return null;

    const dados = await resp.json();
    salvarSessao(dados);
    return dados;
}
