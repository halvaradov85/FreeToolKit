import { nanoid } from 'nanoid';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/error';

export type Provider = 'STRIPE' | 'MERCADOPAGO';
const PRO_PERIOD_DAYS = 30;

/**
 * ¿Hay claves reales para este proveedor? Si no, se usa el modo **simulado** (sandbox local),
 * que permite probar todo el flujo de upgrade sin claves. Enchufar Stripe/MercadoPago = añadir
 * las claves en .env e implementar la llamada real en createCheckout/handleWebhook.
 */
export function isProviderConfigured(provider: Provider): boolean {
  if (provider === 'STRIPE') return !!process.env.STRIPE_SECRET_KEY;
  return !!process.env.MERCADOPAGO_ACCESS_TOKEN;
}

/** Inicia un checkout. Devuelve la URL a la que redirigir y si es simulado. */
export async function createCheckout(userId: string, provider: Provider) {
  const sessionRef = nanoid(16);
  await prisma.payment.create({
    data: {
      userId,
      provider,
      providerPaymentId: sessionRef,
      amount: 5,
      currency: 'USD',
      status: 'PENDING',
    },
  });

  if (isProviderConfigured(provider)) {
    // TODO: crear sesión real de Stripe/MercadoPago y devolver su URL.
    throw new AppError(501, 'provider_checkout_not_implemented', 'Integración real pendiente; usa el modo simulado.');
  }
  return { checkoutUrl: `/billing/confirm?session=${sessionRef}`, simulated: true, sessionRef };
}

/**
 * Confirma un pago simulado (equivale a recibir el webhook de "pago completado"): activa la
 * suscripción y eleva el tier a Pro de inmediato (FR-019). Idempotente.
 */
export async function confirmSimulated(userId: string, sessionRef: string) {
  const payment = await prisma.payment.findFirst({
    where: { userId, providerPaymentId: sessionRef },
  });
  if (!payment) throw new AppError(404, 'session_not_found', 'Sesión de pago no encontrada.');
  if (payment.status === 'SUCCEEDED') {
    return prisma.subscription.findFirst({ where: { userId, status: 'ACTIVE' }, orderBy: { createdAt: 'desc' } });
  }

  const currentPeriodEnd = new Date(Date.now() + PRO_PERIOD_DAYS * 24 * 60 * 60 * 1000);
  const [, sub] = await prisma.$transaction([
    prisma.payment.update({ where: { id: payment.id }, data: { status: 'SUCCEEDED' } }),
    prisma.subscription.create({
      data: { userId, provider: payment.provider, providerSubId: `sim_${sessionRef}`, status: 'ACTIVE', currentPeriodEnd },
    }),
    prisma.user.update({ where: { id: userId }, data: { tier: 'PRO' } }),
  ]);
  await prisma.payment.update({ where: { id: payment.id }, data: { subscriptionId: sub.id } });
  return sub;
}

export async function getSubscription(userId: string) {
  return prisma.subscription.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } });
}

/** Cancela: conserva Pro hasta el fin del periodo pagado (FR-021). */
export async function cancelSubscription(userId: string) {
  const sub = await prisma.subscription.findFirst({ where: { userId, status: 'ACTIVE' }, orderBy: { createdAt: 'desc' } });
  if (!sub) throw new AppError(404, 'no_subscription', 'No tienes una suscripción activa.');
  return prisma.subscription.update({ where: { id: sub.id }, data: { cancelAtPeriodEnd: true } });
}

/** Webhook real (verificación + idempotencia). Inerte sin claves; estructura lista. */
export async function handleWebhook(provider: Provider, _payload: unknown, _signature?: string) {
  if (!isProviderConfigured(provider)) return { handled: false, reason: 'provider_not_configured' };
  // TODO: verificar firma e idempotencia; activar/renovar/cancelar según el evento.
  return { handled: false, reason: 'not_implemented' };
}
