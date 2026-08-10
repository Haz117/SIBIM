# SIBIM — Sistema Integral de Bienes Municipales

Sistema de control patrimonial para el H. Ayuntamiento: inventario de bienes municipales (mobiliario, vehículos, equipo de cómputo, equipo de oficina, herramientas y maquinaria, equipo audiovisual) organizado por el **organigrama municipal** (Presidencia, Secretarías y Direcciones), con acceso por área — cada dirección gestiona únicamente su propio inventario — y un superusuario con visibilidad y control total.

## Índice

- [Características](#características)
- [Stack técnico](#stack-técnico)
- [Primeros pasos](#primeros-pasos)
- [Configuración de entorno](#configuración-de-entorno)
- [Autenticación y roles](#autenticación-y-roles)
- [Arquitectura de datos](#arquitectura-de-datos)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Temas y diseño](#temas-y-diseño)
- [Seguridad](#seguridad)
- [Problemas conocidos](#problemas-conocidos)
- [Roadmap hacia producción](#roadmap-hacia-producción)

## Características

- **Dashboard** con 6 indicadores patrimoniales (total de bienes, valor, existencias bajas, agotados, movimientos del día, categorías) que se recalculan según el área del usuario. Los indicadores son clicables y llevan a la sección correspondiente.
- **Organigrama** interactivo: Despacho de la Presidencia, Secretarías, Direcciones, Contraloría y otras áreas/organismos, cada una expandible para ver los bienes asignados (máximo 5 en vista previa). Si el área tiene más, se muestra "Ver los N bienes →" con enlace directo al listado filtrado en Productos. Los roles Secretario/a y Dirección ven una vista acotada a su propia secretaría/dirección (el árbol completo es exclusivo del superusuario). Búsqueda con botón de limpiar en el propio campo.
- **Productos** (bienes patrimoniales): alta, edición, eliminación con deshacer, búsqueda ampliada (nombre, código, proveedor, ubicación, descripción), filtros por categoría/estado/área, ordenamiento por columna, paginación (10/25/50/100 por página) con reset automático y scroll al inicio, exportación a CSV y Excel. Vista de detalle con ficha completa. Tabla responsiva con vista de tarjetas en móvil.
- **Categorías**: CRUD completo con validación de nombre único, conteo de bienes por categoría, íconos, colores y estado de uso.
- **Movimientos**: registro de entradas, salidas, ajustes (incluye fijar el stock exactamente en 0, ej. tras un conteo físico) y transferencias; filtros por tipo, producto y rango de fechas; ordenamiento por columna; anulación con restauración automática de stock; paginación; exportación a CSV y Excel (deshabilitada con filtro vacío); vista de tarjetas en móvil.
- **Alertas**: tres paneles (agotados, existencias bajas, garantías por vencer en 7 días), accionables — "Reponer"/"Solicitar" abren un diálogo de movimiento con el bien ya preseleccionado para registrar el reabastecimiento sin salir de la página. Pantalla "Todo en orden" cuando no hay alertas.
- **Reportes**: 7 tipos de reporte descargables en PDF y Excel (Inventario General, Bienes por Área, Movimientos, Alertas de Stock, Valoración, Auditoría, Garantías), con el escudo municipal en el encabezado del PDF y encabezado de tabla repetido en impresiones de varias páginas. Filtro por período predefinido o rango de fechas con validación de rango. Gráfico de stock por categoría.
- **Configuración**: edición de nombre y foto de perfil, selector de tema, panel de usuarios con acceso (admin), restablecimiento de datos de demo.
- **Fotos optimizadas automáticamente**: las fotos de bienes y de perfil (hasta 8 MB de origen) se redimensionan y recomprimen en el navegador antes de guardarse (`src/lib/image.ts`), evitando agotar la cuota de `localStorage`.
- **Paleta de comandos** (`Ctrl+K`): búsqueda rápida de páginas y bienes desde cualquier parte de la app.
- **Toasts** con variantes (éxito, error, info, advertencia) y botones de acción (ej. "Deshacer" al eliminar un bien). Si una operación falla contra la base de datos, el cambio se revierte automáticamente en pantalla y aparece un toast de error.
- **Campo de fecha con calendario propio**: el selector de "Vencimiento de garantía" y los filtros por rango de fecha usan un calendario construido a la medida (mes navegable, hoy resaltado, atajo "Hoy"/"Limpiar") en vez del selector nativo del navegador, y valida que la fecha exista de verdad (rechaza combinaciones imposibles como 31/02).
- **Confirmación de cierre de sesión**: el botón de salir en el sidebar muestra un diálogo de confirmación antes de cerrar la sesión.
- **Tooltips de ayuda** (`?`) en campos clave de los formularios: Stock Mínimo, Stock Máximo, Vencimiento de Garantía y Tipo de Movimiento.
- **Login** con panel institucional, animación de entrada, lista de usuarios de prueba y protección contra fuerza bruta (rate limiting por IP).
- **Animación de apertura** (splash con logo) al abrir o recargar, sin repetirse en la navegación interna.
- Tema claro/oscuro persistente (`next-themes`), configurable desde la barra superior o desde Configuración.
- Boundaries de carga y error (`loading.tsx`, `error.tsx`) con pantallas de esqueleto animado y recuperación.

## Stack técnico

- [Next.js 16](https://nextjs.org) (App Router, Turbopack, Server Actions)
- React 19 + TypeScript
- Tailwind CSS v4
- [Base UI](https://base-ui.com) + [Phosphor Icons](https://phosphoricons.com)
- [Recharts](https://recharts.org) para gráficas del dashboard y reportes
- `xlsx` + `jspdf` para exportación real de Excel y PDF
- `jose` para firma y verificación de sesiones JWT
- `zod` para validación de inputs en Server Actions
- `@supabase/supabase-js` + `@supabase/ssr` (cliente exclusivamente server-side)

## Primeros pasos

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). Al cargar verás la animación de entrada y luego el login; usa el panel **"Usuarios de prueba"** para autocompletar credenciales del superusuario o de cualquier área.

Sin Supabase configurado la app funciona completamente con datos de demostración en memoria — los datos no persisten al recargar en ese modo.

```bash
npm run build   # build de producción
npm run start   # servir el build
npm run lint    # eslint
```

## Configuración de entorno

Copia el archivo de ejemplo y rellena los valores:

```bash
cp .env.local.example .env.local
```

| Variable | Descripción | Dónde encontrarla |
|---|---|---|
| `SUPABASE_URL` | URL del proyecto Supabase | Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave con acceso total a la BD | Dashboard → Settings → API → service_role |
| `SESSION_SECRET` | Clave para firmar cookies de sesión | Genera con `openssl rand -base64 32` |

> **Importante:** Ninguna de estas variables lleva el prefijo `NEXT_PUBLIC_`. El cliente Supabase corre exclusivamente en el servidor y las claves nunca llegan al navegador.

Si `SUPABASE_URL` o `SUPABASE_SERVICE_ROLE_KEY` no están definidas, la app opera con datos mock. `SESSION_SECRET` es obligatorio en producción — la app lanza un error al arrancar si no está configurado con `NODE_ENV=production`.

### Configurar la base de datos

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Abre el **SQL Editor** y ejecuta `supabase/schema.sql` — crea las tablas, índices, funciones atómicas y el seed de datos de prueba
3. Rellena `.env.local` con las credenciales del proyecto

## Autenticación y roles

La sesión se guarda en una **cookie httpOnly firmada con JWT** (`jose` + `SESSION_SECRET`). Las rutas del dashboard están protegidas por [`src/middleware.ts`](src/middleware.ts). En modo demo (sin Supabase) las credenciales se validan contra `src/lib/auth-users.ts`.

Hay tres niveles de acceso (ver [`src/lib/access.ts`](src/lib/access.ts)):

| Rol | Alcance |
|---|---|
| `admin` | Ve y gestiona todos los bienes de todas las áreas |
| `secretario` | Ve y gestiona los bienes de su secretaría y todas sus direcciones adscritas |
| `direccion` | Ve y gestiona únicamente los bienes de su propia dirección; el campo área queda fijo al crear un bien |

## Arquitectura de datos

### Modo demo (sin Supabase)

Los datos viven en memoria (React state) e inicializan desde `src/lib/mock-data.ts`. Las mutaciones (agregar/editar/eliminar) actualizan el estado local inmediatamente pero no persisten al recargar.

### Modo producción (con Supabase)

El switch lo controla `isSupabaseConfigured()` en `src/lib/supabase.ts`:

- Las **lecturas** van por `src/lib/db.ts` (marcado `server-only`) — carga inicial en el layout del servidor
- Las **escrituras** van por `src/lib/db-actions.ts` (Server Actions `use server`) — validadas con Zod antes de llegar a la BD
- Los movimientos (alta y anulación) usan **funciones RPC de Postgres** que ejecutan el INSERT y el UPDATE de stock en una sola transacción, evitando inconsistencias si la segunda operación falla
- El estado en el cliente es **optimista**: la UI se actualiza inmediatamente y, si la operación falla en la BD, el cambio se revierte automáticamente con un toast de error

### Estado derivado

El campo `estado` de un producto (`activo`, `bajo_stock`, `agotado`, `vencido`) no se almacena en la BD — se calcula en `src/lib/product-utils.ts` y se aplica tanto en la capa de lectura (`db.ts`) como al actualizar stock en el cliente (`store.tsx`), garantizando coherencia sin duplicar lógica.

## Estructura del proyecto

```
config/areas.js                  # fuente de verdad del organigrama municipal
supabase/schema.sql              # DDL, índices, funciones RPC y seed de datos

src/
  middleware.ts                  # protección de rutas (login requerido)
  app/
    login/                       # pantalla de inicio de sesión
    (dashboard)/
      loading.tsx                # skeleton animado de carga
      error.tsx                  # pantalla de error con reintentar
      dashboard/                 # indicadores e historial
      organigrama/               # árbol de secretarías con bienes
      productos/                 # catálogo con CRUD, filtros y exportación
      categorias/                # gestión de categorías de bienes
      movimientos/               # registro y consulta de movimientos
      alertas/                   # bienes con stock bajo o garantías venciendo
      reportes/                  # 7 tipos de reporte en PDF/Excel
      configuracion/             # perfil, tema, usuarios y datos de demo
  components/
    app-entrance.tsx             # animación al abrir/recargar la app
    command-palette.tsx          # búsqueda rápida Ctrl+K
    auth-provider.tsx            # contexto de usuario autenticado (useAuth)
    movimiento-form.tsx          # formulario de movimiento, compartido entre Movimientos y Alertas
    layout/                      # Sidebar y Topbar
    ui/
      toast.tsx                  # sistema de notificaciones con acciones
      pagination.tsx             # paginación con selector de registros/página
      confirm-dialog.tsx         # diálogo de confirmación reutilizable
      date-input.tsx             # campo de fecha personalizado con calendario propio
  lib/
    store.tsx                    # DataProvider: estado global + actualizaciones optimistas con revert
    db.ts                        # lecturas de BD (server-only) con fallback a mock
    db-actions.ts                # escrituras de BD (Server Actions) con validación Zod
    supabase.ts                  # cliente Supabase exclusivamente server-side
    session.ts                   # sesión firmada con JWT (jose)
    auth-actions.ts              # login/logout con rate limiting y validación Zod
    rate-limit.ts                # limitador de intentos de login por IP
    schemas.ts                   # esquemas Zod para validación de inputs
    product-utils.ts             # computeEstado() — estado derivado de stock y vencimiento
    access.ts                    # alcance por rol (admin/secretario/dirección)
    types.ts                     # tipos TypeScript del dominio
    mock-data.ts                 # datos de demostración
    auth-users.ts                # usuarios de demostración (roles y áreas)
    areas-list.ts                # ALL_AREA_NAMES — nombres válidos del organigrama
    image.ts                     # compressImage(): redimensiona/recomprime fotos
    export.ts                    # helpers downloadCSV, downloadExcel, printReport
```

## Temas y diseño

El tema por defecto es claro; el oscuro queda disponible desde el botón de la barra superior o desde Configuración. Toda la paleta vive como variables CSS en `src/app/globals.css` (`:root` para claro, `.dark` para oscuro).

### Paleta semántica del sistema

El color de marca es morado (`#7C3AED`). El resto de la UI usa una paleta semántica coherente aplicada de forma consistente en todos los módulos (badges, toasts, iconos, gráficas y botones):

| Concepto | Color | Hex |
|---|---|---|
| Activo / Entrada / Éxito | Teal | `#14B8A6` |
| Bajo Stock / Ajuste / Advertencia | Amber | `#F59E0B` |
| Agotado / Salida / Error | Rose | `#F43F5E` |
| Vencido / Ajuste secundario | Purple | `#8B5CF6` |
| Transferencia | Indigo | `#818CF8` |
| Eliminar / Destructivo (hover) | Rose | `#F43F5E` |

## Seguridad

### Implementado

| Mecanismo | Detalle |
|---|---|
| **Sesión JWT firmada** | Cookie httpOnly firmada con HMAC-SHA256 (`jose`). El userId no viaja en texto plano. |
| **Variables de entorno server-only** | `SUPABASE_SERVICE_ROLE_KEY` y `SESSION_SECRET` no llevan prefijo `NEXT_PUBLIC_` — nunca llegan al bundle del cliente. |
| **Cliente Supabase server-only** | `import "server-only"` en `supabase.ts` — el motor de bundling rechaza cualquier importación desde código cliente. |
| **Rate limiting** | Máximo 5 intentos de login fallidos por IP en 15 minutos. Se resetea al autenticarse correctamente. |
| **Validación Zod** | Todos los inputs de Server Actions se validan en runtime antes de tocar la BD: longitudes, rangos numéricos, enums, formatos. |
| **Validación de área** | El campo `area` de un bien se valida contra `ALL_AREA_NAMES` del organigrama antes de cualquier escritura. |
| **Operaciones atómicas** | Alta y anulación de movimientos usan funciones RPC de Postgres para evitar inconsistencias de stock entre queries. |
| **HTTP Security Headers** | `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`, `Content-Security-Policy`, `Permissions-Policy`, `Referrer-Policy`. |
| **Cookies seguras** | `httpOnly`, `sameSite: lax`, `secure` en producción. |

### Pendiente para producción

- **Row Level Security (RLS)** en Supabase — políticas a nivel de BD por rol de usuario
- **Supabase Auth** — reemplazar `auth-users.ts` con autenticación real (bcrypt o provider OAuth)
- **Supabase Storage** — mover fotos de bienes de `localStorage` a un bucket

## Problemas conocidos

- **Turbopack**: en desarrollo, si ves un error de compilación de `globals.css` con caracteres corruptos (`Unexpected token Number...`), es un bug conocido de la caché de Turbopack. Solución: detener el servidor, borrar la carpeta `.next` y volver a correr `npm run dev`.
- **Encabezado de tabla fijo (`position: sticky`)**: se intentó y se revirtió deliberadamente en Productos/Movimientos. La tabla necesita scroll horizontal (`overflow-x-auto`) por el número de columnas, y la especificación CSS obliga a que `overflow-y` se compute como `auto` en cuanto `overflow-x` no es `visible` — esto crea un contenedor de scroll vertical no intencionado dentro de esa misma capa, y el encabezado `sticky` termina superponiéndose sobre la primera fila y bloqueando sus clics. Si se retoma esta función, la forma correcta es darle a la tabla su propio contenedor con `max-height` + `overflow-y-auto`.
- **Popovers dentro de Dialog**: cualquier popover posicionado con `absolute` dentro de un `DialogContent` queda recortado por el `overflow-y-auto` del modal. El patrón correcto es renderizar en portal a `document.body` con posición `fixed` calculada por `getBoundingClientRect` — ya implementado en `date-input.tsx`.
- **`xlsx` con vulnerabilidades conocidas**: `npm audit` reporta 4 vulnerabilidades en esta dependencia sin fix disponible. El riesgo es bajo dado que la librería procesa únicamente datos internos generados por la app, no archivos cargados por usuarios externos.

## Roadmap hacia producción

- [x] Sesión firmada con JWT (`jose` + `SESSION_SECRET`)
- [x] Cliente Supabase server-only (service role key nunca expuesta al cliente)
- [x] Operaciones de movimiento atómicas con RPC de Postgres
- [x] Validación de inputs con Zod en todos los Server Actions
- [x] Rate limiting en login
- [x] HTTP Security Headers
- [x] Actualizaciones optimistas con revert automático en fallo de BD
- [ ] Row Level Security (RLS) en Supabase
- [ ] Migrar autenticación a Supabase Auth o bcrypt
- [ ] Fotos a Supabase Storage (reemplazar Data URLs en localStorage)
- [ ] Polling o Supabase Realtime para sincronización multi-usuario
- [ ] Auditoría de ediciones directas a campos de bienes
