// assets/js/ui.js

function mostrarMensagem(tipo, msg) {
    const msgBox = document.createElement('div');
    msgBox.className = `msg-box ${tipo}`;
    msgBox.textContent = msg;
    document.body.appendChild(msgBox);

    setTimeout(() => {
        msgBox.remove();
    }, 3000);
}

export { mostrarMensagem };
