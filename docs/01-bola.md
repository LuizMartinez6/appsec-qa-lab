# Aula 01 — BOLA: falha de autorização em nível de objeto

**Projeto:** appsec-qa-lab  
**Ambiente:** API didática local em Node.js/Express; testes de API com Playwright  
**Status:** corrigida nos cenários de teste existentes

## Resumo

Foi identificada uma falha de **Broken Object Level Authorization (BOLA)** no endpoint `GET /api/documents/:documentId`. Um usuário autenticado conseguia consultar documentos de outro usuário ao informar o identificador do documento, pois a busca não verificava seu proprietário.

## Comportamento vulnerável

A rota buscava um documento somente pelo ID solicitado:

```javascript
const document = documents.find((entry) => entry.id === req.params.documentId);
```

A autenticação identificava corretamente o usuário, mas a rota não verificava se ele tinha permissão sobre aquele objeto.

### Evidência anterior à correção

- Alice acessava seu próprio documento: teste passou.
- Alice acessava o documento de Bob: **esperado `404`, recebido `200`** (teste falhou, demonstrando o problema).
- Requisição sem token: teste passou (`401`).
- Bob acessava seu próprio documento: teste passou.

Resultado informado pelo teste Playwright: **3 passaram, 1 falhou**.

## Causa raiz

A aplicação validava o identificador do documento, mas não comparava seu proprietário com a identidade do usuário autenticado. Assim, possuir um token válido permitia consultar objetos de outros usuários caso seus IDs fossem conhecidos.

## Correção aplicada

A busca passou a exigir simultaneamente o ID do documento e a correspondência do proprietário com o usuário autenticado:

```javascript
const document = documents.find(
  (entry) => entry.id === req.params.documentId && entry.ownerId === req.currentUser.id
);
```

A identificação do usuário vem de `req.currentUser`, preenchido pelo middleware de autenticação no servidor, e **não** de um parâmetro livre como `req.query.userId`.

Quando não existe documento acessível ao usuário, a rota retorna `404`. Neste laboratório, essa é uma escolha deliberada para não confirmar a existência de documentos de terceiros.

## Impacto de segurança

A falha compromete a **confidencialidade**, permitindo leitura não autorizada de dados de outros usuários. Se a mesma falha existisse numa aplicação de prontuários médicos, poderia expor dados sensíveis de pacientes, afetando privacidade e confiança na instituição.

**Escopo da demonstração:** a vulnerabilidade confirmada nesta aula afeta a consulta via `GET`. Não foram demonstradas alterações ou exclusões indevidas por `PATCH` ou `DELETE`.

## Verificação da correção

Comando utilizado:

```bash
npm run test:bola
```

Resultado informado após a correção: **4 testes passaram (4 passed)**.

Cenários cobertos:

1. Alice pode consultar o próprio documento.
2. Alice não pode consultar o documento de Bob (`404`).
3. Usuário sem token não pode consultar documentos (`401`).
4. Bob pode consultar o próprio documento.

## Lições aprendidas

- **Autenticação** valida quem está fazendo a requisição.
- **Autorização** valida se essa identidade pode acessar determinado recurso.
- Um token válido não concede acesso automático a todos os documentos.
- A verificação de proprietário deve ser feita no backend, usando a identidade autenticada.
- Testes de regressão de segurança ajudam a impedir a reintrodução dessa falha.

## Limitações e próximos passos

Este laboratório usa autenticação simplificada com tokens fixos e valida somente alguns cenários de uma aplicação didática. Os quatro testes passando não comprovam a segurança completa do sistema. Futuras aulas podem avaliar autorização para atualização, exclusão e outros tipos de recursos.
