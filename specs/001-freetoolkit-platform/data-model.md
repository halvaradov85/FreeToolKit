# Phase 1 — Data Model: FreeToolKit

Modelo de datos derivado de las entidades del spec. Implementado con Prisma sobre
PostgreSQL. El **catálogo de herramientas** vive como definición tipada en `shared/` (fuente
de verdad de tier/límite); la tabla `Tool` almacena solo **overrides editables por admin**
(enabled, límite) referenciados por `toolId`.

## Entidades

### User
Persona registrada.
- `id` (uuid, pk)
- `email` (string, único, requerido, formato email)
- `passwordHash` (string, requerido) — bcrypt; nunca en texto plano ni en logs
- `role` (enum: `USER` | `ADMIN`, default `USER`)
- `tier` (enum: `FREE` | `PRO`, default `FREE`) — derivado de la suscripción activa
- `status` (enum: `ACTIVE` | `SUSPENDED`, default `ACTIVE`)
- `themePref` (enum: `LIGHT` | `DARK` | `SYSTEM`, default `SYSTEM`)
- `localePref` (string, default `es`)
- `createdAt`, `updatedAt`
- Relaciones: 1—N `UsageRecord`, 1—N `HistoryItem`, 1—1/N `Subscription`, 1—N `ShortLink`,
  1—N `Payment`, 1—N `RefreshToken`.

### RefreshToken
Token de refresco rotatorio para renovar el JWT de acceso.
- `id` (uuid, pk)
- `userId` (fk → User)
- `tokenHash` (string) — se guarda hasheado
- `expiresAt` (datetime)
- `revokedAt` (datetime, nullable)
- `createdAt`

### Subscription
Relación del usuario con el plan Pro.
- `id` (uuid, pk)
- `userId` (fk → User)
- `provider` (enum: `STRIPE` | `MERCADOPAGO`)
- `providerSubId` (string) — id de suscripción en la pasarela
- `status` (enum: `ACTIVE` | `CANCELED` | `EXPIRED` | `PAST_DUE`)
- `currentPeriodEnd` (datetime) — hasta cuándo conserva Pro
- `cancelAtPeriodEnd` (bool, default false)
- `createdAt`, `updatedAt`
- **Transiciones**: `ACTIVE → PAST_DUE` (fallo de cobro) → `ACTIVE` (reintento ok) o
  `EXPIRED`; `ACTIVE → CANCELED` (cancelación; Pro hasta `currentPeriodEnd` → luego FREE).

### Tool (override de catálogo)
Estado editable por admin de una herramienta del catálogo. La definición base (categoría,
nombre, runtime, proveedor, proFeatures) está en `shared/`.
- `id` (string, pk) — el `toolId` del catálogo (p. ej. `json-formatter`)
- `enabled` (bool, default true)
- `freeLimitPerDayOverride` (int, nullable) — si null, usa el valor del catálogo
- `updatedAt`

### UsageRecord
Contador de consumo para el cupo diario y las métricas.
- `id` (uuid, pk)
- `subjectType` (enum: `USER` | `ANON`)
- `subjectId` (string) — userId, o identificador derivado de red/dispositivo para anónimos
- `toolId` (string) — referencia al catálogo
- `usageDate` (date) — fecha en la zona horaria de referencia
- `count` (int, default 0)
- **Unicidad**: `(subjectType, subjectId, toolId, usageDate)` — único; el conteo se
  incrementa de forma atómica (upsert) antes de ejecutar la herramienta limitada.

### HistoryItem
Acción de un usuario autenticado sobre una herramienta, para su panel.
- `id` (uuid, pk)
- `userId` (fk → User)
- `toolId` (string)
- `createdAt`
- `meta` (json, nullable) — metadatos no sensibles (p. ej. formato de salida); nunca el
  contenido del usuario

### ShortLink
Enlace creado por la herramienta de acortar (server-side, persistente).
- `id` (uuid, pk)
- `code` (string, único) — slug corto
- `targetUrl` (string, requerido, url válida)
- `userId` (fk → User, nullable) — null si anónimo
- `clickCount` (int, default 0) — métrica básica; analytics detallado es Pro
- `createdAt`, `expiresAt` (nullable)

### Payment
Transacción de suscripción (las donaciones externas no se registran aquí).
- `id` (uuid, pk)
- `userId` (fk → User)
- `subscriptionId` (fk → Subscription, nullable)
- `provider` (enum: `STRIPE` | `MERCADOPAGO`)
- `providerPaymentId` (string)
- `amount` (decimal), `currency` (string)
- `status` (enum: `PENDING` | `SUCCEEDED` | `FAILED` | `REFUNDED`)
- `createdAt`

### AdminAuditLog
Traza de acciones administrativas.
- `id` (uuid, pk)
- `adminId` (fk → User)
- `action` (string) — p. ej. `TOOL_DISABLED`, `USER_ROLE_CHANGED`
- `targetType`, `targetId` (string)
- `createdAt`

## Reglas de validación (de los requisitos)

- `User.email` único y con formato válido; `passwordHash` siempre bcrypt (FR-014).
- Conteo de cuota atómico y único por `(subject, toolId, usageDate)` (FR-007/FR-008, SC-002).
- `Subscription.currentPeriodEnd` gobierna el acceso Pro tras cancelar (FR-021).
- `ShortLink.targetUrl` validado como URL; `code` único.
- Ningún campo almacena contenido de usuario procesado en servidor (FR-005, SC-007).

## prisma/schema.prisma (borrador)

```prisma
generator client { provider = "prisma-client-js" }
datasource db { provider = "postgresql"; url = env("DATABASE_URL") }

enum Role { USER ADMIN }
enum Tier { FREE PRO }
enum UserStatus { ACTIVE SUSPENDED }
enum ThemePref { LIGHT DARK SYSTEM }
enum SubProvider { STRIPE MERCADOPAGO }
enum SubStatus { ACTIVE CANCELED EXPIRED PAST_DUE }
enum SubjectType { USER ANON }
enum PaymentStatus { PENDING SUCCEEDED FAILED REFUNDED }

model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String
  role         Role     @default(USER)
  tier         Tier     @default(FREE)
  status       UserStatus @default(ACTIVE)
  themePref    ThemePref  @default(SYSTEM)
  localePref   String   @default("es")
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  subscriptions Subscription[]
  usage        UsageRecord[]
  history      HistoryItem[]
  shortLinks   ShortLink[]
  payments     Payment[]
  refreshTokens RefreshToken[]
}

model RefreshToken {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  tokenHash String
  expiresAt DateTime
  revokedAt DateTime?
  createdAt DateTime @default(now())
}

model Subscription {
  id             String   @id @default(uuid())
  userId         String
  user           User     @relation(fields: [userId], references: [id])
  provider       SubProvider
  providerSubId  String
  status         SubStatus
  currentPeriodEnd DateTime
  cancelAtPeriodEnd Boolean @default(false)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  payments       Payment[]
}

model Tool {
  id                       String  @id
  enabled                  Boolean @default(true)
  freeLimitPerDayOverride  Int?
  updatedAt                DateTime @updatedAt
}

model UsageRecord {
  id          String   @id @default(uuid())
  subjectType SubjectType
  subjectId   String
  toolId      String
  usageDate   DateTime @db.Date
  count       Int      @default(0)
  user        User?    @relation(fields: [subjectId], references: [id], map: "usage_user_fk")
  @@unique([subjectType, subjectId, toolId, usageDate])
  @@index([toolId, usageDate])
}

model HistoryItem {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  toolId    String
  meta      Json?
  createdAt DateTime @default(now())
  @@index([userId, createdAt])
}

model ShortLink {
  id         String   @id @default(uuid())
  code       String   @unique
  targetUrl  String
  userId     String?
  user       User?    @relation(fields: [userId], references: [id])
  clickCount Int      @default(0)
  createdAt  DateTime @default(now())
  expiresAt  DateTime?
}

model Payment {
  id                String   @id @default(uuid())
  userId            String
  user              User     @relation(fields: [userId], references: [id])
  subscriptionId    String?
  subscription      Subscription? @relation(fields: [subscriptionId], references: [id])
  provider          SubProvider
  providerPaymentId String
  amount            Decimal
  currency          String
  status            PaymentStatus
  createdAt         DateTime @default(now())
}

model AdminAuditLog {
  id         String   @id @default(uuid())
  adminId    String
  action     String
  targetType String
  targetId   String
  createdAt  DateTime @default(now())
}
```

> Nota: la relación `UsageRecord.subjectId → User` solo aplica cuando `subjectType = USER`;
> para `ANON` el `subjectId` es un identificador derivado y la FK es opcional. En
> implementación puede modelarse sin FK estricta para no bloquear el registro anónimo.
