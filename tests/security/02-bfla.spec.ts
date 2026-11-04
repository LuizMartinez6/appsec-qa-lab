import { test, expect} from '@playwright/test'

test.beforeEach(async ({ request }) => {
  const response = await request.post('/test/reset-auth');

  expect(response.status()).toBe(200);
});

test('Alice não pode consultar a rota de dashboard', async ({request}) => {
    const response = await request.get('/api/admin/dashboard', {
        headers: { Authorization: 'Bearer alice-lab-token'}
    })
    expect(response.status()).toBe(403)
})

test('Admin pode consultar a rota de dashboard', async ({request}) => {
    const response = await request.get('/api/admin/dashboard', {
        headers: { Authorization: 'Bearer admin-lab-token'}
    })
    expect(response.status()).toBe(200)
})

test('Sem token ninguém pode consultar a rota de dashboard', async ({ request }) => {
    const response = await request.get('/api/admin/dashboard')
    expect(response.status()).toBe(401)
})