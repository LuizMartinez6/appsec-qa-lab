import { credentials } from '../data/credentials.js';

export function validateCredentials(username, password) {
  const credential = credentials.find(
    (entry) => entry.username === username
  );

  if (!credential || credential.password !== password) {
    return undefined;
  }

  return credential.userId;
}