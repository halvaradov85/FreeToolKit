# Implementation Plan: FreeToolKit — Plataforma de 51 herramientas online (freemium)

**Branch**: `001-freetoolkit-platform` | **Date**: 2026-06-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-freetoolkit-platform/spec.md`

## Summary

FreeToolKit es una plataforma web de 51 herramientas de utilidad organizadas en 8
categorías, con modelo freemium (Free con límites diarios y anuncios, Pro ilimitado sin
anuncios y con funciones extra, más donaciones). El enfoque técnico: un **monorepo** con
cliente Angular y API Express/TypeScript, **Prisma sobre PostgreSQL** (en Docker), auth
**JWT + bcrypt** con roles, y pagos vía **Stripe/MercadoPago**. El núcleo es un **catálogo
central de herramientas enchufables**: cada herramienta se registra con su categoría, tier,
límite y proveedor de ejecución. Las transformaciones sin estado corren **en el cliente**
(privacidad y coste cero); solo las que lo requieren llegan al servidor, donde un
**middleware de cuotas** aplica los límites de forma autoritativa antes de entregar
resultados. Los proveedores de terceros se aíslan tras una interfaz común con caché y
degradación elegante.

## Technical Context

**Language/Version**: TypeScript 5.x en todo el monorepo. Node.js 20 LTS (backend). Angular
(última estable, standalone components) en el frontend.
**Primary Dependencies**: Frontend — Angular, Angular Router, `@ngx-translate` (i18n),
Angular CDK; librerías client-side por herramienta (p. ej. compresión/recorte de imágenes en
canvas, `pdf-lib` para PDF en cliente cuando sea viable, generación de QR, hashing en
WebCrypto). Backend — Express, Prisma Client, `jsonwebtoken`, `bcrypt`, `zod` (validación),
`stripe`, SDK de MercadoPago, `sharp` (imágenes server-side), `pdf-lib` (manipular PDF
existentes: unir/dividir/comprimir), **LibreOffice headless** (`libreoffice-convert`) para
`word-to-pdf`/`excel-to-pdf`.
**Storage**: PostgreSQL (Docker en desarrollo) vía Prisma ORM. Sin almacenamiento
persistente del contenido de usuario procesado en servidor (efímero).
**Testing**: Backend — Vitest + Supertest (unit + integration de endpoints y cuotas).
Frontend — Vitest/Jasmine + Testing Library para componentes; Playwright para E2E de flujos
críticos (uso de herramienta, límite, upgrade).
**Target Platform**: Aplicación web responsive (navegadores modernos, desde 320 px). API
desplegable en servidor Linux/contenedor.
**Project Type**: Web application (frontend Angular + backend Express) — monorepo.
**Performance Goals**: Resultado de herramienta client-side en <10 s desde abrir el catálogo
(SC-001); respuestas de API p95 < 500 ms para operaciones ligeras; las operaciones pesadas
(imágenes/PDF) muestran progreso y no bloquean la UI.
**Constraints**: Límites freemium aplicados 100% en servidor (FR-007); contenido de usuario
efímero (FR-005/SC-007); responsive 320 px→escritorio, oscuro/claro (SC-006); i18n con
español principal; secretos solo por variables de entorno.
**Scale/Scope**: 51 herramientas en 8 categorías; ~6 historias de usuario; ~35 requisitos
funcionales; roles usuario/admin; tiers Free/Pro. Escala objetivo inicial: miles de usuarios
diarios con picos en herramientas populares.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Cumplimiento en este plan | Estado |
|-----------|---------------------------|--------|
| I. Client-First Privacy | ~30+ herramientas se implementan en el cliente; el servidor solo procesa lo inevitable y de forma efímera (sin persistir entrada). | ✅ |
| II. Modular Tool Architecture | Catálogo central tipado; cada herramienta es un módulo enchufable con metadatos (id, categoría, tier, límite, runtime client/server, proveedor). El núcleo no cambia al añadir/quitar. | ✅ |
| III. Freemium Boundaries (server-enforced) | Middleware de cuotas autoritativo en la API; el tier y los límites derivan del catálogo, no se codifican por endpoint. La UI solo refleja estado. | ✅ |
| IV. Responsive & Accessible UX | Angular responsive mobile-first, tema oscuro/claro persistente, i18n con español principal, navegación por teclado y contraste. | ✅ |
| V. Cost-Controlled 3rd-Party | Proveedores de pago (traducción, quitar fondo, TTS, monedas, email hackeado) tras una interfaz `Provider` con caché y degradación; descargador de vídeos excluido (decisión de alcance). | ✅ |

**Resultado del gate**: PASS. Sin violaciones; `Complexity Tracking` queda vacío.

## Project Structure

### Documentation (this feature)

```text
specs/001-freetoolkit-platform/
├── plan.md              # Este archivo
├── research.md          # Fase 0 — decisiones técnicas
├── data-model.md        # Fase 1 — modelo de datos (Prisma)
├── quickstart.md        # Fase 1 — cómo levantar el entorno
├── contracts/           # Fase 1 — contratos de API + catálogo de herramientas
│   ├── auth.openapi.yaml
│   ├── tools.openapi.yaml
│   ├── billing.openapi.yaml
│   ├── admin.openapi.yaml
│   └── tool-catalog.md
└── tasks.md             # Fase 2 — (lo genera /speckit.tasks)
```

### Source Code (repository root)

```text
client/                          # Angular (standalone components)
├── src/
│   ├── app/
│   │   ├── core/                # auth, interceptores HTTP/JWT, guards, tema, i18n
│   │   ├── shared/              # UI común, layout, componentes de catálogo
│   │   ├── catalog/             # listado, búsqueda y filtro de herramientas
│   │   ├── tools/               # un módulo por herramienta (client-side o cliente de API)
│   │   │   ├── _registry.ts     # registro central que consume el catálogo
│   │   │   └── <tool-id>/       # componente + lógica de cada herramienta
│   │   ├── account/             # login, registro, dashboard, historial, preferencias
│   │   ├── billing/             # upgrade Pro, estado de suscripción, donaciones
│   │   └── admin/               # panel de administración
│   ├── assets/i18n/             # es.json (principal), en.json, ...
│   └── environments/
└── tests/                       # unit + e2e (Playwright)

server/                          # Express + TypeScript
├── src/
│   ├── modules/
│   │   ├── auth/                # registro, login, JWT, bcrypt, roles
│   │   ├── tools/               # endpoints de herramientas server-side
│   │   ├── catalog/             # definición/estado del catálogo (fuente de verdad de tier+límite)
│   │   ├── usage/               # contadores de cuota + middleware de límites
│   │   ├── billing/             # Stripe/MercadoPago, webhooks, suscripciones
│   │   ├── admin/               # métricas y gestión
│   │   └── providers/           # interfaz Provider + adaptadores de terceros (aislados)
│   ├── middleware/              # auth, cuota, validación (zod), manejo de errores
│   ├── lib/                     # utilidades (efímero/cleanup, logging sin secretos)
│   └── app.ts / server.ts
└── tests/                       # contract + integration + unit (Vitest/Supertest)

prisma/
├── schema.prisma                # modelo de datos (ver data-model.md)
├── migrations/
└── seed.ts                      # seed del catálogo de 51 herramientas + admin inicial

shared/                          # tipos compartidos cliente/servidor
└── src/                         # contratos del catálogo y de la API (single source of truth)

docker-compose.yml               # PostgreSQL (y servicios de desarrollo)
```

**Structure Decision**: Monorepo web (Opción 2) con `client/` (Angular), `server/` (Express),
`prisma/` (schema y migraciones) y un paquete `shared/` para tipos comunes (catálogo y
contratos de API), evitando duplicar la definición de las herramientas entre cliente y
servidor. PostgreSQL corre en Docker durante el desarrollo (`docker-compose.yml`).

## Complexity Tracking

> Sin violaciones de la constitución. Sección intencionadamente vacía.
