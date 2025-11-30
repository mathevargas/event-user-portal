// Carrega qualquer tela HTML da pasta pages
function loadPage(page) {
    const content = document.getElementById("content");

    fetch(`./${page}.html`)
        .then(response => response.text())
        .then(html => {
            content.innerHTML = html;
        })
        .catch(err => {
            content.innerHTML = "<h3>Erro ao carregar página.</h3>";
            console.error(err);
        });
}
