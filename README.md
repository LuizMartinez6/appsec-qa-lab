# AppSec QA Lab

Projeto de estudo local para transicao de **QA Automation** para **Application Security**.

**Objetivo:** aprender a **identificar**, **corrigir** e **prevenir** vulnerabilidades de API com testes automatizados.

## Stack

- Node.js 20+ (recomendado: Node.js 24)
- Express 5
- Playwright Test (testes de API em TypeScript)
- Sem banco de dados no primeiro modulo: dados ficticios em memoria

## Comecar no Windows / PowerShell

```powershell
npm install
npm run test:smoke
```

Depois de instalar as dependencias, o npm cria o `package-lock.json`. Inclua esse arquivo no Git para registrar as versoes resolvidas.

O Playwright inicia a API local automaticamente durante os testes. Como sao testes HTTP/API, **nao precisa instalar navegador**.

Para abrir a API manualmente:

```powershell
npm start
```

Abra `http://127.0.0.1:3100/health` no navegador.

## Rotas iniciais

| Rota | O que faz |
|---|---|
| `GET /health` | Healthcheck publico |
| `GET /api/documents` | Lista documentos do usuario autenticado |
| `GET /api/documents/:documentId` | Busca um documento pelo ID (**falha BOLA didatica**) |

Autenticacao **ficticia e apenas para o laboratorio**:

```text
Authorization: Bearer alice-lab-token
Authorization: Bearer bob-lab-token
```

## Modulo 01: BOLA

Leia [`docs/01-bola.md`](docs/01-bola.md).

```powershell
npm run test:bola
```

**Estado inicial esperado:** um teste de seguranca falha intencionalmente. Isso **nao** significa que a instalacao esta quebrada: o exercicio e corrigir o backend ate os testes de seguranca passarem.

Depois da correcao:

```powershell
npm test
```

## Como organizar os commits no GitHub

1. `chore: cria estrutura inicial do laboratorio`
2. `test: reproduz falha de autorizacao BOLA`
3. `fix: aplica controle de acesso em documentos`
4. `docs: registra causa e correcao da BOLA`

E uma sugestao de historico de aprendizado, nao passos que voce deve executar de uma vez.

## Cuidados importantes

- **Aplicacao deliberadamente vulneravel.** Use somente em `127.0.0.1` no seu computador.
- Nao publique o servidor, nao abra portas no roteador, nao implante na nuvem.
- Tokens fixos sao artificiais: nao reproduza esse mecanismo em producao.
- Nenhuma informacao privada, senha real ou chave de API deve ser colocada no repositorio.
- A solucao da aula nao e fornecida de proposito: vamos praticar o raciocinio de remediacao.

## Referencias

- [OWASP API Security — Broken Object Level Authorization](https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/)
- [PortSwigger — Access control](https://portswigger.net/web-security/access-control)
- [Playwright — API testing](https://playwright.dev/docs/api-testing)
