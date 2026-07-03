import { Router } from 'express';
import { z } from 'zod';
import { validateBody } from '../../middleware/validate';
import { requireAuth } from '../../middleware/auth';
import * as authService from './auth.service';

export const authRouter = Router();

// El registro exige una contraseña fuerte (8+).
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.'),
});

// El login solo requiere que no esté vacía (la validación real es contra el hash guardado).
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshSchema = z.object({ refreshToken: z.string().min(10) });

authRouter.post('/register', validateBody(registerSchema), async (req, res, next) => {
  try {
    const tokens = await authService.register(req.body.email, req.body.password);
    res.status(201).json(tokens);
  } catch (err) {
    next(err);
  }
});

authRouter.post('/login', validateBody(loginSchema), async (req, res, next) => {
  try {
    const tokens = await authService.login(req.body.email, req.body.password);
    res.json(tokens);
  } catch (err) {
    next(err);
  }
});

authRouter.post('/refresh', validateBody(refreshSchema), async (req, res, next) => {
  try {
    const tokens = await authService.refresh(req.body.refreshToken);
    res.json(tokens);
  } catch (err) {
    next(err);
  }
});

authRouter.post('/logout', requireAuth, validateBody(refreshSchema), async (req, res, next) => {
  try {
    await authService.logout(req.body.refreshToken);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
