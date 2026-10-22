import { demoTokens, users } from '../data/users.js';

// Autenticacao didatica: a API identifica um usuario por um token fixo.
// O foco da primeira aula é AUTORIZACAO (o que ele pode acessar).
export function requireAuthentication(req, res, next) {
  const authorization = req.get('authorization') ?? '';
  const match = /^Bearer\s+(\S+)$/i.exec(authorization);
  const userId = match ? demoTokens[match[1]] : undefined;
  const user = users.find((entry) => entry.id === userId);

  if (!user) {
    return res.status(401).json({ error: 'Autenticacao necessaria.' });
  }

  req.currentUser = user;
  next();
}
