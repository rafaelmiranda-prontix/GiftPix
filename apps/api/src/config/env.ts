import dotenv from 'dotenv';
import path from 'path';

const rootEnvPath = path.resolve(process.cwd(), '..', '..', '.env');
dotenv.config({ path: rootEnvPath });
dotenv.config();

interface EnvConfig {
  port: number;
  nodeEnv: string;
  provider: 'asaas' | 'pagbank';
  asaas: {
    apiUrl: string;
    apiKey: string;
  };
  pagbank: {
    apiUrl: string;
    apiToken: string;
    email: string;
  };
  security: {
    apiSecretKey: string;
  };
  limits: {
    minPixValue: number;
    maxPixValue: number;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  logs: {
    level: string;
  };
  cors: {
    allowedOrigins: string[];
  };
}

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value && !defaultValue) {
    throw new Error(`Environment variable ${key} is required but not set`);
  }
  return value as string;
};

export const config: EnvConfig = {
  port: parseInt(getEnvVar('PORT', '3000'), 10),
  nodeEnv: getEnvVar('NODE_ENV', 'development'),
  provider: (getEnvVar('PAYMENT_PROVIDER', 'asaas') as 'asaas' | 'pagbank'),
  asaas: {
    apiUrl: getEnvVar('ASAAS_API_URL', 'https://sandbox.asaas.com/api'),
    apiKey: getEnvVar('ASAAS_API_KEY', ''),
  },
  pagbank: {
    apiUrl: getEnvVar('PAGBANK_API_URL', 'https://sandbox.api.pagseguro.com'),
    apiToken: getEnvVar('PAGBANK_API_TOKEN', ''),
    email: getEnvVar('PAGBANK_EMAIL', ''),
  },
  security: {
    apiSecretKey: getEnvVar('API_SECRET_KEY'),
  },
  limits: {
    minPixValue: parseFloat(getEnvVar('MIN_PIX_VALUE', '1.00')),
    maxPixValue: parseFloat(getEnvVar('MAX_PIX_VALUE', '10000.00')),
  },
  rateLimit: {
    windowMs: parseInt(getEnvVar('RATE_LIMIT_WINDOW_MS', '900000'), 10),
    maxRequests: parseInt(getEnvVar('RATE_LIMIT_MAX_REQUESTS', '100'), 10),
  },
  logs: {
    level: getEnvVar('LOG_LEVEL', 'info'),
  },
  cors: {
    allowedOrigins: (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean),
  },
};
