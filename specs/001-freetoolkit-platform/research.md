# Phase 0 — Research: FreeToolKit

Decisiones técnicas que resuelven el contexto del plan. No quedan marcadores
NEEDS CLARIFICATION pendientes.

## 1. Estructura del repositorio

- **Decisión**: Monorepo con `client/`, `server/`, `prisma/` y un paquete `shared/` de tipos.
- **Rationale**: el catálogo de herramientas y los contratos de API deben tener una única
  fuente de verdad consumida por cliente y servidor (Principio II). Un monorepo simplifica
  el versionado conjunto y el desarrollo local con Docker.
- **Alternativas**: repos separados (más fricción para compartir tipos); Nx/Turborepo
  (potente pero añade complejidad innecesaria al inicio — se puede adoptar después).

## 2. Catálogo de herramientas enchufable

- **Decisión**: un catálogo declarativo tipado en `shared/` que describe cada herramienta:
  `id`, `category`, `name`, `tier` (free/pro), `freeLimitPerDay`, `runtime` (`client` |
  `server`), `provider` (opcional), `proFeatures`, `enabled`. El cliente lo usa para render y
  el servidor como fuente de verdad de tier/límite. La BD guarda overrides editables por admin.
- **Rationale**: cumple Principios II y III; añadir/quitar una herramienta no toca el núcleo.
- **Alternativas**: definir tier/límite por endpoint a mano (frágil, viola III); todo en BD
  sin tipos compartidos (pierde verificación estática y autocompletado).

## 3. Ejecución client-side vs server-side por herramienta

- **Decisión**: clasificar las 51 herramientas por `runtime`:
  - **Client (sin backend)** — la mayoría: contadores de texto, mayúsculas, lorem ipsum,
    generador/fortaleza de contraseñas, eliminar duplicados, IMC, préstamos, descuentos,
    edad, porcentajes, propinas, conversores (unidades, temperatura, numeración, zona
    horaria), Base64, formateador/validador JSON-XML, minificador, color picker, meta tags,
    htaccess, contador de tweets, generador de QR, hash (WebCrypto), encriptar texto, recorte
    e imagen→base64, favicon, redimensionar para redes, generador de hashtags, lector de QR.
  - **Server** — procesamiento pesado o con secretos: compresión/redimensión por lotes y
    quitar fondo (HD), PDFs (a imagen, unir, dividir, comprimir, Word→PDF, Excel→PDF),
    acortador de links (persistencia + analytics), marca de agua batch.
  - **Server + proveedor externo**: traductor, corrector ortográfico, texto a voz, conversor
    de monedas en vivo, verificar email hackeado.
- **Rationale**: Principio I (privacidad y coste); solo va al servidor lo inevitable.
- **Alternativas**: todo en servidor (coste y privacidad peores); todo en cliente (imposible
  para PDF pesado, secretos de terceros y persistencia de enlaces).

## 4. Autenticación y roles

- **Decisión**: JWT de acceso corto + refresh token rotatorio; contraseñas con bcrypt
  (coste ≥ 12). Roles `user` y `admin` en el token y verificados por middleware. Mensajes de
  auth genéricos (no revelar existencia de email, FR-016).
- **Rationale**: estándar para SPA + API; cumple FR-013..FR-017 y la constitución.
- **Alternativas**: sesiones con cookie de servidor (válido, pero JWT encaja mejor con SPA y
  escalado sin estado); OAuth social (futuro, no requerido en MVP).

## 5. Sistema de cuotas freemium

- **Decisión**: middleware `enforceQuota(toolId)` que, para usuarios no-Pro, incrementa de
  forma atómica un contador `(sujeto, toolId, fecha)` en PostgreSQL **antes** de ejecutar, y
  rechaza al superar el límite del catálogo. `sujeto` = userId si autenticado, o una **clave
  efímera de anónimo** para no autenticados. Reinicio diario por fecha en una zona horaria de
  referencia configurable. Un fallo del sistema/proveedor revierte el consumo (FR-012).
- **Identificación de anónimos (resuelve C1)**: la clave de anónimo se deriva de la **IP** y
  cabeceras de la petición, **sin fingerprinting persistente del dispositivo** ni cookies de
  rastreo. Basta para limitar el abuso del cupo diario y respeta el Principio I (privacidad):
  no se construye un perfil estable del usuario, solo un cubo de conteo que expira con la fecha.
- **Rationale**: autoritativo en servidor (Principio III, FR-007..FR-010), resistente a
  evasión por limpiar cookies (SC-002) usando la fecha del servidor y conteo atómico.
- **Alternativas**: contar en cliente/localStorage (evadible, rechazado); Redis para
  contadores (más rápido a escala, pero PostgreSQL basta para el MVP y reduce piezas).

## 6. Pagos y suscripciones

- **Decisión**: abstracción `PaymentProvider` con adaptadores **Stripe** y **MercadoPago**
  (cobertura LATAM). El tier Pro se activa/desactiva por **webhooks** verificados (alta,
  renovación, fallo, cancelación, reembolso). Donaciones vía enlaces externos
  Ko-fi/Buy Me a Coffee (fuera de la facturación interna). Idempotencia en el manejo de
  webhooks.
- **Rationale**: FR-018..FR-023; aislar proveedores evita acoplar la lógica de negocio a uno.
- **Alternativas**: un solo proveedor (menor cobertura regional); gestionar donaciones
  internamente (complejidad y cumplimiento innecesarios).

## 7. Proveedores de terceros aislados

- **Decisión**: interfaz `Provider` por capacidad (traducción, fondo, TTS, FX, breach-check)
  con caché (cuando el ToS lo permita) y **degradación elegante** ante fallo/cuota agotada;
  el intento fallido no consume cupo. Claves por variables de entorno.
- **Rationale**: Principio V; protege margen y permite cambiar de proveedor sin tocar la UI.
- **Alternativas**: llamar a las APIs directamente desde los endpoints (acopla y dificulta
  caché/fallback).

## 8. i18n, tema y responsive

- **Decisión**: `@ngx-translate` con `es.json` como idioma principal y carga perezosa de
  otros idiomas; tema oscuro/claro con variables CSS y preferencia persistente (local +
  perfil para usuarios autenticados); layout mobile-first con breakpoints desde 320 px.
- **Rationale**: FR-031..FR-033, SC-006.
- **Alternativas**: i18n nativo de Angular (build por idioma, menos flexible para añadir
  idiomas incrementalmente).

## 9. Testing

- **Decisión**: Vitest + Supertest en backend (énfasis en cuotas, auth y webhooks);
  componentes Angular con Testing Library; Playwright para E2E de los flujos P1/P2 (usar
  herramienta, agotar límite, upgrade).
- **Rationale**: cubre los requisitos críticos de monetización y los criterios de éxito.
- **Alternativas**: solo unit (insuficiente para flujos de pago y límites).

## 10. Privacidad / efímero

- **Decisión**: las operaciones server-side procesan en memoria o en archivos temporales con
  borrado garantizado tras responder (incluido en caso de error); sin retención salvo
  historial/funciones que el usuario active. Logs sin contenido de usuario ni secretos.
- **Rationale**: Principio I, FR-005, SC-007.
- **Alternativas**: almacenar entradas para "reprocesar" (rechazado por privacidad).

## 11. Conversión de documentos Word/Excel → PDF (resuelve U1)

- **Decisión**: `word-to-pdf` y `excel-to-pdf` se implementan con **LibreOffice en modo
  headless** (vía `libreoffice-convert` o invocando `soffice --headless --convert-to pdf`),
  ejecutado en el contenedor del backend. `pdf-lib` se reserva para manipular PDF ya
  existentes (unir, dividir, etc.), **no** para renderizar .docx/.xlsx.
- **Rationale**: `pdf-lib` no sabe interpretar formatos ofimáticos; LibreOffice headless es la
  vía fiable y open-source para una conversión fiel sin depender de una API de pago.
- **Implicación de despliegue**: la imagen del backend DEBE incluir LibreOffice; la conversión
  es server-side (Principio I: archivo efímero, borrado tras responder) y cuenta para el cupo.
- **Alternativas**: APIs de conversión de pago (coste recurrente, Principio V); `pdf-lib` solo
  (imposible para .docx/.xlsx, descartado).
