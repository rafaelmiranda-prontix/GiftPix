import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env';
import { logger } from '../utils/logger';

/**
 * Middleware de autenticação via API Key
 * Verifica se a requisição contém um token válido no header
 */
export const authenticateApiKey = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const apiKey = req.headers['x-api-key'] as string;

  if (!apiKey) {
    logger.warn('Request without API key', { ip: req.ip, path: req.path });
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'API key é obrigatória',
      },
    });
    return;
  }

  if (apiKey !== config.security.apiSecretKey) {
    logger.warn('Request with invalid API key', { ip: req.ip, path: req.path });
    res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'API key inválida',
      },
    });
    return;
  }

  logger.debug('Request authenticated successfully', { path: req.path });
  next();
};
