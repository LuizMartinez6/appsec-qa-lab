# Broken Authentication — Revogação, login dinâmico e isolamento de sessões

**Projeto:** `appsec-qa-lab`  
**Ambiente:** laboratório local com Node.js, Express, TypeScript e Playwright  
**Escopo:** autenticação de API, gerenciamento de sessão e testes de regressão  
**Status:** cenários documentados abaixo verificados na execução informada da suíte (**15/15 testes aprovados**)

> Este é um laboratório didático. As credenciais são fictícias e a implementação **não está pronta para produção**. Este relatório descreve os riscos investigados, os controles implementados e os resultados observados, sem afirmar que toda a autenticação está segura.

## 1. Risco de segurança

Uma API pode permitir **reutilização de tokens após logout**, aceitar credenciais incorretas ou não isolar corretamente sessões diferentes de uma mesma conta. Dependendo da falha, isso pode viabilizar uso indevido de sessões e acesso não autorizado a dados ou funções.

A investigação foi dividida em duas fases:

- **Tokens fixos do laboratório:** verificar revogação e independência entre sessões simuladas.
- **Tokens dinâmicos:** verificar emissão após autenticação, acesso a rotas protegidas, rejeição de senha incorreta, revogação e isolamento entre dispositivos.

## 2. Contexto e endpoints

| Endpoint | Objetivo |
| --- | --- |
| `POST /api/login` | Validar credenciais fictícias e emitir token dinâmico |
| `GET /api/documents` | Retornar documentos do usuário autenticado |
| `POST /api/logout` | Revogar o token usado na requisição |
| `POST /test/reset-auth` | Limpar revogações para testes sequenciais; **somente com `NODE_ENV=test`** |

Arquivos relevantes:

```text
src/data/users.js
src/data/credentials.js
src/services/authService.js
src/services/sessionService.js
src/middleware/auth.js
src/app.js
tests/security/03-broken-auth.spec.ts
tests/security/04-dynamic-login.spec.ts
```

## 3. Controle de revogação

No laboratório, o token apresentado no logout é registrado em um `Set`:

```js
export const revokedTokens = new Set();

// Após um logout autenticado:
revokedTokens.add(token);
```

O middleware de autenticação impede que um token revogado volte a ser usado:

```js
if (token && revokedTokens.has(token)) {
  return res.status(401).json({ error: 'Token revogado.' });
}
```

**Por que importa:** sem essa verificação, a API poderia continuar aceitando uma credencial que o usuário considera encerrada. O método `.has()` retorna `true` quando o token está na lista de revogação.

No modelo atual, o logout adiciona o token à lista de revogação; ele não necessariamente remove a entrada correspondente do `Map` de sessões.

## 4. Emissão e validação de tokens dinâmicos

A função de sessão gera um valor criptograficamente aleatório e o associa ao usuário:

```js
import { randomBytes } from 'node:crypto';

export const sessions = new Map();

export function createSession(userId) {
  const token = randomBytes(32).toString('hex');
  sessions.set(token, userId);
  return token;
}
```

`randomBytes(32)` produz **32 bytes aleatórios**; a representação hexadecimal tem **64 caracteres**. O `Map` não cria o token: ele guarda a associação **token → usuário**.

No middleware, os tokens de sessão são consultados primeiro, preservando temporariamente a compatibilidade com tokens fixos usados nos testes antigos:

```js
const userId = token
  ? (sessions.get(token) ?? demoTokens[token])
  : undefined;
```

O endpoint de login valida as credenciais **antes** de emitir uma sessão. Caso a validação falhe, responde `401` e não inclui token na resposta.

**Atenção:** no laboratório a verificação de senha foi implementada com credenciais fictícias em texto puro para ensino. Em produção, isso deve ser substituído por armazenamento de hashes apropriados e comparação segura.

## 5. Evidências automatizadas

### 5.1 Tokens fixos — `03-broken-auth.spec.ts`

| Caso | Resultado esperado | Resultado observado |
| --- | --- | --- |
| Token revogado não pode acessar documentos | Depois do logout, `GET /api/documents` retorna `401` | Passou |
| Logout em uma sessão não invalida outra sessão | PC: `401`; celular: `200` | Passou |

**Resultado confirmado:** **2/2 testes**.

### 5.2 Tokens dinâmicos — `04-dynamic-login.spec.ts`

| Caso | Verificação principal | Resultado observado |
| --- | --- | --- |
| Login válido da Alice | `POST /api/login` → `200`; token com 64 caracteres; acesso a `/api/documents` → `200` | Passou |
| Senha incorreta | `POST /api/login` → `401`; `body.token` é `undefined` | Passou |
| Token dinâmico após logout | Acesso antes → `200`; logout → `200`; reutilização → `401` | Passou |
| Duas sessões dinâmicas da Alice | Tokens distintos; logout do PC → `200`; PC depois → `401`; celular depois → `200` | Passou |

**Resultado confirmado:** **4/4 testes**. Verificar que a resposta não tem `token` não prova, sozinho, que nenhuma sessão foi criada internamente; essa é uma limitação da cobertura atual.

### 5.3 Regressão completa

Comando:

```powershell
npm test
```

Execução informada:

```text
Running 15 tests using 1 worker
15 passed (1.0s)
```

| Conjunto | Testes aprovados |
| --- | ---: |
| BOLA/IDOR | 4 |
| BFLA | 3 |
| Broken Authentication — tokens fixos | 2 |
| Login dinâmico | 4 |
| Smoke | 2 |
| **Total** | **15** |

Os resultados demonstram que os **cenários cobertos** passaram nessa execução; não equivalem a uma auditoria de segurança completa.

## 6. Isolamento do ambiente de teste

Para evitar que revogações realizadas por um teste afetem os testes seguintes, o laboratório utiliza `POST /test/reset-auth` no `beforeEach`. Essa rota só é registrada quando a API inicia com `NODE_ENV=test`.

```powershell
$env:NODE_ENV = 'test'
npm run start
```

Se o servidor for iniciado sem esse valor, a chamada de reset retorna `404` e os testes que dependem dela falham **antes de executar os cenários de segurança**. Uma instância antiga na porta `3100` também pode causar confusão durante depuração.

**Restrições:** não expor a rota de reset em ambientes públicos. Com mais de um worker ou múltiplas requisições simultâneas, limpar um estado global pode interferir em outros testes; a suíte atual foi validada com **1 worker**.

## 7. Riscos e limitações remanescentes

1. **Estado apenas em memória:** `Map` e `Set` são perdidos quando o processo reinicia. Tokens fixos presentes em `demoTokens` podem voltar a funcionar após a lista de revogação ser reinicializada; tokens dinâmicos antigos deixam de ser reconhecidos se sua sessão só existia no `Map` perdido.
2. **Ausência de expiração:** não há TTL ou validade automática comprovada para as sessões dinâmicas.
3. **Credenciais didáticas:** senhas fictícias em texto puro e tokens fixos são inadequados para produção.
4. **Sem armazenamento compartilhado:** múltiplas instâncias da API não compartilham sessões e revogações.
5. **Cobertura parcial:** ainda faltam testes para usuário inexistente, tentativas repetidas de login, política de expiração, falhas de armazenamento e verificação de que o login inválido não cria estado de sessão.

## 8. Melhorias recomendadas

- Substituir senhas em texto puro por **hashes de senha adequados** (por exemplo, Argon2id) e verificar sem expor informações sobre a conta.
- Adicionar **expiração**, gestão de sessões persistente e política de revogação.
- Avaliar armazenamento do **hash do token**, em vez do token bruto, em um armazenamento persistente.
- Aplicar proteção contra tentativas abusivas de login e observar eventos de autenticação.
- Isolar o estado dos testes sem depender de reset global quando houver execução paralela.

## 9. Conclusão

Os testes verificaram que o laboratório **rejeita logins com senha incorreta**, **bloqueia tokens revogados** e **mantém ativa outra sessão válida do mesmo usuário** após um logout individual. A suíte completa passou com **15/15 testes**.

O modelo atual é útil para demonstrar controles e testes de Broken Authentication, mas **não deve ser usado como solução de autenticação em produção** sem os aprimoramentos descritos acima.
