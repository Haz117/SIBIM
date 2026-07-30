# SIBIM — Sistema Integral de Bienes Municipales

Sistema de control patrimonial para el H. Ayuntamiento: inventario de bienes (mobiliario, vehículos, equipo de cómputo, equipo de oficina, herramientas y maquinaria, equipo audiovisual) organizado por el organigrama municipal (secretarías y direcciones), con acceso por área y un superusuario con visibilidad total.

## Stack

- [Next.js](https://nextjs.org) 16 (App Router, Turbopack)
- Tailwind CSS v4
- shadcn/ui + [Phosphor Icons](https://phosphoricons.com)
- Recharts

## Primeros pasos

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). Al abrir o recargar la app verás una animación de entrada breve con el logo antes de mostrar el contenido, y luego la pantalla de login — usa el panel "Usuarios de prueba" para entrar con el superusuario o con cualquiera de los usuarios de área.

> **Nota Turbopack**: si en desarrollo ves un error de compilación de `globals.css` con caracteres corruptos, es un bug conocido de la caché de Turbopack (no del código). Solución: detener el servidor, borrar la carpeta `.next` y volver a correr `npm run dev`.

## Autenticación

El login es un mock local (sin backend real conectado todavía) pensado para reemplazarse por autenticación real antes de producción — ver `src/lib/auth-users.ts` y `src/lib/session.ts`. Incluye:

- Un **superusuario** con visibilidad y gestión total (cuenta de demostración, temporal).
- Un **usuario por área** con bienes asignados; cada uno solo ve y gestiona el inventario de su propia secretaría/dirección (filtrado automático en Productos, Alertas, Movimientos y Dashboard; su área queda resaltada en el Organigrama).

## Estructura relevante

- `config/areas.js` — fuente de verdad del organigrama (Presidencia, Secretarías, Direcciones).
- `src/lib/mock-data.ts` — datos de ejemplo de bienes patrimoniales.
- `src/lib/auth-users.ts` — usuarios de demostración.
- `src/proxy.ts` — protege las rutas del dashboard (Next 16 renombró `middleware.ts` a `proxy.ts`).
- `src/components/app-entrance.tsx` — animación de entrada mostrada en cada apertura/recarga de la app.
- `src/app/(dashboard)` — dashboard, organigrama, productos, categorías, movimientos, alertas, reportes.
- `src/app/login` — pantalla de inicio de sesión.
