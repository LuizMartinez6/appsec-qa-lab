import { test, expect } from '@playwright/test';

test('API deve estar saudavel', async ({ request }) => {
  const response = await request.get('/health');
  expect(response.status()).toBe(200);
  expect(await response.json()).toMatchObject({ status: 'ok' });
});

test('listar apenas meus documentos', async ({ request }) => {
  const response = await request.get('/api/documents', {
    headers: { Authorization: 'Bearer alice-lab-token' },
  });
  expect(response.status()).toBe(200);
  const documents = await response.json();
  expect(documents).toHaveLength(1);
  expect(documents[0].id).toBe('doc-101');
});
