# FreeToolKit

Plataforma web de **51 herramientas online gratuitas** con modelo freemium (Free con límites
y anuncios, Pro ilimitado sin anuncios, donaciones).

Monorepo: **Angular** (cliente) + **Express/TypeScript** (API) + **Prisma/PostgreSQL**.

## Stack

- **Frontend**: Angular 18 (standalone), responsive, modo oscuro/claro, i18n (español)
- **Backend**: Node.js 20 + Express + TypeScript
- **BD**: PostgreSQL (Docker) vía Prisma
- **Auth**: JWT (access + refresh rotatorio) + bcrypt, roles usuario/admin
- **Pagos**: Stripe / MercadoPago (modo simulado sin claves) · Donaciones: Ko-fi / BMC

## Estructura

```text
client/   Angular (catálogo, herramientas, cuenta, billing, admin)
server/   API Express (auth, tools, usage/quota, billing, admin, providers)
prisma/   schema, migraciones y seed (51 herramientas + admin)
shared/   catálogo tipado y contratos (fuente de verdad)
```

## Requisitos

Docker Desktop, Node.js 20+, git.

## Puesta en marcha

```bash
# 1. Variables de entorno
cp .env.example .env          # ajusta los secretos

# 2. Base de datos
docker compose up -d db

# 3. Dependencias + esquema + datos
npm install
npm run build:shared
npx prisma migrate dev --schema prisma/schema.prisma
npx prisma db seed            # o: npx tsx prisma/seed.ts

# 4. Arrancar
npm run dev:server            # API en http://localhost:3000/api/v1
npm run dev:client            # Angular en http://localhost:4200
```

Admin inicial sembrado: `admin@freetoolkit.local` / `admin1234` (cámbialo).

## Tests

```bash
npm test --workspace @freetoolkit/server   # Vitest + Supertest
```

## Arquitectura (resumen)

- **Catálogo enchufable**: cada herramienta se declara en `shared/src/catalog.ts`; añadir una
  client-side = registrar su componente en `client/src/app/tools/registry.ts`.
- **Privacidad (client-first)**: 35 herramientas corren 100% en el navegador; lo que llega al
  servidor se procesa en memoria (efímero).
- **Cuotas freemium**: aplicadas en el servidor con incremento atómico; anónimos por IP+UA
  (sin fingerprinting); Pro = ilimitado (tier leído en vivo).

## Estado

Las 6 historias de usuario (herramientas, freemium, cuentas, pagos, admin, donaciones) están
implementadas. Pendiente: integraciones reales de proveedores y pasarelas (requieren API
keys), Word/Excel→PDF (LibreOffice), E2E Playwright.

Especificación completa en `specs/001-freetoolkit-platform/`.
