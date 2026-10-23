// Usuarios e tokens ficticios: exclusivamente para estudo local.
export const users = Object.freeze([
  { id: 'user-alice', name: 'Alice', role: 'user' },
  { id: 'user-bob', name: 'Bob', role: 'user' },
  { id: 'user-admin', name: 'Admin', role: 'admin'}
]);

// Simplificacao didatica: NÃO é um sistema de autenticacao para producao.
export const demoTokens = Object.freeze({
  'alice-lab-token': 'user-alice',
  'bob-lab-token': 'user-bob',
  'admin-lab-token': 'user-admin'
});
