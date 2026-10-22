import { Router } from 'express';
import { documents } from '../data/documents.js';
import { requireAuthentication } from '../middleware/auth.js';

export const documentsRouter = Router();

// Todas as rotas de documentos exigem um usuario autenticado.
documentsRouter.use(requireAuthentication);

// Exemplo que ja respeita o usuario: serve como pista conceitual.
documentsRouter.get('/', (req, res) => {
  const mine = documents.filter((document) => document.ownerId === req.currentUser.id);
  return res.json(mine);
});

// AULA 01 — BOLA: esta rota contem UMA FALHA INTENCIONAL de autorizacao.
// Sua tarefa futura sera entender e corrigir a causa, sem mudar os dados de teste.
documentsRouter.get('/:documentId', (req, res) => {
  const document = documents.find((entry) => entry.id === req.params.documentId && entry.ownerId === req.currentUser.id);

  if (!document) {
    return res.status(404).json({ error: 'Documento nao encontrado.' });
  }

  // TODO (aluno): revisar aqui a regra de acesso a um objeto especifico.
  return res.json(document);
});
