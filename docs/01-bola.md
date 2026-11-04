# BOLA / IDOR — Acesso a documentos de outros usuários

> **Situação:** falha reproduzida e corrigida no laboratório.  
> **Categoria:** OWASP API1:2023 — Broken Object Level Authorization.

## O problema, em poucas palavras

Imagine que Alice e Bob usam o mesmo sistema, mas cada um tem seus documentos privados. Alice deveria conseguir consultar apenas os próprios documentos.

No nosso laboratório, porém, **Alice conseguia abrir um documento de Bob ao informar o ID dele na URL**. A API reconhecia Alice pelo token, mas não conferia se o documento pertencia a ela.

**Por que isso importa?** Em uma aplicação real, a mesma falha poderia expor informações de outros clientes, mesmo sem o invasor descobrir suas senhas.

## Como identificamos a falha

Testamos a rota `GET /api/documents/:documentId` usando a conta da Alice para solicitar um documento de Bob.

- **Esperado:** `404 Not Found`, pois aquele documento não deveria estar disponível para Alice.
- **Encontrado antes da correção:** `200 OK`, com acesso ao documento.

O teste automatizado falhou justamente porque encontrou esse comportamento inseguro.

## O que estava errado no código?

A API procurava o documento apenas pelo identificador:

```js
const document = documents.find(
  (entry) => entry.id === req.params.documentId
);
```

Isso respondia à pergunta *“qual documento foi solicitado?”*, mas ignorava *“esse documento pertence a quem está pedindo?”*.

## Como corrigimos

Passamos a procurar o documento pelo ID **e** pelo dono:

```js
const document = documents.find(
  (entry) =>
    entry.id === req.params.documentId &&
    entry.ownerId === req.currentUser.id
);
```

O `req.currentUser` é definido pelo servidor após autenticar a requisição. Assim, Alice não pode simplesmente informar que é Bob para acessar o documento dele.

Neste laboratório, um documento de outra pessoa retorna `404` para não confirmar sua existência.

## Como verificamos a correção

O arquivo [`tests/security/01-bola.spec.ts`](../tests/security/01-bola.spec.ts) automatiza quatro cenários:

| Cenário | Resposta esperada |
| --- | --- |
| Alice acessa o próprio documento | `200` |
| Alice tenta acessar o documento de Bob | `404` |
| Alguém tenta acessar sem token | `401` |
| Bob acessa o próprio documento | `200` |

**Resultado registrado:** 4 testes passaram. Os mesmos cenários também passaram na regressão geral de 15 testes.

Para executar apenas estes testes:

```bash
npx playwright test tests/security/01-bola.spec.ts
```

## O que esse resultado não significa

Confirmamos a proteção de **leitura de documentos nesse endpoint**. Não testamos aqui todas as rotas do projeto nem operações de edição ou exclusão de documentos.

**Referência:** [OWASP — Broken Object Level Authorization](https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/).

---
*Laboratório local com dados e tokens fictícios.*
