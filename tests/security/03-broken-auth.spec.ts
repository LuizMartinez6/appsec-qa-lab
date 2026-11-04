import { test, expect } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  const response = await request.post('/test/reset-auth');

  expect(response.status()).toBe(200);
});

test('Token revogado não pode acessar documentos', async ({ request}) => {
    const headers = {
        Authorization: 'Bearer alice-lab-token'
    }

    //1. Verifica se o token funciona antes do logout
    const beforeLogout = await request.get('/api/documents', {
        headers
    })

    expect(beforeLogout.status()).toBe(200)

    //2. Realiza logout
    const logout = await request.post('/api/logout', {
        headers
    })

    expect(logout.status()).toBe(200)

    //3. Tenta reutilizar o mesmo token
    const afterLogout = await request.get('/api/documents', {
        headers
    })
    expect(afterLogout.status()).toBe(401)
})


test('Logout em uma sessao nao invalida outra sessao', async ({ request }) => {
  const computador = {
    Authorization: 'Bearer alice-lab-token',
  };

  const celular = {
    Authorization: 'Bearer alice-mobile-token',
  };

  // 1. Verifica se as duas sessoes funcionam
  const acessoComputador = await request.get('/api/documents', {
    headers: computador,
  });

  const acessoCelular = await request.get('/api/documents', {
    headers: celular,
  });

  expect(acessoComputador.status()).toBe(200);
  expect(acessoCelular.status()).toBe(200);

  // 2. Faz logout apenas no computador
  const logout = await request.post('/api/logout', {
    headers: computador,
  });

  expect(logout.status()).toBe(200);

  // 3. Verifica se o computador perdeu acesso
  const computadorDepois = await request.get('/api/documents', {
    headers: computador,
  });

  expect(computadorDepois.status()).toBe(401);

  // 4. Verifica se o celular continua autenticado
  const celularDepois = await request.get('/api/documents', {
    headers: celular,
  });

  expect(celularDepois.status()).toBe(200);
});