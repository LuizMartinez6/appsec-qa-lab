import { test, expect } from '@playwright/test';

// AULA 01: o teste de seguranca abaixo deve FALHAR ANTES da correcao.
// Isso e proposital: primeiro demonstramos a falha; depois corrigimos o codigo.

test('Alice pode acessar o proprio documento', async ({ request }) => {
  const response = await request.get('/api/documents/doc-101', {
    headers: { Authorization: 'Bearer alice-lab-token' },
  });
  expect(response.status()).toBe(200);
  expect((await response.json()).ownerId).toBe('user-alice');
});

test('Alice nao pode consultar documento de Bob (regressao BOLA)', async ({ request }) => {
  const response = await request.get('/api/documents/doc-202', {
    headers: { Authorization: 'Bearer alice-lab-token' },
  });
  expect(response.status()).toBe(404);
});

test('Sem token, ninguem pode consultar documento', async ({ request }) => {
  const response = await request.get('/api/documents/doc-101');
  expect(response.status()).toBe(401);
});

test('Bob pode acessar o proprio documento', async ({ request }) => {
  const response = await request.get('/api/documents/doc-202', {
    headers: { Authorization: 'Bearer bob-lab-token' },
  });
  expect(response.status()).toBe(200);
  expect((await response.json()).ownerId).toBe('user-bob');
});
