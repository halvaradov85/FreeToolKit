import { AppError } from '../../middleware/error';
import type { ServerToolHandler } from '../tools/handlers/types';

/**
 * Interfaz de proveedor externo. Cada capacidad (traducción, fondo, TTS, FX, breach) se aísla
 * tras esta función. Si el proveedor no está configurado o falla, se degrada con elegancia
 * lanzando 503; el manejador de errores revierte el cupo (no se cobra un intento fallido,
 * FR-012). Las claves se leen de variables de entorno (Principio V).
 */
function providerCapability(envKey: string, label: string): ServerToolHandler {
  return async () => {
    const key = process.env[envKey];
    if (!key) {
      throw new AppError(503, 'provider_unavailable', `El proveedor de ${label} no está configurado.`);
    }
    // Integración real del proveedor en una iteración posterior (con caché cuando el ToS lo permita).
    throw new AppError(503, 'provider_unavailable', `El proveedor de ${label} no está disponible ahora.`);
  };
}

export const PROVIDER_HANDLERS: Record<string, ServerToolHandler> = {
  // text-translate tiene su propio endpoint en vivo (/api/v1/translate) con API gratuita.
  'text-spellcheck': providerCapability('PROVIDER_SPELLCHECK_KEY', 'corrección'),
  'text-to-speech': providerCapability('PROVIDER_TTS_KEY', 'texto a voz'),
  // convert-currency tiene su propio endpoint en vivo (/api/v1/fx) con API pública gratuita.
  'sec-email-breach': providerCapability('PROVIDER_BREACH_KEY', 'verificación de filtraciones'),
  'image-remove-bg': providerCapability('PROVIDER_REMOVEBG_KEY', 'quitar fondo'),
};
