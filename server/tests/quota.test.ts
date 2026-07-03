import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '../src/lib/prisma';
import { tryConsume, revertConsume, usageStatus, effectiveLimit } from '../src/modules/usage/usage.service';

const SUBJECT = { type: 'ANON' as const, id: 'test-anon-quota-subject' };
const TOOL = 'pdf-merge'; // límite 3/día en el catálogo

async function cleanup() {
  await prisma.usageRecord.deleteMany({ where: { subjectType: SUBJECT.type, subjectId: SUBJECT.id } });
}

describe('sistema de cuotas (SC-002, FR-007..FR-012)', () => {
  beforeAll(cleanup);
  afterAll(async () => { await cleanup(); await prisma.$disconnect(); });

  it('el límite efectivo de pdf-merge es 3', async () => {
    expect(await effectiveLimit(TOOL)).toBe(3);
  });

  it('permite hasta el límite y bloquea el siguiente uso', async () => {
    const limit = 3;
    for (let i = 0; i < limit; i++) {
      const r = await tryConsume(SUBJECT, TOOL, limit);
      expect(r.allowed).toBe(true);
    }
    const blocked = await tryConsume(SUBJECT, TOOL, limit);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it('revertir un consumo permite un uso más (no se cobra el intento fallido)', async () => {
    await revertConsume(SUBJECT, TOOL);
    const r = await tryConsume(SUBJECT, TOOL, 3);
    expect(r.allowed).toBe(true);
  });

  it('usageStatus refleja ilimitado cuando el límite es null', async () => {
    const s = await usageStatus(SUBJECT, 'text-word-count', null);
    expect(s.remaining).toBeNull();
  });
});
