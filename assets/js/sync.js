// assets/js/sync.js
// Botão "Sincronizar offline" — simulação para o trabalho

document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("btnSync");
    if (!btn) return;

    btn.onclick = () => {
        alert("Sincronização realizada com sucesso! Agora você pode usar o modo offline (simulado).");
    };
});
