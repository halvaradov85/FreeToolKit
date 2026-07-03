import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/lib/prisma';

const app = createApp();
const EMAIL = 'test-auth-user@freetoolkit.local';
const PASSWORD = 'supersecret123';

async function cleanup() {
  const u = await prisma.user.findUnique({ where: { email: EMAIL } });
  if (u) {
    await prisma.refreshToken.deleteMany({ where: { userId: u.id } });
    await prisma.historyItem.deleteMany({ where: { userId: u.id } });
    await prisma.user.delete({ where: { id: u.id } });
  }
}

describe('auth y cuenta (US3, FR-013..FR-016)', () => {
  beforeAll(cleanup);
  afterAll(async () => { await cleanup(); await prisma.$disconnect(); });

  let accessToken = '';
  let refreshToken = '';

  it('registra un usuario y devuelve tokens', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({ email: EMAIL, password: PASSWORD });
    expect(res.status).toBe(201);
    expect(res.body.accessToken).toBeTruthy();
    expect(res.body.refreshToken).toBeTruthy();
    accessToken = res.body.accessToken;
    refreshToken = res.body.refreshToken;
  });

  it('no permite registrar el mismo email dos veces', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({ email: EMAIL, password: PASSWORD });
    expect(res.status).toBe(409);
  });

  it('login con contraseña incorrecta devuelve mensaje genérico (FR-016)', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({ email: EMAIL, password: 'wrongpass123' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('invalid_credentials');
  });

  it('login con email inexistente devuelve el mismo error genérico', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({ email: 'nope@freetoolkit.local', password: 'whatever123' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('invalid_credentials');
  });

  it('GET /account/me requiere token y devuelve el perfil', async () => {
    const noAuth = await request(app).get('/api/v1/account/me');
    expect(noAuth.status).toBe(401);
    const res = await request(app).get('/api/v1/account/me').set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe(EMAIL);
    expect(res.body.tier).toBe('FREE');
  });

  it('refresh rota y emite nuevos tokens', async () => {
    const res = await request(app).post('/api/v1/auth/refresh').send({ refreshToken });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeTruthy();
  });

  it('registra y lista historial', async () => {
    await request(app).post('/api/v1/account/history').set('Authorization', `Bearer ${accessToken}`).send({ toolId: 'text-word-count' });
    const res = await request(app).get('/api/v1/account/history').set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0].toolId).toBe('text-word-count');
  });
});
