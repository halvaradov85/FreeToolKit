import { promisify } from 'node:util';
// libreoffice-convert envuelve el binario `soffice`. Requiere LibreOffice instalado
// (incluido en la imagen Docker del backend). En local sin LibreOffice devolverá 503.
// eslint-disable-next-line @typescript-eslint/no-var-requires
import libre from 'libreoffice-convert';
import { AppError } from '../../../middleware/error';
import type { ServerToolHandler } from './types';

const convertAsync = promisify(libre.convert) as (
  input: Buffer,
  format: string,
  filter: undefined,
) => Promise<Buffer>;

function officeToPdf(label: string, allowed: RegExp): ServerToolHandler {
  return async (files) => {
    const f = files[0];
    if (!f) throw new AppError(400, 'no_file', `Sube un archivo ${label}.`);
    if (!allowed.test(f.originalname)) {
      throw new AppError(400, 'bad_type', `El archivo no parece ${label}.`);
    }
    try {
      const pdf = await convertAsync(f.buffer, '.pdf', undefined);
      return { buffer: pdf, contentType: 'application/pdf', filename: f.originalname.replace(/\.[^.]+$/, '') + '.pdf' };
    } catch {
      throw new AppError(503, 'libreoffice_unavailable', 'La conversión no está disponible (LibreOffice no instalado en este entorno).');
    }
  };
}

export const wordToPdf = officeToPdf('Word', /\.(docx?|odt|rtf)$/i);
export const excelToPdf = officeToPdf('Excel', /\.(xlsx?|ods|csv)$/i);
