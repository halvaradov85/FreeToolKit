// Logger mínimo que NUNCA debe registrar secretos ni contenido de usuario (Principio I).
type Level = 'info' | 'warn' | 'error';

function log(level: Level, msg: string, meta?: Record<string, unknown>) {
  const safe = meta ? sanitize(meta) : undefined;
  const line = { ts: new Date().toISOString(), level, msg, ...(safe ?? {}) };
  // eslint-disable-next-line no-console
  console[level === 'info' ? 'log' : level](JSON.stringify(line));
}

const REDACT = /(password|secret|token|authorization|cookie|apikey|api_key)/i;

function sanitize(meta: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(meta)) {
    out[k] = REDACT.test(k) ? '[redacted]' : v;
  }
  return out;
}

export const logger = {
  info: (msg: string, meta?: Record<string, unknown>) => log('info', msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => log('warn', msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => log('error', msg, meta),
};
