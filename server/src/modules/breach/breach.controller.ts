import { Router } from 'express';
import { z } from 'zod';
import { AppError } from '../../middleware/error';
import { validateBody } from '../../middleware/validate';
import { resolveSubject } from '../../middleware/quota';
import { isProRequest } from '../auth/tier';
import { effectiveLimit, tryConsume, revertConsume } from '../usage/usage.service';

const TOOL_ID = 'sec-email-breach';
export const breachRouter = Router();

const schema = z.object({ email: z.string().email() });

breachRouter.post('/', validateBody(schema), async (req, res, next) => {
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
      res.setHeader('X-Quota-Remaining', String(result.remaining));
    }

    const email = encodeURIComponent(req.body.email);
    // XposedOrNot: API pública gratuita, sin clave (Principio V).
    let resp: Response;
    try {
      resp = await fetch(`https://api.xposedornot.com/v1/check-email/${email}`);
    } catch {
      throw new AppError(503, 'breach_unavailable', 'El servicio de filtraciones no está disponible.');
    }
    if (resp.status === 404) {
      return res.json({ breached: false, breaches: [] });
    }
    if (!resp.ok) throw new AppError(503, 'breach_unavailable', 'El servicio de filtraciones no está disponible.');
    const data = (await resp.json()) as { breaches?: string[][]; Error?: string };
    if (data.Error || !data.breaches) {
      return res.json({ breached: false, breaches: [] });
    }
    const breaches = data.breaches.flat();
    return res.json({ breached: breaches.length > 0, breaches });
  } catch (err) {
    if (consumed) await revertConsume(subject, TOOL_ID); // un fallo no consume cupo (FR-012)
    if (err instanceof AppError) return res.status(err.status).json({ error: err.code, message: err.message });
    return next(err);
  }
});
