import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import { createApp } from './src/app.js';
import { initializeDatabase } from './src/config/database.js';
import { logger } from './src/utils/logger.js';

const port = process.env.PORT || 4000;

async function start() {
  await initializeDatabase();
  const app = await createApp();
  const server = http.createServer(app);
  server.listen(port, () => {
    logger.info(`Server listening on port ${port}`);
  });
}

start().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});

