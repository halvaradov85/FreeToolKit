import { Router } from 'express';
import { AppError } from '../../middleware/error';

export const fxRouter = Router();

interface RatesCache {
  rates: Record<string, number>;
  ts: number;
}
const cache = new Map<string, RatesCache>();
const TTL_MS = 60 * 60 * 1000; // 1 hora (las tasas se actualizan a diario)

async function getRates(base: string): Promise<Record<string, number>> {
  const cached = cache.get(base);
  if (cached && Date.now() - cached.ts < TTL_MS) return cached.rates;
  // open.er-api.com es gratuita y no requiere clave (Principio V: degradación elegante).
  let resp: Response;
  try {
    resp = await fetch(`https://open.er-api.com/v6/latest/${base}`);
  } catch {
    throw new AppError(503, 'fx_unavailable', 'El servicio de tipos de cambio no está disponible.');
  }
  if (!resp.ok) throw new AppError(503, 'fx_unavailable', 'El servicio de tipos de cambio no está disponible.');
  const data = (await resp.json()) as { result?: string; rates?: Record<string, number> };
  if (data.result !== 'success' || !data.rates) {
    throw new AppError(503, 'fx_unavailable', 'No se pudieron obtener los tipos de cambio.');
  }
  cache.set(base, { rates: data.rates, ts: Date.now() });
  return data.rates;
}

fxRouter.get('/currencies', async (_req, res, next) => {
  try {
    const rates = await getRates('USD');
    res.json(Object.keys(rates).sort());
  } catch (err) {
    next(err);
  }
});

fxRouter.get('/convert', async (req, res, next) => {
  try {
    const from = String(req.query.from || 'USD').toUpperCase();
    const to = String(req.query.to || 'EUR').toUpperCase();
    const amount = Number(req.query.amount);
    if (!/^[A-Z]{3}$/.test(from) || !/^[A-Z]{3}$/.test(to)) {
      throw new AppError(400, 'bad_currency', 'Moneda inválida (usa código de 3 letras).');
    }
    if (!Number.isFinite(amount)) throw new AppError(400, 'bad_amount', 'Cantidad inválida.');

    const rates = await getRates(from);
    const rate = rates[to];
    if (rate === undefined) throw new AppError(400, 'unknown_currency', `Moneda no soportada: ${to}.`);
    res.json({ from, to, amount, rate, result: Math.round(amount * rate * 100) / 100 });
  } catch (err) {
    next(err);
  }
});
