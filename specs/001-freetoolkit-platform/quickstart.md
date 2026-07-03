# Quickstart — FreeToolKit (desarrollo)

Cómo levantar el entorno de desarrollo del monorepo. Requisitos ya instalados en esta
máquina: **Docker Desktop**, **Node.js 20 LTS**, **git**.

## 1. Base de datos (PostgreSQL en Docker)

`docker-compose.yml` en la raíz levanta PostgreSQL:

```bash
docker compose up -d db
```

Variables de entorno (archivo `.env` en la raíz, NUNCA commiteado):

```dotenv
DATABASE_URL="postgresql://freetoolkit:freetoolkit@localhost:5432/freetoolkit?schema=public"
JWT_ACCESS_SECRET="<secreto>"
JWT_REFRESH_SECRET="<secreto>"
STRIPE_SECRET_KEY="<sk_test_...>"
STRIPE_WEBHOOK_SECRET="<whsec_...>"
MERCADOPAGO_ACCESS_TOKEN="<token_test>"
# Claves de proveedores (traducción, fondo, TTS, FX, breach-check)
TZ_REFERENCE="America/Lima"
```

## 2. Backend (Express + Prisma)

```bash
cd server
npm install
npx prisma migrate dev      # crea el esquema en PostgreSQL
npx prisma db seed          # siembra las 51 herramientas + admin inicial
npm run dev                 # API en http://localhost:3000/api/v1
```

## 3. Frontend (Angular)

```bash
cd client
npm install
npm start                   # http://localhost:4200
```

## 4. Verificación rápida

- `GET /api/v1/catalog/tools` devuelve 51 herramientas.
- Abrir http://localhost:4200, usar una herramienta client-side (p. ej. contador de
  palabras) sin iniciar sesión → resultado instantáneo.
- Registrarse, usar una herramienta limitada hasta agotar el cupo → la siguiente devuelve
  `429 quota_exceeded`.
- Flujo de upgrade en modo de prueba (Stripe/MercadoPago sandbox) → tras webhook, el tier
  pasa a `PRO` y desaparecen límites/anuncios.

## 5. Tests

```bash
cd server && npm test       # Vitest + Supertest (cuotas, auth, webhooks)
cd client && npm test        # componentes
cd client && npm run e2e     # Playwright (flujos P1/P2)
```

## Mapa de carpetas

- `client/` — Angular (catálogo, herramientas, cuenta, billing, admin)
- `server/` — API Express (auth, tools, catalog, usage, billing, admin, providers)
- `prisma/` — schema, migraciones y seed
- `shared/` — catálogo tipado y contratos de API (fuente de verdad)
