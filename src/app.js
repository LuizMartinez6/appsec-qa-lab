import express from 'express';
import { documentsRouter } from './routes/documents.js';
import { adminRouter } from './routes/admin.js';
import {requireAuthentication, revokedTokens, resetRevokedToken} from './middleware/auth.js';
import { validateCredentials } from './services/authService.js';
import { createSession, resetSessions } from './services/sessionService.js';

export const app = express();
if (process.env.NODE_ENV == 'test'){
  app.post('/test/reset-auth', (req, res) => {
    resetRevokedToken()
    resetSessions()
    return res.status(200).json({
      message: 'Estado de autenticação restaurado'
    })
  })
}
app.disable('x-powered-by');
app.use(express.json({ limit: '16kb' }));

app.get('/health', (req, res) => {
  return res.status(200).json({ status: 'ok', project: 'appsec-qa-lab' });
});

app.get('/api/me', (req, res) => {
  return res.json({ hint: 'Use Authorization: Bearer alice-lab-token nas rotas /api/documents.' });
});

app.post('/api/logout', requireAuthentication, (req, res) => {
  const authorization = req.get('authorization')
  const token = authorization.split(' ')[1];
  revokedTokens.add(token)
  return res.status(200).json({
    message: 'Logout realizado com sucesso.'
  })
})

app.post('/api/login', (req, res) => {
  const { username, password } = req.body ?? {};

  const userId = validateCredentials(username, password);

  if (!userId) {
    return res.status(401).json({
      error: 'Credenciais inválidas.'
    });
  }

  const token = createSession(userId);

  return res.status(200).json({
    token
  });
});

app.use('/api/documents', documentsRouter);

app.use('/api/admin', adminRouter);

app.use((req, res) => {
  return res.status(404).json({ error: 'Rota nao encontrada.' });
});
