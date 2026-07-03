import type { CategoryMeta, ToolCategory, ToolDef } from './types';

export const CATEGORIES: CategoryMeta[] = [
  { id: 'imagenes', label: 'Imágenes' },
  { id: 'texto', label: 'Texto' },
  { id: 'pdf', label: 'Archivos / PDF' },
  { id: 'desarrollo', label: 'Desarrollo / Tech' },
  { id: 'conversores', label: 'Conversores' },
  { id: 'calculadoras', label: 'Calculadoras' },
  { id: 'redes', label: 'Redes Sociales' },
  { id: 'seguridad', label: 'Seguridad' },
];

const C = (cat: ToolCategory) => cat;

/** Catálogo declarativo: fuente de verdad de tier y límite. */
export const TOOLS: ToolDef[] = [
  // ---------- Imágenes (8) ----------
  { id: 'image-compress', category: C('imagenes'), name: 'Compresor de imágenes', description: 'Reduce el peso de tus imágenes.', tier: 'FREE', freeLimitPerDay: 5, runtime: 'server', proFeatures: ['Ilimitado'] },
  { id: 'image-resize', category: C('imagenes'), name: 'Redimensionar imágenes', description: 'Cambia el tamaño de una imagen.', tier: 'FREE', freeLimitPerDay: 5, runtime: 'server', proFeatures: ['Ilimitado'] },
  { id: 'image-convert', category: C('imagenes'), name: 'Convertir formatos', description: 'PNG, JPG, WebP, GIF.', tier: 'FREE', freeLimitPerDay: null, runtime: 'client', proFeatures: ['Batch'] },
  { id: 'image-remove-bg', category: C('imagenes'), name: 'Quitar fondo', description: 'Elimina el fondo de una imagen.', tier: 'FREE', freeLimitPerDay: 3, runtime: 'server+provider', provider: 'removebg', proFeatures: ['Ilimitado', 'HD'] },
  { id: 'image-crop', category: C('imagenes'), name: 'Recortar (crop)', description: 'Recorta una imagen.', tier: 'FREE', freeLimitPerDay: null, runtime: 'client', proFeatures: [] },
  { id: 'image-watermark', category: C('imagenes'), name: 'Marca de agua', description: 'Añade una marca de agua.', tier: 'PRO', freeLimitPerDay: 0, runtime: 'server', proFeatures: ['Pro'] },
  { id: 'image-to-base64', category: C('imagenes'), name: 'Imagen a Base64', description: 'Convierte una imagen a Base64.', tier: 'FREE', freeLimitPerDay: null, runtime: 'client', proFeatures: [] },
  { id: 'image-favicon', category: C('imagenes'), name: 'Crear favicon', description: 'Genera un favicon desde una imagen.', tier: 'FREE', freeLimitPerDay: null, runtime: 'client', proFeatures: [] },

  // ---------- Texto (8) ----------
  { id: 'text-word-count', category: C('texto'), name: 'Contador de palabras', description: 'Cuenta palabras y caracteres.', tier: 'FREE', freeLimitPerDay: null, runtime: 'client', proFeatures: [] },
  { id: 'text-password-gen', category: C('texto'), name: 'Generador de contraseñas', description: 'Crea contraseñas seguras.', tier: 'FREE', freeLimitPerDay: null, runtime: 'client', proFeatures: ['Bóveda guardada'] },
  { id: 'text-case-convert', category: C('texto'), name: 'Mayúsculas/minúsculas', description: 'Cambia el caso del texto.', tier: 'FREE', freeLimitPerDay: null, runtime: 'client', proFeatures: [] },
  { id: 'text-lorem-ipsum', category: C('texto'), name: 'Generador de Lorem Ipsum', description: 'Texto de relleno.', tier: 'FREE', freeLimitPerDay: null, runtime: 'client', proFeatures: [] },
  { id: 'text-dedupe', category: C('texto'), name: 'Eliminar duplicados', description: 'Quita líneas duplicadas.', tier: 'FREE', freeLimitPerDay: null, runtime: 'client', proFeatures: [] },
  { id: 'text-translate', category: C('texto'), name: 'Traductor', description: 'Traduce texto.', tier: 'FREE', freeLimitPerDay: 3, runtime: 'server+provider', provider: 'translate', proFeatures: ['Ilimitado'] },
  { id: 'text-spellcheck', category: C('texto'), name: 'Corrector ortográfico', description: 'Corrige ortografía.', tier: 'FREE', freeLimitPerDay: null, runtime: 'client', proFeatures: [] },
  { id: 'text-to-speech', category: C('texto'), name: 'Texto a voz', description: 'Convierte texto en audio.', tier: 'FREE', freeLimitPerDay: 3, runtime: 'server+provider', provider: 'tts', proFeatures: ['Ilimitado'] },

  // ---------- Archivos / PDF (6) ----------
  { id: 'pdf-to-image', category: C('pdf'), name: 'PDF a imagen', description: 'Convierte páginas de PDF a imagen.', tier: 'FREE', freeLimitPerDay: null, runtime: 'client', proFeatures: [] },
  { id: 'pdf-merge', category: C('pdf'), name: 'Unir PDFs', description: 'Combina varios PDF.', tier: 'FREE', freeLimitPerDay: 3, runtime: 'server', proFeatures: ['Ilimitado'] },
  { id: 'pdf-split', category: C('pdf'), name: 'Dividir PDF', description: 'Separa un PDF en partes.', tier: 'FREE', freeLimitPerDay: 3, runtime: 'server', proFeatures: ['Ilimitado'] },
  { id: 'pdf-compress', category: C('pdf'), name: 'Comprimir PDF', description: 'Reduce el peso de un PDF.', tier: 'FREE', freeLimitPerDay: 3, runtime: 'server', proFeatures: ['Ilimitado'] },
  { id: 'word-to-pdf', category: C('pdf'), name: 'Word a PDF', description: 'Convierte .docx a PDF.', tier: 'FREE', freeLimitPerDay: 3, runtime: 'server', proFeatures: ['Ilimitado'] },
  { id: 'excel-to-pdf', category: C('pdf'), name: 'Excel a PDF', description: 'Convierte .xlsx a PDF.', tier: 'FREE', freeLimitPerDay: 3, runtime: 'server', proFeatures: ['Ilimitado'] },

  // ---------- Desarrollo / Tech (10) ----------
  { id: 'qr-generate', category: C('desarrollo'), name: 'Generador de QR', description: 'Crea códigos QR.', tier: 'FREE', freeLimitPerDay: null, runtime: 'client', proFeatures: ['Logo + colores'] },
  { id: 'qr-read', category: C('desarrollo'), name: 'Lector de QR', description: 'Lee un código QR.', tier: 'FREE', freeLimitPerDay: null, runtime: 'client', proFeatures: [] },
  { id: 'link-shorten', category: C('desarrollo'), name: 'Acortador de links', description: 'Acorta enlaces.', tier: 'FREE', freeLimitPerDay: 5, runtime: 'server', proFeatures: ['Ilimitado', 'Analytics'] },
  { id: 'json-format', category: C('desarrollo'), name: 'Formateador de JSON', description: 'Formatea e identa JSON.', tier: 'FREE', freeLimitPerDay: null, runtime: 'client', proFeatures: [] },
  { id: 'color-picker', category: C('desarrollo'), name: 'Selector de colores', description: 'Elige y convierte colores.', tier: 'FREE', freeLimitPerDay: null, runtime: 'client', proFeatures: ['Paletas guardadas'] },
  { id: 'minify', category: C('desarrollo'), name: 'Minificador CSS/JS/HTML', description: 'Reduce el tamaño del código.', tier: 'FREE', freeLimitPerDay: null, runtime: 'client', proFeatures: [] },
  { id: 'seo-meta-tags', category: C('desarrollo'), name: 'Meta tags SEO', description: 'Genera meta tags.', tier: 'FREE', freeLimitPerDay: null, runtime: 'client', proFeatures: [] },
  { id: 'json-xml-validate', category: C('desarrollo'), name: 'Validador JSON/XML', description: 'Valida JSON y XML.', tier: 'FREE', freeLimitPerDay: null, runtime: 'client', proFeatures: [] },
  { id: 'base64', category: C('desarrollo'), name: 'Encoder/Decoder Base64', description: 'Codifica y decodifica Base64.', tier: 'FREE', freeLimitPerDay: null, runtime: 'client', proFeatures: [] },
  { id: 'htaccess-gen', category: C('desarrollo'), name: 'Generador de .htaccess', description: 'Crea reglas .htaccess.', tier: 'FREE', freeLimitPerDay: null, runtime: 'client', proFeatures: [] },

  // ---------- Conversores (6) ----------
  { id: 'convert-units', category: C('conversores'), name: 'Conversor de unidades', description: 'Longitud, peso, volumen…', tier: 'FREE', freeLimitPerDay: null, runtime: 'client', proFeatures: [] },
  { id: 'convert-currency', category: C('conversores'), name: 'Conversor de monedas', description: 'Tipos de cambio en vivo.', tier: 'FREE', freeLimitPerDay: null, runtime: 'server+provider', provider: 'fx', proFeatures: [] },
  { id: 'convert-timezone', category: C('conversores'), name: 'Conversor de zona horaria', description: 'Convierte entre zonas horarias.', tier: 'FREE', freeLimitPerDay: null, runtime: 'client', proFeatures: [] },
  { id: 'convert-temperature', category: C('conversores'), name: 'Conversor de temperatura', description: 'Celsius, Fahrenheit, Kelvin.', tier: 'FREE', freeLimitPerDay: null, runtime: 'client', proFeatures: [] },
  { id: 'convert-number-base', category: C('conversores'), name: 'Conversor de numeración', description: 'Bin, hex, oct, dec.', tier: 'FREE', freeLimitPerDay: null, runtime: 'client', proFeatures: [] },
  { id: 'convert-speed', category: C('conversores'), name: 'Velocidad de internet', description: 'Mbps, MB/s, etc.', tier: 'FREE', freeLimitPerDay: null, runtime: 'client', proFeatures: [] },

  // ---------- Calculadoras (6) ----------
  { id: 'calc-bmi', category: C('calculadoras'), name: 'Calculadora de IMC', description: 'Índice de masa corporal.', tier: 'FREE', freeLimitPerDay: null, runtime: 'client', proFeatures: [] },
  { id: 'calc-loan', category: C('calculadoras'), name: 'Préstamos/intereses', description: 'Cuota y total de un préstamo.', tier: 'FREE', freeLimitPerDay: null, runtime: 'client', proFeatures: [] },
  { id: 'calc-discount', category: C('calculadoras'), name: 'Calculadora de descuentos', description: 'Precio con descuento.', tier: 'FREE', freeLimitPerDay: null, runtime: 'client', proFeatures: [] },
  { id: 'calc-age', category: C('calculadoras'), name: 'Calculadora de edad', description: 'Edad exacta desde una fecha.', tier: 'FREE', freeLimitPerDay: null, runtime: 'client', proFeatures: [] },
  { id: 'calc-percentage', category: C('calculadoras'), name: 'Calculadora de porcentajes', description: 'Porcentajes y variaciones.', tier: 'FREE', freeLimitPerDay: null, runtime: 'client', proFeatures: [] },
  { id: 'calc-tip', category: C('calculadoras'), name: 'Calculadora de propinas', description: 'Propina y división de cuenta.', tier: 'FREE', freeLimitPerDay: null, runtime: 'client', proFeatures: [] },

  // ---------- Redes Sociales (3) — descargador de videos EXCLUIDO ----------
  { id: 'social-resize', category: C('redes'), name: 'Redimensionar para redes', description: 'IG, FB, TW.', tier: 'FREE', freeLimitPerDay: null, runtime: 'client', proFeatures: ['Batch'] },
  { id: 'social-hashtags', category: C('redes'), name: 'Generador de hashtags', description: 'Sugiere hashtags.', tier: 'FREE', freeLimitPerDay: null, runtime: 'client', proFeatures: ['Tendencias'] },
  { id: 'social-tweet-count', category: C('redes'), name: 'Contador para tweets', description: 'Caracteres restantes.', tier: 'FREE', freeLimitPerDay: null, runtime: 'client', proFeatures: [] },

  // ---------- Seguridad (4) ----------
  { id: 'sec-password-strength', category: C('seguridad'), name: 'Fortaleza de contraseña', description: 'Mide la robustez.', tier: 'FREE', freeLimitPerDay: null, runtime: 'client', proFeatures: [] },
  { id: 'sec-hash-gen', category: C('seguridad'), name: 'Generador de hash', description: 'MD5, SHA-256.', tier: 'FREE', freeLimitPerDay: null, runtime: 'client', proFeatures: [] },
  { id: 'sec-encrypt-text', category: C('seguridad'), name: 'Encriptar/Desencriptar', description: 'Cifra texto con una clave.', tier: 'FREE', freeLimitPerDay: null, runtime: 'client', proFeatures: [] },
  { id: 'sec-email-breach', category: C('seguridad'), name: 'Email hackeado', description: 'Comprueba filtraciones.', tier: 'FREE', freeLimitPerDay: 3, runtime: 'server+provider', provider: 'breach', proFeatures: ['Ilimitado'] },
];

export const TOOLS_BY_ID: Record<string, ToolDef> = Object.fromEntries(
  TOOLS.map((t) => [t.id, t]),
);

if (TOOLS.length !== 51) {
  // Salvaguarda de integridad del catálogo (FR-001 / FR-035).
  throw new Error(`El catálogo debe tener 51 herramientas, tiene ${TOOLS.length}`);
}
