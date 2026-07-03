import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/lib/prisma';

const app = createApp();
const EMAIL = 'test-billing-user@freetoolkit.local';
const PASSWORD = 'billingpass123';

async function cleanup() {
  const u = await prisma.user.findUnique({ where: { email: EMAIL } });
  if (u) {
    await prisma.payment.deleteMany({ where: { userId: u.id } });
    await prisma.subscription.deleteMany({ where: { userId: u.id } });
    await prisma.refreshToken.deleteMany({ where: { userId: u.id } });
    await prisma.user.delete({ where: { id: u.id } });
  }
}

describe('pagos / Pro (US4, FR-018..FR-021)', () => {
  let token = '';
  beforeAll(async () => {
    await cleanup();
    const res = await request(app).post('/api/v1/auth/register').send({ email: EMAIL, password: PASSWORD });
    token = res.body.accessToken;
  });
  afterAll(async () => { await cleanup(); await prisma.$disconnect(); });

  it('checkout devuelve una URL (modo simulado sin claves)', async () => {
    const res = await request(app).post('/api/v1/billing/checkout').set('Authorization', `Bearer ${token}`).send({ provider: 'STRIPE' });
    expect(res.status).toBe(200);
    expect(res.body.checkoutUrl).toContain('/billing/confirm?session=');
    expect(res.body.simulated).toBe(true);
  });

  it('confirmar el pago activa Pro', async () => {
    const checkout = await request(app).post('/api/v1/billing/checkout').set('Authorization', `Bearer ${token}`).send({ provider: 'STRIPE' });
    const session = new URL('http://x' + checkout.body.checkoutUrl).searchParams.get('session')!;
    const res = await request(app).post('/api/v1/billing/confirm').set('Authorization', `Bearer ${token}`).send({ session });
    expect(res.status).toBe(200);
    expect(res.body.tier).toBe('PRO');
    const me = await request(app).get('/api/v1/account/me').set('Authorization', `Bearer ${token}`);
    expect(me.body.tier).toBe('PRO');
  });

  it('cancelar mantiene Pro hasta fin de periodo', async () => {
    const res = await request(app).delete('/api/v1/billing/subscription').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.cancelAtPeriodEnd).toBe(true);
    expect(res.body.status).toBe('ACTIVE');
  });
});
