import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { config } from './config/env';
import { logger } from './utils/logger';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';

export const createApp = (): Application => {
  const app = express();

  // Security middleware
  app.use(helmet());

  // CORS
  app.use(cors({
    origin: config.nodeEnv === 'production'
      ? ['https://yourdomain.com'] // Configure seus domínios permitidos
      : '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'x-api-key'],
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Muitas requisições. Tente novamente mais tarde.',
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use('/api/', limiter);

  // Body parser
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logging
  app.use((req, res, next) => {
    logger.info('Incoming request', {
      method: req.method,
      path: req.path,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
    next();
  });

  // Routes
  app.use('/api', routes);

  // Root endpoint
  app.get('/', (req, res) => {
    res.json({
      success: true,
      data: {
        name: 'Gift PIX Payout API',
        version: '1.0.0',
        description: 'API para integração de payouts PIX via QR Code com PagSeguro/PagBank',
        endpoints: {
          health: 'GET /api/health',
          createPayout: 'POST /api/pix-payout',
          getPayoutStatus: 'GET /api/pix-payout/:referenceId',
          listPayouts: 'GET /api/pix-payout',
          generateQRCode: 'POST /api/qrcode/generate',
          getQRCodeImage: 'GET /api/qrcode/image',
        },
      },
    });
  });

  // Error handlers (devem ser os últimos)
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
