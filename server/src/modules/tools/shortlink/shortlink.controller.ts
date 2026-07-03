import { Router } from 'express';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { prisma } from '../../../lib/prisma';
import { validateBody } from '../../../middleware/validate';
import { resolveSubject } from '../../../middleware/quota';
import { effectiveLimit, tryConsume, revertConsume } from '../../usage/usage.service';
import { isProRequest } from '../../auth/tier';

const TOOL_ID = 'link-shorten';

const createSchema = z.object({ url: z.string().url() });

export const shortlinkRouter = Router();

shortlinkRouter.post('/', validateBody(createSchema), async (req, res, next) => {
  const subject = resolveSubject(req);
  const isPro = await isProRequest(req);
  const limit = isPro ? null : await effectiveLimit(TOOL_ID);
  let consumed = false;
  try {
    if (!isPro && limit !== null) {
      const result = await tryConsume(subject, TOOL_ID, limit);
      if (!result.allowed) {
        return res.status(429).json({ error: 'quota_exceeded', toolId: TOOL_ID, limit, upgradeUrl: '/billing/upgrade' });
      }
      consumed = true;
    }
    const code = nanoid(7);
    await prisma.shortLink.create({
      data: { code, targetUrl: req.body.url, userId: req.user?.sub ?? null },
    });
    return res.status(201).json({ code, shortUrl: `/s/${code}` });
  } catch (err) {
    if (consumed) await revertConsume(subject, TOOL_ID);
    return next(err);
  }
});

// Redirección pública (se monta en la raíz como /s/:code).
export const redirectRouter = Router();

redirectRouter.get('/:code', async (req, res, next) => {
  try {
    const link = await prisma.shortLink.findUnique({ where: { code: req.params.code } });
    if (!link) return res.status(404).json({ error: 'not_found' });
    await prisma.shortLink.update({ where: { code: link.code }, data: { clickCount: { increment: 1 } } });
    return res.redirect(302, link.targetUrl);
  } catch (err) {
    return next(err);
  }
});
