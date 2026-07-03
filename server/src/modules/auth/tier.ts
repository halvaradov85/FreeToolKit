import type { Request } from 'express';
import { prisma } from '../../lib/prisma';

/**
 * Degrada a Free de forma perezosa si la suscripción Pro caducó (sin necesidad de un cron):
 * si el usuario es PRO pero no tiene una suscripción activa vigente, se marca EXPIRED y
 * vuelve a FREE (FR-021/FR-022).
 */
async function resolveTier(userId: string, tokenTier: 'FREE' | 'PRO'): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { tier: true, role: true } });
  if (user?.role === 'ADMIN') return true; // los admin siempre tienen acceso Pro
  const tier = user?.tier ?? tokenTier;
  if (tier !== 'PRO') return false;

  const sub = await prisma.subscription.findFirst({
    where: { userId, status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
  });
  const vigente = sub && sub.currentPeriodEnd.getTime() > Date.now();
  if (vigente) return true;

  // Caducó: degradar.
  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { tier: 'FREE' } }),
    ...(sub ? [prisma.subscription.update({ where: { id: sub.id }, data: { status: 'EXPIRED' } })] : []),
  ]);
  return false;
}

/**
 * Tier efectivo (en vivo) de la petición. Pro surte efecto de inmediato (FR-019) y caduca
 * solo cuando corresponde. Se cachea por petición.
 */
export async function isProRequest(req: Request): Promise<boolean> {
  if (!req.user) return false;
  const r = req as Request & { _isPro?: boolean };
  if (r._isPro !== undefined) return r._isPro;
  let pro = false;
  try {
    pro = await resolveTier(req.user.sub, req.user.tier);
  } catch {
    pro = req.user.tier === 'PRO';
  }
  r._isPro = pro;
  return pro;
}
