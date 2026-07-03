import crypto from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { TOOLS_BY_ID } from '@freetoolkit/shared';
import { effectiveLimit, tryConsume, revertConsume, type Subject } from '../modules/usage/usage.service';

/**
 * Clave efímera de anónimo: hash de IP + user-agent. SIN fingerprinting persistente ni
 * cookies de rastreo (Principio I). Solo sirve para acotar el cupo diario.
 */
function anonSubjectId(req: Request): string {
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || 'unknown';
  const ua = req.headers['user-agent'] ?? '';
  return crypto.createHash('sha256').update(`${ip}|${ua}`).digest('hex').slice(0, 32);
}

export function resolveSubject(req: Request): Subject {
  if (req.user) return { type: 'USER', id: req.user.sub };
  return { type: 'ANON', id: anonSubjectId(req) };
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      quota?: { subject: Subject; toolId: string; consumed: boolean };
    }
  }
}

/**
 * Aplica el cupo del tier Free en el servidor (FR-007). Los usuarios Pro y las herramientas
 * sin límite pasan directo. Si se agota el cupo → 429. Si se consume, marca req.quota para
 * poder revertir en caso de fallo posterior (FR-012).
 */
export function enforceQuota(toolId: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const def = TOOLS_BY_ID[toolId];
    if (!def) return res.status(404).json({ error: 'unknown_tool' });

    // Pro = ilimitado.
    if (req.user?.tier === 'PRO') return next();

    const limit = await effectiveLimit(toolId);
    if (limit === null) return next(); // ilimitado en Free

    const subject = resolveSubject(req);
    const result = await tryConsume(subject, toolId, limit);
    if (!result.allowed) {
      return res.status(429).json({
        error: 'quota_exceeded',
        toolId,
        limit,
        used: result.used,
        upgradeUrl: '/billing/upgrade',
      });
    }
    req.quota = { subject, toolId, consumed: true };
    res.setHeader('X-Quota-Remaining', String(result.remaining));
    return next();
  };
}

/** Revierte el consumo si el handler falló (se llama desde el manejador de errores del execute). */
export async function revertIfConsumed(req: Request): Promise<void> {
  if (req.quota?.consumed) {
    await revertConsume(req.quota.subject, req.quota.toolId);
    req.quota.consumed = false;
  }
}
