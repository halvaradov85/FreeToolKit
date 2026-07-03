import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/lib/prisma';

const app = createApp();
const USER_EMAIL = 'test-admin-regular@freetoolkit.local';

async function token(email: string, password: string) {
  const res = await request(app).post('/api/v1/auth/login').send({ email, password });
  return res.body.accessToken as string;
}

describe('administración (US5, FR-027..FR-030)', () => {
  let adminToken = '';
  let userToken = '';

  beforeAll(async () => {
    adminToken = await token('admin@freetoolkit.local', 'admin1234');
    await prisma.user.deleteMany({ where: { email: USER_EMAIL } });
    const reg = await request(app).post('/api/v1/auth/register').send({ email: USER_EMAIL, password: 'regular123' });
    userToken = reg.body.accessToken;
  });

  afterAll(async () => {
    await prisma.tool.update({ where: { id: 'json-format' }, data: { enabled: true } }).catch(() => {});
    const u = await prisma.user.findUnique({ where: { email: USER_EMAIL } });
    if (u) { await prisma.refreshToken.deleteMany({ where: { userId: u.id } }); await prisma.user.delete({ where: { id: u.id } }); }
    await prisma.$disconnect();
  });

  it('un admin ve métricas agregadas', async () => {
    const res = await request(app).get('/api/v1/admin/metrics').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.totalUsers).toBeGreaterThan(0);
    expect(Array.isArray(res.body.topTools)).toBe(true);
  });

  it('un usuario normal recibe 403', async () => {
    const res = await request(app).get('/api/v1/admin/metrics').set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });

  it('desactivar una herramienta se refleja en el catálogo', async () => {
    await request(app).patch('/api/v1/admin/tools/json-format').set('Authorization', `Bearer ${adminToken}`).send({ enabled: false });
    const cat = await request(app).get('/api/v1/catalog/tools');
    const tool = cat.body.find((t: { id: string }) => t.id === 'json-format');
    expect(tool.enabled).toBe(false);
  });
});
