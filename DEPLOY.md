# Despliegue de FreeToolKit

Todo el stack se empaqueta en Docker: **db** (PostgreSQL) + **server** (API + LibreOffice) +
**client** (Angular servido por nginx, que además hace de proxy a la API).

## Opción A — VPS / servidor propio (Docker Compose)

Requisitos: una máquina Linux con Docker y Docker Compose.

```bash
# 1. Clona el repo en el servidor
git clone <tu-repo> && cd FreeToolKit

# 2. Crea los secretos de producción
cp .env.prod.example .env.prod
nano .env.prod            # rellena passwords y secretos (openssl rand -hex 32)

# 3. Levanta todo (build incluido)
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build

# 4. La web queda en http://<ip-del-servidor>:80
```

El contenedor `server` aplica las migraciones automáticamente al arrancar
(`prisma migrate deploy`) y siembra... (ejecuta el seed manualmente la primera vez):

```bash
docker compose -f docker-compose.prod.yml exec server npx tsx prisma/seed.ts
```

### HTTPS

Pon un **reverse proxy** delante (Caddy o Traefik son los más simples) que termine TLS y
apunte al servicio `client`. Con Caddy basta un Caddyfile de 2 líneas con tu dominio y
`reverse_proxy client:80`.

## Opción B — Render / Railway (PaaS)

Estos servicios construyen desde el repo:

- **Base de datos**: crea un PostgreSQL gestionado; copia su `DATABASE_URL`.
- **Servicio del backend**: tipo "Web Service" con `Dockerfile.server` como Dockerfile.
  Variables: `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `TZ_REFERENCE`,
  y (opcional) las de Stripe/MercadoPago. Puerto 3000.
- **Servicio del frontend**: "Web Service" con `client/Dockerfile`. Ajusta `nginx.conf` para
  que `proxy_pass` apunte a la URL pública del backend (en PaaS no comparten red `server:3000`).

> Nota: en PaaS, edita `client/nginx.conf` cambiando `http://server:3000` por la URL interna
> o pública de tu backend.

## Conectar pasarelas reales

El sistema funciona en **modo simulado** sin claves. Para activar Stripe/MercadoPago de
verdad: añade `STRIPE_SECRET_KEY` / `MERCADOPAGO_ACCESS_TOKEN` y completa el `// TODO` en
`server/src/modules/billing/billing.service.ts` (crear sesión real + verificar webhook).

## Variables de entorno

Ver `.env.prod.example`. Imprescindibles: `POSTGRES_PASSWORD`, `JWT_ACCESS_SECRET`,
`JWT_REFRESH_SECRET`.

## Qué desbloquea el contenedor

La imagen del backend incluye **LibreOffice headless**, por lo que **Word→PDF** y
**Excel→PDF** funcionan en producción (en local sin LibreOffice devuelven 503).
