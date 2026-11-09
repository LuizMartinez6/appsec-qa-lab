
import { test, expect } from '@playwright/test';

test('Reset deve invalidar sessoes dinamicas anteriores', async ({ request }) => {
  const login = await request.post('/api/login', {
    data: {
      username: 'alice',
      password: 'alice-lab-password',
    },
  });

  expect(login.status()).toBe(200);

  const { token } = await login.json();
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const logout = await request.post('/api/logout', { headers });
  expect(logout.status()).toBe(200);

  const afterLogout = await request.get('/api/documents', { headers });
  expect(afterLogout.status()).toBe(401);

  const reset = await request.post('/test/reset-auth');
  expect(reset.status()).toBe(200);
  
  const afterReset = await request.get('/api/documents', { headers });
  expect(afterReset.status()).toBe(401);
});
