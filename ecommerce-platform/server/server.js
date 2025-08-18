// Entry point of the backend service
import 'dotenv/config';
import app from './src/app.js';
import { sequelize } from './src/config/database.js';

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established');

    // Sync models (disable force for production)
    await sequelize.sync({ alter: false });

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();