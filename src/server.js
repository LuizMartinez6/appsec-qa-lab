import { app } from './app.js';

const port = Number.parseInt(process.env.PORT ?? '3100', 10);

// Intencionalmente local: nao exponha o laboratorio na internet ou em rede publica.
app.listen(port, '127.0.0.1', () => {
  console.log(`AppSec QA Lab executando em http://127.0.0.1:${port}`);
});
