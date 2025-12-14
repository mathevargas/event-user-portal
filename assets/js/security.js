document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;

  const paginasProtegidas = [
    "minhas_inscricoes.html",
    "certificado.html",
    "certificado_resultado.html",
    "portaria.html"
  ];

  const precisaLogin = paginasProtegidas.some((p) => path.endsWith(p));
  if (!precisaLogin) return;

  if (typeof exigirLogin === "function") exigirLogin();
});
