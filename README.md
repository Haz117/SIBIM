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

Abre [http://localhost:3000](http://localhost:3000). Verás la pantalla de login — usa el panel "Usuarios de prueba" para entrar con el superusuario o con cualquiera de los usuarios de área.

## Estructura relevante

- `config/areas.js` — fuente de verdad del organigrama (Presidencia, Secretarías, Direcciones).
- `src/lib/mock-data.ts` — datos de ejemplo de bienes patrimoniales.
- `src/lib/auth-users.ts` — usuarios de demostración (sustituir por autenticación real antes de producción).
- `src/app/(dashboard)` — dashboard, organigrama, productos, categorías, movimientos, alertas, reportes.
