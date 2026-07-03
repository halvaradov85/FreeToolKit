import dotenv from 'dotenv';
import path from 'node:path';

// Carga el .env de la raíz del monorepo.
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

function required(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (v === undefined) throw new Error(`Falta la variable de entorno ${name}`);
  return v;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: required('DATABASE_URL', 'postgresql://freetoolkit:freetoolkit@localhost:5432/freetoolkit?schema=public'),
  jwtAccessSecret: required('JWT_ACCESS_SECRET', 'dev-access-secret'),
  jwtRefreshSecret: required('JWT_REFRESH_SECRET', 'dev-refresh-secret'),
  jwtAccessTtl: process.env.JWT_ACCESS_TTL ?? '15m',
  jwtRefreshTtl: process.env.JWT_REFRESH_TTL ?? '7d',
  tzReference: process.env.TZ_REFERENCE ?? 'America/Lima',
};
