import type { NextFunction, Request, Response } from 'express';
import { verifyAccessToken, type AccessClaims } from '../modules/auth/jwt';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AccessClaims;
    }
  }
}

/** Adjunta req.user si hay un Bearer válido; no bloquea si falta (uso anónimo permitido). */
export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    try {
      req.user = verifyAccessToken(header.slice(7));
    } catch {
      // token inválido → se trata como anónimo
    }
  }
  next();
}

/** Exige autenticación. */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  try {
    req.user = verifyAccessToken(header.slice(7));
    return next();
  } catch {
    return res.status(401).json({ error: 'unauthorized' });
  }
}

/** Exige rol admin. */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'forbidden' });
  }
  return next();
}
