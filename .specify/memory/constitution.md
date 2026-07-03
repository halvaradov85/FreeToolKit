<!--
Sync Impact Report
==================
Version change: (template) → 1.0.0
Bump rationale: Initial ratification of the FreeToolKit constitution (MAJOR baseline).
Modified principles: N/A (first definition)
Added sections:
  - Core Principles (5): Client-First Privacy, Modular Tool Architecture,
    Freemium Boundaries (server-enforced), Responsive & Accessible UX,
    Cost-Controlled Third-Party Dependencies
  - Technology & Architecture Constraints
  - Development Workflow & Quality Gates
  - Governance
Removed sections: N/A
Templates requiring updates:
  - .specify/templates/plan-template.md       ✅ aligned (Constitution Check generic)
  - .specify/templates/spec-template.md        ✅ aligned
  - .specify/templates/tasks-template.md       ✅ aligned
Follow-up TODOs: none
-->

# FreeToolKit Constitution

## Core Principles

### I. Client-First Privacy
Toda herramienta que pueda ejecutarse íntegramente en el navegador DEBE hacerlo en el
cliente, sin enviar los datos del usuario al servidor. El servidor solo interviene cuando
la operación lo exige (procesamiento pesado, APIs de terceros, persistencia o cómputo que
no puede vivir en el cliente). Los archivos y textos que sí llegan al servidor se procesan
de forma **efímera**: se eliminan inmediatamente tras devolver el resultado y nunca se
almacenan salvo que el usuario lo solicite explícitamente (p. ej. historial, bóveda Pro).
**Rationale**: privacidad por defecto, menor coste de infraestructura y mayor velocidad
percibida; ~30 de las 52 herramientas son transformaciones sin estado que no justifican
un viaje al backend.

### II. Modular Tool Architecture
Cada una de las 52 herramientas DEBE implementarse como un módulo autocontenido y
enchufable, registrado en un catálogo central por `id`, categoría, tier (free/pro) y
límite de uso. Añadir o quitar una herramienta NO DEBE requerir modificar el núcleo
(auth, layout, sistema de límites, facturación). Una herramienta no puede depender del
estado interno de otra.
**Rationale**: 52 herramientas en 8 categorías solo son mantenibles si el núcleo es
estable y las herramientas son hojas intercambiables; habilita despliegue incremental.

### III. Freemium Boundaries (Server-Enforced)
Los límites de uso del tier Free (p. ej. 3–5 usos/día) y los privilegios Pro DEBEN
validarse en el **servidor** como fuente de verdad; la UI solo refleja ese estado, nunca
lo decide. Cada consumo contra una herramienta limitada DEBE registrarse de forma atómica
contra el contador diario del usuario antes de entregar el resultado. Las restricciones de
tier para una herramienta DEBEN derivarse de su definición en el catálogo, no codificarse
a mano en cada endpoint.
**Rationale**: la monetización depende de que los límites no se puedan saltar desde el
cliente; centralizar la regla evita inconsistencias entre las 52 herramientas.

### IV. Responsive & Accessible UX
La interfaz DEBE ser responsive mobile-first y funcionar correctamente en móvil, tablet y
escritorio. Modo oscuro y claro son obligatorios y la preferencia DEBE persistir. El
idioma principal es el **español**; la arquitectura DEBE permitir i18n sin reescribir
componentes. Los componentes interactivos DEBEN ser navegables por teclado y respetar
contraste y etiquetas accesibles.
**Rationale**: un catálogo de utilidades de uso masivo vive o muere por su accesibilidad
en móvil y por una experiencia consistente entre temas e idiomas.

### V. Cost-Controlled Third-Party Dependencies
Las herramientas que dependen de APIs de terceros de pago (traducción, quitar fondo,
texto a voz, monedas en vivo, email hackeado) DEBEN aislarse tras una interfaz de
proveedor, aplicar caché cuando el ToS lo permita y degradar con elegancia si la cuota se
agota o el proveedor falla. Ninguna funcionalidad que viole los Términos de Servicio de un
tercero o exponga al proyecto a riesgo legal (p. ej. descarga de vídeos de plataformas que
lo prohíben) DEBE incluirse sin una decisión explícita y documentada.
**Rationale**: cada dependencia externa es coste fijo, mantenimiento y riesgo; aislarlas
protege el margen del modelo freemium y la viabilidad legal del producto.

## Technology & Architecture Constraints

- **Frontend**: Angular (última versión estable), 100% responsive, modo oscuro/claro.
- **Backend**: Node.js + Express + TypeScript.
- **ORM / BD**: Prisma sobre PostgreSQL (ejecutado en Docker durante el desarrollo).
- **Auth**: JWT para sesiones + bcrypt para hashing de contraseñas.
- **Pagos**: Stripe y/o MercadoPago para suscripciones Pro; Ko-fi / Buy Me a Coffee para
  donaciones.
- **Estructura de repositorio**: `client/` (Angular), `server/` (API Express),
  `prisma/` (schema y migraciones).
- TypeScript es obligatorio en el backend; el código compartido (tipos del catálogo,
  contratos de API) DEBE tener una única fuente de verdad.
- Los secretos (JWT secret, claves de Stripe/MercadoPago, API keys de terceros) DEBEN
  leerse de variables de entorno y NUNCA commitearse.

## Development Workflow & Quality Gates

- El desarrollo sigue **Spec-Driven Development** (spec-kit): `constitution` → `specify`
  → `plan` → `tasks` → `implement`. No se implementa una funcionalidad sin su spec y plan.
- Toda herramienta nueva DEBE entrar por el registro central del catálogo (Principio II) y
  declarar su tier y límite (Principio III).
- Las rutas que consumen cuota o tocan pagos DEBEN tener pruebas de la lógica de límites y
  de los flujos de autorización antes de considerarse completas.
- Las contraseñas, tokens y datos de pago NO DEBEN aparecer en logs.
- Cualquier desviación del stack o de estos principios DEBE justificarse en el `plan` de la
  funcionalidad bajo "Complexity Tracking".

## Governance

Esta constitución prevalece sobre cualquier otra práctica del proyecto. Las enmiendas
DEBEN documentarse en este archivo, incrementar la versión según versionado semántico
(MAJOR: cambios incompatibles de principios; MINOR: nuevo principio o sección; PATCH:
aclaraciones) y registrarse en el Sync Impact Report de la cabecera. Toda revisión de
cambios DEBE verificar el cumplimiento de estos principios; la complejidad añadida DEBE
justificarse explícitamente. El estado de tier y los límites de uso, al ser el motor de
la monetización, reciben escrutinio reforzado en cada revisión.

**Version**: 1.0.0 | **Ratified**: 2026-06-14 | **Last Amended**: 2026-06-14
