import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { validateBody } from '../../middleware/validate';
import { optionalAuth } from '../../middleware/auth';

export const contactRouter = Router();

const schema = z.object({
  name: z.string().max(120).optional(),
  email: z.string().email().optional(),
  message: z.string().min(3).max(4000),
});

// Cualquiera (anónimo o registrado) puede enviar un mensaje al buzón del admin.
contactRouter.post('/', optionalAuth, validateBody(schema), async (req, res, next) => {
  try {
    await prisma.contactMessage.create({
      data: {
        name: req.body.name ?? null,
        email: req.body.email ?? null,
        message: req.body.message,
        userId: req.user?.sub ?? null,
      },
    });
    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
});
