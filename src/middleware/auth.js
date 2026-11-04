import { demoTokens, users } from '../data/users.js';
import { sessions } from '../services/sessionService.js';
export const revokedTokens = new Set();
export function resetRevokedToken() {
  revokedTokens.clear()
}

// Autenticacao didatica: a API identifica um usuario por um token fixo.
// O foco da primeira aula é AUTORIZACAO (o que ele pode acessar).
export function requireAuthentication(req, res, next) {
  const authorization = req.get('authorization') ?? '';
  const match = /^Bearer\s+(\S+)$/i.exec(authorization);
  const token = match ? match[1] : undefined;
  if (token && revokedTokens.has(token)) {
    return res.status(401).json({
      error: 'Token revogado.'
    })
  }
  const userId = token ? (sessions.get(token) ?? demoTokens[token]): undefined;
  const user = users.find((entry) => entry.id === userId);

  if (!user) {
    return res.status(401).json({ error: 'Autenticacao necessaria.' });
  }

  req.currentUser = user;
  next();
}
