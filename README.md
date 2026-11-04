# AppSec QA Lab

Laboratório prático de **Application Security (AppSec)** focado na identificação, reprodução, correção e validação automatizada de vulnerabilidades em APIs REST.

O projeto utiliza uma API desenvolvida em Node.js e Express, acompanhada de testes automatizados com Playwright para validar controles de autenticação, autorização e segurança.

## Tecnologias

- **Node.js / Express** — Desenvolvimento da API REST.
- **TypeScript / Playwright** — Testes automatizados de API.
- **JavaScript** — Implementação dos controles de segurança.
- **Node.js Crypto** — Geração de tokens de sessão.
- **Git / GitHub** — Versionamento e documentação.

## Estrutura do projeto

```text
appsec-qa-lab/
├── src/
│   ├── data/           # Dados fictícios do laboratório
│   ├── middleware/     # Autenticação e autorização
│   ├── routes/         # Endpoints da API
│   ├── services/       # Serviços de autenticação e sessões
│   ├── app.js
│   └── server.js
│
├── tests/
│   ├── security/       # Testes automatizados de segurança
│   └── smoke.spec.ts
│
├── docs/               # Relatórios técnicos de vulnerabilidades
├── .env.example
├── package.json
└── README.md
```

## Pré-requisitos

Para executar o laboratório, é necessário:

- Node.js (versão 24 utilizada no desenvolvimento).
- npm.
- Git.
- Um terminal PowerShell, Bash ou equivalente.

## Instalação

**1. Clone o repositório:**

```bash
git clone https://github.com/LuizMartinez6/appsec-qa-lab.git
cd appsec-qa-lab
```

**2. Instale as dependências:**

```bash
npm install
```

**3. Configure as variáveis de ambiente:**

Crie um arquivo `.env.test` a partir de `.env.example`.

Windows (PowerShell):

```powershell
Copy-Item .env.example .env.test
```

Linux/macOS:

```bash
cp .env.example .env.test
```

Conteúdo esperado do arquivo:

```dotenv
NODE_ENV=test
PORT=3100
```

O ambiente de teste habilita rotas auxiliares necessárias para restaurar o estado da autenticação durante a execução dos testes automatizados.

## Executando a aplicação

**1. Inicie o servidor em modo de teste:**

```bash
npm run start:test
```

O script `start:test` deve estar configurado no `package.json` para carregar `.env.test`.

Após iniciar, a API estará disponível em:

```text
http://127.0.0.1:3100
```

O servidor é limitado à interface local (`127.0.0.1`) para evitar exposição na rede.

**2. Execute os testes em outro terminal:**

```bash
npm test
```

Para executar um módulo específico:

```bash
npx playwright test tests/security/01-bola.spec.ts
```

Para executar os testes de autenticação dinâmica:

```bash
npx playwright test tests/security/04-dynamic-login.spec.ts
```

## Documentação de vulnerabilidades

Os relatórios técnicos estão disponíveis na pasta `docs/`.

| Vulnerabilidade | Documentação |
|---|---|
| Broken Object Level Authorization (BOLA/IDOR) | [Relatório BOLA](docs/01-bola-relatorio.md) |
| Broken Function Level Authorization (BFLA) | [Relatório BFLA](docs/02-bfla.md) |
| Broken Authentication | [Relatório de autenticação](docs/03-broken-authentication.md) |

Cada relatório apresenta o comportamento vulnerável, a causa raiz, o impacto, as correções aplicadas e as evidências de validação.

Os cenários automatizados e suas expectativas estão definidos diretamente em `tests/security/`.

## Limitações e segurança

Este projeto possui finalidade exclusivamente educacional.

- Utiliza usuários e credenciais fictícios.
- O armazenamento de sessões é realizado em memória.
- O gerenciamento de sessões ainda não implementa expiração automática.
- A autenticação utiliza mecanismos simplificados para fins didáticos.
- As rotas auxiliares de teste não devem ser disponibilizadas em ambientes públicos.

**Não utilize esta implementação como um sistema de autenticação pronto para produção.**

## Referências

- [OWASP API Security Top 10](https://owasp.org/API-Security/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [Documentação do Playwright](https://playwright.dev/)

## Licença

A licença do projeto deverá ser definida antes de disponibilizá-lo para reutilização por terceiros.
