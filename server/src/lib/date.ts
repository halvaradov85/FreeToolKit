import { env } from './env';

/**
 * Fecha del día (a medianoche UTC) según la zona horaria de referencia configurada.
 * Sirve de clave para el reinicio diario de cupos (FR-009).
 */
export function usageDateFor(date = new Date()): Date {
  const ymd = new Intl.DateTimeFormat('en-CA', {
    timeZone: env.tzReference,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
  return new Date(`${ymd}T00:00:00.000Z`);
}
