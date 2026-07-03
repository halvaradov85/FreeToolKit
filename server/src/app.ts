import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { optionalAuth } from './middleware/auth';
import { apiLimiter, authLimiter } from './middleware/ratelimit';
import { errorHandler, notFound } from './middleware/error';
import { catalogRouter } from './modules/catalog/catalog.controller';
import { toolsRouter } from './modules/tools/tools.controller';
import { shortlinkRouter, redirectRouter } from './modules/tools/shortlink/shortlink.controller';
import { authRouter } from './modules/auth/auth.controller';
import { accountRouter } from './modules/account/account.controller';
import { billingRouter } from './modules/billing/billing.controller';
import { adminRouter } from './modules/admin/admin.controller';
import { fxRouter } from './modules/fx/fx.controller';
import { translateRouter } from './modules/translate/translate.controller';
import { breachRouter } from './modules/breach/breach.controller';
import { contactRouter } from './modules/contact/contact.controller';

export function createApp() {
  const app = express();

  // Detrás de un proxy/balanceador: confía en la primera cabecera para obtener la IP real
  // (necesario para el rate-limit y la clave efímera de anónimos).
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '1mb' }));
  app.use('/api', apiLimiter);
  app.use(optionalAuth);

  app.get('/api/v1/health', (_req, res) => res.json({ status: 'ok' }));

  app.use('/api/v1/auth', authLimiter, authRouter);
  app.use('/api/v1/account', accountRouter);
  app.use('/api/v1/billing', billingRouter);
  app.use('/api/v1/admin', adminRouter);
  app.use('/api/v1/catalog', catalogRouter);
  app.use('/api/v1/fx', fxRouter);
  app.use('/api/v1/translate', translateRouter);
  app.use('/api/v1/breach', breachRouter);
  app.use('/api/v1/contact', contactRouter);
  app.use('/api/v1/tools/link-shorten', shortlinkRouter);
  app.use('/api/v1/tools', toolsRouter);
  app.use('/s', redirectRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
