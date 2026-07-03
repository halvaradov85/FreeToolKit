import { Router } from 'express';
import { z } from 'zod';
import { TOOLS_BY_ID } from '@freetoolkit/shared';
import { prisma } from '../../lib/prisma';
import { requireAuth, requireAdmin } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';

export const adminRouter = Router();
adminRouter.use(requireAuth, requireAdmin);

adminRouter.get('/metrics', async (_req, res, next) => {
  try {
    const [totalUsers, proUsers, activeSubs, totalLinks, topUsageRaw] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { tier: 'PRO' } }),
      prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      prisma.shortLink.count(),
      prisma.usageRecord.groupBy({ by: ['toolId'], _sum: { count: true }, orderBy: { _sum: { count: 'desc' } }, take: 10 }),
    ]);
    const topTools = topUsageRaw.map((r) => ({
      toolId: r.toolId,
      name: TOOLS_BY_ID[r.toolId]?.name ?? r.toolId,
      uses: r._sum.count ?? 0,
    }));
    res.json({
      totalUsers,
      proUsers,
      freeUsers: totalUsers - proUsers,
      activeSubscriptions: activeSubs,
      shortLinks: totalLinks,
      conversionRate: totalUsers ? Math.round((proUsers / totalUsers) * 1000) / 10 : 0,
      topTools,
    });
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/users', async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: { id: true, email: true, role: true, tier: true, status: true, createdAt: true },
    });
    res.json(users);
  } catch (err) {
    next(err);
  }
});

const userPatch = z.object({
  role: z.enum(['USER', 'ADMIN']).optional(),
  status: z.enum(['ACTIVE', 'SUSPENDED']).optional(),
});

adminRouter.patch('/users/:id', validateBody(userPatch), async (req, res, next) => {
  try {
    const user = await prisma.user.update({ where: { id: req.params.id }, data: req.body });
    await prisma.adminAuditLog.create({
      data: { adminId: req.user!.sub, action: 'USER_UPDATED', targetType: 'User', targetId: user.id },
    });
    res.json({ id: user.id, role: user.role, status: user.status });
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/messages', async (_req, res, next) => {
  try {
    const [messages, unread] = await Promise.all([
      prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' }, take: 200 }),
      prisma.contactMessage.count({ where: { read: false } }),
    ]);
    res.json({ unread, messages });
  } catch (err) {
    next(err);
  }
});

adminRouter.patch('/messages/:id', async (req, res, next) => {
  try {
    const msg = await prisma.contactMessage.update({
      where: { id: req.params.id },
      data: { read: req.body?.read ?? true },
    });
    res.json({ id: msg.id, read: msg.read });
  } catch (err) {
    next(err);
  }
});

const toolPatch = z.object({
  enabled: z.boolean().optional(),
  freeLimitPerDayOverride: z.number().int().min(0).nullable().optional(),
});

adminRouter.patch('/tools/:id', validateBody(toolPatch), async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!TOOLS_BY_ID[id]) return res.status(404).json({ error: 'unknown_tool' });
    const tool = await prisma.tool.upsert({
      where: { id },
      update: req.body,
      create: { id, enabled: req.body.enabled ?? true, freeLimitPerDayOverride: req.body.freeLimitPerDayOverride ?? null },
    });
    await prisma.adminAuditLog.create({
      data: { adminId: req.user!.sub, action: 'TOOL_UPDATED', targetType: 'Tool', targetId: id },
    });
    return res.json(tool);
  } catch (err) {
    return next(err);
  }
});
