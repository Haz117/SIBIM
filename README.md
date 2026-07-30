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

- **Dashboard** con indicadores patrimoniales (total de bienes, valor, existencias bajas, agotados, movimientos) que se recalculan según el área del usuario que inició sesión.
- **Organigrama** interactivo: Despacho de la Presidencia, Secretarías y Direcciones, cada una expandible para ver los bienes que tiene asignados, con enlace directo al listado filtrado en Productos. El área del usuario en sesión aparece resaltada automáticamente.
- **Productos** (bienes patrimoniales): alta, filtros por categoría/estado/área, y formulario con el área bloqueada a la propia cuando el usuario no es superusuario.
- **Categorías, Movimientos, Alertas y Reportes** con datos filtrados por área para usuarios no administradores.
- **Login** con panel institucional, animación de entrada y una lista de "usuarios de prueba" para explorar los distintos roles sin tener que memorizar credenciales.
- **Animación de apertura de la app** (splash con logo) al abrir o recargar, sin repetirse en la navegación interna.
- Tema claro/oscuro persistente (`next-themes`), configurable también desde **Configuración**.

## Stack técnico

- [Next.js 16](https://nextjs.org) (App Router, Turbopack, Server Actions)
- React 19 + TypeScript
- Tailwind CSS v4
- [shadcn/ui](https://ui.shadcn.com) sobre [Base UI](https://base-ui.com) + [Phosphor Icons](https://phosphoricons.com)
- [Recharts](https://recharts.org) para las gráficas del dashboard y reportes

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

El login es un **mock local** (no hay backend real conectado todavía) — ver [`src/lib/auth-users.ts`](src/lib/auth-users.ts) y [`src/lib/session.ts`](src/lib/session.ts). Hay dos roles:

| Rol | Alcance |
| --- | --- |
| **Superusuario** | Ve y gestiona todos los bienes de todas las áreas. |
| **Usuario de área** | Solo ve y gestiona los bienes asignados a su secretaría/dirección; el campo de área queda fijo al crear un bien. |

La sesión se guarda en una cookie httpOnly simple (sin cifrar, ya que no protege ningún secreto real todavía). Las rutas del dashboard están protegidas por [`src/proxy.ts`](src/proxy.ts) — en Next 16 el archivo `middleware.ts` fue renombrado a `proxy.ts`.

## Estructura del proyecto

```
config/areas.js                  # fuente de verdad del organigrama municipal
src/
  proxy.ts                       # protección de rutas (login requerido)
  app/
    login/                       # pantalla de inicio de sesión
    (dashboard)/                 # dashboard, organigrama, productos, categorías,
                                  # movimientos, alertas, reportes, configuración
  components/
    app-entrance.tsx             # animación al abrir/recargar la app
    logo.tsx                     # marca SIBIM (SVG)
    auth-provider.tsx            # contexto de usuario autenticado (useAuth)
    layout/                      # Sidebar y Topbar
    ui/                          # componentes shadcn/ui
  lib/
    mock-data.ts                 # bienes, categorías y movimientos de ejemplo
    auth-users.ts                # usuarios de demostración (roles y áreas)
    areas-icons.tsx, areas-list.ts, areas.types.ts  # helpers del organigrama
    icon-map.tsx                 # íconos por categoría de bien
```

## Datos y organigrama

Todos los datos (bienes, movimientos, usuarios) son mock — viven en `src/lib/mock-data.ts` y `src/lib/auth-users.ts`, listos para reemplazarse por un backend real (hay `@supabase/supabase-js` y `@supabase/ssr` ya instalados, pero sin credenciales configuradas). El organigrama en `config/areas.js` es la fuente de verdad: cada bien tiene un campo `area` que debe coincidir exactamente con el nombre de una secretaría o dirección ahí definida para que aparezca correctamente en el Organigrama y en el login de esa área.

## Temas y diseño

El tema por defecto es claro; el oscuro queda disponible desde el botón de la barra superior o desde Configuración. Toda la paleta vive como variables CSS en `src/app/globals.css` (`:root` para claro, `.dark` para oscuro) para que un solo lugar controle ambos modos.

## Problemas conocidos

- **Turbopack**: en desarrollo, si ves un error de compilación de `globals.css` con caracteres corruptos (`Unexpected token Number...`), es un bug conocido de la caché de Turbopack, no del código. Solución: detener el servidor, borrar la carpeta `.next` y volver a correr `npm run dev`.
- El botón de generar PDF/Excel en Reportes y los botones de acción en Alertas son ilustrativos (no hay generación de archivos real todavía).

## Roadmap hacia producción

- Sustituir `src/lib/auth-users.ts` / `session.ts` por un proveedor de autenticación real (ej. Supabase Auth) y cifrar/firmar la sesión.
- Conectar `mock-data.ts` a una base de datos real, incluyendo carga de fotografías por bien y por usuario/representante de área.
- Generación real de reportes (PDF/Excel) — `jspdf` y `xlsx` ya están instalados.
