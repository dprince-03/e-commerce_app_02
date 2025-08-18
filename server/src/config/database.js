import { Sequelize } from 'sequelize';
import { logger } from '../utils/logger.js';

let sequelize;

export function getSequelize() {
  if (!sequelize) {
    const dbName = process.env.DB_NAME || 'ecommerce';
    const dbUser = process.env.DB_USER || 'postgres';
    const dbPassword = process.env.DB_PASSWORD || 'postgres';
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbPort = Number(process.env.DB_PORT || 5432);
    const dbSsl = String(process.env.DB_SSL || 'false') === 'true';

    sequelize = new Sequelize(dbName, dbUser, dbPassword, {
      host: dbHost,
      port: dbPort,
      dialect: 'postgres',
      dialectOptions: dbSsl ? { ssl: { require: true, rejectUnauthorized: false } } : {},
      logging: false
    });
  }
  return sequelize;
}

export async function initializeDatabase() {
  const db = getSequelize();

  // Initialize models
  const { initModels } = await import('../models/index.js');
  initModels(db);

  await db.authenticate();
  logger.info('Database connected');

  if (String(process.env.DB_SYNC || 'true') === 'true') {
    await db.sync();
    logger.info('Database synchronized');
  }
}

