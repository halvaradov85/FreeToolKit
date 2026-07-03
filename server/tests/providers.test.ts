import { afterEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';

const app = createApp();

describe('proveedores externos', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('translate degrada a 503 si el proveedor no responde', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('network unavailable')));

    const res = await request(app)
      .post('/api/v1/translate')
      .set('User-Agent', 'provider-test-translate')
      .send({ text: 'Hello world', from: 'en', to: 'es' });

    expect(res.status).toBe(503);
    expect(res.body.error).toBe('translate_unavailable');
  });

  it('breach degrada a 503 si el proveedor no responde', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('network unavailable')));

    const res = await request(app)
      .post('/api/v1/breach')
      .set('User-Agent', 'provider-test-breach')
      .send({ email: 'nobody@example.invalid' });

    expect(res.status).toBe(503);
    expect(res.body.error).toBe('breach_unavailable');
  });

  it('fx degrada a 503 si el proveedor no responde', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('network unavailable')));

    const res = await request(app).get('/api/v1/fx/convert?from=USD&to=EUR&amount=10');

    expect(res.status).toBe(503);
    expect(res.body.error).toBe('fx_unavailable');
  });
});
