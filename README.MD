EVENT-USER-PORTAL — Portal Web (Participante + Portaria) — HTML + CSS + JavaScript (Vanilla)

Este projeto é o frontend oficial do Sistema de Eventos. Ele roda diretamente no navegador (ex.: VS Code + Live Server) e consome APIs REST via HTTP:

Auth API (Java Spring Boot) — autenticação, usuários, completar cadastro

Events API (Java Spring Boot) — eventos, inscrições, check-in/presença

Certificates API (FastAPI + WeasyPrint) — emissão de certificado em PDF e validação por código

✅ Não existe API Gate/Offline neste trabalho.
✅ Toda operação é 100% online, com JWT nas rotas protegidas.

1) Objetivo

Fornecer um portal web para:

Participantes

Listar eventos

Inscrever / cancelar inscrição

Ver Minhas Inscrições

Emitir certificado em PDF

Validar certificado publicamente por código

Porteiro (perfil PORTEIRO)

Acessar somente a tela Portaria

Ver navbar reduzida: Portaria + Sair

Admin (perfil ADMIN)

Acessar todas as telas normalmente (incluindo Portaria)

2) Tecnologias Utilizadas

HTML5 — estrutura das páginas

CSS3 — estilização

JavaScript (Vanilla) — regras do portal e integração

Fetch API — chamadas HTTP (REST)

LocalStorage — armazenamento da sessão (token + dados do usuário)

Requisito da disciplina: JS puro (sem frameworks).

3) Estrutura do Projeto
event-user-portal/
│
├─ assets/
│   ├─ css/
│   │   └─ style.css
│   └─ js/
│       ├─ config.js
│       ├─ auth.js
│       ├─ eventos.js
│       ├─ certificados.js
│       └─ security.js   (se existir)
│
├─ pages/
│   ├─ home.html
│   ├─ login.html
│   ├─ cadastro.html                 (ou criar_conta.html)
│   ├─ completar_cadastro.html       (ou cadastro_completar.html)
│   ├─ evento_detalhes.html
│   ├─ minhas_inscricoes.html
│   ├─ certificado.html
│   ├─ certificado_resultado.html
│   ├─ validar_certificado.html
│   └─ portaria.html
│
└─ README.md

4) Sessão, Perfis e Segurança
4.1 Sessão (JWT)

Após login, o portal recebe um JWT da Auth API.

O token e dados do usuário são armazenados em:

localStorage["usuario"]

4.2 Header de autenticação

Em chamadas protegidas, o portal envia:

Authorization: Bearer <token>

4.3 Controle de acesso por perfil

O portal lê o perfil do usuário a partir:

do próprio objeto salvo (usuario.role / usuario.perfil), ou

do payload do JWT (decodificado no frontend)

Regras práticas:

PORTEIRO: navegação reduzida e acesso focado em Portaria

ADMIN: acesso completo a tudo

Participante: acesso às telas padrão do portal

4.4 CORS (necessário para o portal funcionar no navegador)

Como o portal roda em http://127.0.0.1:5501 (Live Server) e consome APIs em outras portas (ex.: 8081, 8082, 8001), as APIs precisam liberar CORS para essas origens.

Exemplos comuns de origens do Live Server:

http://127.0.0.1:5500

http://127.0.0.1:5501

http://localhost:5500

http://localhost:5501

5) Integração com APIs
5.1 Auth API (Java Spring Boot)

Responsável por:

login

cadastro

consulta de usuário

completar cadastro (usuário sem senha)

emissão/validação do JWT

Endpoints usados pelo portal (exemplos):

POST /auth/login

POST /auth/cadastrar

GET /usuarios/por-email?email=...

PATCH /usuarios/{id}/completar

5.2 Events API (Java Spring Boot)

Responsável por:

CRUD de eventos (ou listagem)

inscrições (confirmar/cancelar)

check-in e/ou presença (fluxo online)

Endpoints usados (variam conforme sua implementação):

GET /eventos

GET /eventos/{id}

POST /inscricoes / DELETE /inscricoes/... (ou equivalente)

GET /inscricoes/... (ou equivalente)

POST /checkins / POST /presencas (ou equivalente)

5.3 Certificates API (FastAPI + WeasyPrint)

Responsável por:

gerar certificado em PDF real

validar certificado por código

Endpoints:

POST /certificados/gerar-pdf → retorna application/pdf

GET /certificados/validar/{codigo} → retorna JSON

Observação importante:

a API expõe headers (CORS expose_headers) para o browser conseguir ler:

Content-Disposition (nome do arquivo)

X-Certificado-Codigo (se utilizado)

6) Sincronização

✅ Não existe sincronização offline neste projeto.

Todo o funcionamento é online e ocorre em tempo real, assim:

O usuário interage com o portal (HTML/JS).

O portal chama as APIs via fetch().

As APIs processam e persistem dados nos seus bancos (PostgreSQL).

O portal atualiza a UI com as respostas retornadas.

Ou seja, o “estado” do sistema é sempre o estado real do backend no momento da requisição.
Não há fila offline, base local de dados nem envio posterior.

7) Telas Implementadas
Tela	Descrição
home.html	listagem de eventos
login.html	autenticação
cadastro.html	criação de conta
completar_cadastro.html	completar cadastro (usuário sem senha)
evento_detalhes.html	detalhes + inscrição/cancelamento
minhas_inscricoes.html	lista de inscrições do usuário
certificado.html	emissão de certificado (gera PDF)
certificado_resultado.html	resultado/validação pós-emissão
validar_certificado.html	validação pública por código
portaria.html	operações do porteiro (perfil PORTEIRO/ADMIN)
8) Como Executar Localmente

Abra a pasta do projeto no VS Code

Use a extensão Live Server

Execute a página inicial (exemplo):

pages/home.html

URL típica:

http://127.0.0.1:5501/pages/home.html

Certifique-se que as APIs (Auth/Events/Certificates) estejam rodando localmente e com CORS liberado.

9) Status do Projeto

Portal Web: ✅ OK

Login + Sessão JWT: ✅ OK

Completar cadastro: ✅ OK (depende de CORS e rotas na Auth API)

Eventos + inscrições: ✅ OK

Portaria (sem Gate/Offline): ✅ OK (online)

Emissão de certificado PDF (WeasyPrint): ✅ OK

Validação pública de certificado: ✅ OK

10) Desenvolvido por

Portal Web (HTML/CSS/JS): Matheus Vargas

Sistema de Eventos (Microserviços: Auth / Events / Certificates): arquitetura em microserviços integrada ao portal