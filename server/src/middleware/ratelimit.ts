import rateLimit from 'express-rate-limit';

/** Límite general de la API: protege contra abuso y picos. */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'rate_limited', message: 'Demasiadas peticiones, inténtalo en un momento.' },
});

/** Límite estricto para autenticación: frena ataques de fuerza bruta. */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'rate_limited', message: 'Demasiados intentos. Espera unos minutos.' },
});
