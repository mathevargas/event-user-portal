EVENT-USER-PORTAL — Portal do Participante (HTML + CSS + JavaScript)
Este frontend é responsável por permitir que os usuários acessem e interajam com o Sistema de Eventos.
 Consome diretamente os microserviços responsáveis por autenticação, eventos e certificados.
Faz parte da arquitetura de microserviços do Sistema de Eventos.

1. Objetivo
Disponibilizar um portal web para os participantes realizarem:
Consulta de eventos


Inscrição em eventos


Acompanhamento de participações


Emissão de certificados


Validação pública de certificados


Não há backend próprio neste projeto.
 Toda lógica de negócio é feita pelas APIs externas:
AUTH API


EVENTS API


CERTIFICATES API



2. Tecnologias Utilizadas
Tecnologia
Finalidade
HTML5
Interface
CSS3
Estilização
JavaScript (Vanilla)
Lógica e integração com APIs
Fetch API
Comunicação HTTP
LocalStorage
Sessão no navegador
Microsserviços REST
Backend externo

Requisito da disciplina: JS puro (sem frameworks).

3. Estrutura do Projeto
event-user-portal/
│
├─ assets/
│   ├─ css/
│   │   └─ style.css
│   └─ js/
│       ├─ auth.js
│       ├─ eventos.js
│       └─ certificados.js
│
├─ pages/
│   ├─ home.html
│   ├─ login.html
│   ├─ criar_conta.html
│   ├─ cadastro_completar.html
│   ├─ evento_detalhes.html
│   ├─ minhas_inscricoes.html
│   ├─ certificado.html
│   ├─ certificado_resultado.html
│   └─ validar_certificado.html
│
└─ README.md


4. Fluxo do Usuário
Usuário acessa a página inicial


Realiza login ou cadastro


Sessão é armazenada no navegador


Usuário se inscreve em eventos


Consulta inscrições realizadas


Gera certificado caso tenha presença confirmada


Pode validar qualquer certificado pelo código



5. Integração com APIs
5.1 AUTH API
Login, cadastro e completar cadastro
Endpoints utilizados:
POST /auth/login


POST /auth/registrar


PATCH /auth/completar


5.2 EVENTS API
Eventos e inscrições
Endpoints utilizados:
GET /eventos


GET /eventos/{id}


POST /eventos/{id}/inscrever


GET /eventos/inscricoes/{email}


5.3 CERTIFICATES API
Certificados
Endpoints utilizados:
POST /certificados/gerar


GET /certificados/validar/{codigo}



6. Telas Implementadas
Tela
Descrição
Status
home.html
Listagem de eventos
OK
login.html
Autenticação
OK
criar_conta.html
Cadastro inicial
OK
cadastro_completar.html
Finalizar cadastro criado pela portaria
OK
evento_detalhes.html
Informação do evento e inscrição
OK
minhas_inscricoes.html
Lista e status das inscrições
OK
certificado.html
Emissão do certificado
OK
certificado_resultado.html
Resultado da emissão
OK
validar_certificado.html
Validação pública
OK


7. Segurança (atual)
Sessão armazenada em LocalStorage


Acesso restrito em páginas sensíveis


Ainda não implementado:
JWT real


Regras de acesso por perfil


Expiração de sessão


Essas funcionalidades serão aplicadas na fase de integração final.

8. Como Executar Localmente
No Visual Studio Code:
Abrir a pasta do projeto


Clicar com o botão direito em pages/home.html


Selecionar: Open With Live Server


Acessar pelo navegador:
http://127.0.0.1:5500/pages/home.html


9. Status do Projeto
Função
Situação
Listagem de Eventos
OK
Login e Cadastro
OK
Inscrição
OK
Meus eventos
OK
Emissão de Certificados
OK (MVP)
Validação de Certificados
OK (MVP)
PDF real
Em desenvolvimento
JWT
Em desenvolvimento
Deploy na VM
Em desenvolvimento


10. Próximas Etapas
Adicionar JWT e bloqueio de rotas


Habilitar download do certificado em PDF


Ajustes de layout final e responsividade


Deploy na VM com integração total das APIs



11. Desenvolvido por
Matheus Vargas — Frontend Web (Portal do Participante)
 Implementação completa do fluxo online do usuário.


