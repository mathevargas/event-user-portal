// assets/js/router.js

const routes = {
    '/home': 'home.html',
    '/login': 'login.html',
    '/cadastro': 'cadastro.html',
    '/validar_certificado': 'validar_certificado.html'
};

// Função de navegação simples
function navigateTo(route) {
    const page = routes[route];
    if (page) {
        window.location.href = page;
    }
}

export { navigateTo };
