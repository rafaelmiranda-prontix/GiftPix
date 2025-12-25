import { createApp } from './app';
import { config } from './config/env';
import { logger } from './utils/logger';
import fs from 'fs';
import path from 'path';

// Criar diretório de logs se não existir
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const app = createApp();

const server = app.listen(config.port, () => {
  logger.info(`Server started successfully`, {
    port: config.port,
    nodeEnv: config.nodeEnv,
    apiUrl: `http://localhost:${config.port}`,
  });

  logger.info('Environment configuration loaded', {
    pagbankApiUrl: config.pagbank.apiUrl,
    minPixValue: config.limits.minPixValue,
    maxPixValue: config.limits.maxPixValue,
  });
});

// Graceful shutdown
const gracefulShutdown = (signal: string) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  server.close(() => {
    logger.info('Server closed. Process terminating...');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  logger.error('Unhandled Rejection', { reason, promise });
});

export default server;
