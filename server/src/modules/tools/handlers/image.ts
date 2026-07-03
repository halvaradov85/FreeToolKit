import sharp from 'sharp';
import { AppError } from '../../../middleware/error';
import type { ServerToolHandler } from './types';

function firstImageBuffer(files: Express.Multer.File[]): Buffer {
  const f = files[0];
  if (!f) throw new AppError(400, 'no_file', 'Falta la imagen.');
  return f.buffer; // en memoria → efímero (Principio I); sharp valida el contenido real
}

export const imageCompress: ServerToolHandler = async (files, params) => {
  const buf = firstImageBuffer(files);
  const quality = Math.min(95, Math.max(30, Number(params.quality) || 70));
  try {
    const out = await sharp(buf).jpeg({ quality, mozjpeg: true }).toBuffer();
    return { buffer: out, contentType: 'image/jpeg', filename: 'comprimida.jpg' };
  } catch {
    throw new AppError(400, 'bad_image', 'El archivo no es una imagen válida.');
  }
};

const POSITIONS = new Set([
  'northwest', 'north', 'northeast', 'west', 'center', 'east', 'southwest', 'south', 'southeast',
]);

export const imageWatermark: ServerToolHandler = async (files, params) => {
  const buf = firstImageBuffer(files);
  const text = String(params.text || 'FreeToolKit').slice(0, 60);
  const opacity = Math.min(1, Math.max(0.1, Number(params.opacity) || 0.5));
  const position = POSITIONS.has(String(params.position)) ? String(params.position) : 'southeast';
  const color = /^#[0-9a-fA-F]{6}$/.test(String(params.color)) ? String(params.color) : '#ffffff';
  try {
    const img = sharp(buf);
    const meta = await img.metadata();
    const width = meta.width ?? 800;
    const height = meta.height ?? 600;
    const fontSize = Math.max(16, Math.round(width / 18));
    const pad = Math.round(fontSize * 0.7);
    const escaped = text.replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c] as string));

    // Posiciona el texto dentro de un SVG del tamaño de la imagen, según la ubicación elegida.
    let x = width / 2;
    let anchor = 'middle';
    if (position.includes('west')) { x = pad; anchor = 'start'; }
    else if (position.includes('east')) { x = width - pad; anchor = 'end'; }
    let y = height / 2 + fontSize / 3;
    if (position.startsWith('north')) y = fontSize + pad;
    else if (position.startsWith('south')) y = height - pad;

    const svg = Buffer.from(
      `<svg width="${width}" height="${height}">
        <text x="${x}" y="${y}" text-anchor="${anchor}"
          font-family="sans-serif" font-size="${fontSize}" font-weight="700"
          fill="${color}" fill-opacity="${opacity}"
          stroke="black" stroke-opacity="${opacity * 0.4}" stroke-width="1">${escaped}</text>
      </svg>`,
    );
    const out = await img.composite([{ input: svg, gravity: 'northwest' }]).png().toBuffer();
    return { buffer: out, contentType: 'image/png', filename: 'marca-de-agua.png' };
  } catch {
    throw new AppError(400, 'bad_image', 'El archivo no es una imagen válida.');
  }
};

export const imageResize: ServerToolHandler = async (files, params) => {
  const buf = firstImageBuffer(files);
  const width = Number(params.width) || undefined;
  const height = Number(params.height) || undefined;
  if (!width && !height) throw new AppError(400, 'bad_params', 'Indica ancho o alto.');
  try {
    const out = await sharp(buf)
      .resize({ width, height, fit: 'inside', withoutEnlargement: true })
      .png()
      .toBuffer();
    return { buffer: out, contentType: 'image/png', filename: 'redimensionada.png' };
  } catch {
    throw new AppError(400, 'bad_image', 'El archivo no es una imagen válida.');
  }
};
