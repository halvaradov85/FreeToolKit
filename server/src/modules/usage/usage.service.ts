import { TOOLS_BY_ID } from '@freetoolkit/shared';
import { prisma } from '../../lib/prisma';
import { usageDateFor } from '../../lib/date';

export type SubjectType = 'USER' | 'ANON';
export interface Subject {
  type: SubjectType;
  id: string;
}

/** Límite efectivo del tier Free para una herramienta (override de admin > catálogo). null = ilimitado. */
export async function effectiveLimit(toolId: string): Promise<number | null> {
  const def = TOOLS_BY_ID[toolId];
  if (!def) return null;
  let limit = def.freeLimitPerDay;
  try {
    const override = await prisma.tool.findUnique({ where: { id: toolId } });
    if (override && override.freeLimitPerDayOverride !== null && override.freeLimitPerDayOverride !== undefined) {
      limit = override.freeLimitPerDayOverride;
    }
  } catch {
    // sin BD → se usa el límite del catálogo
  }
  return limit;
}

/**
 * Intenta consumir un uso de forma atómica. Devuelve si se permitió y el consumo del día.
 * Crea la fila si no existe y aplica un incremento condicional `count < limit`, de modo que
 * dos peticiones concurrentes no puedan exceder el cupo (SC-002).
 */
export async function tryConsume(
  subject: Subject,
  toolId: string,
  limit: number,
): Promise<{ allowed: boolean; used: number; remaining: number }> {
  const usageDate = usageDateFor();
  const where = {
    subjectType_subjectId_toolId_usageDate: {
      subjectType: subject.type,
      subjectId: subject.id,
      toolId,
      usageDate,
    },
  };

  await prisma.usageRecord.upsert({
    where,
    update: {},
    create: { subjectType: subject.type, subjectId: subject.id, toolId, usageDate, count: 0 },
  });

  const updated = await prisma.usageRecord.updateMany({
    where: { subjectType: subject.type, subjectId: subject.id, toolId, usageDate, count: { lt: limit } },
    data: { count: { increment: 1 } },
  });

  const row = await prisma.usageRecord.findUnique({ where });
  const used = row?.count ?? limit;
  return { allowed: updated.count > 0, used, remaining: Math.max(0, limit - used) };
}

/** Revierte un consumo (p. ej. si la operación falla por causa del sistema o un proveedor). FR-012. */
export async function revertConsume(subject: Subject, toolId: string): Promise<void> {
  const usageDate = usageDateFor();
  await prisma.usageRecord.updateMany({
    where: { subjectType: subject.type, subjectId: subject.id, toolId, usageDate, count: { gt: 0 } },
    data: { count: { decrement: 1 } },
  });
}

export async function usageStatus(
  subject: Subject,
  toolId: string,
  limit: number | null,
): Promise<{ used: number; remaining: number | null }> {
  if (limit === null) return { used: 0, remaining: null };
  const usageDate = usageDateFor();
  const row = await prisma.usageRecord.findUnique({
    where: {
      subjectType_subjectId_toolId_usageDate: {
        subjectType: subject.type,
        subjectId: subject.id,
        toolId,
        usageDate,
      },
    },
  });
  const used = row?.count ?? 0;
  return { used, remaining: Math.max(0, limit - used) };
}
