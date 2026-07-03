import { PDFDocument } from 'pdf-lib';
import { AppError } from '../../../middleware/error';
import type { ServerToolHandler } from './types';

function pdfFiles(files: Express.Multer.File[]): Express.Multer.File[] {
  const pdfs = files.filter((f) => f.mimetype === 'application/pdf');
  if (pdfs.length === 0) throw new AppError(400, 'no_pdf', 'Sube al menos un PDF.');
  return pdfs;
}

export const pdfMerge: ServerToolHandler = async (files) => {
  const pdfs = pdfFiles(files);
  if (pdfs.length < 2) throw new AppError(400, 'need_two', 'Sube al menos dos PDF para unir.');
  const out = await PDFDocument.create();
  for (const f of pdfs) {
    const src = await PDFDocument.load(f.buffer);
    const pages = await out.copyPages(src, src.getPageIndices());
    pages.forEach((p) => out.addPage(p));
  }
  const bytes = await out.save();
  return { buffer: Buffer.from(bytes), contentType: 'application/pdf', filename: 'unido.pdf' };
};

export const pdfCompress: ServerToolHandler = async (files) => {
  const [f] = pdfFiles(files);
  const src = await PDFDocument.load(f.buffer);
  // Re-guardado optimizado con object streams (reduce el tamaño en muchos PDF).
  const bytes = await src.save({ useObjectStreams: true });
  return { buffer: Buffer.from(bytes), contentType: 'application/pdf', filename: 'comprimido.pdf' };
};

export const pdfSplit: ServerToolHandler = async (files, params) => {
  const [f] = pdfFiles(files);
  const src = await PDFDocument.load(f.buffer);
  const total = src.getPageCount();
  const from = Math.max(1, Number(params.from) || 1);
  const to = Math.min(total, Number(params.to) || total);
  if (from > to) throw new AppError(400, 'bad_range', 'Rango de páginas inválido.');
  const out = await PDFDocument.create();
  const indices = Array.from({ length: to - from + 1 }, (_, i) => from - 1 + i);
  const pages = await out.copyPages(src, indices);
  pages.forEach((p) => out.addPage(p));
  const bytes = await out.save();
  return { buffer: Buffer.from(bytes), contentType: 'application/pdf', filename: `paginas_${from}-${to}.pdf` };
};
