---
description: "Task list for FreeToolKit implementation"
---

# Tasks: FreeToolKit — Plataforma de 51 herramientas online (freemium)

**Input**: Design documents from `/specs/001-freetoolkit-platform/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Se incluyen tareas de test para los flujos críticos (cuotas freemium y pagos),
conforme a la estrategia de testing definida en plan.md. El resto son opcionales.

**Organization**: Tareas agrupadas por historia de usuario para implementación y prueba
independientes.

## Estado de implementación — MVP (2026-06-15)

Implementado y **verificado** (backend con 51 herramientas en vivo + cliente Angular que
compila):

- **Phase 1 (Setup)**: ✅ T001–T005, T007 · ⚠️ T006 (ESLint/Prettier) pendiente
- **Phase 2 (Foundational)**: ✅ T008–T018, T020–T022 · ⚠️ T019 parcial (tema/i18n/HTTP
  listos; interceptor JWT y guards se añaden con US3)
- **Phase 3 (US1)**: ✅ T023–T033 — **35 de 35** herramientas client-side implementadas y
  funcionales (texto 5, calculadoras 6, conversores 5, desarrollo 9, seguridad 3, redes 3,
  imágenes 4). **US1 completa en su parte client-side.** · ⚠️ T034 (E2E Playwright) pendiente
- Verificación: `GET /api/v1/catalog/tools` → 51 · tests de catálogo en verde · `ng build` OK
  con las 35 herramientas registradas en `client/src/app/tools/registry.ts`.
- Quedan como server-side (US2): 16 herramientas (imágenes pesadas, PDF, acortador, y las 6
  con proveedor externo).

### Phase 4 (US2) — Sistema de cuotas + server-side (2026-06-16)

✅ Implementado y **verificado end-to-end** (cupo 5→4 tras redimensionar una imagen real):

- ✅ T035 test de cuotas (4 casos: agotar→bloquear, revertir, ilimitado) — 8/8 tests en verde
- ✅ T036 repositorio de uso con incremento atómico condicional (`count < limit`) — SC-002
- ✅ T037 cuota autoritativa en servidor; sujeto anónimo por **IP+UA hasheado** (sin
  fingerprinting); Pro = ilimitado; reversión en fallo (FR-012)
- ✅ T038 `GET /tools/:id/quota` · ✅ T039 `POST /tools/:id/execute` con subida **en memoria**
  (efímero, SC-007) y reversión de cupo en error
- ✅ T040 imágenes server (sharp): compress, resize · ✅ T041(parcial) PDF (pdf-lib): merge,
  split — pdf-to-image/compress y word/excel→PDF (LibreOffice) quedan como 501
- ✅ T043 acortador de links + redirección `/s/:code` con cupo · ✅ T044 interfaz `Provider`
  aislada con **degradación elegante** (503, sin consumir cupo) para traducir/fondo/TTS/FX/breach
- ✅ T045 cliente: componente server-side con cupo visible, manejo de **429** (CTA a Pro),
  503 de proveedor y **slot de anuncios** para no-Pro (FR-011)
- ⚠️ Pendiente: integraciones reales de proveedores (requieren API keys), watermark, y las
  conversiones ofimáticas con LibreOffice.

### Phase 5 (US3) — Cuentas, historial y preferencias (2026-06-16)

✅ Implementado y **verificado** (15/15 tests backend; smoke test en vivo):

- ✅ T046 test de auth (7 casos: registro, duplicado, login genérico FR-016, /me, refresh,
  historial)
- ✅ T047 endpoints `register/login/refresh/logout` con **refresh token rotatorio** (hash
  almacenado, revocación) y mensajes genéricos que no revelan si el email existe (FR-016)
- ✅ T048 `GET /account/me` y `PATCH /account/preferences` (tema/idioma)
- ✅ T049 registro de `HistoryItem` (en el execute server-side y vía `POST /account/history`
  para herramientas client) + `GET /account/history`
- ✅ T050 cliente: páginas de login y registro · ✅ T051 dashboard (tier, preferencias,
  historial reciente) con guard de ruta
- ✅ T019 (completado): **interceptor JWT** que adjunta el token y renueva ante 401, +
  `authGuard`, + estado de sesión en el header.

### Phase 6 (US4) — Pagos / Pro (2026-06-16)

✅ Implementado y **verificado** (3 tests + E2E: FREE→pagar→PRO→cupo ilimitado):

- ✅ T052 test de billing (checkout→confirmar→PRO→cancelar)
- ✅ T053/T054 estructura Stripe/MercadoPago con **modo simulado** (funciona sin claves;
  enchufar API keys activa el flujo real) · ✅ T055 `POST /billing/checkout`
- ✅ T056 confirmación (equivale al webhook) que activa la suscripción · webhook real con
  estructura de verificación/idempotencia (inerte sin claves)
- ✅ T057 `GET /billing/subscription`, `DELETE` (cancela a fin de periodo, FR-021)
- ✅ T058 **gating Pro en vivo** (tier leído de BD → efecto inmediato, FR-019; quita límites)
- ✅ T059 cliente: página de upgrade + confirmación + CTA en dashboard

### Phase 7 (US5) — Administración (2026-06-16)

✅ Implementado y **verificado** (3 tests):

- ✅ T060 test admin (métricas, 403 no-admin, desactivar herramienta→catálogo)
- ✅ T061 `GET /admin/metrics` (usuarios, Pro, conversión, top herramientas, enlaces)
- ✅ T062 `GET/PATCH /admin/users/:id` (rol/estado) · ✅ T063 `PATCH /admin/tools/:id`
  (enabled/límite) + `AdminAuditLog` · acceso restringido a admin (FR-030)
- ✅ T064 cliente: panel de administración (métricas, usuarios, herramientas)

### Phase 8 (US6) — Donaciones (2026-06-16)

- ✅ T065 botón de donación (Ko-fi / Buy Me a Coffee) en el footer

### Resumen final

**Las 6 historias de usuario (US1–US6) implementadas y verificadas.** 21/21 tests backend en
verde + `ng build` OK.

### Phase 9 (Polish/Hardening) — parcial (2026-06-16)

- ✅ T066 README de raíz con puesta en marcha y arquitectura
- ✅ T068 **rate-limiting** (general 120/min + auth 20/15min, verificado: 120→429), helmet,
  `trust proxy`, límite de payload, logging que redacta secretos
- ✅ T073 test de catálogo (51 + sin descargador de videos)
- ✅ T072 (por diseño): subidas en memoria (multer memoryStorage) → contenido efímero, nunca
  en disco (SC-007)
- ⚠️ Pendiente: T067 (unit tests utilidades), T069 (pase a11y), T070 (perf), T071 (quickstart
  E2E), T034 (Playwright), ESLint (T006).

Pendientes que dependen de terceros: claves de Stripe/MercadoPago y de proveedores,
LibreOffice para Word/Excel→PDF.

### Ampliación (2026-06-16) — tras hardening

✅ Implementado y **verificado en vivo**:
- ✅ **Marca de agua** (sharp, texto superpuesto) — herramienta PRO; no-Pro recibe **402**
- ✅ **Comprimir PDF** (pdf-lib, object streams)
- ✅ **Expiración automática de Pro** (degradación perezosa al caducar la suscripción, sin
  cron; los admin conservan Pro)
- ✅ Gating de herramientas **PRO** con 402 + CTA en el cliente

✅ **Conversor de monedas EN VIVO** (`/api/v1/fx`, API pública gratuita open.er-api.com sin
key, con caché de 1h) + componente de cliente interactivo. Verificado: 100 USD = 86.23 EUR.

**Herramientas funcionales: 43 de 51** (36 client incl. monedas + 7 server). Las 8 restantes
necesitan LibreOffice (pdf-to-image, word/excel→pdf) o API keys (traductor, corrector, TTS,
quitar fondo, email-breach).

### Despliegue (2026-06-16)

✅ Artefactos de producción creados:
- `Dockerfile.server` (multi-stage Node 20 + **LibreOffice** headless + migraciones al arrancar)
- `client/Dockerfile` + `client/nginx.conf` (build Angular servido por nginx con proxy a la API)
- `docker-compose.prod.yml` (db + server + client) + `.env.prod.example` + `.dockerignore`
- `DEPLOY.md` (guía: VPS con compose, Render/Railway, HTTPS, conectar pasarelas)
- ✅ **Word→PDF / Excel→PDF** con `libreoffice-convert` → **45 de 51 herramientas**.

✅ **VERIFICADO en stack de producción real** (`docker compose -f docker-compose.prod.yml up`):
- Imagen del backend construida (1.24 GB con LibreOffice 7.4.7.2)
- Los 3 contenedores arrancan (db healthy + server + nginx) y migran solos
- Web servida por nginx en :8080, proxy a la API OK (catálogo → 51)
- **Word→PDF probado end-to-end**: .docx → PDF válido (%PDF) a través de la web de producción
- Fix Prisma `binaryTargets` (debian-openssl-3.0.x) para el contenedor

### Traductor en vivo (2026-06-16)

✅ **Traductor real** (`/api/v1/translate`) con la API gratuita **MyMemory** (sin key), con
**cuota** (3/día gratis, ilimitado Pro), reversión en fallo y componente de cliente
interactivo (idiomas, ⇄, cupo, 429→Pro). Verificado: "Good morning…" → "Buenos días…".
Fix de proyecto Docker (`name: freetoolkit-prod`) para no colisionar dev/prod.

**Herramientas funcionales: 46 de 51.** Quedan 5: corrector, texto-a-voz, quitar fondo,
email-breach (requieren API key) y pdf-to-image (renderizador).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo (archivos distintos, sin dependencias)
- **[Story]**: Historia de usuario asociada (US1..US6)

## Path Conventions

Monorepo web: `client/` (Angular), `server/` (Express), `prisma/`, `shared/` (tipos comunes).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Inicialización del monorepo y estructura base

- [ ] T001 Crear estructura del monorepo (`client/`, `server/`, `prisma/`, `shared/`) según plan.md
- [ ] T002 [P] Inicializar `server/` con Node 20 + TypeScript + Express y dependencias (prisma, jsonwebtoken, bcrypt, zod, stripe, mercadopago, sharp, pdf-lib) en server/package.json
- [ ] T003 [P] Inicializar `client/` como proyecto Angular (standalone) con Router, @ngx-translate y Angular CDK en client/package.json
- [ ] T004 [P] Inicializar `shared/` como paquete TypeScript para catálogo y contratos de API en shared/package.json
- [ ] T005 [P] Crear `docker-compose.yml` en la raíz con servicio PostgreSQL
- [ ] T006 [P] Configurar ESLint + Prettier para todo el monorepo
- [ ] T007 [P] Crear `.env.example` y carga de variables de entorno en server/src/lib/env.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Infraestructura central que DEBE completarse antes de cualquier historia

**⚠️ CRITICAL**: Ninguna historia puede empezar hasta completar esta fase

- [ ] T008 Definir el catálogo tipado de las 51 herramientas en shared/src/catalog.ts (a partir de contracts/tool-catalog.md: id, category, name, tier, freeLimitPerDay, runtime, provider, proFeatures)
- [ ] T009 [P] Definir los tipos de contrato de API en shared/src/api.ts (a partir de contracts/api.openapi.yaml)
- [ ] T010 Escribir `prisma/schema.prisma` con todas las entidades de data-model.md
- [ ] T011 Ejecutar la migración inicial de Prisma (`prisma migrate dev`) contra PostgreSQL en Docker
- [ ] T012 Implementar `prisma/seed.ts` que siembra los overrides de `Tool` y un usuario admin inicial
- [ ] T013 [P] Implementar utilidades JWT (access + refresh rotatorio) en server/src/modules/auth/jwt.ts
- [ ] T014 [P] Implementar hashing de contraseñas con bcrypt en server/src/modules/auth/password.ts
- [ ] T015 Implementar middleware de autenticación y roles (user/admin) en server/src/middleware/auth.ts
- [ ] T016 [P] Implementar middleware de validación con zod en server/src/middleware/validate.ts
- [ ] T017 [P] Implementar manejo de errores y logging seguro (sin secretos ni contenido de usuario) en server/src/middleware/error.ts
- [ ] T018 Montar la app Express y el router `/api/v1` en server/src/app.ts y server/src/server.ts
- [ ] T019 [P] Core Angular: interceptor HTTP (JWT), guards de auth y admin en client/src/app/core/
- [ ] T020 [P] Servicio de tema (oscuro/claro persistente) y layout base en client/src/app/shared/
- [ ] T021 [P] Configurar i18n (@ngx-translate) con es.json como idioma principal en client/src/assets/i18n/
- [ ] T022 [P] Servicio de catálogo en cliente que consume `GET /catalog/tools` en client/src/app/catalog/catalog.service.ts

**Checkpoint**: Fundación lista — las historias pueden comenzar

---

## Phase 3: User Story 1 - Usar una herramienta gratis al instante, sin cuenta (Priority: P1) 🎯 MVP

**Goal**: Explorar el catálogo y usar herramientas client-side sin registro, con resultado
instantáneo y sin persistir el contenido del usuario.

**Independent Test**: Abrir el catálogo y ejecutar al menos una herramienta de cada
categoría client-side sin iniciar sesión, verificando el resultado.

- [ ] T023 [US1] Endpoint `GET /catalog/tools` (catálogo + overrides de `Tool`, búsqueda y filtro) en server/src/modules/catalog/
- [ ] T024 [P] [US1] UI de catálogo: listado, búsqueda y filtro por categoría en client/src/app/catalog/
- [ ] T025 [US1] Registro de herramientas y componente base en client/src/app/tools/_registry.ts
- [ ] T026 [P] [US1] Herramientas client-side de **Texto** (8) en client/src/app/tools/text/
- [ ] T027 [P] [US1] Herramientas client-side de **Calculadoras** (6) en client/src/app/tools/calc/
- [ ] T028 [P] [US1] Herramientas client-side de **Conversores** (5, salvo monedas) en client/src/app/tools/convert/
- [ ] T029 [P] [US1] Herramientas client-side de **Desarrollo** (9: qr-generate, qr-read, json-format, color-picker, minify, seo-meta-tags, json-xml-validate, base64, htaccess-gen) en client/src/app/tools/dev/
- [ ] T030 [P] [US1] Herramientas client-side de **Imágenes** (image-convert, image-crop, image-to-base64, image-favicon) en client/src/app/tools/image/
- [ ] T031 [P] [US1] Herramientas client-side de **Redes Sociales** (social-resize, social-hashtags, social-tweet-count) en client/src/app/tools/social/
- [ ] T032 [P] [US1] Herramientas client-side de **Seguridad** (sec-password-strength, sec-hash-gen vía WebCrypto, sec-encrypt-text) en client/src/app/tools/security/
- [ ] T033 [US1] Landing page con propuesta de valor y acceso al catálogo en client/src/app/shared/landing/
- [ ] T034 [US1] E2E (Playwright): usar una herramienta client-side de cada categoría sin login en client/tests/e2e/

**Checkpoint**: US1 funcional — MVP utilizable y desplegable

---

## Phase 4: User Story 2 - Límite diario del tier Free aplicado de forma fiable (Priority: P1)

**Goal**: Aplicar cuotas freemium en el servidor y habilitar las herramientas server-side y
con proveedor externo, bloqueando el exceso de uso de forma inevadible.

**Independent Test**: Agotar el cupo de una herramienta limitada y verificar el bloqueo
(429) tras limpiar el navegador, y el reinicio al día siguiente.

### Tests for User Story 2 ⚠️

- [ ] T035 [P] [US2] Test de integración de cuotas (agotar→429, reinicio diario, no evasión por cookies/pestañas) en server/tests/integration/quota.test.ts

### Implementation for User Story 2

- [ ] T036 [US2] Repositorio de uso con upsert atómico `(subjectType, subjectId, toolId, usageDate)` en server/src/modules/usage/usage.repo.ts
- [ ] T037 [US2] Middleware `enforceQuota(toolId)` autoritativo (sujeto anónimo por red/dispositivo, reinicio por TZ de referencia, revierte si falla) en server/src/middleware/quota.ts
- [ ] T038 [P] [US2] Endpoint `GET /tools/:toolId/quota` (cupo restante) en server/src/modules/tools/
- [ ] T039 [US2] Pipeline `POST /tools/:toolId/execute` con cuota + limpieza efímera del contenido en server/src/modules/tools/execute.ts
- [ ] T040 [P] [US2] Herramientas server de **Imágenes**: image-compress, image-resize (sharp) en server/src/modules/tools/image/
- [ ] T041 [P] [US2] Herramientas server de **PDF**: pdf-to-image, pdf-merge, pdf-split, pdf-compress (pdf-lib) y word-to-pdf, excel-to-pdf (**LibreOffice headless**, ver research §11) en server/src/modules/tools/pdf/ — la imagen Docker del backend DEBE incluir LibreOffice
- [ ] T042 [P] [US2] image-watermark (Pro) y social-resize batch (Pro) en server/src/modules/tools/image/
- [ ] T043 [US2] Acortador de links: crear, redirigir y contar clics (link-shorten) en server/src/modules/tools/shortlink/
- [ ] T044 [P] [US2] Interfaz `Provider` + adaptadores aislados (translate, spellcheck, tts, currency, email-breach) con caché y degradación; sin consumir cupo si falla, en server/src/modules/providers/
- [ ] T045 [US2] Cliente: UI de cupo (restante, bloqueo al límite, CTA registro/Pro) y slot de anuncios para no-Pro en client/src/app/tools/shared/

**Checkpoint**: US1 + US2 funcionales — herramientas limitadas protegidas en servidor

---

## Phase 5: User Story 3 - Cuenta, historial y preferencias (Priority: P2)

**Goal**: Registro/login, panel con historial, tier y consumo, y preferencias persistentes.

**Independent Test**: Registrarse, usar herramientas y ver el historial y el consumo en el
panel; persistir tras reiniciar sesión.

### Tests for User Story 3 ⚠️

- [ ] T046 [P] [US3] Test de integración de auth (registro, login, refresh, mensajes genéricos) en server/tests/integration/auth.test.ts

### Implementation for User Story 3

- [ ] T047 [P] [US3] Endpoints de auth `register/login/refresh/logout` en server/src/modules/auth/auth.controller.ts
- [ ] T048 [P] [US3] Endpoints `GET /account/me` y `PATCH /account/preferences` en server/src/modules/account/
- [ ] T049 [US3] Registro de `HistoryItem` al usar herramientas y `GET /account/history` en server/src/modules/account/history.ts
- [ ] T050 [P] [US3] Cliente: páginas de registro e inicio de sesión en client/src/app/account/auth/
- [ ] T051 [P] [US3] Cliente: dashboard (tier, consumo del día, historial, preferencias) en client/src/app/account/dashboard/

**Checkpoint**: US1–US3 funcionales

---

## Phase 6: User Story 4 - Pasar a Pro y obtener beneficios (Priority: P2)

**Goal**: Upgrade a Pro con pasarela, activación por webhook, retiro de límites/anuncios,
funciones extra, y cancelación con acceso hasta fin de periodo.

**Independent Test**: Checkout en sandbox → webhook → tier PRO sin límites/anuncios →
cancelar → regreso a Free al expirar.

### Tests for User Story 4 ⚠️

- [ ] T052 [P] [US4] Test de integración de billing (checkout→webhook→PRO→cancelar→revert; webhook idempotente) en server/tests/integration/billing.test.ts

### Implementation for User Story 4

- [ ] T053 [P] [US4] Interfaz `PaymentProvider` + adaptador **Stripe** en server/src/modules/billing/stripe.ts
- [ ] T054 [P] [US4] Adaptador **MercadoPago** en server/src/modules/billing/mercadopago.ts
- [ ] T055 [US4] Endpoint `POST /billing/checkout` en server/src/modules/billing/billing.controller.ts
- [ ] T056 [US4] Webhooks `POST /billing/webhook/:provider` verificados e idempotentes que actualizan `Subscription`/tier en server/src/modules/billing/webhook.ts
- [ ] T057 [P] [US4] Endpoints `GET /billing/subscription` y `DELETE` (cancelar a fin de periodo) en server/src/modules/billing/
- [ ] T058 [US4] Gating Pro: retirar límites/anuncios y desbloquear `proFeatures` por herramienta en server/src/middleware/quota.ts y client
- [ ] T059 [P] [US4] Cliente: flujo de upgrade y estado de suscripción en client/src/app/billing/

**Checkpoint**: US1–US4 funcionales — monetización operativa

---

## Phase 7: User Story 5 - Administración de la plataforma (Priority: P3)

**Goal**: Panel admin con métricas, gestión de usuarios y activación/límites de herramientas.

**Independent Test**: Admin ve métricas, desactiva una herramienta y deja de estar
disponible; un no-admin recibe 403.

### Tests for User Story 5 ⚠️

- [ ] T060 [P] [US5] Test de integración de admin (desactivar herramienta→no disponible; no-admin 403) en server/tests/integration/admin.test.ts

### Implementation for User Story 5

- [ ] T061 [P] [US5] Endpoint `GET /admin/metrics` (uso y suscripciones, conversión Free→Pro) en server/src/modules/admin/
- [ ] T062 [P] [US5] Endpoints `GET/PATCH /admin/users` (rol y estado) en server/src/modules/admin/users.ts
- [ ] T063 [US5] Endpoint `PATCH /admin/tools/:toolId` (enabled, override de límite) + `AdminAuditLog` en server/src/modules/admin/tools.ts
- [ ] T064 [P] [US5] Cliente: panel de administración en client/src/app/admin/

**Checkpoint**: US1–US5 funcionales

---

## Phase 8: User Story 6 - Apoyar el proyecto con donaciones (Priority: P3)

**Goal**: Botón de donación a Ko-fi / Buy Me a Coffee accesible en la interfaz.

**Independent Test**: Pulsar "Donar" lleva a un destino de donación externo válido.

- [ ] T065 [P] [US6] Componente de botón de donación (Ko-fi / Buy Me a Coffee) configurable en client/src/app/shared/donate/

**Checkpoint**: Todas las historias funcionales

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Mejoras transversales

- [ ] T066 [P] Documentación (README de raíz + docs/) y actualización de quickstart
- [ ] T067 [P] Tests unitarios de utilidades (JWT, bcrypt, cuota, providers) en server/tests/unit/
- [ ] T068 Endurecimiento de seguridad: rate limiting, cabeceras seguras, verificación de no-fuga de secretos en logs
- [ ] T069 Pase de accesibilidad y responsive (320 px+, teclado, contraste) en client
- [ ] T070 Pase de rendimiento: lazy-loading de herramientas, progreso en operaciones de imagen/PDF
- [ ] T071 Ejecutar la validación de quickstart.md de extremo a extremo
- [ ] T072 [P] Test de privacidad efímera (SC-007): verificar que el archivo temporal de una herramienta server-side se borra tras responder y también en caso de error, en server/tests/integration/ephemeral.test.ts
- [ ] T073 [P] Test de catálogo (FR-035): aseverar que el descargador de videos NO existe y que el catálogo tiene exactamente 51 herramientas, en server/tests/unit/catalog.test.ts

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias
- **Foundational (Phase 2)**: depende de Setup — BLOQUEA todas las historias
- **User Stories (Phase 3+)**: dependen de Foundational
  - US1 y US2 (P1) primero; US2 depende de la infraestructura de cuotas pero es independiente de US1
  - US3, US4 (P2) tras Foundational; US4 se beneficia de US3 pero el gating es independiente
  - US5, US6 (P3)
- **Polish (Phase 9)**: tras completar las historias deseadas

### User Story Dependencies

- **US1 (P1)**: solo Foundational. Es el MVP.
- **US2 (P1)**: solo Foundational (sistema de cuotas). Independiente de US1.
- **US3 (P2)**: solo Foundational. Independiente.
- **US4 (P2)**: Foundational; integra con US2 (gating) y US3 (cuenta), pero testeable aparte.
- **US5 (P3)**: Foundational; usa el catálogo y métricas.
- **US6 (P3)**: independiente; mínima.

### Parallel Opportunities

- Setup: T002–T007 en paralelo
- Foundational: T013/T014/T016/T017 y T019–T022 en paralelo
- US1: T026–T032 (categorías de herramientas client) en paralelo
- US2: T040/T041/T042/T044 en paralelo
- Tras Foundational, distintos desarrolladores pueden tomar US1/US2/US3 en paralelo

---

## Parallel Example: User Story 1

```bash
# Lanzar en paralelo las herramientas client-side por categoría:
Task: "Texto client tools en client/src/app/tools/text/"
Task: "Calculadoras client tools en client/src/app/tools/calc/"
Task: "Conversores client tools en client/src/app/tools/convert/"
Task: "Desarrollo client tools en client/src/app/tools/dev/"
Task: "Imágenes client tools en client/src/app/tools/image/"
Task: "Redes client tools en client/src/app/tools/social/"
Task: "Seguridad client tools en client/src/app/tools/security/"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Completar Phase 1 (Setup) y Phase 2 (Foundational)
2. Completar Phase 3 (US1) → ~35 herramientas client-side + catálogo + landing
3. **VALIDAR**: usar herramientas sin cuenta
4. Desplegar/demostrar (MVP con valor real y SEO)

### Incremental Delivery

1. Setup + Foundational → fundación lista
2. + US1 → MVP (herramientas gratis instantáneas)
3. + US2 → cuotas + herramientas server/proveedor (motor freemium)
4. + US3 → cuentas e historial
5. + US4 → Pro y pagos (ingresos)
6. + US5 → administración
7. + US6 → donaciones

---

## Notes

- [P] = archivos distintos, sin dependencias
- Cada historia es completable y testeable de forma independiente
- Verificar que los tests de cuota/billing fallan antes de implementar
- Commit tras cada tarea o grupo lógico
- El contenido de usuario procesado en servidor NO se persiste (Principio I)
