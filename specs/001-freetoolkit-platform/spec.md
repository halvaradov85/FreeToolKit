# Feature Specification: FreeToolKit — Plataforma de 51 herramientas online (freemium)

**Feature Branch**: `001-freetoolkit-platform`
**Created**: 2026-06-14
**Status**: Draft
**Input**: User description: "Plataforma web FreeToolKit con herramientas online gratuitas y modelo freemium (Free con límites y anuncios, Pro ilimitado sin anuncios, donaciones). Incluye landing, registro/login, dashboard con historial, panel admin, modo oscuro/claro y diseño responsive. Categorías: Imágenes (8), Texto (8), Archivos/PDF (6), Desarrollo (10), Conversores (6), Calculadoras (6), Redes Sociales (3), Seguridad (4)."

> **Decisión de alcance (2026-06-14)**: el "Descargador de videos (YouTube/TikTok)" queda
> **excluido** del proyecto por riesgo legal y de Términos de Servicio. El catálogo pasa de
> 52 a **51 herramientas** y la categoría Redes Sociales de 4 a 3.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Usar una herramienta gratis al instante, sin cuenta (Priority: P1)

Una persona llega a FreeToolKit, elige una herramienta del catálogo (p. ej. contador de
palabras, generador de contraseñas, conversor de unidades, formateador de JSON) y obtiene
el resultado de inmediato, sin registrarse ni instalar nada. Para las herramientas que lo
permiten, sus datos (texto, imagen, archivo) se procesan sin almacenarse.

**Why this priority**: Es la propuesta de valor central. Si solo se entrega esto, ya hay
un producto útil y viral (SEO, uso recurrente) que puede crecer sin fricción.

**Independent Test**: Abrir el catálogo, ejecutar al menos una herramienta de cada
categoría sin iniciar sesión y verificar que devuelve un resultado correcto y que no se
persiste el contenido del usuario.

**Acceptance Scenarios**:

1. **Given** un visitante anónimo en la página de una herramienta de procesamiento local,
   **When** introduce una entrada válida y ejecuta, **Then** ve el resultado sin recargar
   ni autenticarse y puede copiarlo o descargarlo.
2. **Given** un visitante anónimo, **When** busca o filtra el catálogo por categoría o
   nombre, **Then** encuentra la herramienta y accede a ella en un paso.
3. **Given** una herramienta que procesa un archivo subido, **When** se completa la
   operación, **Then** el archivo de entrada no queda almacenado de forma persistente.

---

### User Story 2 - Límite diario del tier Free aplicado de forma fiable (Priority: P1)

Un usuario del tier Free usa una herramienta limitada (p. ej. quitar fondo, traductor, unir
PDF, comprimir PDF). Tras agotar su cupo diario (3–5 usos según la herramienta), el sistema
le impide seguir y le ofrece registrarse o pasar a Pro. El límite no se puede evadir
recargando, borrando cookies ni manipulando el cliente.

**Why this priority**: Es el motor económico del freemium. Sin un límite fiable y aplicado
en el servidor, no hay incentivo para pagar y el coste de las herramientas caras se dispara.

**Independent Test**: Consumir el cupo de una herramienta limitada hasta agotarlo y
verificar que el uso N+1 se bloquea con un mensaje claro y una vía de upgrade, incluso tras
limpiar el estado del navegador.

**Acceptance Scenarios**:

1. **Given** un usuario Free que ya usó su cupo diario de una herramienta, **When** intenta
   usarla otra vez el mismo día, **Then** se bloquea con un mensaje y opciones de
   registro/Pro.
2. **Given** un usuario Free que alcanzó el límite, **When** llega un nuevo día, **Then** su
   cupo se reinicia y puede volver a usar la herramienta.
3. **Given** un intento de evadir el límite borrando cookies o desde otra pestaña, **When**
   se vuelve a invocar la herramienta, **Then** el sistema sigue contabilizando el uso
   correctamente.

---

### User Story 3 - Cuenta, historial y preferencias (Priority: P2)

Una persona se registra con email y contraseña, inicia sesión y accede a un panel donde ve
su historial de uso, su tier actual y su consumo del día, y gestiona preferencias (tema,
idioma).

**Why this priority**: Convierte visitantes en usuarios recurrentes y habilita el upgrade y
la retención; el historial añade valor y datos para el negocio.

**Independent Test**: Registrarse, iniciar sesión, usar varias herramientas y comprobar que
el historial y el contador de consumo se reflejan en el panel; cerrar e iniciar sesión y
verificar que persisten.

**Acceptance Scenarios**:

1. **Given** un visitante, **When** se registra con email y contraseña válidos, **Then**
   queda autenticado y accede a su panel.
2. **Given** un usuario autenticado, **When** usa herramientas, **Then** su historial
   reciente aparece en el panel.
3. **Given** credenciales incorrectas, **When** intenta iniciar sesión, **Then** se rechaza
   con un mensaje claro y sin revelar si el email existe.

---

### User Story 4 - Pasar a Pro y obtener beneficios (Priority: P2)

Un usuario Free decide pasar a Pro. Completa el pago mediante una pasarela y, al confirmarse,
obtiene uso ilimitado, sin anuncios y funciones extra (p. ej. batch, HD, paletas/bóveda
guardadas, analytics de enlaces). Puede consultar y cancelar su suscripción.

**Why this priority**: Es la fuente principal de ingresos recurrentes. Depende de US2 y US3.

**Independent Test**: Ejecutar el flujo de upgrade en modo de prueba, confirmar el pago y
verificar que los límites desaparecen, los anuncios dejan de mostrarse y las funciones Pro
se desbloquean; cancelar y verificar el regreso a Free al expirar.

**Acceptance Scenarios**:

1. **Given** un usuario Free, **When** completa el pago de Pro, **Then** su tier pasa a Pro
   y los límites diarios dejan de aplicarse.
2. **Given** un usuario Pro, **When** usa una herramienta antes limitada, **Then** no ve
   anuncios ni topes de uso y accede a las funciones extra de esa herramienta.
3. **Given** un usuario Pro, **When** cancela, **Then** conserva Pro hasta el fin del
   periodo pagado y luego vuelve a Free.

---

### User Story 5 - Administración de la plataforma (Priority: P3)

Un administrador accede a un panel restringido donde ve métricas de uso (herramientas más
usadas, usuarios, conversiones Free→Pro), gestiona usuarios (rol, estado) y activa/desactiva
herramientas del catálogo o ajusta sus límites.

**Why this priority**: Necesario para operar y crecer, pero no bloquea el valor para el
usuario final ni la monetización inicial.

**Independent Test**: Iniciar sesión como administrador, ver métricas agregadas, desactivar
una herramienta y comprobar que deja de estar disponible para los usuarios.

**Acceptance Scenarios**:

1. **Given** un administrador autenticado, **When** abre el panel, **Then** ve métricas
   agregadas de uso y de suscripciones.
2. **Given** un administrador, **When** desactiva una herramienta, **Then** los usuarios
   dejan de poder usarla y se informa con elegancia.
3. **Given** un usuario sin rol de administrador, **When** intenta acceder al panel, **Then**
   se le deniega el acceso.

---

### User Story 6 - Apoyar el proyecto con donaciones (Priority: P3)

Cualquier visitante puede apoyar el proyecto mediante un botón de donación (Ko-fi / Buy Me a
Coffee) accesible desde la interfaz.

**Why this priority**: Ingreso complementario de baja complejidad; no condiciona el resto.

**Independent Test**: Pulsar el botón de donación y verificar que lleva a un destino de
donación válido.

**Acceptance Scenarios**:

1. **Given** un visitante, **When** pulsa "Donar", **Then** llega a una vía de donación
   externa funcional.

---

### Edge Cases

- **Entrada inválida o demasiado grande**: una herramienta recibe un archivo corrupto,
  vacío o que excede el tamaño máximo permitido → se rechaza con un mensaje claro y sin
  consumir cupo.
- **Fallo de un proveedor externo**: una herramienta dependiente de API de terceros
  (traductor, quitar fondo, monedas, email hackeado) no responde o agotó su cuota → se
  informa con elegancia y no se cobra cupo al usuario por un intento fallido.
- **Cambio de día durante el uso**: el reinicio del cupo diario ocurre de forma consistente
  según una zona horaria definida, sin doble conteo ni saltos.
- **Caducidad/renovación de Pro**: un pago que no se renueva o un reembolso degrada al
  usuario a Free de forma predecible.
- **Sesión expirada**: un usuario con sesión vencida que intenta una acción protegida es
  reautenticado o redirigido sin perder su trabajo en curso cuando sea posible.
- **Concurrencia**: dos usos simultáneos de la misma cuenta no permiten exceder el cupo.
- **Acceso directo a una herramienta desactivada**: navegar a su URL muestra un estado de
  "no disponible" en lugar de un error.

## Requirements *(mandatory)*

### Functional Requirements

**Catálogo y herramientas**

- **FR-001**: El sistema MUST ofrecer 51 herramientas organizadas en 8 categorías
  (Imágenes 8, Texto 8, Archivos/PDF 6, Desarrollo 10, Conversores 6, Calculadoras 6,
  Redes Sociales 3, Seguridad 4).
- **FR-002**: El sistema MUST permitir explorar, buscar y filtrar el catálogo por categoría
  y por nombre.
- **FR-003**: Cada herramienta MUST declarar su categoría, su tier de acceso (Free/Pro), su
  límite de uso aplicable y las funciones extra que ofrece a Pro.
- **FR-004**: Las herramientas que pueden procesarse íntegramente en el dispositivo del
  usuario MUST hacerlo sin enviar el contenido al servidor.
- **FR-005**: El contenido del usuario (texto, imágenes, archivos) que sí se procesa en el
  servidor MUST tratarse de forma efímera y NO persistirse salvo solicitud explícita del
  usuario.
- **FR-006**: Las herramientas MUST validar la entrada (tipo, tamaño máximo, formato) y
  rechazar entradas inválidas con un mensaje claro.

**Límites y freemium**

- **FR-007**: El sistema MUST aplicar los límites de uso del tier Free en el servidor como
  fuente de verdad, independientemente del estado del cliente.
- **FR-008**: El sistema MUST contabilizar cada uso de una herramienta limitada contra un
  cupo diario por usuario (y por visitante anónimo cuando aplique) antes de entregar el
  resultado.
- **FR-009**: El sistema MUST reiniciar los cupos diarios una vez por día según una zona
  horaria definida.
- **FR-010**: Al agotarse el cupo, el sistema MUST bloquear el uso adicional y MUST ofrecer
  vías de registro y de upgrade a Pro.
- **FR-011**: El sistema MUST mostrar anuncios a usuarios no-Pro y NO MUST mostrarlos a
  usuarios Pro.
- **FR-012**: Un intento fallido por causa del sistema o de un proveedor externo NO MUST
  consumir cupo del usuario.

**Cuentas y autenticación**

- **FR-013**: Los usuarios MUST poder registrarse con email y contraseña.
- **FR-014**: Las contraseñas MUST almacenarse de forma irreversible (hash) y NUNCA en
  texto plano ni en logs.
- **FR-015**: Los usuarios MUST poder iniciar y cerrar sesión; las sesiones MUST expirar y
  poder renovarse de forma segura.
- **FR-016**: Los mensajes de error de autenticación NO MUST revelar si un email está
  registrado.
- **FR-017**: El sistema MUST soportar al menos dos roles: usuario y administrador.

**Pro y pagos**

- **FR-018**: Los usuarios MUST poder pasar a Pro mediante una pasarela de pago y ver su
  estado de suscripción.
- **FR-019**: Al confirmarse el pago, el sistema MUST elevar el tier del usuario a Pro y
  retirar límites y anuncios de inmediato.
- **FR-020**: Los usuarios Pro MUST acceder a las funciones extra declaradas por cada
  herramienta (p. ej. batch, HD, paletas/bóveda guardadas, analytics de enlaces).
- **FR-021**: Los usuarios MUST poder cancelar Pro y MUST conservar el acceso hasta el fin
  del periodo pagado, tras el cual vuelven a Free.
- **FR-022**: El sistema MUST registrar el estado de pago de forma fiable ante eventos de la
  pasarela (alta, renovación, fallo, cancelación, reembolso).
- **FR-023**: El sistema MUST ofrecer una vía de donación externa (Ko-fi / Buy Me a Coffee).

**Panel de usuario**

- **FR-024**: Los usuarios autenticados MUST ver su historial de uso reciente.
- **FR-025**: Los usuarios MUST ver su tier actual y su consumo del día frente a sus
  límites.
- **FR-026**: Los usuarios MUST poder gestionar sus preferencias (tema e idioma) de forma
  persistente.

**Panel de administración**

- **FR-027**: Los administradores MUST ver métricas agregadas de uso de herramientas y de
  suscripciones (incluida la conversión Free→Pro).
- **FR-028**: Los administradores MUST poder gestionar usuarios (rol y estado).
- **FR-029**: Los administradores MUST poder activar/desactivar herramientas y ajustar sus
  límites; el catálogo MUST reflejar el cambio para los usuarios.
- **FR-030**: El acceso al panel de administración MUST estar restringido al rol
  administrador.

**Experiencia y privacidad**

- **FR-031**: La interfaz MUST ser responsive y funcionar en móvil, tablet y escritorio.
- **FR-032**: La interfaz MUST ofrecer modo oscuro y claro, con la preferencia persistente.
- **FR-033**: La interfaz MUST tener el español como idioma principal y permitir su
  traducción a otros idiomas sin rehacer las pantallas.
- **FR-034**: La plataforma MUST presentar una landing page que comunique el valor y dé
  acceso al catálogo y al upgrade.
- **FR-035**: La plataforma NO MUST incluir funcionalidades que infrinjan los Términos de
  Servicio de terceros. En particular, el "Descargador de videos (YouTube/TikTok)" queda
  **excluido del alcance** por decisión explícita (2026-06-14).

### Key Entities *(include if feature involves data)*

- **Usuario**: persona registrada; atributos clave: identidad (email), credencial protegida,
  rol (usuario/administrador), tier (Free/Pro), preferencias (tema, idioma), estado.
- **Suscripción**: relación del usuario con el plan Pro; estado (activa, cancelada,
  vencida), inicio y fin del periodo, referencia al pago.
- **Herramienta (entrada de catálogo)**: definición de una de las 52 herramientas;
  categoría, tier de acceso, límite de uso, funciones extra, estado (activa/inactiva).
- **Registro de uso**: consumo de una herramienta por un usuario/visitante en una fecha;
  base del cupo diario y de las métricas.
- **Elemento de historial**: acción realizada por un usuario sobre una herramienta, para
  mostrar en su panel.
- **Enlace acortado**: enlace creado por la herramienta de acortar; destino, código y, para
  Pro, métricas de clics.
- **Pago/Donación**: transacción asociada a una suscripción o a un apoyo voluntario.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un visitante puede encontrar y usar una herramienta de procesamiento local y
  obtener su resultado en menos de 10 segundos desde que abre el catálogo, sin registrarse.
- **SC-002**: El 100% de los intentos de superar el cupo diario de una herramienta Free son
  bloqueados, incluso tras limpiar el estado del navegador o usar varias pestañas.
- **SC-003**: Un usuario Pro deja de ver anuncios y de encontrar topes de uso en el 100% de
  las herramientas inmediatamente tras confirmarse su pago.
- **SC-004**: El 95% de los usuarios completa el registro en menos de 2 minutos.
- **SC-005**: Las 51 herramientas están disponibles y operativas según su definición de tier
  y límite.
- **SC-006**: La interfaz es plenamente utilizable en pantallas desde 320 px de ancho hasta
  escritorio, en modo oscuro y claro.
- **SC-007**: Ningún contenido de usuario procesado en el servidor permanece almacenado tras
  entregar el resultado, salvo el historial/funciones que el usuario active explícitamente.
- **SC-008**: Un administrador puede desactivar una herramienta y verla dejar de estar
  disponible para los usuarios en menos de 1 minuto.

## Assumptions

- **Visitantes anónimos**: las herramientas de procesamiento local son usables sin cuenta;
  para herramientas Free con límite, los visitantes anónimos reciben un cupo asociado a una
  **clave efímera derivada de IP + cabeceras** (sin fingerprinting persistente ni cookies de
  rastreo), y registrarse ofrece una mejor experiencia. (Default razonable; ajustable.)
- **Límites por herramienta**: se toman los valores del catálogo provisto (p. ej. 3/día o
  5/día según la herramienta) como configuración inicial, modificable por administración.
- **Zona horaria de reinicio de cupos**: se define una única zona horaria de referencia
  para el reinicio diario (configurable), por defecto la del público objetivo principal.
- **Pagos**: se ofrece una pasarela para suscripción Pro con cobertura para el público
  objetivo (incluida América Latina) y las donaciones se gestionan vía plataformas externas
  (Ko-fi / Buy Me a Coffee), fuera del alcance de la facturación interna.
- **Anuncios**: el tier no-Pro muestra publicidad; la red/plataforma concreta de anuncios se
  decidirá en planificación y no condiciona los requisitos aquí descritos.
- **Idioma**: español como idioma principal; la i18n adicional es soportada por arquitectura
  aunque su contenido traducido pueda incorporarse de forma incremental.
- **Herramientas con terceros de pago** (traductor, corrector, texto a voz, quitar fondo,
  monedas en vivo, email hackeado): dependen de la disponibilidad y cuota de sus proveedores
  y degradan con elegancia ante fallos.
- **Privacidad**: el procesamiento de archivos en servidor es efímero por defecto, conforme
  a la constitución del proyecto.
