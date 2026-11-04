import { test, expect } from '@playwright/test';

test('Alice pode acessar documentos com token dinamico', async ({ request }) => {
  const login = await request.post('/api/login', {
    data: {
      username: 'alice',
      password: 'alice-lab-password'
    }
  });

  expect(login.status()).toBe(200);

  const body = await login.json();
  const token = body.token;

  expect(typeof token).toBe('string');
  expect(token).toHaveLength(64);

  const documents = await request.get('/api/documents', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  expect(documents.status()).toBe(200);
});

test('Nao deve autenticar Alice com senha incorreta', async ({ request }) => {
  const login = await request.post('/api/login', {
    data: {
      username: 'alice',
      password: 'senha-errada'
    }
  });

  expect(login.status()).toBe(401);

  const body = await login.json();

  expect(body.token).toBeUndefined();
});


test('Token dinamico nao pode ser reutilizado apos logout', async ({ request }) => {
  const login = await request.post('/api/login', {
    data: {
      username: 'alice',
      password: 'alice-lab-password'
    }
  });

  expect(login.status()).toBe(200);

  const body = await login.json();

  const headers = {
    Authorization: `Bearer ${body.token}`
  };

  const antesLogout = await request.get('/api/documents', {
    headers
  });

  expect(antesLogout.status()).toBe(200);

  const logout = await request.post('/api/logout', {
    headers
  });

  expect(logout.status()).toBe(200);

  const depoisLogout = await request.get('/api/documents', {
    headers
  });

  expect(depoisLogout.status()).toBe(401);
});

test('Alice pode criar duas sessoes dinamicas', async ({ request }) => {
  const credentials = {
    username: 'alice',
    password: 'alice-lab-password'
  };

  const loginPC = await request.post('/api/login', {
    data: credentials
  });

  const loginMobile = await request.post('/api/login', {
    data: credentials
  });

  expect(loginPC.status()).toBe(200);
  expect(loginMobile.status()).toBe(200);

  const pc = await loginPC.json();
  const mobile = await loginMobile.json();

  expect(pc.token).not.toBe(mobile.token);

  const headersPC = {
  Authorization: `Bearer ${pc.token}`
};

const headersMobile = {
  Authorization: `Bearer ${mobile.token}`
};

// Encerra somente a sessão do computador
const logoutPC = await request.post('/api/logout', {
  headers: headersPC
});

expect(logoutPC.status()).toBe(200);

// Verifica se o computador perdeu o acesso
const acessoPC = await request.get('/api/documents', {
  headers: headersPC
});

expect(acessoPC.status()).toBe(401);

// Verifica se o celular continua autenticado
const acessoMobile = await request.get('/api/documents', {
  headers: headersMobile
});

expect(acessoMobile.status()).toBe(200);
});