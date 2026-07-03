import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { requireAuth } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import { recordHistory } from './history.service';

export const accountRouter = Router();

accountRouter.use(requireAuth);

accountRouter.get('/me', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
    if (!user) return res.status(404).json({ error: 'not_found' });
    return res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      tier: user.tier,
      themePref: user.themePref,
      localePref: user.localePref,
    });
  } catch (err) {
    return next(err);
  }
});

const prefsSchema = z.object({
  themePref: z.enum(['LIGHT', 'DARK', 'SYSTEM']).optional(),
  localePref: z.string().min(2).max(5).optional(),
});

accountRouter.patch('/preferences', validateBody(prefsSchema), async (req, res, next) => {
  try {
    const user = await prisma.user.update({ where: { id: req.user!.sub }, data: req.body });
    return res.json({ themePref: user.themePref, localePref: user.localePref });
  } catch (err) {
    return next(err);
  }
});

accountRouter.get('/history', async (req, res, next) => {
  try {
    const items = await prisma.historyItem.findMany({
      where: { userId: req.user!.sub },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return res.json(items.map((i) => ({ id: i.id, toolId: i.toolId, createdAt: i.createdAt })));
  } catch (err) {
    return next(err);
  }
});

const historySchema = z.object({ toolId: z.string().min(1) });

accountRouter.post('/history', validateBody(historySchema), async (req, res, next) => {
  try {
    await recordHistory(req.user!.sub, req.body.toolId);
    return res.status(201).json({ ok: true });
  } catch (err) {
    return next(err);
  }
});
