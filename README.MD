🟦 EVENT-USER-PORTAL — Portal do Participante (HTML + CSS + JavaScript)

Este frontend é responsável por permitir o acesso dos usuários ao Sistema de Eventos.
Consome diretamente os microserviços de autenticação, eventos e certificados.

Faz parte da arquitetura de microfrontends/microsserviços proposta.

1. Objetivo

Fornecer ao usuário final um portal funcional para:

Visualizar eventos disponíveis

Realizar inscrições

Acompanhar suas participações

Emitir certificados

Validar certificados gerados

O portal não possui backend.
Toda lógica de negócio é feita via APIs:

AUTH API

EVENTS API

CERTIFICATES API

(Posteriormente) GATE API para sincronização offline

2. Tecnologias Utilizadas
Tecnologia	Função
HTML5	Interface
CSS3	Estilos / layout
JavaScript Vanilla	Lógica e consumo das APIs
LocalStorage	Sessão do usuário
Fetch API	Comunicação HTTP
Microsserviços REST	Backend externo

Importante: não há framework frontend (React/Vue/Angular).
O professor solicitou JS puro.

3. Estrutura do Projeto
event-user-portal/
│
├── assets/
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── auth.js
│       ├── eventos.js
│       └── certificados.js
│
├── pages/
│   ├── home.html
│   ├── login.html
│   ├── criar_conta.html
│   ├── cadastro_completar.html
│   ├── evento_detalhes.html
│   ├── minhas_inscricoes.html
│   ├── certificado.html
│   ├── certificado_resultado.html
│   └── validar_certificado.html
│
└── README.md


Cada tela é totalmente independente, carregada pelo navegador.

4. Fluxo Geral do Portal

Usuário acessa o portal

Visualiza eventos sem login.

Efetua login

AUTH API retorna os dados do usuário

Sessão salva no localStorage

Inscrição no evento

O usuário logado acessa /evento_detalhes

EVENTS API recebe email + ID do evento

Acompanhamento

/minhas_inscricoes.html

Lista todos os eventos inscritos

Certificado

Se status PRESENTE

/certificado.html?idEvento=X

CERTIFICATES API gera código único

Validação pública

/validar_certificado.html

Qualquer pessoa pode validar

5. Integração com APIs
5.1 AUTH API

Finalidade: login, cadastro, completar cadastro.

Endpoints usados:

POST /auth/login

POST /auth/registrar

PUT /auth/completar

5.2 EVENTS API

Finalidade: eventos e inscrições.

Endpoints usados:

GET /eventos

GET /eventos/{id}

POST /eventos/{id}/inscrever

GET /inscricoes/{email}

5.3 CERTIFICATES API

Finalidade: emissão e validação.

Endpoints usados:

POST /certificados/gerar

GET /certificados/validar/{codigo}

6. Telas Implementadas
✔️ 6.1 home.html

Lista eventos ativos

Acesso público

Botão “Detalhes”

✔️ 6.2 login.html

Campo email + senha

Chama AUTH API

Salva sessão local

✔️ 6.3 criar_conta.html

Cadastro inicial

Email + nome + senha

✔️ 6.4 cadastro_completar.html

Fluxo especial:

usuário criado na portaria

não possui senha

Define senha + nome

Salva nova conta

✔️ 6.5 evento_detalhes.html

Consulta eventos individuais

Inscrição via POST

✔️ 6.6 minhas_inscricoes.html

Lista inscrições por email

Mostra status

Link para certificado (status PRESENTE)

✔️ 6.7 certificado.html

Recebe idEvento

Chama CERTIFICATES API

Gera código

✔️ 6.8 certificado_resultado.html

Visualiza informações do certificado

Dados devolvidos pela API

✔️ 6.9 validar_certificado.html

Campo código

Validação pública

Sem necessidade de login

7. Segurança (estado atual)

Controle simples de sessão via LocalStorage

Navegação bloqueada em algumas telas:

evento_detalhes

minhas_inscricoes

certificado

O que não existe neste frontend:

JWT

Cookies

Roles

Middleware

🔴 Segurança real virá na fase de integração final.

8. Como Executar Localmente

📌 Abrir a pasta do portal:

Recomendado (VS Code):

Open With Live Server


Acessar:

http://127.0.0.1:5500/pages/home.html

9. Testes Sem Backend

Como o professor permite telas não integradas:

Event data mockado

Sem PDF real

Sem JWT

Telas abrem normalmente para apresentação.

10. Status do Frontend
Recurso	Status
Listagem de Eventos	✔️
Login	✔️
Cadastro	✔️
Finalizar Cadastro	✔️
Inscrição	✔️
Minhas inscrições	✔️
Emissão de Certificado	✔️ MVP
Validação de Certificado	✔️ MVP
Responsividade	✔️ simples
Integração Gate Offline	🔜
PDF real (download)	🔜
JWT	🔜
Deploy VM	🔜
11. Próximas Etapas (Enzo)

Ajuste de CSS final

Navbar definitiva (não a de teste)

Integração JWT após todas APIs finalizadas

Integração com CERTIFICATES API (PDF)

Integração com GATE API para sincronização offline

12. Desenvolvido por

Enzo Zambiasi — Portal do Usuário (MVP)
Parte responsável pelo frontend completo do participante
(Fluxo online do sistema)