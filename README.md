# SIBIM — Sistema Integral de Bienes Municipales

Sistema de control patrimonial para el H. Ayuntamiento: inventario de bienes municipales (mobiliario, vehículos, equipo de cómputo, equipo de oficina, herramientas y maquinaria, equipo audiovisual) organizado por el **organigrama municipal** (Presidencia, Secretarías y Direcciones), con acceso por área — cada dirección gestiona únicamente su propio inventario — y un superusuario con visibilidad y control total.

## Índice

- [Características](#características)
- [Stack técnico](#stack-técnico)
- [Primeros pasos](#primeros-pasos)
- [Autenticación y roles](#autenticación-y-roles)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Datos y organigrama](#datos-y-organigrama)
- [Temas y diseño](#temas-y-diseño)
- [Problemas conocidos](#problemas-conocidos)
- [Roadmap hacia producción](#roadmap-hacia-producción)

## Características

- **Dashboard** con 6 indicadores patrimoniales (total de bienes, valor, existencias bajas, agotados, movimientos del día, categorías) que se recalculan según el área del usuario. Los indicadores son clicables y llevan a la sección correspondiente.
- **Organigrama** interactivo: Despacho de la Presidencia, Secretarías, Direcciones, Contraloría y otras áreas/organismos, cada una expandible para ver los bienes asignados, con enlace directo al listado filtrado en Productos. Los roles Secretario/a y Dirección ven una vista acotada a su propia secretaría/dirección (el árbol completo es exclusivo del superusuario). Búsqueda con botón de limpiar en el propio campo.
- **Productos** (bienes patrimoniales): alta, edición, eliminación con deshacer, búsqueda ampliada (nombre, código, proveedor, ubicación, descripción), filtros por categoría/estado/área, ordenamiento por columna, paginación (10/25/50/100 por página) con reset automático y scroll al inicio, exportación a CSV y Excel. Vista de detalle con ficha completa. Tabla responsiva con vista de tarjetas en móvil.
- **Categorías**: CRUD completo con validación de nombre único, conteo de bienes por categoría, íconos, colores y estado de uso.
- **Movimientos**: registro de entradas, salidas, ajustes (incluye fijar el stock exactamente en 0, ej. tras un conteo físico) y transferencias; filtros por tipo, producto y rango de fechas; ordenamiento por columna; anulación con restauración automática de stock; paginación; exportación a CSV y Excel (deshabilitada con filtro vacío); vista de tarjetas en móvil.
- **Alertas**: tres paneles (agotados, existencias bajas, garantías por vencer en 7 días), accionables — "Reponer"/"Solicitar" abren un diálogo de movimiento con el bien ya preseleccionado para registrar el reabastecimiento sin salir de la página. Pantalla "Todo en orden" cuando no hay alertas.
- **Reportes**: 7 tipos de reporte descargables en PDF y Excel (Inventario General, Bienes por Área, Movimientos, Alertas de Stock, Valoración, Auditoría, Garantías), con el escudo municipal en el encabezado del PDF y encabezado de tabla repetido en impresiones de varias páginas. Filtro por período predefinido o rango de fechas con validación de rango. Gráfico de stock por categoría.
- **Configuración**: edición de nombre y foto de perfil, selector de tema, panel de usuarios con acceso (admin), restablecimiento de datos de demo.
- **Fotos optimizadas automáticamente**: las fotos de bienes y de perfil (hasta 8 MB de origen) se redimensionan y recomprimen en el navegador antes de guardarse (`src/lib/image.ts`), evitando agotar la cuota de `localStorage`.
- **Persistencia en localStorage**: bienes, categorías, movimientos, nombre de perfil y avatar sobreviven a la recarga de página; si el almacenamiento se llena, se muestra un aviso claro en vez de perder el cambio en silencio. El superusuario puede restablecer los datos de demo desde Configuración.
- **Paleta de comandos** (`Ctrl+K`): búsqueda rápida de páginas y bienes desde cualquier parte de la app.
- **Toasts** con variantes (éxito, error, info, advertencia) y botones de acción (ej. "Deshacer" al eliminar un bien).
- **Login** con panel institucional, animación de entrada y lista de usuarios de prueba para explorar los distintos roles.
- **Animación de apertura** (splash con logo) al abrir o recargar, sin repetirse en la navegación interna.
- Tema claro/oscuro persistente (`next-themes`), configurable desde la barra superior o desde Configuración.
- Boundaries de carga y error (`loading.tsx`, `error.tsx`) con pantallas de esqueleto animado y recuperación.

## Stack técnico

- [Next.js 16](https://nextjs.org) (App Router, Turbopack, Server Actions)
- React 19 + TypeScript
- Tailwind CSS v4
- [Base UI](https://base-ui.com) + [Phosphor Icons](https://phosphoricons.com)
- [Recharts](https://recharts.org) para gráficas del dashboard y reportes
- `xlsx` + `jspdf` + `jspdf-autotable` para exportación real de Excel y PDF

## Primeros pasos

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). Al cargar verás la animación de entrada y luego el login; usa el panel **"Usuarios de prueba"** para autocompletar credenciales del superusuario o de cualquier área.

```bash
npm run build   # build de producción
npm run start   # servir el build
npm run lint    # eslint
```

## Autenticación y roles

El login es un **mock local** (sin backend real) — ver [`src/lib/auth-users.ts`](src/lib/auth-users.ts) y [`src/lib/session.ts`](src/lib/session.ts). Hay tres niveles de acceso (ver [`src/lib/access.ts`](src/lib/access.ts)):

| Rol | Alcance |
| --- | --- |
| **Superusuario** | Ve y gestiona todos los bienes de todas las áreas. |
| **Secretario/a** | Ve y gestiona los bienes de su secretaría **y** de todas las direcciones adscritas a ella. |
| **Dirección** | Ve y gestiona únicamente los bienes de su propia dirección; el campo de área queda fijo al crear un bien. |

La sesión se guarda en una cookie httpOnly simple. Las rutas del dashboard están protegidas por [`src/proxy.ts`](src/proxy.ts).

## Estructura del proyecto

```
config/areas.js                  # fuente de verdad del organigrama municipal
src/
  proxy.ts                       # protección de rutas (login requerido)
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
      date-input.tsx             # campo de fecha personalizado
  lib/
    store.tsx                    # DataProvider: estado global + persistencia localStorage
    image.ts                     # compressImage(): redimensiona/recomprime fotos antes de guardarlas
    use-dismissable-menu.ts      # hook Escape + click-afuera para overlays no modales
    mock-data.ts                 # bienes, categorías y movimientos de ejemplo
    auth-users.ts                # usuarios de demostración (roles y áreas)
    access.ts                    # alcance por rol (admin/secretario/dirección)
    export.ts                    # helpers downloadCSV, downloadExcel, printReport
    areas-icons.tsx, areas-list.ts, areas.types.ts  # helpers del organigrama
    icon-map.tsx                 # íconos por categoría de bien
```

## Datos y organigrama

Los datos (bienes, movimientos, usuarios) son mock — viven en `src/lib/mock-data.ts` y `src/lib/auth-users.ts`, listos para reemplazarse por un backend real (`@supabase/supabase-js` y `@supabase/ssr` ya están instalados). Los datos de bienes, categorías y movimientos se persisten en `localStorage` durante la sesión del navegador y pueden restablecerse al estado inicial desde Configuración (solo superusuario).

El organigrama en `config/areas.js` es la fuente de verdad: cada bien tiene un campo `area` que debe coincidir exactamente con el nombre de una secretaría o dirección ahí definida para que aparezca correctamente en el Organigrama y en el login de esa área.

## Temas y diseño

El tema por defecto es claro; el oscuro queda disponible desde el botón de la barra superior o desde Configuración. Toda la paleta vive como variables CSS en `src/app/globals.css` (`:root` para claro, `.dark` para oscuro) para que un solo lugar controle ambos modos.

## Problemas conocidos

- **Turbopack**: en desarrollo, si ves un error de compilación de `globals.css` con caracteres corruptos (`Unexpected token Number...`), es un bug conocido de la caché de Turbopack. Solución: detener el servidor, borrar la carpeta `.next` y volver a correr `npm run dev`.
- **Encabezado de tabla fijo (`position: sticky`)**: se intentó y se revirtió deliberadamente en Productos/Movimientos. La tabla necesita scroll horizontal (`overflow-x-auto`) por el número de columnas, y la especificación CSS obliga a que `overflow-y` se compute como `auto` en cuanto `overflow-x` no es `visible` — esto crea un contenedor de scroll vertical no intencionado dentro de esa misma capa, y el encabezado `sticky` termina superponiéndose sobre la primera fila y bloqueando sus clics (confirmado con pruebas de interacción real, no solo visualmente). Si se retoma esta función, la forma correcta es darle a la tabla su propio contenedor con `max-height` + `overflow-y-auto` (scroll interno propio), no depender del scroll de la página.

## Roadmap hacia producción

- Sustituir `src/lib/auth-users.ts` / `session.ts` por un proveedor de autenticación real (ej. Supabase Auth) con sesión firmada/cifrada.
- Conectar `store.tsx` a una base de datos real (Supabase, Prisma, etc.) reemplazando las funciones `add*` / `update*` / `delete*` por llamadas a la API.
- Carga de fotografías por bien a un bucket de almacenamiento (ej. Supabase Storage) en vez de Data URLs en localStorage.
- Sistema de roles y permisos granulares a nivel de base de datos.
