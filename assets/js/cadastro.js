document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("btnCadastrar");

    btn.onclick = async () => {
        const nome = document.getElementById("nome").value.trim();
        const email = document.getElementById("email").value.trim();
        const senha = document.getElementById("senha").value.trim();

        if (!nome || !email || !senha) {
            alert("Preencha todos os campos!");
            return;
        }

        try {
            const resp = await fetch(`${CONFIG.AUTH_API}auth/cadastrar`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nome, email, senha })
            });

            if (!resp.ok) {
                const err = await resp.text();
                alert("Erro: " + err);
                return;
            }

            const dados = await resp.json();

            localStorage.setItem("usuario", JSON.stringify(dados));

            alert("Conta criada com sucesso!");
            location.href = "login.html";

        } catch (e) {
            alert("Erro ao cadastrar.");
            console.error(e);
        }
    };
});
