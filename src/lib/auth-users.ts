// Usuarios de demostración — sustituir por autenticación real (ej. Supabase Auth)
// antes de producción. El superusuario aquí es una cuenta temporal de desarrollo;
// en producción debe reemplazarse por credenciales reales gestionadas fuera del código.
//
// Modelo de acceso de 3 niveles (ver src/lib/access.ts para el alcance de cada uno):
//   admin      — ve y administra todo.
//   secretario — ve y administra su secretaría y todas las direcciones adscritas a ella.
//   direccion  — ve y administra únicamente su propia dirección.

export type UserRole = "admin" | "secretario" | "direccion";

export interface AuthUser {
  /** También es el valor guardado en la cookie de sesión */
  id: string;
  username: string;
  /** Solo para la lógica de autenticación interna. Nunca exponer al cliente. */
  password?: string;
  nombre: string;
  cargo: string;
  role: UserRole;
  /** Nombre exacto del área (config/areas.js) que administra. null = superusuario, ve todo. */
  area: string | null;
  /** Foto de perfil (data URL). Se guarda en localStorage en demo y en la BD con Supabase. */
  foto_url?: string | null;
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

  // --- Secretarios (ven y administran su secretaría + todas sus direcciones) ---
  {
    id: "sec-general",
    username: "jm.zuniga",
    password: "Secretario#2026",
    nombre: "José Manuel Zúñiga Guerrero",
    cargo: "Secretario General Municipal",
    role: "secretario",
    area: "Secretaría General Municipal",
  },
  {
    id: "sec-tesoreria",
    username: "r.martinez",
    password: "Secretario#2026",
    nombre: "Rubén Martínez Sánchez",
    cargo: "Secretario de Tesorería Municipal",
    role: "secretario",
    area: "Secretaría de Tesorería Municipal",
  },
  {
    id: "sec-obras",
    username: "ia.lugo",
    password: "Secretario#2026",
    nombre: "Iván Arturo Lugo Martín",
    cargo: "Secretario de Obras Públicas y Desarrollo Urbano",
    role: "secretario",
    area: "Secretaría de Obras Públicas y Desarrollo Urbano",
  },
  {
    id: "sec-planeacion",
    username: "r.barrera",
    password: "Secretario#2026",
    nombre: "Rigoberto Barrera Roldán",
    cargo: "Secretario de Planeación y Evaluación",
    role: "secretario",
    area: "Secretaría de Planeación y Evaluación",
  },
  {
    id: "sec-desarrollo-economico",
    username: "l.ocampo",
    password: "Secretario#2026",
    nombre: "Lucila Ocampo Valle",
    cargo: "Secretaria de Desarrollo Económico y Turismo",
    role: "secretario",
    area: "Secretaría de Desarrollo Económico y Turismo",
  },
  {
    id: "sec-bienestar",
    username: "s.vargas",
    password: "Secretario#2026",
    nombre: "Socorro Vargas Chávez",
    cargo: "Secretaria de Bienestar Social",
    role: "secretario",
    area: "Secretaría de Bienestar Social",
  },
  {
    id: "sec-seguridad",
    username: "d.morelos",
    password: "Secretario#2026",
    nombre: "Diadymir Morelos Esquivel",
    cargo: "Secretaria de Seguridad Pública, Tránsito Municipal, Auxilio Vial y Protección Civil",
    role: "secretario",
    area: "Secretaría de Seguridad Pública, Tránsito Municipal, Auxilio Vial y Protección Civil",
  },
  {
    id: "sec-pueblos-indigenas",
    username: "la.patricio",
    password: "Secretario#2026",
    nombre: "Lupita Anneth Patricio Reyes",
    cargo: "Secretaria de Desarrollo para Pueblos y Comunidades Indígenas",
    role: "secretario",
    area: "Secretaría de Desarrollo para Pueblos y Comunidades Indígenas",
  },

  // --- Direcciones (ven y administran únicamente su propia dirección) ---
  {
    id: "administracion",
    username: "l.jimenez",
    password: "Direccion#2026",
    nombre: "Laura Jiménez Ortiz",
    cargo: "Responsable de bienes",
    role: "direccion",
    area: "Dirección de Administración",
  },
  {
    id: "rh-nomina",
    username: "m.torres",
    password: "Direccion#2026",
    nombre: "Miguel Ángel Torres",
    cargo: "Responsable de bienes",
    role: "direccion",
    area: "Dirección de Recursos Humanos y Nómina",
  },
  {
    id: "archivo",
    username: "p.solis",
    password: "Direccion#2026",
    nombre: "Patricia Solís Ramos",
    cargo: "Responsable de bienes",
    role: "direccion",
    area: "Dirección del Área Coordinadora de Archivo",
  },
  {
    id: "proteccion-civil",
    username: "h.ramirez",
    password: "Direccion#2026",
    nombre: "Héctor Ramírez Cano",
    cargo: "Responsable de bienes",
    role: "direccion",
    area: "Dirección de Protección Civil y Bomberos",
  },
  {
    id: "servicios-publicos",
    username: "j.bautista",
    password: "Direccion#2026",
    nombre: "Jorge Luis Bautista",
    cargo: "Responsable de bienes",
    role: "direccion",
    area: "Dirección de Servicios Públicos y Limpias",
  },
  {
    id: "tecnologias-info",
    username: "a.castillo",
    password: "Direccion#2026",
    nombre: "Andrea Castillo Vega",
    cargo: "Responsable de bienes",
    role: "direccion",
    area: "Dirección de Tecnologías de la Información",
  },
  {
    id: "catastro",
    username: "r.nava",
    password: "Direccion#2026",
    nombre: "Roberto Nava Cruz",
    cargo: "Responsable de bienes",
    role: "direccion",
    area: "Dirección de Catastro",
  },
  {
    id: "correspondencia",
    username: "g.reyes",
    password: "Direccion#2026",
    nombre: "Gabriela Reyes Molina",
    cargo: "Responsable de bienes",
    role: "direccion",
    area: "Unidad Central de Correspondencia",
  },
  {
    id: "gobierno",
    username: "f.aguilar",
    password: "Direccion#2026",
    nombre: "Fernando Aguilar Ponce",
    cargo: "Responsable de bienes",
    role: "direccion",
    area: "Dirección de Gobierno",
  },
  {
    id: "obras-publicas",
    username: "r.dominguez",
    password: "Direccion#2026",
    nombre: "Ricardo Domínguez Silva",
    cargo: "Responsable de bienes",
    role: "direccion",
    area: "Dirección de Obras Públicas",
  },
  {
    id: "servicios-municipales",
    username: "c.herrera",
    password: "Direccion#2026",
    nombre: "Claudia Herrera Luna",
    cargo: "Responsable de bienes",
    role: "direccion",
    area: "Dirección de Servicios Municipales",
  },
  {
    id: "logistica-eventos",
    username: "s.mendoza",
    password: "Direccion#2026",
    nombre: "Sofía Mendoza Ríos",
    cargo: "Responsable de bienes",
    role: "direccion",
    area: "Dirección de Logística y Eventos",
  },
  {
    id: "comunicacion-social",
    username: "d.cortes",
    password: "Direccion#2026",
    nombre: "Daniel Cortés Salinas",
    cargo: "Responsable de bienes",
    role: "direccion",
    area: "Dirección de Comunicación Social y Marketing Digital",
  },
];

export function findUserByCredentials(username: string, password: string): AuthUser | null {
  return AUTH_USERS.find((u) => u.username === username && u.password === password) ?? null;
}

export function findUserById(id: string): AuthUser | null {
  return AUTH_USERS.find((u) => u.id === id) ?? null;
}
