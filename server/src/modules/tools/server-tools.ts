import { AppError } from '../../middleware/error';
import { imageCompress, imageResize, imageWatermark } from './handlers/image';
import { pdfMerge, pdfSplit, pdfCompress } from './handlers/pdf';
import { wordToPdf, excelToPdf } from './handlers/office';
import { PROVIDER_HANDLERS } from '../providers/provider';
import type { ServerToolHandler } from './handlers/types';

const notImplemented = (label: string): ServerToolHandler => {
  return async () => {
    throw new AppError(501, 'not_implemented', `${label} llega en una próxima iteración.`);
  };
};

/** Registro de manejadores server-side. Las herramientas no implementadas devuelven 501. */
export const SERVER_TOOL_HANDLERS: Record<string, ServerToolHandler> = {
  // Imágenes
  'image-compress': imageCompress,
  'image-resize': imageResize,
  'image-watermark': imageWatermark,
  // PDF
  'pdf-merge': pdfMerge,
  'pdf-split': pdfSplit,
  'pdf-compress': pdfCompress,
  'pdf-to-image': notImplemented('PDF a imagen'),
  'word-to-pdf': wordToPdf,
  'excel-to-pdf': excelToPdf,
  // Proveedores externos (aislados, degradan con elegancia)
  ...PROVIDER_HANDLERS,
};
