import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import * as billing from './billing.service';

export const billingRouter = Router();

const checkoutSchema = z.object({ provider: z.enum(['STRIPE', 'MERCADOPAGO']) });
const confirmSchema = z.object({ session: z.string().min(8) });

billingRouter.post('/checkout', requireAuth, validateBody(checkoutSchema), async (req, res, next) => {
  try {
    const result = await billing.createCheckout(req.user!.sub, req.body.provider);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

billingRouter.post('/confirm', requireAuth, validateBody(confirmSchema), async (req, res, next) => {
  try {
    const sub = await billing.confirmSimulated(req.user!.sub, req.body.session);
    res.json({ ok: true, tier: 'PRO', subscription: sub });
  } catch (err) {
    next(err);
  }
});

billingRouter.get('/subscription', requireAuth, async (req, res, next) => {
  try {
    const sub = await billing.getSubscription(req.user!.sub);
    res.json(sub ?? null);
  } catch (err) {
    next(err);
  }
});

billingRouter.delete('/subscription', requireAuth, async (req, res, next) => {
  try {
    const sub = await billing.cancelSubscription(req.user!.sub);
    res.json(sub);
  } catch (err) {
    next(err);
  }
});

// Webhook real (sin auth; verificación dentro). Inerte sin claves configuradas.
billingRouter.post('/webhook/:provider', async (req, res, next) => {
  try {
    const provider = req.params.provider.toUpperCase() === 'MERCADOPAGO' ? 'MERCADOPAGO' : 'STRIPE';
    const result = await billing.handleWebhook(provider, req.body, req.headers['stripe-signature'] as string);
    res.json(result);
  } catch (err) {
    next(err);
  }
});
