import { randomBytes } from 'node:crypto';

export const sessions = new Map();

export function createSession(userId) {
  const token = randomBytes(32).toString('hex');

  sessions.set(token, userId);

  return token;
}

export function resetSessions() {
  sessions.clear();
}