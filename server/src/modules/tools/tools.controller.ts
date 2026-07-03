import { Router } from 'express';
import multer from 'multer';
import { TOOLS_BY_ID } from '@freetoolkit/shared';
import { AppError } from '../../middleware/error';
import { resolveSubject } from '../../middleware/quota';
import { effectiveLimit, tryConsume, revertConsume, usageStatus } from '../usage/usage.service';
import { SERVER_TOOL_HANDLERS } from './server-tools';
import { recordHistory } from '../account/history.service';
import { isProRequest } from '../auth/tier';

export const toolsRouter = Router();

// Subida en memoria: el contenido nunca se escribe en disco → efímero (Principio I, SC-007).
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });

toolsRouter.get('/:toolId/quota', async (req, res, next) => {
  try {
    const def = TOOLS_BY_ID[req.params.toolId];
    if (!def) return res.status(404).json({ error: 'unknown_tool' });
    if (await isProRequest(req)) {
      return res.json({ toolId: def.id, limit: null, used: 0, remaining: null, unlimited: true });
    }
    const limit = await effectiveLimit(def.id);
    const subject = resolveSubject(req);
    const { used, remaining } = await usageStatus(subject, def.id, limit);
    return res.json({ toolId: def.id, limit, used, remaining, unlimited: limit === null });
  } catch (err) {
    return next(err);
  }
});

toolsRouter.post('/:toolId/execute', upload.array('files', 10), async (req, res, next) => {
  const def = TOOLS_BY_ID[req.params.toolId];
  if (!def) return res.status(404).json({ error: 'unknown_tool' });
  if (def.runtime === 'client') {
    return res.status(400).json({ error: 'client_tool', message: 'Esta herramienta se ejecuta en el navegador.' });
  }
  const handler = SERVER_TOOL_HANDLERS[def.id];
  if (!handler) return res.status(501).json({ error: 'not_implemented' });

  const subject = resolveSubject(req);
  const isPro = await isProRequest(req);

  // Herramientas exclusivas de Pro.
  if (def.tier === 'PRO' && !isPro) {
    return res.status(402).json({ error: 'pro_required', toolId: def.id, upgradeUrl: '/billing/upgrade' });
  }

  const limit = isPro ? null : await effectiveLimit(def.id);
  let consumed = false;

  try {
    // Aplicar cupo ANTES de procesar (FR-008).
    if (!isPro && limit !== null) {
      const result = await tryConsume(subject, def.id, limit);
      if (!result.allowed) {
        return res.status(429).json({ error: 'quota_exceeded', toolId: def.id, limit, upgradeUrl: '/billing/upgrade' });
      }
      consumed = true;
      res.setHeader('X-Quota-Remaining', String(result.remaining));
    }

    let params: Record<string, unknown> = {};
    if (typeof req.body?.params === 'string') {
      try { params = JSON.parse(req.body.params); } catch { params = {}; }
    } else if (req.body && typeof req.body === 'object') {
      params = req.body;
    }

    const files = (req.files as Express.Multer.File[]) ?? [];
    const out = await handler(files, params);

    if (req.user) await recordHistory(req.user.sub, def.id);

    res.setHeader('Content-Type', out.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${out.filename}"`);
    return res.send(out.buffer);
  } catch (err) {
    // Un fallo del sistema/proveedor NO consume cupo (FR-012).
    if (consumed) await revertConsume(subject, def.id);
    if (err instanceof AppError) {
      return res.status(err.status).json({ error: err.code, message: err.message });
    }
    return next(err);
  }
});
