# Contrato: Catálogo de herramientas (51)

Fuente de verdad de `tier` y `freeLimitPerDay`. `runtime`: `client` (sin backend) /
`server` / `server+provider`. La tabla `Tool` en BD solo guarda overrides de admin
(`enabled`, `freeLimitPerDayOverride`).

Convención: `freeLimitPerDay = ∞` significa sin límite en Free; `Pro` indica la función o
mejora que desbloquea el tier Pro.

## Imágenes (8)

| id | Nombre | tier | freeLimitPerDay | runtime | Pro |
|----|--------|------|-----------------|---------|-----|
| `image-compress` | Compresor de imágenes | FREE | 5 | server | Ilimitado |
| `image-resize` | Redimensionar imágenes | FREE | 5 | server | Ilimitado |
| `image-convert` | Convertir formatos (PNG/JPG/WebP/GIF) | FREE | ∞ | client | Batch |
| `image-remove-bg` | Quitar fondo | FREE | 3 | server+provider | Ilimitado + HD |
| `image-crop` | Recortar (crop) | FREE | ∞ | client | — |
| `image-watermark` | Marca de agua | PRO | — | server | Pro |
| `image-to-base64` | Imagen a Base64 | FREE | ∞ | client | — |
| `image-favicon` | Crear favicon | FREE | ∞ | client | — |

## Texto (8)

| id | Nombre | tier | freeLimitPerDay | runtime | Pro |
|----|--------|------|-----------------|---------|-----|
| `text-word-count` | Contador de palabras/caracteres | FREE | ∞ | client | — |
| `text-password-gen` | Generador de contraseñas | FREE | ∞ | client | Bóveda guardada |
| `text-case-convert` | Mayúsculas/minúsculas | FREE | ∞ | client | — |
| `text-lorem-ipsum` | Generador de Lorem Ipsum | FREE | ∞ | client | — |
| `text-dedupe` | Eliminar texto duplicado | FREE | ∞ | client | — |
| `text-translate` | Traductor (API) | FREE | 3 | server+provider | Ilimitado |
| `text-spellcheck` | Corrector ortográfico | FREE | 3 | server+provider | Ilimitado |
| `text-to-speech` | Texto a voz | FREE | 3 | server+provider | Ilimitado |

## Archivos / PDF (6)

| id | Nombre | tier | freeLimitPerDay | runtime | Pro |
|----|--------|------|-----------------|---------|-----|
| `pdf-to-image` | PDF a imagen | FREE | 3 | server | Ilimitado |
| `pdf-merge` | Unir PDFs | FREE | 3 | server | Ilimitado |
| `pdf-split` | Dividir PDF | FREE | 3 | server | Ilimitado |
| `pdf-compress` | Comprimir PDF | FREE | 3 | server | Ilimitado |
| `word-to-pdf` | Word a PDF | FREE | 3 | server | Ilimitado |
| `excel-to-pdf` | Excel a PDF | FREE | 3 | server | Ilimitado |

## Desarrollo / Tech (10)

| id | Nombre | tier | freeLimitPerDay | runtime | Pro |
|----|--------|------|-----------------|---------|-----|
| `qr-generate` | Generador de QR | FREE | ∞ | client | Logo + colores |
| `qr-read` | Lector de QR | FREE | ∞ | client | — |
| `link-shorten` | Acortador de links | FREE | 5 | server | Ilimitado + analytics |
| `json-format` | Formateador de JSON | FREE | ∞ | client | — |
| `color-picker` | Selector de colores | FREE | ∞ | client | Paletas guardadas |
| `minify` | Minificador CSS/JS/HTML | FREE | ∞ | client | — |
| `seo-meta-tags` | Generador de meta tags SEO | FREE | ∞ | client | — |
| `json-xml-validate` | Validador de JSON/XML | FREE | ∞ | client | — |
| `base64` | Encoder/Decoder Base64 | FREE | ∞ | client | — |
| `htaccess-gen` | Generador de .htaccess | FREE | ∞ | client | — |

## Conversores (6)

| id | Nombre | tier | freeLimitPerDay | runtime | Pro |
|----|--------|------|-----------------|---------|-----|
| `convert-units` | Conversor de unidades | FREE | ∞ | client | — |
| `convert-currency` | Conversor de monedas (en vivo) | FREE | ∞ | server+provider | — |
| `convert-timezone` | Conversor de zona horaria | FREE | ∞ | client | — |
| `convert-temperature` | Conversor de temperatura | FREE | ∞ | client | — |
| `convert-number-base` | Conversor de numeración (bin/hex/oct) | FREE | ∞ | client | — |
| `convert-speed` | Conversor de velocidad de internet | FREE | ∞ | client | — |

## Calculadoras (6)

| id | Nombre | tier | freeLimitPerDay | runtime | Pro |
|----|--------|------|-----------------|---------|-----|
| `calc-bmi` | Calculadora de IMC | FREE | ∞ | client | — |
| `calc-loan` | Calculadora de préstamos/intereses | FREE | ∞ | client | — |
| `calc-discount` | Calculadora de descuentos | FREE | ∞ | client | — |
| `calc-age` | Calculadora de edad | FREE | ∞ | client | — |
| `calc-percentage` | Calculadora de porcentajes | FREE | ∞ | client | — |
| `calc-tip` | Calculadora de propinas | FREE | ∞ | client | — |

## Redes Sociales (3)

> El "Descargador de videos (YouTube/TikTok)" fue **excluido** por riesgo legal/ToS.

| id | Nombre | tier | freeLimitPerDay | runtime | Pro |
|----|--------|------|-----------------|---------|-----|
| `social-resize` | Redimensionar para redes (IG/FB/TW) | FREE | ∞ | client | Batch |
| `social-hashtags` | Generador de hashtags | FREE | ∞ | client | Pro + tendencias |
| `social-tweet-count` | Contador de caracteres para tweets | FREE | ∞ | client | — |

## Seguridad (4)

| id | Nombre | tier | freeLimitPerDay | runtime | Pro |
|----|--------|------|-----------------|---------|-----|
| `sec-password-strength` | Fortaleza de contraseña | FREE | ∞ | client | — |
| `sec-hash-gen` | Generador de hash (MD5/SHA256) | FREE | ∞ | client | — |
| `sec-encrypt-text` | Encriptar/Desencriptar texto | FREE | ∞ | client | — |
| `sec-email-breach` | Verificar si un email fue hackeado | FREE | 3 | server+provider | Ilimitado |

## Resumen

| Categoría | Cantidad |
|-----------|----------|
| Imágenes | 8 |
| Texto | 8 |
| Archivos/PDF | 6 |
| Desarrollo/Tech | 10 |
| Conversores | 6 |
| Calculadoras | 6 |
| Redes Sociales | 3 |
| Seguridad | 4 |
| **TOTAL** | **51** |

- **client**: 35 · **server**: 10 · **server+provider**: 6
