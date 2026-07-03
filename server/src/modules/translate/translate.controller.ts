import { Router } from 'express';
import { z } from 'zod';
import { AppError } from '../../middleware/error';
import { validateBody } from '../../middleware/validate';
import { resolveSubject } from '../../middleware/quota';
import { isProRequest } from '../auth/tier';
import { effectiveLimit, tryConsume, revertConsume } from '../usage/usage.service';

const TOOL_ID = 'text-translate';
export const translateRouter = Router();

const schema = z.object({
  text: z.string().min(1).max(2000),
  from: z.string().min(2).max(5).default('en'),
  to: z.string().min(2).max(5).default('es'),
});

translateRouter.post('/', validateBody(schema), async (req, res, next) => {
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

    const { text, from, to } = req.body;
    // MyMemory: API pública gratuita, sin clave (Principio V).
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`;
    let resp: Response;
    try {
      resp = await fetch(url);
    } catch {
      throw new AppError(503, 'translate_unavailable', 'El traductor no está disponible ahora.');
    }
    if (!resp.ok) throw new AppError(503, 'translate_unavailable', 'El traductor no está disponible ahora.');
    const data = (await resp.json()) as { responseStatus?: number; responseData?: { translatedText?: string } };
    const translated = data.responseData?.translatedText;
    if (!translated) throw new AppError(503, 'translate_unavailable', 'No se pudo traducir el texto.');

    return res.json({ from, to, translatedText: translated });
  } catch (err) {
    if (consumed) await revertConsume(subject, TOOL_ID); // un fallo no consume cupo (FR-012)
    if (err instanceof AppError) return res.status(err.status).json({ error: err.code, message: err.message });
    return next(err);
  }
});
