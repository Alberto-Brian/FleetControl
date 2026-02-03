# Autenticação e Setup — Fluxo de Login

- Este documento descreve como a aplicação decide entre Setup inicial e Login, como o serviço de autenticação é exposto via IPC, como o contexto de autenticação gerencia sessão e como o pós-login é protegido pela licença.

## Visão Geral

- O App inicia tema/idioma e verifica se já existem usuários cadastrados.
- Se não houver usuários, renderiza a tela de Setup para criar o primeiro usuário.
- Se houver usuários e não estiver autenticado, mostra a tela de Login.
- Quando autenticado, renderiza a aplicação principal protegida por verificação de licença.
- Sessão do usuário persiste via localStorage (chave `fleet_user`).

## Módulos e Componentes Chave

- Roteamento condicional: [App.tsx](file:///c:/projects/FLEETCONTROL/src/App.tsx)
- Contexto de autenticação: [AuthContext.tsx](file:///c:/projects/FLEETCONTROL/src/contexts/AuthContext.tsx)
- Helpers (renderer → IPC): [service-auth-helpers.ts](file:///c:/projects/FLEETCONTROL/src/helpers/service-auth-helpers.ts)
- Exposição IPC (preload): [auth-service-context.ts](file:///c:/projects/FLEETCONTROL/src/helpers/ipc/services/auth/auth-service-context.ts)
- Canais IPC: [auth-service-channels.ts](file:///c:/projects/FLEETCONTROL/src/helpers/ipc/services/auth/auth-service-channels.ts)
- Listeners (main → serviço): [auth-service-listeners.ts](file:///c:/projects/FLEETCONTROL/src/helpers/ipc/services/auth/auth-service-listeners.ts)
- Serviço de autenticação (main): [auth.service.ts](file:///c:/projects/FLEETCONTROL/src/lib/services/auth.service.ts)
- Setup inicial: [SetupPage.tsx](file:///c:/projects/FLEETCONTROL/src/pages/SetupPage.tsx)
- Tela de login: [LoginPage.tsx](file:///c:/projects/FLEETCONTROL/src/pages/LoginPage.tsx)
- Guarda de licença: [LicenseGuard.tsx](file:///c:/projects/FLEETCONTROL/src/components/LicenseGuard.tsx)
- Preload: [preload.ts](file:///c:/projects/FLEETCONTROL/src/preload.ts)
- Registro de listeners: [listeners-register.ts](file:///c:/projects/FLEETCONTROL/src/helpers/ipc/listeners-register.ts) e chamada em [main.ts](file:///c:/projects/FLEETCONTROL/src/main.ts#L73)

## Inicialização do App

- Tema/idioma: [App.tsx](file:///c:/projects/FLEETCONTROL/src/App.tsx#L27-L31) sincroniza tema e idioma.
- Verificação de usuários: [App.tsx](file:///c:/projects/FLEETCONTROL/src/App.tsx#L33-L47) chama `hasUsers` via helper para decidir a rota.
- Fluxo condicional:
  - Sem usuários: renderiza [SetupPage](file:///c:/projects/FLEETCONTROL/src/pages/SetupPage.tsx) [App.tsx:L61-L64](file:///c:/projects/FLEETCONTROL/src/App.tsx#L61-L64)
  - Com usuários e sem sessão: renderiza [LoginPage](file:///c:/projects/FLEETCONTROL/src/pages/LoginPage.tsx) [App.tsx:L66-L69](file:///c:/projects/FLEETCONTROL/src/App.tsx#L66-L69)
  - Autenticado: renderiza Home dentro de [LicenseGuard](file:///c:/projects/FLEETCONTROL/src/components/LicenseGuard.tsx) [App.tsx:L71-L79](file:///c:/projects/FLEETCONTROL/src/App.tsx#L71-L79)

## Setup Inicial (Primeiro Usuário)

- UI coleta nome, email, senha e confirmação: [SetupPage.tsx](file:///c:/projects/FLEETCONTROL/src/pages/SetupPage.tsx#L15-L23)
- Validações locais de senha: [SetupPage.tsx](file:///c:/projects/FLEETCONTROL/src/pages/SetupPage.tsx#L28-L45)
- Criação do primeiro usuário:
  - Chamada renderer: `createFirstUser` em [service-auth-helpers.ts](file:///c:/projects/FLEETCONTROL/src/helpers/service-auth-helpers.ts#L36-L39)
  - IPC preload expõe `_service_auth.createFirstUser`: [auth-service-context.ts](file:///c:/projects/FLEETCONTROL/src/helpers/ipc/services/auth/auth-service-context.ts#L21-L29)
  - Listener main: [auth-service-listeners.ts](file:///c:/projects/FLEETCONTROL/src/helpers/ipc/services/auth/auth-service-listeners.ts#L24-L27,L47-L49)
  - Serviço: [auth.service.ts](file:///c:/projects/FLEETCONTROL/src/lib/services/auth.service.ts#L92-L118) valida inexistência de usuários, gera `password_hash` e insere na tabela `users`.
- Ao concluir, UI notifica e volta para login: [SetupPage.tsx](file:///c:/projects/FLEETCONTROL/src/pages/SetupPage.tsx#L55-L62)

## Login

- UI de login coleta `email` e `password`: [LoginPage.tsx](file:///c:/projects/FLEETCONTROL/src/pages/LoginPage.tsx#L14-L17,L55-L84)
- Envio e tratamento: [LoginPage.tsx](file:///c:/projects/FLEETCONTROL/src/pages/LoginPage.tsx#L19-L36)
  - Chama `login(formData)` do contexto.
  - Em erro, exibe toast com `error.message`.
- Contexto de autenticação:
  - Inicialização de sessão a partir do localStorage: [AuthContext.tsx](file:///c:/projects/FLEETCONTROL/src/contexts/AuthContext.tsx#L25-L43)
  - `login`: [AuthContext.tsx](file:///c:/projects/FLEETCONTROL/src/contexts/AuthContext.tsx#L44-L53)
    - Usa helper `login` para chamar IPC.
    - Salva o usuário retornado em estado e em `localStorage:fleet_user`.
  - `logout` e `updateUser`: [AuthContext.tsx](file:///c:/projects/FLEETCONTROL/src/contexts/AuthContext.tsx#L55-L63)
  - `isAuthenticated` é verdadeiro se `user` não for nulo: [AuthContext.tsx](file:///c:/projects/FLEETCONTROL/src/contexts/AuthContext.tsx#L66-L74)
- Helper de autenticação (renderer):
  - `login`: [service-auth-helpers.ts](file:///c:/projects/FLEETCONTROL/src/helpers/service-auth-helpers.ts#L11-L19) invoca `window._service_auth.login` e retorna `IUser`.
- Exposição de serviço (preload):
  - `_service_auth.login(credentials)`: [auth-service-context.ts](file:///c:/projects/FLEETCONTROL/src/helpers/ipc/services/auth/auth-service-context.ts#L21-L23)
- Listener no processo principal:
  - Handler `LOGIN`: [auth-service-listeners.ts](file:///c:/projects/FLEETCONTROL/src/helpers/ipc/services/auth/auth-service-listeners.ts#L18-L22)
  - Implementação `loginEvent`: [auth-service-listeners.ts](file:///c:/projects/FLEETCONTROL/src/helpers/ipc/services/auth/auth-service-listeners.ts#L30-L32)
- Serviço de autenticação (main):
  - `AuthService.login(email, password)`: [auth.service.ts](file:///c:/projects/FLEETCONTROL/src/lib/services/auth.service.ts#L13-L52)
    - Busca usuário ativo e não deletado.
    - Compara senha via `bcrypt`.
    - Atualiza `last_access_at`.
    - Retorna apenas dados públicos (`id`, `name`, `email`, `avatar`).

## Persistência de Sessão

- O usuário autenticado é armazenado em `localStorage` sob `fleet_user`: [AuthContext.tsx](file:///c:/projects/FLEETCONTROL/src/contexts/AuthContext.tsx#L47-L49)
- Na inicialização, o contexto tenta carregar `fleet_user` e ajusta `isLoading`: [AuthContext.tsx](file:///c:/projects/FLEETCONTROL/src/contexts/AuthContext.tsx#L25-L43)
- `logout` limpa estado e `localStorage`: [AuthContext.tsx](file:///c:/projects/FLEETCONTROL/src/contexts/AuthContext.tsx#L55-L58)

## Logout, Logout Global e Atualização de Perfil

- Renderer helpers:
  - `logout(userId)`: [service-auth-helpers.ts](file:///c:/projects/FLEETCONTROL/src/helpers/service-auth-helpers.ts#L21-L25)
  - `logoutAllUsers()`: [service-auth-helpers.ts](file:///c:/projects/FLEETCONTROL/src/helpers/service-auth-helpers.ts#L27-L29)
  - `updateProfile(userId, data)`: [service-auth-helpers.ts](file:///c:/projects/FLEETCONTROL/src/helpers/service-auth-helpers.ts#L46-L49)
- Main listeners:
  - Handlers correspondentes: [auth-service-listeners.ts](file:///c:/projects/FLEETCONTROL/src/helpers/ipc/services/auth/auth-service-listeners.ts#L22-L28,L34-L57)
- Serviço:
  - `logout`: [auth.service.ts](file:///c:/projects/FLEETCONTROL/src/lib/services/auth.service.ts#L54-L63)
  - `logoutAllUsers`: [auth.service.ts](file:///c:/projects/FLEETCONTROL/src/lib/services/auth.service.ts#L65-L75)
  - `updateProfile`: [auth.service.ts](file:///c:/projects/FLEETCONTROL/src/lib/services/auth.service.ts#L161-L182)
- Observação: `logoutAllUsers` também é acionado na inicialização após um restore: [main.ts](file:///c:/projects/FLEETCONTROL/src/main.ts#L148-L156) e [main.ts](file:///c:/projects/FLEETCONTROL/src/main.ts#L151-L154)

## License Guard (Pós-Login)

- Após autenticar, a árvore principal é envolvida por [LicenseGuard](file:///c:/projects/FLEETCONTROL/src/components/LicenseGuard.tsx) que verifica a licença: [App.tsx](file:///c:/projects/FLEETCONTROL/src/App.tsx#L71-L79)
- Se a licença estiver inválida, abre o diálogo de ativação e, ao sucesso, recarrega estado de licença: [LicenseGuard.tsx](file:///c:/projects/FLEETCONTROL/src/components/LicenseGuard.tsx#L12-L35,L56-L65)

## Exposição e Registro de IPC

- Preload expõe todos os contexts, incluindo `_service_auth`: [context-exposer.ts](file:///c:/projects/FLEETCONTROL/src/helpers/ipc/context-exposer.ts#L21-L40) e [preload.ts](file:///c:/projects/FLEETCONTROL/src/preload.ts#L1-L3)
- Registro de listeners ocorre ao criar a janela principal: [listeners-register.ts](file:///c:/projects/FLEETCONTROL/src/helpers/ipc/listeners-register.ts#L22-L41) chamado em [main.ts](file:///c:/projects/FLEETCONTROL/src/main.ts#L73)
- Canais usados pelo serviço de autenticação: [auth-service-channels.ts](file:///c:/projects/FLEETCONTROL/src/helpers/ipc/services/auth/auth-service-channels.ts#L2-L8)

## Tratamento de Erros (Renderer)

- Setup: validações simples e toasts de erro/sucesso: [SetupPage.tsx](file:///c:/projects/FLEETCONTROL/src/pages/SetupPage.tsx#L28-L71)
- Login: toast de erro com `error.message`: [LoginPage.tsx](file:///c:/projects/FLEETCONTROL/src/pages/LoginPage.tsx#L27-L33)

## Sequência Resumida

1. App monta e sincroniza tema/idioma [App.tsx:L27-L31](file:///c:/projects/FLEETCONTROL/src/App.tsx#L27-L31)
2. Verifica `hasUsers` via IPC [App.tsx:L33-L47](file:///c:/projects/FLEETCONTROL/src/App.tsx#L33-L47)
3. Sem usuários → Setup cria primeiro usuário [SetupPage.tsx](file:///c:/projects/FLEETCONTROL/src/pages/SetupPage.tsx) → volta ao Login
4. Com usuários → Login envia credenciais [LoginPage.tsx](file:///c:/projects/FLEETCONTROL/src/pages/LoginPage.tsx) → IPC → `AuthService.login` valida e retorna `IUser`
5. Contexto salva usuário e define `isAuthenticated` [AuthContext.tsx](file:///c:/projects/FLEETCONTROL/src/contexts/AuthContext.tsx#L44-L53)
6. App renderiza Home dentro de `LicenseGuard` e segue uso normal

