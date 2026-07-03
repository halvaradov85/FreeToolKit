import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { TOOLS } from '@freetoolkit/shared';

const app = createApp();

describe('catálogo', () => {
  it('el catálogo base tiene exactamente 51 herramientas', () => {
    expect(TOOLS.length).toBe(51);
  });

  it('no incluye el descargador de videos (FR-035)', () => {
    const ids = TOOLS.map((t) => t.id).join(',');
    expect(ids).not.toMatch(/video|download|youtube|tiktok/i);
  });

  it('GET /api/v1/catalog/tools devuelve 51 entradas', async () => {
    const res = await request(app).get('/api/v1/catalog/tools');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(51);
  });

  it('filtra por categoría', async () => {
    const res = await request(app).get('/api/v1/catalog/tools?category=calculadoras');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(6);
  });

  it('PDF a imagen se declara client-side porque se procesa en el navegador', () => {
    const tool = TOOLS.find((t) => t.id === 'pdf-to-image');
    expect(tool?.runtime).toBe('client');
    expect(tool?.freeLimitPerDay).toBeNull();
  });
});
