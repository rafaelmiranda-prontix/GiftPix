export type DatabaseProvider = 'supabase' | 'postgres';

export interface DatabaseConfig {
  provider: DatabaseProvider;
  url: string;
  directUrl?: string;
  ssl?: boolean;
}

const buildPostgresUrl = (env: NodeJS.ProcessEnv): string => {
  if (env.DATABASE_URL) {
    return env.DATABASE_URL;
  }

  const host = env.DB_HOST || 'localhost';
  const port = env.DB_PORT || '5432';
  const name = env.DB_NAME || 'giftpix';
  const user = env.DB_USER || 'postgres';
  const password = env.DB_PASSWORD || '';

  const encodedPassword = password ? encodeURIComponent(password) : '';
  const auth = encodedPassword ? `${user}:${encodedPassword}` : user;

  return `postgresql://${auth}@${host}:${port}/${name}`;
};

export const getDatabaseConfig = (env: NodeJS.ProcessEnv = process.env): DatabaseConfig => {
  const provider = (env.DB_PROVIDER || 'supabase') as DatabaseProvider;

  if (provider === 'supabase') {
    const url = env.SUPABASE_DATABASE_URL || env.DATABASE_URL;
    if (!url) {
      throw new Error('SUPABASE_DATABASE_URL (or DATABASE_URL) is required when DB_PROVIDER=supabase');
    }
    return { provider, url, directUrl: env.SUPABASE_DIRECT_URL || env.DIRECT_URL, ssl: true };
  }

  const url = buildPostgresUrl(env);
  return { provider, url, ssl: true };
};
