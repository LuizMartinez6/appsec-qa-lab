# BFLA — Usuário comum acessando uma área administrativa

> **Situação:** falha reproduzida e corrigida no laboratório.  
> **Categoria:** OWASP API5:2023 — Broken Function Level Authorization.

## O problema, em poucas palavras

Imagine que Alice possui uma conta comum e que existe uma área reservada aos administradores.

No nosso laboratório, **Alice conseguia acessar a rota administrativa mesmo sem ter o papel de administrador**. Ela estava autenticada, mas isso não deveria dar acesso a qualquer funcionalidade do sistema.

**A diferença essencial:** autenticação confirma *quem você é*; autorização verifica *o que você pode fazer*.

## Como identificamos a falha

Enviamos uma requisição para `GET /api/admin/dashboard` usando o token de Alice.

- **Esperado:** `403 Forbidden`, porque ela não tem permissão de administrador.
- **Encontrado antes da correção:** `200 OK`.

O servidor verificava que Alice tinha uma sessão válida, mas não conferia seu papel (`role`).

## O que estava errado no código?

A rota exigia somente autenticação:

```js
adminRouter.use(requireAuthentication);
```

Isso era suficiente para barrar alguém sem token, mas **não diferenciava usuários comuns de administradores**.

## Como corrigimos

Criamos um middleware para verificar a permissão exigida e o aplicamos à rota:

```js
adminRouter.use(requireAuthentication);
adminRouter.use(requireRole('admin'));
```

O `requireRole('admin')` verifica o campo `role` do usuário autenticado:

- Se não há identidade autenticada, o acesso é negado com `401`.
- Se o usuário está autenticado, mas não é administrador, recebe `403`.
- Se é administrador, a requisição pode continuar.

A **ordem** importa: primeiro identificamos a pessoa, depois verificamos sua permissão.

## Como verificamos a correção

O arquivo [`tests/security/02-bfla.spec.ts`](../tests/security/02-bfla.spec.ts) verifica:

| Cenário | Resposta esperada |
| --- | --- |
| Alice tenta acessar o dashboard | `403` |
| Administrador acessa o dashboard | `200` |
| Requisição sem token | `401` |

**Resultado registrado:** 3 testes passaram. Esses cenários também passaram na regressão geral de 15 testes.

Para executar apenas estes testes:

```bash
npx playwright test tests/security/02-bfla.spec.ts
```

## O que esse resultado não significa

A rota do laboratório apenas devolve uma mensagem de demonstração. Não comprovamos acesso a dados sensíveis nem alterações administrativas. Também não examinamos todas as permissões possíveis de uma aplicação real.

**Referência:** [OWASP — Broken Function Level Authorization](https://owasp.org/API-Security/editions/2023/en/0xa5-broken-function-level-authorization/).

---
*Laboratório local com usuários, permissões e tokens fictícios.*
