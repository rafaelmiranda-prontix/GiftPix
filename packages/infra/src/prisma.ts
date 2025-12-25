import { PrismaClient } from '@prisma/client';
import { getDatabaseConfig } from './database';

const dbConfig = getDatabaseConfig();

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbConfig.url,
    },
  },
});

export type PrismaClientType = typeof prisma;
