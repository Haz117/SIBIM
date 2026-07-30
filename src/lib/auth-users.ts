// Usuarios de demostración — sustituir por autenticación real (ej. Supabase Auth)
// antes de producción. El superusuario aquí es una cuenta temporal de desarrollo;
// en producción debe reemplazarse por credenciales reales gestionadas fuera del código.

export type UserRole = "admin" | "area";

export interface AuthUser {
  /** También es el valor guardado en la cookie de sesión */
  id: string;
  username: string;
  /** DEMO ONLY — texto plano. En producción: hash + proveedor de auth real. */
  password: string;
  nombre: string;
  cargo: string;
  role: UserRole;
  /** Nombre exacto del área (config/areas.js) que administra. null = superusuario, ve todo. */
  area: string | null;
}

export const AUTH_USERS: AuthUser[] = [
  {
    id: "admin",
    username: "admin",
    password: "Admin#2026",
    nombre: "Superusuario",
    cargo: "Administrador del sistema",
    role: "admin",
    area: null,
  },
  {
    id: "administracion",
    username: "l.jimenez",
    password: "Area#2026",
    nombre: "Laura Jiménez Ortiz",
    cargo: "Responsable de bienes",
    role: "area",
    area: "Dirección de Administración",
  },
  {
    id: "rh-nomina",
    username: "m.torres",
    password: "Area#2026",
    nombre: "Miguel Ángel Torres",
    cargo: "Responsable de bienes",
    role: "area",
    area: "Dirección de Recursos Humanos y Nómina",
  },
  {
    id: "archivo",
    username: "p.solis",
    password: "Area#2026",
    nombre: "Patricia Solís Ramos",
    cargo: "Responsable de bienes",
    role: "area",
    area: "Dirección del Área Coordinadora de Archivo",
  },
  {
    id: "proteccion-civil",
    username: "h.ramirez",
    password: "Area#2026",
    nombre: "Héctor Ramírez Cano",
    cargo: "Responsable de bienes",
    role: "area",
    area: "Dirección de Protección Civil y Bomberos",
  },
  {
    id: "seguridad-publica",
    username: "d.morelos",
    password: "Area#2026",
    nombre: "Diadymir Morelos Esquivel",
    cargo: "Secretaria de Seguridad Pública",
    role: "area",
    area: "Secretaría de Seguridad Pública, Tránsito Municipal, Auxilio Vial y Protección Civil",
  },
  {
    id: "servicios-publicos",
    username: "j.bautista",
    password: "Area#2026",
    nombre: "Jorge Luis Bautista",
    cargo: "Responsable de bienes",
    role: "area",
    area: "Dirección de Servicios Públicos y Limpias",
  },
  {
    id: "tecnologias-info",
    username: "a.castillo",
    password: "Area#2026",
    nombre: "Andrea Castillo Vega",
    cargo: "Responsable de bienes",
    role: "area",
    area: "Dirección de Tecnologías de la Información",
  },
  {
    id: "catastro",
    username: "r.nava",
    password: "Area#2026",
    nombre: "Roberto Nava Cruz",
    cargo: "Responsable de bienes",
    role: "area",
    area: "Dirección de Catastro",
  },
  {
    id: "correspondencia",
    username: "g.reyes",
    password: "Area#2026",
    nombre: "Gabriela Reyes Molina",
    cargo: "Responsable de bienes",
    role: "area",
    area: "Unidad Central de Correspondencia",
  },
  {
    id: "gobierno",
    username: "f.aguilar",
    password: "Area#2026",
    nombre: "Fernando Aguilar Ponce",
    cargo: "Responsable de bienes",
    role: "area",
    area: "Dirección de Gobierno",
  },
  {
    id: "obras-publicas",
    username: "r.dominguez",
    password: "Area#2026",
    nombre: "Ricardo Domínguez Silva",
    cargo: "Responsable de bienes",
    role: "area",
    area: "Dirección de Obras Públicas",
  },
  {
    id: "servicios-municipales",
    username: "c.herrera",
    password: "Area#2026",
    nombre: "Claudia Herrera Luna",
    cargo: "Responsable de bienes",
    role: "area",
    area: "Dirección de Servicios Municipales",
  },
  {
    id: "logistica-eventos",
    username: "s.mendoza",
    password: "Area#2026",
    nombre: "Sofía Mendoza Ríos",
    cargo: "Responsable de bienes",
    role: "area",
    area: "Dirección de Logística y Eventos",
  },
  {
    id: "comunicacion-social",
    username: "d.cortes",
    password: "Area#2026",
    nombre: "Daniel Cortés Salinas",
    cargo: "Responsable de bienes",
    role: "area",
    area: "Dirección de Comunicación Social y Marketing Digital",
  },
];

export function findUserByCredentials(username: string, password: string): AuthUser | null {
  return AUTH_USERS.find((u) => u.username === username && u.password === password) ?? null;
}

export function findUserById(id: string): AuthUser | null {
  return AUTH_USERS.find((u) => u.id === id) ?? null;
}
