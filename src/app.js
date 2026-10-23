import express from 'express';
import { documentsRouter } from './routes/documents.js';
import { adminRouter } from './routes/admin.js';

export const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '16kb' }));

app.get('/health', (req, res) => {
  return res.status(200).json({ status: 'ok', project: 'appsec-qa-lab' });
});

app.get('/api/me', (req, res) => {
  return res.json({ hint: 'Use Authorization: Bearer alice-lab-token nas rotas /api/documents.' });
});

app.use('/api/documents', documentsRouter);

app.use('/api/admin', adminRouter);

app.use((req, res) => {
  return res.status(404).json({ error: 'Rota nao encontrada.' });
});
