# Aula 02 — BFLA (Broken Function Level Authorization)

**Projeto:** appsec-qa-lab  
**Categoria:** OWASP API5:2023 — Broken Function Level Authorization  
**Status:** Vulnerabilidade reproduzida e corrigida  
**Tecnologias:** Node.js, Express e Playwright

## 1. Objetivo

Compreender a diferença entre autenticação e autorização, identificar uma falha de controle de acesso em uma funcionalidade administrativa e implementar uma correção utilizando RBAC (*Role-Based Access Control*).

## 2. Cenário da vulnerabilidade

A aplicação possui uma rota administrativa:

`GET /api/admin/dashboard`

Essa funcionalidade deveria ser acessível exclusivamente por usuários com a permissão `admin`.

| Usuário | Role | Acesso esperado |
|---|---|---|
| Alice | user | 403 Forbidden |
| Admin | admin | 200 OK |
| Sem autenticação | — | 401 Unauthorized |

## 3. Causa raiz

A vulnerabilidade ocorria porque a rota administrativa verificava apenas se o usuário estava autenticado, sem validar seu nível de permissão.

Isso permitia que usuários comuns acessassem funcionalidades destinadas exclusivamente a administradores.

Durante o teste inicial, Alice conseguiu acessar o dashboard e recebeu `200 OK`, quando o comportamento esperado era `403 Forbidden`.

## 4. Correção aplicada

Foi implementado um middleware de autorização chamado `requireRole`, responsável por comparar o papel do usuário autenticado com a permissão exigida pela rota.

O middleware utiliza `req.currentUser.role`, valor disponibilizado anteriormente pelo `requireAuthentication`.

Foram estabelecidas três regras:

- Sem usuário autenticado: retornar `401 Unauthorized`.
- Usuário autenticado sem o papel exigido: retornar `403 Forbidden`.
- Usuário com a permissão necessária: executar `next()` e permitir a continuação.

A rota administrativa passou a utilizar os middlewares nesta ordem:

`requireAuthentication` → `requireRole('admin')` → `dashboard`

## 5. Validação da correção

Foram criados testes automatizados com Playwright cobrindo três cenários:

| Cenário | Resultado |
|---|---|
| Alice tenta acessar o dashboard | 403 — Passou |
| Admin acessa o dashboard | 200 — Passou |
| Acesso sem token | 401 — Passou |

**Resultados finais:**

- Testes BFLA: 3 de 3 passaram.
- Testes BOLA: 4 de 4 passaram.
- Testes smoke: 2 de 2 passaram.
- **Suíte completa: 9 de 9 testes passaram.**

## 6. Impacto da vulnerabilidade

A falha permitia acesso não autorizado a uma funcionalidade administrativa, comprometendo o controle de acesso da aplicação.

Neste laboratório, a rota retornava apenas uma mensagem administrativa. Não foi demonstrada exposição de dados sensíveis ou execução de operações destrutivas.

Em aplicações reais, falhas semelhantes podem ter impactos maiores dependendo das funcionalidades administrativas expostas.

## 7. Conhecimentos adquiridos

- Diferença entre autenticação e autorização.
- Funcionamento dos middlewares no Express.
- Uso de `req`, `res` e `next()`.
- Controle de acesso baseado em papéis (RBAC).
- Importância da ordem de execução dos middlewares.
- Diferenças entre HTTP 401, 403 e 500.
- Uso de testes automatizados para validar controles de segurança.
- Importância dos testes de regressão após correções.

## 8. Conclusão

A vulnerabilidade BFLA foi reproduzida e corrigida por meio da implementação de um middleware RBAC reutilizável.

Os testes automatizados confirmaram que usuários comuns não conseguem acessar a rota administrativa, enquanto usuários autorizados permanecem com acesso.

A correção resolve os cenários testados, sem representar uma garantia de segurança completa da aplicação.

**Observação:** a autenticação utiliza tokens fictícios exclusivamente para treinamento local e não deve ser utilizada em produção.